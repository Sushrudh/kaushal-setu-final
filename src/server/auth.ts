import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kaushal-setu-national-secret-key-2025-aes256';
const TOKEN_EXPIRY = '7d';

export interface AuthUser {
  id: string;
  email: string;
  role: 'student' | 'institution' | 'industry' | 'admin';
  full_name: string;
  organization?: string;
  is_verified: boolean;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      organization: user.organization,
      is_verified: user.is_verified
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (err) {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.ks_token) {
    token = req.cookies.ks_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication session required. Please sign in.' }
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Session expired or invalid. Please sign in again.' }
    });
  }

  // Check if user is still active in database
  const dbUser = db.prepare('SELECT id, is_active FROM common_users WHERE id = ?').get(user.id) as { id: string; is_active: number } | undefined;
  if (!dbUser || dbUser.is_active === 0) {
    return res.status(403).json({
      success: false,
      error: { code: 'ACCOUNT_SUSPENDED', message: 'Account is deactivated or not found.' }
    });
  }

  req.user = user;
  next();
}

export function resolveUserOrDemo(req: AuthenticatedRequest, fallbackRole?: 'student' | 'institution' | 'industry' | 'admin'): AuthUser | null {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.ks_token) {
    token = req.cookies.ks_token;
  }

  if (token) {
    const verified = verifyToken(token);
    if (verified) {
      const dbUser = db.prepare('SELECT id, email, role, full_name, organization, is_verified, is_active FROM common_users WHERE id = ?').get(verified.id) as any;
      if (dbUser && dbUser.is_active !== 0) {
        const fullUser: AuthUser = {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          full_name: dbUser.full_name,
          organization: dbUser.organization,
          is_verified: Boolean(dbUser.is_verified)
        };
        req.user = fullUser;
        return fullUser;
      }
    }
  }

  // Fallback demo user ONLY if absolutely no auth was provided and preview fallback is explicitly requested
  // CRITICAL: NEVER allow fallback for admin or student roles! Student accounts require strict candidate data isolation.
  if (fallbackRole && fallbackRole !== 'admin' && fallbackRole !== 'student' && !token) {
    const dbUser = db.prepare('SELECT id, email, role, full_name, organization, is_verified FROM common_users WHERE role = ? AND is_active = 1 LIMIT 1').get(fallbackRole) as any;
    if (dbUser) {
      const fallback: AuthUser = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        full_name: dbUser.full_name,
        organization: dbUser.organization,
        is_verified: Boolean(dbUser.is_verified)
      };
      req.user = fallback;
      return fallback;
    }
  }

  return null;
}

export function requireRole(allowedRoles: string | string[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_ROLE',
          message: `Access denied. Route requires [${roles.join(', ')}] role privilege.`
        }
      });
    }

    next();
  };
}

// -------------------------------------------------------------
// OTP Generation & Verification Service
// -------------------------------------------------------------
export class OtpService {
  public static generateOtp(target: string, purpose: string): { otpId: string; code: string } {
    // Generate secure 6-digit numerical OTP (100000 - 999999)
    const code = crypto.randomInt(100000, 1000000).toString();
    const id = 'otp_' + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 mins
    const codeHash = crypto.createHash('sha256').update(code.trim()).digest('hex');

    // Invalidate prior active OTPs for this target and purpose
    db.prepare(`
      UPDATE common_otp_verifications
      SET is_used = 1
      WHERE target = ? AND purpose = ? AND is_used = 0
    `).run(target, purpose);

    db.prepare(`
      INSERT INTO common_otp_verifications (id, target, otp_code, purpose, attempts, is_used, expires_at)
      VALUES (?, ?, ?, ?, 0, 0, ?)
    `).run(id, target, codeHash, purpose, expiresAt);

    return { otpId: id, code };
  }

  public static verifyOtp(target: string, code: string, purpose: string): { valid: boolean; message: string } {
    const record = db.prepare(`
      SELECT * FROM common_otp_verifications
      WHERE target = ? AND purpose = ? AND is_used = 0
      ORDER BY created_at DESC
      LIMIT 1
    `).get(target, purpose) as any;

    if (!record) {
      return { valid: false, message: 'No active OTP verification found. Please request a new code.' };
    }

    if (new Date(record.expires_at).getTime() < Date.now()) {
      db.prepare('UPDATE common_otp_verifications SET is_used = 1 WHERE id = ?').run(record.id);
      return { valid: false, message: 'OTP code has expired. Please request a new code.' };
    }

    if (record.attempts >= 5) {
      db.prepare('UPDATE common_otp_verifications SET is_used = 1 WHERE id = ?').run(record.id);
      return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new code.' };
    }

    // Increment attempts
    db.prepare(`
      UPDATE common_otp_verifications
      SET attempts = attempts + 1
      WHERE id = ?
    `).run(record.id);

    const enteredHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    const isValid = record.otp_code === enteredHash || record.otp_code === code.trim();

    if (!isValid) {
      if (record.attempts + 1 >= 5) {
        db.prepare('UPDATE common_otp_verifications SET is_used = 1 WHERE id = ?').run(record.id);
        return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new code.' };
      }
      return { valid: false, message: 'Invalid OTP code. Please check and try again.' };
    }

    // Mark as used
    db.prepare(`
      UPDATE common_otp_verifications
      SET is_used = 1
      WHERE id = ?
    `).run(record.id);

    return { valid: true, message: 'OTP verified successfully.' };
  }
}

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kaushal-setu-secure-session-key-2026';

export interface AuthUser {
  id: number;
  email: string;
  role: 'student' | 'institution' | 'industry' | 'admin';
  full_name: string;
  student_id?: number;
  institution_id?: number;
  industry_id?: number;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      student_id: user.student_id,
      institution_id: user.institution_id,
      industry_id: user.industry_id,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers.cookie) {
    // Look for session_token
    const match = req.headers.cookie.match(/session_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please sign in to access this portal.' }
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Session expired or invalid. Please sign in again.' }
    });
  }

  // Check if user is active in DB
  const row = db.prepare(`SELECT account_status FROM users WHERE id = ?`).get(user.id) as { account_status: string } | undefined;
  if (!row || row.account_status === 'suspended') {
    return res.status(403).json({
      success: false,
      error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account is suspended. Please contact National Helpdesk.' }
    });
  }

  req.user = user;
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role '${req.user.role}' is not authorized for this resource.`
        }
      });
    }

    next();
  };
}

// Generate secure 6-digit numeric OTP
export function createOTP(userId: number | null, target: string, type: string): string {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

  // Invalidate previous OTPs for this target & type
  db.prepare(`
    UPDATE otp_verifications
    SET verified = 2
    WHERE target = ? AND type = ? AND verified = 0
  `).run(target, type);

  db.prepare(`
    INSERT INTO otp_verifications (user_id, target, otp_code, type, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, target, otpCode, type, expiresAt);

  return otpCode;
}

export function verifyOTP(target: string, code: string, type: string): boolean {
  const row = db.prepare(`
    SELECT id, otp_code, expires_at, attempts, verified
    FROM otp_verifications
    WHERE target = ? AND type = ? AND verified = 0
    ORDER BY id DESC LIMIT 1
  `).get(target, type) as { id: number; otp_code: string; expires_at: string; attempts: number; verified: number } | undefined;

  if (!row) return false;

  if (row.attempts >= 5) {
    db.prepare(`UPDATE otp_verifications SET verified = 3 WHERE id = ?`).run(row.id);
    return false; // Too many attempts
  }

  const now = new Date();
  const expires = new Date(row.expires_at);
  if (now > expires) {
    db.prepare(`UPDATE otp_verifications SET verified = 2 WHERE id = ?`).run(row.id);
    return false; // Expired
  }

  if (row.otp_code !== code.trim()) {
    db.prepare(`UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?`).run(row.id);
    return false;
  }

  // Success - mark verified
  db.prepare(`UPDATE otp_verifications SET verified = 1 WHERE id = ?`).run(row.id);
  return true;
}

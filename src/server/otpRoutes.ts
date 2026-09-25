import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { requestOtp, verifyOtp } from './otp.js';
import { db } from './db.js';

export const otpRouter = Router();

// POST /api/otp/request
otpRouter.post('/request', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: { message: 'Email required' }
    });
  }

  try {
    const result = await requestOtp(email);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: { message: result.error || 'Failed to send verification email' }
      });
    }

    res.json({
      success: true,
      message: 'OTP sent',
      devNotice: process.env.NODE_ENV !== 'production' && (result as any).devNotice ? (result as any).devNotice : undefined,
      otp: process.env.NODE_ENV !== 'production' && (result as any).devNotice ? (result as any).devNotice : undefined
    });
  } catch (err: any) {
    console.error('[OTP Route] OTP request unexpected error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to send verification email' }
    });
  }
});

// POST /api/otp/verify
otpRouter.post('/verify', async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      error: { message: 'Email and code required' }
    });
  }

  const result = await verifyOtp(email, code);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: { message: result.error || 'Invalid code' }
    });
  }

  // Mark account verified in database
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const user = db.prepare('SELECT id, role FROM common_users WHERE email = ?').get(normalizedEmail) as any;
    if (user) {
      db.prepare('UPDATE common_users SET is_verified = 1 WHERE id = ?').run(user.id);
      db.prepare(`
        INSERT INTO common_audit_logs (id, user_id, user_email, role, action, details)
        VALUES (?, ?, ?, ?, 'EMAIL_VERIFIED', 'User email address verified via OTP.')
      `).run(crypto.randomUUID(), user.id, normalizedEmail, user.role);
    }
  } catch (err) {
    console.warn('[OTP Route] Could not update is_verified in db:', err);
  }

  res.json({
    success: true,
    message: 'Verified'
  });
});

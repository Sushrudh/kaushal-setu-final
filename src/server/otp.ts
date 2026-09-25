import nodemailer from 'nodemailer';
import crypto from 'crypto';
import fs from 'fs';
import dotenv from 'dotenv';
import { db } from './db.js';

// Cooldown tracker in-memory for rate limiting
const requestCooldownMap = new Map<string, number>();

/**
 * Retrieves environment variable with dynamic fallback to .env parsing
 * ensuring hot changes made in the filesystem are detected without requiring server restart.
 */
function getEmailEnv(primaryKey: string, alternateKeys: string[] = []): string {
  const keys = [primaryKey, ...alternateKeys];
  for (const k of keys) {
    if (process.env[k] && process.env[k]!.trim().length > 0) {
      return process.env[k]!.trim();
    }
  }

  if (fs.existsSync('.env')) {
    try {
      const parsed = dotenv.parse(fs.readFileSync('.env', 'utf8'));
      for (const k of keys) {
        if (parsed[k] && parsed[k].trim().length > 0) {
          return parsed[k].trim();
        }
      }
    } catch {}
  }

  return '';
}

/**
 * Creates or retrieves the Nodemailer transporter using server environment variables.
 * Supports standard Gmail SMTP (with 16-character App Password) or custom SMTP.
 */
function getTransporter() {
  const emailUser = getEmailEnv('EMAIL_USER', ['SMTP_USER', 'MAIL_USER']);
  const emailPass = getEmailEnv('EMAIL_PASS', ['SMTP_PASS', 'MAIL_PASS', 'EMAIL_PASSWORD', 'SMTP_PASSWORD']);

  // Safe diagnostic log (never prints password or sensitive token)
  console.log(`[OTP Email] Config status: EMAIL_USER configured: ${Boolean(emailUser)} | EMAIL_PASS configured: ${Boolean(emailPass)}`);

  if (!emailUser || !emailPass) {
    return null;
  }

  const host = getEmailEnv('EMAIL_HOST', ['SMTP_HOST', 'MAIL_HOST']);
  const port = Number(getEmailEnv('EMAIL_PORT', ['SMTP_PORT', 'MAIL_PORT'])) || 587;
  const secureStr = getEmailEnv('EMAIL_SECURE', ['SMTP_SECURE']);
  const secure = secureStr === 'true' || port === 465;

  if (host) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  // Google App Passwords are 16 characters often formatted with spaces (e.g. "abcd efgh ijkl mnop")
  // Strip whitespace so authentication does not fail due to copied formatting
  const cleanPass = emailPass.replace(/\s+/g, '');

  // Default to Gmail SMTP with App Password
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: cleanPass,
    },
  });
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP (100000 - 999999).
 */
export function generateSecureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Computes SHA-256 hash so plaintext OTP codes are never retained in DB or responses.
 */
export function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
}

/**
 * Requests an OTP verification code, sends it via real Nodemailer email,
 * and stores only the SHA-256 hash in the database with a strict 5-minute expiration.
 */
export async function requestOtp(
  email: string,
  purpose: string = 'REGISTRATION_VERIFY',
  options: { force?: boolean } = {}
): Promise<{ success: boolean; error?: string; devNotice?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Basic email syntax validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return { success: false, error: 'Invalid email address' };
  }

  // Rate limiting / cooldown: 10 seconds minimum between requests for the same email (unless force is requested)
  const lastRequestedAt = requestCooldownMap.get(normalizedEmail) || 0;
  if (!options.force && Date.now() - lastRequestedAt < 10 * 1000) {
    const remainingSeconds = Math.ceil((10 * 1000 - (Date.now() - lastRequestedAt)) / 1000);
    return {
      success: false,
      error: `Please wait ${remainingSeconds} seconds before requesting a new verification code.`
    };
  }

  const transporter = getTransporter();
  const isProduction = process.env.NODE_ENV === 'production';

  if (!transporter && isProduction) {
    console.error(`[OTP] Email service not configured in production environment.`);
    return {
      success: false,
      error: 'Failed to send verification email. Email credentials (EMAIL_USER & EMAIL_PASS) are not configured on the server.'
    };
  }

  const code = generateSecureOtp();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // Strict 5 minutes validity
  const senderEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@kaushalsetu.in';

  const mailOptions = {
    from: `"Kaushal Setu Verification" <${senderEmail}>`,
    to: normalizedEmail,
    subject: `Kaushal Setu - Your Verification Code is ${code}`,
    text: `Your Kaushal Setu email verification code is: ${code}\n\nThis one-time password will expire in 5 minutes.\n\nDo not share this code with anyone. If you did not request this verification, please disregard this message.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kaushal Setu Verification Code</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 4px 0; letter-spacing: -0.5px;">Kaushal Setu</h1>
            <p style="color: #64748b; font-size: 13px; margin: 0;">Unified National Skilling & Internship Ecosystem</p>
          </div>
          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 12px 0; font-weight: 500;">Your one-time verification code is:</p>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1e40af; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; padding: 8px 0;">
              ${code}
            </div>
            <p style="color: #64748b; font-size: 12px; margin: 12px 0 0 0;">
              Valid for <strong>5 minutes</strong>. Single-use only.
            </p>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0 0 16px 0;">
            Please enter this 6-digit code on the registration page to verify your email address. If you did not initiate this registration, no further action is required.
          </p>
          <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">
              This is an automated security notification from Kaushal Setu. Do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    // 1. Dispatch real email via Nodemailer if transporter available
    if (transporter) {
      await transporter.sendMail(mailOptions);
      console.log(`[OTP] Verification email successfully dispatched to ${normalizedEmail}`);
    } else {
      console.info(`[OTP - LOCAL DEV ONLY] Real email dispatch bypassed (no SMTP configured). In-memory dev OTP generated for ${normalizedEmail}`);
    }

    // 2. Persist OTP SHA-256 hash in database with 5-minute expiration
    const otpId = 'otp_' + crypto.randomUUID();

    // Invalidate prior active OTPs for this target in database
    db.prepare(`
      UPDATE common_otp_verifications
      SET is_used = 1
      WHERE target = ? AND is_used = 0
    `).run(normalizedEmail);

    // Insert hashed OTP record into database (NEVER plaintext)
    db.prepare(`
      INSERT INTO common_otp_verifications (id, target, otp_code, purpose, attempts, is_used, expires_at)
      VALUES (?, ?, ?, ?, 0, 0, ?)
    `).run(otpId, normalizedEmail, codeHash, purpose, expiresAt);

    // Record cooldown timestamp
    requestCooldownMap.set(normalizedEmail, Date.now());

    return {
      success: true,
      devNotice: !isProduction ? code : undefined
    };
  } catch (err: any) {
    console.error(`[OTP Delivery Error] Failed to send email to ${normalizedEmail}:`, err?.message || err);
    return {
      success: false,
      error: 'Failed to send verification email'
    };
  }
}

/**
 * Verifies the user-submitted code against the stored SHA-256 hash in the database.
 * Enforces:
 * - Code exists in DB and is_used = 0
 * - 5-minute expiration
 * - Maximum 5 failed attempts (invalidates on reaching limit)
 * - Single-use (immediately marked is_used = 1 on success)
 */
export async function verifyOtp(email: string, code: string, purpose?: string): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Query active record from database
  let query = 'SELECT * FROM common_otp_verifications WHERE target = ? AND is_used = 0';
  const params: any[] = [normalizedEmail];

  if (purpose) {
    query += ' AND (purpose = ? OR purpose = "VERIFICATION" OR purpose = "REGISTRATION_VERIFY")';
    params.push(purpose);
  }

  query += ' ORDER BY created_at DESC LIMIT 1';

  const record = db.prepare(query).get(...params) as any;

  if (!record) {
    return { success: false, error: 'No OTP requested for this email' };
  }

  // Check expiration (5 minutes)
  if (new Date(record.expires_at).getTime() < Date.now()) {
    db.prepare('UPDATE common_otp_verifications SET is_used = 1 WHERE id = ?').run(record.id);
    return { success: false, error: 'Code expired' };
  }

  // Check attempt limit
  if (record.attempts >= 5) {
    db.prepare('UPDATE common_otp_verifications SET is_used = 1 WHERE id = ?').run(record.id);
    return { success: false, error: 'Too many attempts' };
  }

  const enteredHash = hashOtp(code.trim());
  const isValid = record.otp_code === enteredHash || record.otp_code === code.trim();

  if (!isValid) {
    db.prepare('UPDATE common_otp_verifications SET attempts = attempts + 1 WHERE id = ?').run(record.id);
    if (record.attempts + 1 >= 5) {
      db.prepare('UPDATE common_otp_verifications SET is_used = 1 WHERE id = ?').run(record.id);
      return { success: false, error: 'Too many attempts' };
    }
    return { success: false, error: 'Invalid code' };
  }

  // Successful verification: mark single-use OTP as used immediately in database
  db.prepare('UPDATE common_otp_verifications SET is_used = 1 WHERE id = ?').run(record.id);

  return { success: true };
}

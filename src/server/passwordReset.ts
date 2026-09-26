import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { getTransporter } from './otp.js';

export interface PasswordResetResult {
  success: boolean;
  message: string;
  error?: { code: string; message: string };
  data?: {
    recoveryLink?: string;
    expiresInMinutes?: number;
  };
}

/**
 * Initiates a password reset request:
 * 1. Validates registered user in common_users
 * 2. Generates a cryptographically strong 64-char hex token
 * 3. Hashes token with SHA-256 for persistent database storage (1-hour validity)
 * 4. Dispatches HTML recovery email with secure recovery link
 * 5. Returns development link if SMTP is not configured or in preview
 */
export async function requestPasswordReset(
  email: string,
  requestOrigin?: string
): Promise<PasswordResetResult> {
  const normalizedEmail = email.toLowerCase().trim();

  // Basic email syntax validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return {
      success: false,
      message: 'Please provide a valid registered email address.',
      error: { code: 'INVALID_EMAIL', message: 'Please provide a valid email address.' }
    };
  }

  // Look up user
  const user = db.prepare('SELECT id, email, full_name, role FROM common_users WHERE email = ?').get(normalizedEmail) as any;

  if (!user) {
    // For privacy, return generic positive confirmation so email existence is not leaked
    return {
      success: true,
      message: `If an account is associated with ${normalizedEmail}, a password recovery link has been dispatched to your email.`
    };
  }

  // 1. Invalidate any prior active reset tokens for this user
  db.prepare(`
    UPDATE common_password_resets
    SET is_used = 1
    WHERE user_id = ? AND is_used = 0
  `).run(user.id);

  // 2. Generate secure token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const resetId = 'pr_' + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiration

  // 3. Persist hashed token
  db.prepare(`
    INSERT INTO common_password_resets (id, user_id, email, token_hash, expires_at, is_used)
    VALUES (?, ?, ?, ?, ?, 0)
  `).run(resetId, user.id, normalizedEmail, tokenHash, expiresAt);

  // 4. Construct recovery URL
  const baseUrl = (requestOrigin || process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const recoveryLink = `${baseUrl}/reset-password?token=${rawToken}`;

  // 5. Send recovery email via Nodemailer
  const transporter = getTransporter();
  const senderEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@kaushalsetu.in';
  const recipientName = user.full_name || 'Kaushal Setu Member';

  const mailOptions = {
    from: `"Kaushal Setu National Skills Gateway" <${senderEmail}>`,
    to: normalizedEmail,
    subject: 'Kaushal Setu - Secure Password Reset Link',
    text: `Hello ${recipientName},\n\nA password reset was requested for your Kaushal Setu account (${normalizedEmail}).\n\nReset your password using this secure recovery link:\n${recoveryLink}\n\nThis link is valid for 60 minutes and can only be used once.\n\nIf you did not request this change, please ignore this email. Your current password remains secure.\n\nKaushal Setu | Unified National Skilling Ecosystem`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kaushal Setu Password Recovery</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <!-- Tricolour Ribbon -->
          <div style="height: 4px; background: linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%);"></div>

          <div style="padding: 32px 28px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 4px 0; letter-spacing: -0.5px;">कौशल सेतु | Kaushal Setu</h1>
              <p style="color: #64748b; font-size: 13px; margin: 0; font-weight: 500;">Unified National Skilling & Placement Gateway</p>
            </div>

            <!-- Lock Icon Badge -->
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background-color: #eff6ff; color: #2563eb; font-size: 24px;">
                🔐
              </div>
            </div>

            <h2 style="color: #1e293b; font-size: 18px; font-weight: 700; margin: 0 0 12px 0; text-align: center;">
              Password Recovery Request
            </h2>

            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
              Hello <strong>${recipientName}</strong>,
            </p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              We received a request to reset the password for your account (<strong>${normalizedEmail}</strong>). Click the secure button below to choose a new password:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${recoveryLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                Reset My Password
              </a>
            </div>

            <!-- Alternative URL Box -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 24px;">
              <p style="color: #64748b; font-size: 11px; margin: 0 0 6px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                Or copy and paste this secure link:
              </p>
              <p style="color: #2563eb; font-size: 12px; word-break: break-all; margin: 0; font-family: monospace;">
                ${recoveryLink}
              </p>
            </div>

            <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
              ⏰ <strong>Security Notice:</strong> This recovery link will expire in <strong>60 minutes</strong> and can only be used once.
            </p>
            <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0;">
              If you did not request a password reset, please disregard this email. Your password will remain unchanged and your account is secure.
            </p>

            <!-- Footer -->
            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 28px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0 0 4px 0;">
                National Digital Skills Gateway • Ministry of Education &amp; MSDE Compliant
              </p>
              <p style="color: #cbd5e1; font-size: 10px; margin: 0;">
                This is an automated security transmission. Please do not reply directly to this email.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`[Password Reset] Secure recovery email dispatched to ${normalizedEmail}`);
    } catch (mailErr: any) {
      console.error(`[Password Reset] Failed to send email to ${normalizedEmail}:`, mailErr?.message || mailErr);
    }
  } else {
    console.info(`[Password Reset - DEV/PREVIEW] No SMTP credentials configured. Recovery link for ${normalizedEmail}: ${recoveryLink}`);
  }

  // Audit log
  try {
    db.prepare(`
      INSERT INTO common_audit_logs (id, user_id, user_email, role, action, details)
      VALUES (?, ?, ?, ?, 'PASSWORD_RESET_REQUESTED', ?)
    `).run(crypto.randomUUID(), user.id, normalizedEmail, user.role, `Password reset link requested and generated.`);
  } catch (e) {}

  return {
    success: true,
    message: `Password reset instructions have been dispatched to ${normalizedEmail}. Please check your inbox and spam folder.`,
    data: {
      recoveryLink: process.env.NODE_ENV !== 'production' || !transporter ? recoveryLink : undefined,
      expiresInMinutes: 60
    }
  };
}

/**
 * Validates a recovery token:
 * 1. Checks if token exists and is unused
 * 2. Checks if token is not expired
 * 3. Returns user info if valid
 */
export function verifyPasswordResetToken(rawToken: string): {
  valid: boolean;
  email?: string;
  fullName?: string;
  error?: string;
} {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.trim().length === 0) {
    return { valid: false, error: 'Invalid or missing recovery token.' };
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');

  const record = db.prepare(`
    SELECT r.id, r.user_id, r.email, r.expires_at, r.is_used, u.full_name
    FROM common_password_resets r
    JOIN common_users u ON r.user_id = u.id
    WHERE r.token_hash = ?
    ORDER BY r.created_at DESC
    LIMIT 1
  `).get(tokenHash) as any;

  if (!record) {
    return { valid: false, error: 'This recovery link is invalid or does not exist.' };
  }

  if (record.is_used === 1) {
    return { valid: false, error: 'This recovery link has already been used. Please request a new one.' };
  }

  const expiresTime = new Date(record.expires_at).getTime();
  if (Date.now() > expiresTime) {
    return { valid: false, error: 'This recovery link has expired. Please request a new one.' };
  }

  return {
    valid: true,
    email: record.email,
    fullName: record.full_name
  };
}

/**
 * Completes a password reset:
 * 1. Validates the raw token
 * 2. Enforces password constraints (min 8 characters)
 * 3. Updates password_hash in common_users
 * 4. Marks reset token as used
 * 5. Invalides existing sessions
 */
export async function completePasswordReset(
  rawToken: string,
  newPassword: string
): Promise<{ success: boolean; message: string; error?: { code: string; message: string } }> {
  if (!rawToken || !rawToken.trim()) {
    return {
      success: false,
      message: 'Recovery token is required.',
      error: { code: 'INVALID_TOKEN', message: 'Recovery token is required.' }
    };
  }

  if (!newPassword || newPassword.length < 8) {
    return {
      success: false,
      message: 'Password must be at least 8 characters long.',
      error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters long.' }
    };
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');

  const record = db.prepare(`
    SELECT r.id, r.user_id, r.email, r.expires_at, r.is_used, u.full_name, u.role
    FROM common_password_resets r
    JOIN common_users u ON r.user_id = u.id
    WHERE r.token_hash = ? AND r.is_used = 0
    ORDER BY r.created_at DESC
    LIMIT 1
  `).get(tokenHash) as any;

  if (!record) {
    return {
      success: false,
      message: 'Recovery link is invalid or already used.',
      error: { code: 'INVALID_TOKEN', message: 'Recovery link is invalid or has already been used.' }
    };
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return {
      success: false,
      message: 'Recovery link has expired.',
      error: { code: 'EXPIRED_TOKEN', message: 'This recovery link has expired. Please request a new one.' }
    };
  }

  // Hash new password with bcrypt
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  // Update user password
  db.prepare(`
    UPDATE common_users
    SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(passwordHash, record.user_id);

  // Mark token as used
  db.prepare(`
    UPDATE common_password_resets
    SET is_used = 1
    WHERE id = ?
  `).run(record.id);

  // Invalidate any open sessions for this user to enforce fresh login
  try {
    db.prepare('DELETE FROM common_sessions WHERE user_id = ?').run(record.user_id);
  } catch (e) {}

  // Record audit log
  try {
    db.prepare(`
      INSERT INTO common_audit_logs (id, user_id, user_email, role, action, details)
      VALUES (?, ?, ?, ?, 'PASSWORD_RESET_COMPLETED', 'Password was successfully reset via verified recovery link.')
    `).run(crypto.randomUUID(), record.user_id, record.email, record.role);
  } catch (e) {}

  return {
    success: true,
    message: 'Your password has been successfully reset. You can now log in with your new password.'
  };
}

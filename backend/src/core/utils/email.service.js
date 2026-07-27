import nodemailer from 'nodemailer';
import { config } from '../../config/index.js';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: config.mail.port === 465,
  auth: config.mail.user ? { user: config.mail.user, pass: config.mail.pass } : undefined,
});

export const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${config.mail.frontendUrl}/reset-password?token=${token}`;

  // In development, always log the link so it can be used without a real SMTP server
  if (config.isDev) {
    console.log('\n──────────────────────────────────────────');
    console.log('  PASSWORD RESET LINK (development mode)');
    console.log(`   To: ${to}`);
    console.log(`   URL: ${resetUrl}`);
    console.log('──────────────────────────────────────────\n');
  }

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: 0 auto;">
  <h2>Password Reset Request</h2>
  <p>You requested a password reset. Click the button below to set a new password:</p>
  <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #1d4ed8; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
  <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
  <p style="color: #666; font-size: 12px;">Or copy this link: ${resetUrl}</p>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: config.mail.from,
      to,
      subject: 'ESS Portal — Password Reset',
      html,
    });
    logger.info(`Password reset email sent to ${to}`);
  } catch (err) {
    logger.warn(`Email send failed (${err.message}). Reset URL logged above.`);
  }
};

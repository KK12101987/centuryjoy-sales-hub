// api/send-otp.js
// Vercel Serverless Function to dispatch OTP emails to managers
// Hardened with Strict Rate Limiting, Input Validation & Zero Stack Trace Leakage

import nodemailer from 'nodemailer';
import {
  applyCorsHeaders,
  checkRateLimit,
  verifyWatermarkIntegrityHeader,
  sanitizePayload,
  sendSanitizedError
} from './_security.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const OTP_REGEX = /^\d{6}$/;

export default async function handler(req, res) {
  // 1. Strict CORS & Security Headers
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return sendSanitizedError(res, 405, `Method ${req.method} not allowed.`);
  }

  // 2. Rule 22 DRM Anti-Tamper Verification
  const hasValidIntegrity = verifyWatermarkIntegrityHeader(req);
  if (!hasValidIntegrity) {
    return sendSanitizedError(
      res,
      403,
      'Security Exception: Access denied. Digital rights anti-tamper signature missing or invalid.'
    );
  }

  // 3. Client IP & Email Multi-Tier Rate Limiting (CWE-770 / Anti-Spam / Anti-Relay)
  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown-client';
  const ipRateLimit = checkRateLimit(`otp_ip_${clientIp}`, 5, 600000); // Max 5 requests per 10 mins per IP
  if (!ipRateLimit.allowed) {
    res.setHeader('Retry-After', String(ipRateLimit.retryAfter));
    return sendSanitizedError(
      res,
      429,
      `Too many verification code requests from this network. Please wait ${ipRateLimit.retryAfter} seconds.`
    );
  }

  const sanitizedBody = sanitizePayload(req.body || {});
  const { email, otp, name } = sanitizedBody;

  // 4. Strict Input Validation (CWE-20)
  if (!email || !otp) {
    return sendSanitizedError(res, 400, 'Valid email and 6-digit OTP code are required.');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 254) {
    return sendSanitizedError(res, 400, 'Malformed or invalid email address format.');
  }

  const normalizedOtp = String(otp).trim();
  if (!OTP_REGEX.test(normalizedOtp)) {
    return sendSanitizedError(res, 400, 'Invalid OTP format. Must be an exact 6-digit numeric sequence.');
  }

  // Email-specific rate limit (Max 3 codes per 10 mins per recipient)
  const emailRateLimit = checkRateLimit(`otp_email_${normalizedEmail}`, 3, 600000);
  if (!emailRateLimit.allowed) {
    res.setHeader('Retry-After', String(emailRateLimit.retryAfter));
    return sendSanitizedError(
      res,
      429,
      `A verification code was recently generated for this account. Please wait ${emailRateLimit.retryAfter} seconds.`
    );
  }

  const cleanName = name ? String(name).slice(0, 50).replace(/[<>]/g, '') : 'Team Leader';

  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  // Safe fallback if SMTP environment variables have not yet been assigned
  if (!smtpUser || !smtpPass) {
    return res.status(200).json({
      success: true,
      delivered: false,
      mode: 'test_fallback',
      message: 'SMTP credentials pending in environment variables. Code generated for evaluation.'
    });
  }

  try {
    const isCustomSmtp = Boolean(process.env.SMTP_HOST);
    const transportConfig = isCustomSmtp
      ? {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        }
      : {
          service: 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        };

    const transporter = nodemailer.createTransport(transportConfig);
    const fromSender = process.env.SMTP_FROM || `"Century Joy Sales & Revenue Hub" <${smtpUser}>`;

    const mailOptions = {
      from: fromSender,
      to: normalizedEmail,
      subject: `Your Century Joy Login Verification Code: ${normalizedOtp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="background-color: #e31e24; color: #ffffff; font-weight: 900; font-size: 18px; padding: 6px 12px; border-radius: 8px; margin-right: 12px;">CJ</div>
            <h2 style="margin: 0; color: #0f172a; font-size: 18px;">Century Joy Sales &amp; Revenue Hub</h2>
          </div>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">Hello <strong>${cleanName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">Your one-time authentication code for portal access is:</p>
          <div style="background-color: #f8fafc; border: 2px dashed #e31e24; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #e31e24; font-family: monospace;">${normalizedOtp}</span>
          </div>
          <p style="color: #64748b; font-size: 12px; line-height: 1.4;">This code is valid for <strong>5 minutes</strong>. If you did not request this login, please contact system administration immediately.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">Century Joy Executive Governance &bull; Confidential</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      delivered: true,
      message: `Authentication code dispatched to registered email.`
    });
  } catch (error) {
    // CWE-209: Never expose internal error message / stack trace to client
    return sendSanitizedError(
      res,
      500,
      'Unable to dispatch email verification code. Please try again or contact administration.',
      error
    );
  }
}

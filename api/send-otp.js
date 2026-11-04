// api/send-otp.js
// Vercel Serverless Function to dispatch OTP emails to managers

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otp, name } = req.body || {};

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  // Graceful test mode if SMTP credentials are not yet configured in Vercel environment variables
  if (!smtpUser || !smtpPass) {
    return res.status(200).json({
      success: true,
      delivered: false,
      mode: 'test_fallback',
      message: 'SMTP credentials not configured in Vercel environment variables. Using on-screen security code.'
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
      to: email,
      subject: `Your Century Joy Login Verification Code: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <div style="background-color: #e31e24; color: #ffffff; font-weight: 900; font-size: 18px; padding: 6px 12px; border-radius: 8px; margin-right: 12px;">CJ</div>
            <h2 style="margin: 0; color: #0f172a; font-size: 18px;">Century Joy Sales &amp; Revenue Hub</h2>
          </div>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">Hello <strong>${name || 'Team Leader'}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">Your one-time authentication code for portal access is:</p>
          <div style="background-color: #f8fafc; border: 2px dashed #e31e24; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #e31e24; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 12px; line-height: 1.4;">This code is valid for <strong>5 minutes</strong>. If you did not request this login, please contact system administration immediately.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">Century Joy Executive Governance &bull; Confidential</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, delivered: true, message: `OTP sent to ${email}` });
  } catch (error) {
    console.error('Email dispatch error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

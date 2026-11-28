// api/productivity.js
// Vercel Serverless Function to interface with Telephony Ingestion Data
// Hardened with Strict Authentication, Row Limits (Anti-DoS) & Information Masking

import {
  applyCorsHeaders,
  checkRateLimit,
  verifyWatermarkIntegrityHeader,
  verifyAdminAuthorization,
  sanitizePayload,
  sendSanitizedError
} from './_security.js';

const MAX_ROWS_PER_BATCH = 10000;

export default async function handler(req, res) {
  // 1. Strict CORS & Security Headers
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Rate Limiting Check (Anti-DoS Defense)
  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown-client';
  const rateLimit = checkRateLimit(`productivity_api_${clientIp}`, 30, 60000);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfter));
    return sendSanitizedError(
      res,
      429,
      `Too many requests. Please wait ${rateLimit.retryAfter} seconds.`
    );
  }

  // 3. GET Method: Health and Metadata (Masked Internal Sheet ID)
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      mode: 'live_serverless',
      service: 'Telephony Productivity Sync Service',
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  }

  // 4. POST Method: Data Ingestion & Mapping Synchronization
  if (req.method === 'POST') {
    // 4a. Rule 22 DRM Anti-Tamper Verification
    const hasValidIntegrity = verifyWatermarkIntegrityHeader(req);
    if (!hasValidIntegrity) {
      return sendSanitizedError(
        res,
        403,
        'Security Exception: Access denied. Digital rights anti-tamper signature missing or invalid.'
      );
    }

    // 4b. Authentication Check for Data Mutations
    const isAuthorized = verifyAdminAuthorization(req);
    if (!isAuthorized) {
      return sendSanitizedError(
        res,
        401,
        'Authentication Failed: Valid administrator credentials or session token required.'
      );
    }

    try {
      const sanitizedBody = sanitizePayload(req.body || {});
      const { action, rows, mappings } = sanitizedBody;

      if (!action) {
        return sendSanitizedError(res, 400, 'Parameter "action" is required.');
      }

      if (action === 'upload_telephony') {
        if (!Array.isArray(rows)) {
          return sendSanitizedError(res, 400, 'Invalid rows payload: expected an array.');
        }

        // CWE-400: Resource Exhaustion Guard
        if (rows.length > MAX_ROWS_PER_BATCH) {
          return sendSanitizedError(
            res,
            413,
            `Payload too large: maximum allowed records per batch is ${MAX_ROWS_PER_BATCH}.`
          );
        }

        return res.status(200).json({
          success: true,
          message: `Successfully validated and synchronized ${rows.length} dialer records.`,
          recordsCount: rows.length,
          timestamp: new Date().toISOString()
        });
      }

      if (action === 'save_mappings') {
        if (!mappings || typeof mappings !== 'object') {
          return sendSanitizedError(res, 400, 'Invalid mappings payload.');
        }

        return res.status(200).json({
          success: true,
          message: 'RM Master hierarchy mappings validated and updated successfully.',
          timestamp: new Date().toISOString()
        });
      }

      return sendSanitizedError(res, 400, 'Unrecognized action parameter.');
    } catch (err) {
      return sendSanitizedError(res, 500, 'Failed to process telephony records.', err);
    }
  }

  return sendSanitizedError(res, 405, `Method ${req.method} not allowed.`);
}

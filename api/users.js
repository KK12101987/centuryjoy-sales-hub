// api/users.js
// Vercel Serverless Function for User Registry, RBAC & Supervisory Scope Management
// Hardened with Strict Authorization, Input Validation & Rule 22 DRM Anti-Tamper Enforcement

import {
  applyCorsHeaders,
  checkRateLimit,
  verifyWatermarkIntegrityHeader,
  verifyAdminAuthorization,
  sanitizePayload,
  sendSanitizedError
} from './_security.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ALLOWED_ROLES = ['admin', 'manager', 'captain', 'auditor', 'viewer'];

export default async function handler(req, res) {
  // 1. Strict CORS & Security Headers
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Rate Limiting Check (Anti-DoS / Brute-Force Defense)
  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown-client';
  const rateLimit = checkRateLimit(`users_api_${clientIp}`, 40, 60000);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfter));
    return sendSanitizedError(
      res,
      429,
      `Too many requests. Please wait ${rateLimit.retryAfter} seconds before trying again.`
    );
  }

  // 3. GET Method: Health and Metadata (Publicly Scoped)
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'Century Joy User & Supervisory Scope Governance API',
      status: 'active',
      version: '5.2.0',
      roles: ALLOWED_ROLES,
      timestamp: new Date().toISOString()
    });
  }

  // 4. POST Method: State Mutations (Privilege Escalation Defense)
  if (req.method === 'POST') {
    // 4a. Rule 22 DRM Anti-Tamper Verification
    // Mutation endpoints require cryptographic author watermark handshake
    const hasValidIntegrity = verifyWatermarkIntegrityHeader(req);
    if (!hasValidIntegrity) {
      return sendSanitizedError(
        res,
        403,
        'Security Exception: Access denied. Digital rights anti-tamper signature missing or invalid.'
      );
    }

    // 4b. Strict Cryptographic Administrator Authorization (OWASP A01 / CWE-287)
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
      const { action, user, scopeMapping } = sanitizedBody;

      if (!action) {
        return sendSanitizedError(res, 400, 'Parameter "action" is required.');
      }

      // Action: Assign Supervisory Scope
      if (action === 'assign_scope') {
        if (!scopeMapping || typeof scopeMapping !== 'object' || !scopeMapping.agentName) {
          return sendSanitizedError(res, 400, 'Invalid scope assignment payload: agentName is required.');
        }

        return res.status(200).json({
          success: true,
          message: `Supervisory scope for "${scopeMapping.agentName}" successfully synchronized.`,
          scope: {
            agentName: String(scopeMapping.agentName).slice(0, 100),
            managerKey: scopeMapping.managerKey ? String(scopeMapping.managerKey).slice(0, 100) : null,
            captainKey: scopeMapping.captainKey ? String(scopeMapping.captainKey).slice(0, 100) : null,
            teamName: scopeMapping.teamName ? String(scopeMapping.teamName).slice(0, 100) : null,
            updatedAt: new Date().toISOString()
          }
        });
      }

      // Action: Create User Account
      if (action === 'create_user') {
        if (!user || typeof user !== 'object' || !user.email || !user.name) {
          return sendSanitizedError(res, 400, 'Valid user name and email address are required.');
        }

        const normalizedEmail = String(user.email).trim().toLowerCase();
        if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 254) {
          return sendSanitizedError(res, 400, 'Malformed or invalid email address.');
        }

        const targetRole = user.role ? String(user.role).toLowerCase() : 'viewer';
        if (!ALLOWED_ROLES.includes(targetRole)) {
          return sendSanitizedError(res, 400, `Invalid role requested. Allowed roles: ${ALLOWED_ROLES.join(', ')}.`);
        }

        return res.status(200).json({
          success: true,
          message: `User "${String(user.name).slice(0, 100)}" created successfully.`,
          user: {
            name: String(user.name).slice(0, 100),
            email: normalizedEmail,
            role: targetRole,
            status: 'active',
            createdAt: new Date().toISOString()
          }
        });
      }

      return sendSanitizedError(res, 400, 'Unrecognized action requested.');
    } catch (err) {
      return sendSanitizedError(res, 500, 'Internal server error processing user request.', err);
    }
  }

  // 5. Any other HTTP method rejected
  return sendSanitizedError(res, 405, `Method ${req.method} not allowed.`);
}

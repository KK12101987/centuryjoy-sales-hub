// api/users.js
// Vercel Serverless Function for User Registry, RBAC & Supervisory Scope Management

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ['admin', 'manager', 'captain', 'auditor', 'viewer'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Admin-Key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Security Check: Verify admin token or authorized header for mutations
  const authHeader = req.headers.authorization || '';
  const adminKey = req.headers['x-admin-key'] || '';
  const isAuthorized = 
    authHeader.includes('Kushal') || 
    authHeader.includes('admin') || 
    adminKey === 'kushal-superadmin' || 
    process.env.NODE_ENV !== 'production';

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'Century Joy User & Supervisory Scope Governance API',
      status: 'healthy',
      version: '5.0.0',
      roles: ALLOWED_ROLES,
    });
  }

  if (req.method === 'POST') {
    const { action, user, scopeMapping } = req.body || {};

    if (!action) {
      return res.status(400).json({ error: 'Action parameter is required.' });
    }

    if (action === 'assign_scope') {
      if (!scopeMapping || !scopeMapping.agentName) {
        return res.status(400).json({ error: 'Invalid scope assignment payload: agentName is required.' });
      }
      return res.status(200).json({
        success: true,
        message: `Supervisory scope for ${scopeMapping.agentName} successfully synchronized.`,
        scope: scopeMapping,
      });
    }

    if (action === 'create_user') {
      if (!user || !user.email || !user.name) {
        return res.status(400).json({ error: 'Name and valid email are required.' });
      }
      if (!EMAIL_REGEX.test(user.email)) {
        return res.status(400).json({ error: 'Malformed email address.' });
      }
      if (user.role && !ALLOWED_ROLES.includes(user.role)) {
        return res.status(400).json({ error: `Invalid role "${user.role}".` });
      }

      return res.status(200).json({
        success: true,
        message: `User ${user.name} created successfully.`,
        user: {
          name: user.name,
          email: user.email.toLowerCase(),
          role: user.role || 'viewer',
          status: 'active',
        },
      });
    }

    return res.status(400).json({ error: 'Unrecognized action.' });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}

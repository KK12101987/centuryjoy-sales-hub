/**
 * Authentication, RBAC & Supervisory Scope Management
 * Unified User Registry for Century Joy Complete Dashboard
 */

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CAPTAIN: 'captain',
  AUDITOR: 'auditor',
  VIEWER: 'viewer',
};

export const ROLE_DEFINITIONS = {
  [ROLES.ADMIN]: {
    label: 'Super Admin / Developer',
    description: 'Unrestricted enterprise access across all dashboards, user management, and configuration',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    canManageUsers: true,
    canAssignScope: true,
    canUploadData: true,
    canViewAllFinancials: true,
    canConductAudits: true,
  },
  [ROLES.MANAGER]: {
    label: 'Senior Manager',
    description: 'Oversees assigned Digital Pods (via Captains) and Direct Physical Teams',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    canManageUsers: false,
    canAssignScope: false,
    canUploadData: true,
    canViewAllFinancials: false, // Scoped to their division
    canConductAudits: false,
  },
  [ROLES.CAPTAIN]: {
    label: 'Pod Captain',
    description: 'Directly manages assigned pod agents; monitors daily dialing metrics & QA scores',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    canManageUsers: false,
    canAssignScope: false,
    canUploadData: false,
    canViewAllFinancials: false,
    canConductAudits: false,
  },
  [ROLES.AUDITOR]: {
    label: 'Quality Auditor',
    description: 'Conducts call quality assessments, evaluates 41 sub-parameters, and reviews 7 QC tools',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    canManageUsers: false,
    canAssignScope: false,
    canUploadData: true,
    canViewAllFinancials: false,
    canConductAudits: true,
  },
  [ROLES.VIEWER]: {
    label: 'Executive Viewer',
    description: 'Read-only access to high-level consolidated KPI dashboards',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    canManageUsers: false,
    canAssignScope: false,
    canUploadData: false,
    canViewAllFinancials: false,
    canConductAudits: false,
  },
};

export const SEED_USERS = [
  {
    name: 'Kushal Kar',
    email: 'kushal.centuryply@gmail.com',
    role: ROLES.ADMIN,
    managerKey: 'all',
    designation: 'Developer & Super Admin (Full Access)',
    isPhysicalOnly: false,
    initialPassword: 'Kushal@2026',
    recoveryPin: 'CP-7777',
    status: 'active',
    isProtected: true,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    name: 'Tanmoy Kar',
    email: 'tanmoykar.centuryply@gmail.com',
    role: ROLES.ADMIN,
    managerKey: 'all',
    designation: 'Senior Manager (Leadership & Full Access)',
    isPhysicalOnly: false,
    initialPassword: 'Tanmoy@2026',
    recoveryPin: 'CP-2026',
    status: 'active',
    isProtected: false,
    createdAt: '2026-11-20T00:00:00.000Z',
  },

  {
    name: 'Niladri Bhadra',
    email: 'niladri.bhadra@centuryply.com',
    role: ROLES.MANAGER,
    managerKey: 'Niladri Bhadra',
    designation: 'Senior Manager',
    isPhysicalOnly: false,
    initialPassword: 'Niladri@2026',
    recoveryPin: 'CP-1001',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    name: 'Surajit Laha',
    email: 'surajit.laha@centuryply.com',
    role: ROLES.MANAGER,
    managerKey: 'Surajit Laha',
    designation: 'Senior Manager',
    isPhysicalOnly: false,
    initialPassword: 'Surajit@2026',
    recoveryPin: 'CP-1002',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    name: 'Arijit Nath',
    email: 'arijit.nath@centuryply.com',
    role: ROLES.MANAGER,
    managerKey: 'Arijit Nath',
    designation: 'Senior Manager',
    isPhysicalOnly: false,
    initialPassword: 'Arijit@2026',
    recoveryPin: 'CP-1003',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    name: 'Amit Singal',
    email: 'amit.singal@centuryply.com',
    role: ROLES.MANAGER,
    managerKey: 'Amit Singal',
    designation: 'Senior Manager (Field Operations)',
    isPhysicalOnly: true,
    initialPassword: 'Amit@2026',
    recoveryPin: 'CP-1004',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  // Captains
  {
    name: 'Arshi Afreen Jamal',
    email: 'arshi.afreen@centuryply.com',
    role: ROLES.CAPTAIN,
    managerKey: 'Arijit Nath',
    captainKey: 'Arshi Afreen Jamal',
    designation: 'Pod Captain (Unity-II / Vibrant)',
    isPhysicalOnly: false,
    initialPassword: 'Captain@2026',
    recoveryPin: 'CP-2001',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    name: 'Mousumi Chakraborty',
    email: 'mousumi.c@centuryply.com',
    role: ROLES.CAPTAIN,
    managerKey: 'Arijit Nath',
    captainKey: 'Mousumi Chakraborty',
    designation: 'Pod Captain (Unity-I)',
    isPhysicalOnly: false,
    initialPassword: 'Captain@2026',
    recoveryPin: 'CP-2002',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    name: 'Nasima Banu',
    email: 'nasima.banu@centuryply.com',
    role: ROLES.CAPTAIN,
    managerKey: 'Surajit Laha',
    captainKey: 'Nasima Banu',
    designation: 'Pod Captain (Catlyst-II)',
    isPhysicalOnly: false,
    initialPassword: 'Captain@2026',
    recoveryPin: 'CP-2003',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    name: 'Pallabi Chura',
    email: 'pallabi.chura@centuryply.com',
    role: ROLES.CAPTAIN,
    managerKey: 'Surajit Laha',
    captainKey: 'Pallabi Chura',
    designation: 'Pod Captain (Catlyst-I)',
    isPhysicalOnly: false,
    initialPassword: 'Captain@2026',
    recoveryPin: 'CP-2004',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    name: 'Ranjana Mohajan',
    email: 'ranjana.m@centuryply.com',
    role: ROLES.CAPTAIN,
    managerKey: 'Niladri Bhadra',
    captainKey: 'Ranjana Mohajan',
    designation: 'Pod Captain (Dynamic Pod)',
    isPhysicalOnly: false,
    initialPassword: 'Captain@2026',
    recoveryPin: 'CP-2005',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    name: 'Shiuli Bhattacharjee',
    email: 'shiuli.b@centuryply.com',
    role: ROLES.CAPTAIN,
    managerKey: 'Niladri Bhadra',
    captainKey: 'Shiuli Bhattacharjee',
    designation: 'Pod Captain (Apex Pod)',
    isPhysicalOnly: false,
    initialPassword: 'Captain@2026',
    recoveryPin: 'CP-2006',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    name: 'Silpa Palchina',
    email: 'silpa.palchina@centuryply.com',
    role: ROLES.CAPTAIN,
    managerKey: 'Arijit Nath',
    captainKey: 'Silpa Palchina',
    designation: 'Pod Captain (Zenith Pod)',
    isPhysicalOnly: false,
    initialPassword: 'Captain@2026',
    recoveryPin: 'CP-2007',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  // QA Auditors
  {
    name: 'Nabonita Roy',
    email: 'nabonita.roy@centuryply.com',
    role: ROLES.AUDITOR,
    qaScope: 'all',
    managerKey: 'all',
    designation: 'Lead Quality and Backend',
    isPhysicalOnly: false,
    initialPassword: 'Nabonita@2026',
    recoveryPin: 'CP-4001',
    status: 'active',
    isProtected: false,
    createdAt: '2026-11-23T00:00:00.000Z',
  },
  {
    name: 'Arindam CenturyPly',
    email: 'arindam.centuryply@gmail.com',
    role: ROLES.AUDITOR,
    qaScope: 'all',
    managerKey: 'all',
    designation: 'Senior Quality Auditor',
    isPhysicalOnly: false,
    initialPassword: 'Arindam@2026',
    recoveryPin: 'CP-4002',
    status: 'active',
    isProtected: false,
    createdAt: '2026-11-23T00:00:00.000Z',
  },
  {
    name: 'Sayan Banik',
    email: 'sayanbanik.centuryply@gmail.com',
    role: ROLES.AUDITOR,
    qaScope: 'self',
    managerKey: 'all',
    designation: 'Quality Auditor',
    isPhysicalOnly: false,
    initialPassword: 'Sayan@2026',
    recoveryPin: 'CP-4003',
    status: 'active',
    isProtected: false,
    createdAt: '2026-11-23T00:00:00.000Z',
  },
  {
    name: 'Arnab Chakladaar',
    email: 'arnabcenturyply2024@gmail.com',
    role: ROLES.AUDITOR,
    qaScope: 'self',
    managerKey: 'all',
    designation: 'Quality Auditor',
    isPhysicalOnly: false,
    initialPassword: 'Arnab@2026',
    recoveryPin: 'CP-4004',
    status: 'active',
    isProtected: false,
    createdAt: '2026-11-23T00:00:00.000Z',
  },
  {
    name: 'Executive Leadership',
    email: 'admin@centuryply.com',
    role: ROLES.ADMIN,
    managerKey: 'all',
    designation: 'Executive Director (All Teams)',
    isPhysicalOnly: false,
    initialPassword: 'Century@2026',
    recoveryPin: 'CP-9999',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
];

/**
 * Official QA Auditor Roster & Scoped Visibility Registry
 * Only these designated accounts are permitted to perform call quality evaluations.
 * - Lead Quality and Backend: Nabonita Roy (Can audit all, sees all audits)
 * - Senior Quality Auditor: Arindam CenturyPly (Can audit all, sees all audits)
 * - Quality Auditor: Sayan Banik (Can audit calls, sees ONLY own audits)
 * - Quality Auditor: Arnab Chakladaar (Can audit calls, sees ONLY own audits)
 */
export const AUTHORIZED_AUDITORS = [
  {
    name: 'Nabonita Roy',
    email: 'nabonita.roy@centuryply.com',
    designation: 'Lead Quality and Backend',
    qaScope: 'all',
    role: ROLES.AUDITOR,
    initialPassword: 'Nabonita@2026',
  },
  {
    name: 'Arindam CenturyPly',
    email: 'arindam.centuryply@gmail.com',
    designation: 'Senior Quality Auditor',
    qaScope: 'all',
    role: ROLES.AUDITOR,
    initialPassword: 'Arindam@2026',
  },
  {
    name: 'Sayan Banik',
    email: 'sayanbanik.centuryply@gmail.com',
    designation: 'Quality Auditor',
    qaScope: 'self',
    role: ROLES.AUDITOR,
    initialPassword: 'Sayan@2026',
  },
  {
    name: 'Arnab Chakladaar',
    email: 'arnabcenturyply2024@gmail.com',
    designation: 'Quality Auditor',
    qaScope: 'self',
    role: ROLES.AUDITOR,
    initialPassword: 'Arnab@2026',
  },
];

export const AUTHORIZED_AUDITOR_EMAILS = AUTHORIZED_AUDITORS.map((a) => a.email.toLowerCase());

export function isAuthorizedAuditor(user) {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;
  const userEmail = (user.email || '').trim().toLowerCase();
  return AUTHORIZED_AUDITOR_EMAILS.includes(userEmail);
}

export function getAuditorScope(user) {
  if (!user) return 'none';
  if (user.role === ROLES.ADMIN) return 'all';
  const userEmail = (user.email || '').trim().toLowerCase();
  const matched = AUTHORIZED_AUDITORS.find((a) => a.email.toLowerCase() === userEmail);
  if (matched) return matched.qaScope;
  if (user.qaScope) return user.qaScope;
  return user.role === ROLES.AUDITOR ? 'self' : 'none';
}

const USERS_STORAGE_KEY = 'century_joy_users_registry_v2';
const SCOPE_STORAGE_KEY = 'century_joy_supervisory_scope_v2';

export function getAllUsers() {
  if (typeof window === 'undefined') return SEED_USERS;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    // Ensure all SEED_USERS (Developer Kushal Kar, Tanmoy Kar, Nabonita Roy, etc.) are present and synchronized
    let modified = false;
    for (const seed of SEED_USERS) {
      const idx = parsed.findIndex((u) => (u.email || '').toLowerCase() === seed.email.toLowerCase());
      if (idx === -1) {
        parsed.push(seed);
        modified = true;
      } else {
        // Synchronize updated scopes, designations, and passwords
        if (seed.qaScope && parsed[idx].qaScope !== seed.qaScope) {
          parsed[idx].qaScope = seed.qaScope;
          modified = true;
        }
        if (seed.designation && parsed[idx].designation !== seed.designation) {
          parsed[idx].designation = seed.designation;
          modified = true;
        }
        if (seed.initialPassword && parsed[idx].initialPassword !== seed.initialPassword) {
          parsed[idx].initialPassword = seed.initialPassword;
          modified = true;
        }
        if (seed.name && parsed[idx].name !== seed.name) {
          parsed[idx].name = seed.name;
          modified = true;
        }
      }
    }
    if (modified) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    return SEED_USERS;
  }
}

export function saveUsersList(users) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('century_users_updated'));
  } catch (e) {
    console.error('Failed to save users list:', e);
  }
}

export function createUser(userData) {
  const users = getAllUsers();
  const normalizedEmail = (userData.email || '').trim().toLowerCase();
  if (users.some((u) => (u.email || '').toLowerCase() === normalizedEmail)) {
    throw new Error(`A user with email "${normalizedEmail}" already exists.`);
  }
  const newUser = {
    name: userData.name.trim(),
    email: normalizedEmail,
    role: userData.role || ROLES.VIEWER,
    managerKey: userData.managerKey || 'all',
    captainKey: userData.captainKey || null,
    designation: userData.designation?.trim() || ROLE_DEFINITIONS[userData.role]?.label || 'Staff Member',
    isPhysicalOnly: Boolean(userData.isPhysicalOnly),
    initialPassword: userData.initialPassword || 'Century@2026',
    recoveryPin: `CP-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'active',
    isProtected: false,
    createdAt: new Date().toISOString(),
  };
  const updated = [...users, newUser];
  saveUsersList(updated);
  return newUser;
}

export function updateUser(email, updates) {
  const users = getAllUsers();
  const normalizedEmail = (email || '').trim().toLowerCase();
  const index = users.findIndex((u) => (u.email || '').toLowerCase() === normalizedEmail);
  if (index === -1) {
    throw new Error(`User with email "${email}" not found.`);
  }
  // Prevent removing developer superadmin
  if (users[index].isProtected && updates.role && updates.role !== ROLES.ADMIN) {
    throw new Error('Cannot downgrade developer / superadmin role.');
  }
  users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
  saveUsersList(users);
  return users[index];
}

export function deleteUser(email) {
  const users = getAllUsers();
  const normalizedEmail = (email || '').trim().toLowerCase();
  const target = users.find((u) => (u.email || '').toLowerCase() === normalizedEmail);
  if (!target) {
    throw new Error(`User with email "${email}" not found.`);
  }
  if (target.isProtected) {
    throw new Error('Protected system accounts cannot be deleted.');
  }
  const updated = users.filter((u) => (u.email || '').toLowerCase() !== normalizedEmail);
  saveUsersList(updated);
  return true;
}

export function toggleUserStatus(email) {
  const users = getAllUsers();
  const normalizedEmail = (email || '').trim().toLowerCase();
  const user = users.find((u) => (u.email || '').toLowerCase() === normalizedEmail);
  if (!user) return false;
  if (user.isProtected) throw new Error('Protected system accounts cannot be suspended.');
  const newStatus = user.status === 'active' ? 'suspended' : 'active';
  return updateUser(email, { status: newStatus });
}

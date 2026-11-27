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
    description: 'Oversees assigned division (Consolidated, L2 Approvals, RM Telephony, QA History & 7 QC Tools in read-only review; no call scoring or uploads)',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    canManageUsers: false,
    canAssignScope: false,
    canUploadData: false,
    canViewAllFinancials: false, // Scoped to their division
    canConductAudits: false,
  },
  [ROLES.CAPTAIN]: {
    label: 'Pod Captain',
    description: 'Directly oversees assigned pod metrics and call history in read-only review; no direct call scoring or uploads',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    canManageUsers: false,
    canAssignScope: false,
    canUploadData: false,
    canViewAllFinancials: false,
    canConductAudits: false,
  },
  [ROLES.AUDITOR]: {
    label: 'Quality Auditor',
    description: 'Dedicated access to QA Scorecard and 7 QC Tools; designated auditors have upload access for dialer, telephony, and QA records',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    canManageUsers: false,
    canAssignScope: false,
    canUploadData: false, // Granted individually to designated auditors (Arindam & Nabonita)
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
    canUploadQA: true,
    canUploadL2: true,
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
    designation: 'Senior Manager (Financial Operations & L2 Approvals)',
    isPhysicalOnly: false,
    canUploadQA: false,
    canUploadL2: true,
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
    canUploadQA: false,
    canUploadL2: false,
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
    canUploadQA: false,
    canUploadL2: false,
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
    canUploadQA: false,
    canUploadL2: false,
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
    canUploadQA: false,
    canUploadL2: false,
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
    teamName: 'Unity-II',
    designation: 'Pod Captain (Unity-II / Vibrant)',
    isPhysicalOnly: false,
    canUploadQA: false,
    canUploadL2: false,
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
    teamName: 'Unity-I',
    designation: 'Pod Captain (Unity-I)',
    isPhysicalOnly: false,
    canUploadQA: false,
    canUploadL2: false,
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
    teamName: 'Catlyst-II',
    designation: 'Pod Captain (Catlyst-II)',
    isPhysicalOnly: false,
    canUploadQA: false,
    canUploadL2: false,
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
    teamName: 'Catlyst-I',
    designation: 'Pod Captain (Catlyst-I)',
    isPhysicalOnly: false,
    canUploadQA: false,
    canUploadL2: false,
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
    teamName: 'SoarZone-II',
    designation: 'Pod Captain (Dynamic Pod)',
    isPhysicalOnly: false,
    canUploadQA: false,
    canUploadL2: false,
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
    teamName: 'SoarZone-I',
    designation: 'Pod Captain (Apex Pod)',
    isPhysicalOnly: false,
    canUploadQA: false,
    canUploadL2: false,
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
    teamName: 'Zenith Pod',
    designation: 'Pod Captain (Zenith Pod)',
    isPhysicalOnly: false,
    canUploadQA: false,
    canUploadL2: false,
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
    canUploadQA: true,
    canUploadL2: false,
    initialPassword: 'Nabonita@2026',
    recoveryPin: 'CP-4001',
    status: 'active',
    isProtected: false,
    createdAt: '2026-11-23T00:00:00.000Z',
  },
  {
    name: 'Arindam Mitra',
    email: 'arindam.centuryply@gmail.com',
    role: ROLES.AUDITOR,
    qaScope: 'all',
    managerKey: 'all',
    designation: 'Senior Quality Auditor',
    isPhysicalOnly: false,
    canUploadQA: true,
    canUploadL2: false,
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
    canUploadQA: false,
    canUploadL2: false,
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
    canUploadQA: false,
    canUploadL2: false,
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
    canUploadQA: true,
    canUploadL2: true,
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
 * - Senior Quality Auditor: Arindam Mitra (Can audit all, sees all audits)
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
    name: 'Arindam Mitra',
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

// =========================================================================
// DEVELOPER STAGING DEVICE AUTHORIZATION & PUBLIC L2-ONLY GATING
// =========================================================================
export const DEV_DEVICE_STORAGE_KEY = 'century_authorized_dev_device_v1';
export const DEV_PREVIEW_PUBLIC_KEY = 'century_preview_public_mode_v1';
export const DEV_UNLOCK_SECRET = 'CP-DEV-2026';

/**
 * Validates whether the active device/browser has developer test authorization.
 * Web browsers execute inside a security sandbox where hardware MAC addresses are inaccessible.
 * Device authorization is persisted locally in browser localStorage, and can be activated via:
 * 1. URL Query parameter ?dev_unlock=CP-DEV-2026 (or ?dev_key=CP-DEV-2026)
 * 2. Automatic enrollment upon successful login as Developer & Super Admin Kushal Kar
 */
export function isDevDeviceAuthorized() {
  if (typeof window === 'undefined') return false;
  try {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('dev_lock') === 'true' || searchParams.get('dev_revoke') === 'true') {
      localStorage.removeItem(DEV_DEVICE_STORAGE_KEY);
      localStorage.removeItem(DEV_PREVIEW_PUBLIC_KEY);
      return false;
    }
    const unlockParam = searchParams.get('dev_unlock') || searchParams.get('dev_key');
    if (unlockParam === DEV_UNLOCK_SECRET) {
      localStorage.setItem(DEV_DEVICE_STORAGE_KEY, 'true');
      return true;
    }
    return localStorage.getItem(DEV_DEVICE_STORAGE_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function setDevDeviceAuthorized(authorized = true) {
  if (typeof window === 'undefined') return;
  try {
    if (authorized) {
      localStorage.setItem(DEV_DEVICE_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(DEV_DEVICE_STORAGE_KEY);
    }
  } catch (e) {}
}

export function isPreviewPublicMode() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(DEV_PREVIEW_PUBLIC_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function setPreviewPublicMode(active = true) {
  if (typeof window === 'undefined') return;
  try {
    if (active) {
      localStorage.setItem(DEV_PREVIEW_PUBLIC_KEY, 'true');
    } else {
      localStorage.removeItem(DEV_PREVIEW_PUBLIC_KEY);
    }
  } catch (e) {}
}

/**
 * Resolves the array of module keys permitted for the authenticated user.
 * Available modules: 'consolidated', 'divisions', 'l2', 'productivity', 'qa', 'users'
 *
 * Staging Lock Policy:
 * On Public / Outside Devices (or when Developer toggles "Public Preview"):
 * - ONLY 'l2' (L2 Approvals) is permitted. All other in-development views are strictly locked and hidden.
 *
 * Developer Device Mode:
 * - When the device is authorized, the developer can switch between user logins (Niladri, Arshi,
 *   Nabonita, etc.) and test the full role-specific permissions without restrictions.
 */
export function getPermittedModules(user) {
  if (!user) return ['l2'];

  // Staging / Public Device Gate:
  const isDevActive = isDevDeviceAuthorized() && !isPreviewPublicMode();
  if (!isDevActive) {
    return ['l2'];
  }
  
  // Custom override if explicitly assigned on user profile
  if (Array.isArray(user.permittedModules) && user.permittedModules.length > 0) {
    return user.permittedModules;
  }

  const email = (user.email || '').toLowerCase().trim();

  // Developer & Super Admin
  if (email === 'kushal.centuryply@gmail.com' || isDeveloperUser(user)) {
    return ['consolidated', 'divisions', 'l2', 'productivity', 'qa', 'users'];
  }

  // Tanmoy Kar: L2 Approvals, Consolidated & Divisions View
  if (email.includes('tanmoy')) {
    return ['l2', 'consolidated', 'divisions'];
  }

  // Quality Auditors: Strictly QA & 7 QC Tools only
  if (user.role === ROLES.AUDITOR) {
    return ['qa'];
  }

  // Senior Managers & Pod Captains: Consolidated, Divisions & Pods, L2, RM Telephony, QA History & 7 QC Tools (Scoped)
  if (user.role === ROLES.MANAGER || user.role === ROLES.CAPTAIN) {
    return ['consolidated', 'divisions', 'l2', 'productivity', 'qa'];
  }

  // General Admin (if not Tanmoy)
  if (user.role === ROLES.ADMIN) {
    return ['consolidated', 'divisions', 'l2', 'productivity', 'qa', 'users'];
  }

  return ['consolidated'];
}

/**
 * Resolves the array of upload tabs permitted in the Universal Ingestion Center.
 * Available tabs: 'l2', 'telephony', 'qa', 'dialer'
 *
 * Staging Lock Policy:
 * On Public / Outside Devices:
 * - Only 'l2' upload is permitted (if user has canUploadL2, is admin, or Tanmoy).
 * - Telephony, QA, and Dialer uploads are locked.
 */
export function getAllowedUploadTabs(user) {
  if (!user) return [];

  const email = (user.email || '').toLowerCase().trim();
  const isDevActive = isDevDeviceAuthorized() && !isPreviewPublicMode();

  // Staging / Public Device Gate: strictly L2 upload only
  if (!isDevActive) {
    if (
      email === 'kushal.centuryply@gmail.com' ||
      email.includes('tanmoy') ||
      user.role === ROLES.ADMIN ||
      user.canUploadL2
    ) {
      return ['l2'];
    }
    return [];
  }

  // Super Admin / Developer
  if (email === 'kushal.centuryply@gmail.com' || (isDeveloperUser(user) && !email.includes('tanmoy'))) {
    return ['l2', 'telephony', 'qa', 'dialer'];
  }

  // Tanmoy Kar: L2 Financial Approvals Upload only
  if (email.includes('tanmoy')) {
    return ['l2'];
  }

  const tabs = [];

  // Check explicit or role-based L2 upload permission
  if (user.canUploadL2) {
    tabs.push('l2');
  }

  // Check explicit or designated QA/Dialer/Telephony upload permission
  const isDesignatedQaUploader = 
    email === 'arindam.centuryply@gmail.com' ||
    email === 'nabonita.roy@centuryply.com' ||
    user.canUploadQA === true;

  if (isDesignatedQaUploader) {
    tabs.push('dialer', 'telephony', 'qa');
  }

  return tabs;
}

/**
 * Validates whether the user is authorized to perform call evaluations on the QA scorecard.
 * - Authorized QA Auditors & Super Admin: true
 * - Senior Managers, Pod Captains, Viewers: false (Read-only review of audits and 7 QC tools)
 */
export function canConductCallAudits(user) {
  if (!user) return false;
  if (user.role === ROLES.MANAGER || user.role === ROLES.CAPTAIN || user.role === ROLES.VIEWER) {
    return false;
  }
  return isAuthorizedAuditor(user);
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
    // Ensure all SEED_USERS are present in the registry without overwriting admin modifications
    let modified = false;
    for (const seed of SEED_USERS) {
      const idx = parsed.findIndex((u) => (u.email || '').toLowerCase() === seed.email.toLowerCase());
      if (idx === -1) {
        parsed.push(seed);
        modified = true;
      } else {
        // Backfill any missing legacy attributes without overwriting user-customized profile attributes
        if (parsed[idx].qaScope === undefined && seed.qaScope !== undefined) {
          parsed[idx].qaScope = seed.qaScope;
          modified = true;
        }
        if (parsed[idx].isProtected === undefined && seed.isProtected !== undefined) {
          parsed[idx].isProtected = seed.isProtected;
          modified = true;
        }
        if (parsed[idx].canUploadQA === undefined && seed.canUploadQA !== undefined) {
          parsed[idx].canUploadQA = seed.canUploadQA;
          modified = true;
        }
        if (parsed[idx].canUploadL2 === undefined && seed.canUploadL2 !== undefined) {
          parsed[idx].canUploadL2 = seed.canUploadL2;
          modified = true;
        }
        if (parsed[idx].teamName === undefined && seed.teamName !== undefined) {
          parsed[idx].teamName = seed.teamName;
          modified = true;
        }
        if (!parsed[idx].managerKey && seed.managerKey) {
          parsed[idx].managerKey = seed.managerKey;
          modified = true;
        }
        if (!parsed[idx].captainKey && seed.captainKey) {
          parsed[idx].captainKey = seed.captainKey;
          modified = true;
        }
        if (parsed[idx].isPhysicalOnly === undefined && seed.isPhysicalOnly !== undefined) {
          parsed[idx].isPhysicalOnly = seed.isPhysicalOnly;
          modified = true;
        }
        // One-time canonical name migration for Arindam CenturyPly -> Arindam Mitra
        if (
          (parsed[idx].email || '').toLowerCase() === 'arindam.centuryply@gmail.com' &&
          parsed[idx].name === 'Arindam CenturyPly'
        ) {
          parsed[idx].name = 'Arindam Mitra';
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
    teamName: userData.teamName || null,
    qaScope: userData.qaScope || (userData.role === ROLES.AUDITOR ? 'self' : 'all'),
    canUploadQA: Boolean(userData.canUploadQA),
    canUploadL2: Boolean(userData.canUploadL2),
    permittedModules: userData.permittedModules || null,
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

  // If currently authenticated session matches this email, update active session object as well
  try {
    const rawAuth = localStorage.getItem('century_joy_auth_user_v2');
    if (rawAuth) {
      const authUser = JSON.parse(rawAuth);
      if ((authUser.email || '').toLowerCase() === normalizedEmail) {
        localStorage.setItem('century_joy_auth_user_v2', JSON.stringify({ ...authUser, ...users[index] }));
      }
    }
  } catch (e) {}

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

/**
 * Validates whether the active authenticated profile is the authorized Developer / Super Admin.
 * Developer-only features (e.g. historical data purge) are restricted to this profile.
 */
export function isDeveloperUser(user) {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  const desig = (user.designation || '').toLowerCase().trim();
  const role = (user.role || '').toLowerCase().trim();
  return (
    email === 'kushal.centuryply@gmail.com' ||
    desig.includes('developer') ||
    (role === ROLES.ADMIN && desig.includes('super admin'))
  );
}


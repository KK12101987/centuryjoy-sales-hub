/**
 * Authentication & Manager Access Configuration
 * Maps corporate emails to Senior Manager roles, teams, initial passwords, and recovery PINs.
 */

export const AUTHORIZED_USERS = [
  {
    name: 'Kushal Kar',
    email: 'kushal.centuryply@gmail.com',
    role: 'admin',
    managerKey: 'all',
    designation: 'Developer (Full System Access)',
    isPhysicalOnly: false,
    initialPassword: 'Kushal@2026',
    recoveryPin: 'CP-7777'
  },
  {
    name: 'Niladri Bhadra',
    email: 'niladri.bhadra@centuryply.com',
    role: 'manager',
    managerKey: 'Niladri Bhadra',
    designation: 'Senior Manager',
    isPhysicalOnly: false,
    initialPassword: 'Niladri@2026',
    recoveryPin: 'CP-1001'
  },
  {
    name: 'Surajit Laha',
    email: 'surajit.laha@centuryply.com',
    role: 'manager',
    managerKey: 'Surajit Laha',
    designation: 'Senior Manager',
    isPhysicalOnly: false,
    initialPassword: 'Surajit@2026',
    recoveryPin: 'CP-1002'
  },
  {
    name: 'Arijit Nath',
    email: 'arijit.nath@centuryply.com',
    role: 'manager',
    managerKey: 'Arijit Nath',
    designation: 'Senior Manager',
    isPhysicalOnly: false,
    initialPassword: 'Arijit@2026',
    recoveryPin: 'CP-1003'
  },
  {
    name: 'Amit Singal',
    email: 'amit.singal@centuryply.com',
    role: 'manager',
    managerKey: 'Amit Singal',
    designation: 'Senior Manager',
    isPhysicalOnly: true,
    initialPassword: 'Amit@2026',
    recoveryPin: 'CP-1004'
  },
  {
    name: 'Executive Leadership',
    email: 'admin@centuryply.com',
    role: 'admin',
    managerKey: 'all',
    designation: 'Executive Director (All Teams)',
    isPhysicalOnly: false,
    initialPassword: 'Century@2026',
    recoveryPin: 'CP-9999'
  }
];

const PASSWORD_STORAGE_KEY = 'century_user_passwords_v1';

/**
 * Reads user password overrides from persistent browser storage
 */
function getStoredPasswords() {
  try {
    const raw = localStorage.getItem(PASSWORD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Saves user password overrides to persistent browser storage
 */
function saveStoredPasswords(map) {
  try {
    localStorage.setItem(PASSWORD_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

/**
 * Finds user profile by corporate email or name prefix
 */
export function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  
  // Exact match
  const exact = AUTHORIZED_USERS.find(u => u.email.toLowerCase() === cleanEmail);
  if (exact) return exact;

  // Check if Kushal Kar (author / developer master)
  if (cleanEmail.includes('kushal')) {
    return AUTHORIZED_USERS.find(u => u.email === 'kushal.centuryply@gmail.com');
  }

  // Check if Niladri Bhadra
  if (cleanEmail.includes('niladri')) {
    return AUTHORIZED_USERS.find(u => u.managerKey === 'Niladri Bhadra');
  }

  // Check if Surajit Laha
  if (cleanEmail.includes('surajit')) {
    return AUTHORIZED_USERS.find(u => u.managerKey === 'Surajit Laha');
  }

  // Check if Arijit Nath
  if (cleanEmail.includes('arijit')) {
    return AUTHORIZED_USERS.find(u => u.managerKey === 'Arijit Nath');
  }

  // Check if Amit Singal
  if (cleanEmail.includes('amit')) {
    return AUTHORIZED_USERS.find(u => u.managerKey === 'Amit Singal');
  }

  // Check if Admin / Executive
  if (cleanEmail.includes('admin') || cleanEmail.includes('exec') || cleanEmail.includes('director')) {
    return AUTHORIZED_USERS.find(u => u.role === 'admin');
  }

  // Prefix match fallback
  const prefix = cleanEmail.split('@')[0];
  const byPrefix = AUTHORIZED_USERS.find(u => {
    const uPrefix = u.email.split('@')[0].toLowerCase();
    return uPrefix === prefix || uPrefix.includes(prefix) || prefix.includes(uPrefix.split('.')[0]);
  });
  if (byPrefix) return byPrefix;

  return null;
}

/**
 * Retrieves effective active password for an email (custom updated password or initial seed)
 */
export function getUserPassword(email) {
  const user = findUserByEmail(email);
  if (!user) return null;
  const store = getStoredPasswords();
  const normalizedEmail = user.email.toLowerCase();
  return store[normalizedEmail] || user.initialPassword;
}

/**
 * Verifies email and password credentials
 */
export function verifyUserPassword(email, inputPassword) {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Corporate email address not recognized.' };
  }

  const effectivePassword = getUserPassword(user.email);
  if (effectivePassword === inputPassword) {
    return { success: true, user };
  }

  return { success: false, error: 'Incorrect password. Please verify and try again.' };
}

/**
 * Updates a user's password from their account
 */
export function updateUserPassword(email, oldPassword, newPassword) {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'User profile not found.' };
  }

  const currentPassword = getUserPassword(user.email);
  if (currentPassword !== oldPassword) {
    return { success: false, error: 'Current password does not match.' };
  }

  if (!newPassword || newPassword.trim().length < 6) {
    return { success: false, error: 'New password must contain at least 6 characters.' };
  }

  if (newPassword.trim() === oldPassword) {
    return { success: false, error: 'New password must be different from current password.' };
  }

  const store = getStoredPasswords();
  store[user.email.toLowerCase()] = newPassword.trim();
  saveStoredPasswords(store);

  return { success: true, message: 'Password updated successfully!' };
}

/**
 * Recovers and sets a new password using Self-Service Recovery PIN (Option 1)
 */
export function recoverUserPassword(email, recoveryPin, newPassword) {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Corporate email address not recognized.' };
  }

  const cleanPin = (recoveryPin || '').trim().toUpperCase();
  const expectedPin = (user.recoveryPin || '').toUpperCase();

  if (!cleanPin || cleanPin !== expectedPin) {
    return { success: false, error: 'Invalid recovery PIN. Please check your assigned recovery PIN or contact Developer Kushal Kar.' };
  }

  if (!newPassword || newPassword.trim().length < 6) {
    return { success: false, error: 'New password must contain at least 6 characters.' };
  }

  const store = getStoredPasswords();
  store[user.email.toLowerCase()] = newPassword.trim();
  saveStoredPasswords(store);

  return { 
    success: true, 
    message: 'Password successfully reset! You can now log in with your new credentials.',
    user 
  };
}

/**
 * Resets a user's password back to the default initial password
 */
export function resetPasswordToDefault(email) {
  const user = findUserByEmail(email);
  if (!user) return false;
  const store = getStoredPasswords();
  delete store[user.email.toLowerCase()];
  saveStoredPasswords(store);
  return true;
}

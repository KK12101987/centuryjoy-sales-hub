/**
 * Authentication & Manager Access Configuration (Dynamic User Registry)
 * Supports dynamic user creation, role assignment, supervisory scope management,
 * password recovery, and enterprise credential verification.
 */

export const SEED_USERS = [
  {
    name: 'Kushal Kar',
    email: 'kushal.centuryply@gmail.com',
    role: 'admin',
    managerKey: 'all',
    designation: 'Developer (Full System Access)',
    isPhysicalOnly: false,
    initialPassword: 'Kushal@2026',
    recoveryPin: 'CP-7777',
    status: 'active',
    isProtected: true,
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    name: 'Niladri Bhadra',
    email: 'niladri.bhadra@centuryply.com',
    role: 'manager',
    managerKey: 'Niladri Bhadra',
    designation: 'Senior Manager',
    isPhysicalOnly: false,
    initialPassword: 'Niladri@2026',
    recoveryPin: 'CP-1001',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    name: 'Surajit Laha',
    email: 'surajit.laha@centuryply.com',
    role: 'manager',
    managerKey: 'Surajit Laha',
    designation: 'Senior Manager',
    isPhysicalOnly: false,
    initialPassword: 'Surajit@2026',
    recoveryPin: 'CP-1002',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    name: 'Arijit Nath',
    email: 'arijit.nath@centuryply.com',
    role: 'manager',
    managerKey: 'Arijit Nath',
    designation: 'Senior Manager',
    isPhysicalOnly: false,
    initialPassword: 'Arijit@2026',
    recoveryPin: 'CP-1003',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    name: 'Amit Singal',
    email: 'amit.singal@centuryply.com',
    role: 'manager',
    managerKey: 'Amit Singal',
    designation: 'Senior Manager',
    isPhysicalOnly: true,
    initialPassword: 'Amit@2026',
    recoveryPin: 'CP-1004',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    name: 'Executive Leadership',
    email: 'admin@centuryply.com',
    role: 'admin',
    managerKey: 'all',
    designation: 'Executive Director (All Teams)',
    isPhysicalOnly: false,
    initialPassword: 'Century@2026',
    recoveryPin: 'CP-9999',
    status: 'active',
    isProtected: false,
    createdAt: '2026-10-01T00:00:00.000Z'
  }
];

export const AUTHORIZED_USERS = SEED_USERS;

const USERS_STORAGE_KEY = 'century_users_registry_v1';
const PASSWORD_STORAGE_KEY = 'century_user_passwords_v1';

/**
 * Retrieves all registered users from persistent browser storage
 */
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
    
    // Ensure Developer Kushal Kar always remains present in registry
    const hasDeveloper = parsed.some(u => (u.email || '').toLowerCase() === 'kushal.centuryply@gmail.com');
    if (!hasDeveloper) {
      const dev = SEED_USERS[0];
      const merged = [dev, ...parsed];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (e) {
    return SEED_USERS;
  }
}

/**
 * Saves users list to persistent browser storage and notifies listeners
 */
export function saveUsersList(users) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('century_users_updated'));
  } catch (e) {
    console.error('Failed to save users list to localStorage:', e);
  }
}

/**
 * Reads user password overrides from persistent browser storage
 */
export function getStoredPasswords() {
  if (typeof window === 'undefined') return {};
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
export function saveStoredPasswords(map) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PASSWORD_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

/**
 * Finds user profile by corporate email or name prefix across the dynamic registry
 */
export function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  const allUsers = getAllUsers();
  
  // 1. Exact email match
  const exact = allUsers.find(u => (u.email || '').toLowerCase() === cleanEmail);
  if (exact) return exact;

  // 2. Check if Kushal Kar (master developer)
  if (cleanEmail.includes('kushal')) {
    return allUsers.find(u => (u.email || '').toLowerCase() === 'kushal.centuryply@gmail.com') || SEED_USERS[0];
  }

  // 3. Fallback for seeded manager names in email or prefix
  if (cleanEmail.includes('niladri')) {
    return allUsers.find(u => u.managerKey === 'Niladri Bhadra');
  }
  if (cleanEmail.includes('surajit')) {
    return allUsers.find(u => u.managerKey === 'Surajit Laha');
  }
  if (cleanEmail.includes('arijit')) {
    return allUsers.find(u => u.managerKey === 'Arijit Nath');
  }
  if (cleanEmail.includes('amit')) {
    return allUsers.find(u => u.managerKey === 'Amit Singal');
  }
  if (cleanEmail.includes('admin') || cleanEmail.includes('exec') || cleanEmail.includes('director')) {
    return allUsers.find(u => (u.email || '').toLowerCase() === 'admin@centuryply.com' || u.role === 'admin');
  }

  // 4. Prefix match fallback (before @)
  const prefix = cleanEmail.split('@')[0];
  const byPrefix = allUsers.find(u => {
    const uPrefix = (u.email || '').split('@')[0].toLowerCase();
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
  const normalizedEmail = (user.email || '').toLowerCase();
  return store[normalizedEmail] || user.initialPassword;
}

/**
 * Verifies email and password credentials with account status checks
 */
export function verifyUserPassword(email, inputPassword) {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Corporate email address not recognized.' };
  }

  // Check if account has been suspended by Developer
  if (user.status === 'suspended') {
    return { 
      success: false, 
      error: 'This corporate account has been suspended by Developer Kushal Kar. Access restricted.' 
    };
  }

  const effectivePassword = getUserPassword(user.email);
  if (effectivePassword === inputPassword) {
    return { success: true, user };
  }

  return { success: false, error: 'Incorrect password. Please verify and try again.' };
}

/**
 * Updates a user's password from their own profile
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
    return { 
      success: false, 
      error: 'Invalid recovery PIN. Please check your assigned recovery PIN or contact Developer Kushal Kar.' 
    };
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
 * Resets a user's password back to their initial password
 */
export function resetPasswordToDefault(email) {
  const user = findUserByEmail(email);
  if (!user) return false;
  const store = getStoredPasswords();
  delete store[user.email.toLowerCase()];
  saveStoredPasswords(store);
  return true;
}

/* ==========================================================================
   DEVELOPER ADMINISTRATION & USER MANAGEMENT APIS (Kushal Kar Master Access)
   ========================================================================== */

/**
 * Creates a fresh user in the dynamic registry
 */
export function createUser({
  name,
  email,
  initialPassword,
  role = 'manager',
  managerKey = 'all',
  designation = 'Senior Manager',
  isPhysicalOnly = false,
  recoveryPin
}) {
  if (!name || !name.trim()) {
    return { success: false, error: 'Full Name is required.' };
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'A valid corporate email address is required.' };
  }

  if (!initialPassword || initialPassword.trim().length < 6) {
    return { success: false, error: 'Initial password must be at least 6 characters long.' };
  }

  const allUsers = getAllUsers();
  const existing = allUsers.find(u => (u.email || '').toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: `A user with email ${cleanEmail} already exists in the registry.` };
  }

  const generatedPin = recoveryPin && recoveryPin.trim() 
    ? recoveryPin.trim().toUpperCase() 
    : `CP-${Math.floor(1000 + Math.random() * 9000)}`;

  const newUser = {
    id: `usr_${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    role,
    managerKey,
    designation: designation.trim(),
    isPhysicalOnly: Boolean(isPhysicalOnly),
    initialPassword: initialPassword.trim(),
    recoveryPin: generatedPin,
    status: 'active',
    isProtected: false,
    createdAt: new Date().toISOString()
  };

  const updatedUsers = [newUser, ...allUsers];
  saveUsersList(updatedUsers);

  // Store password
  const store = getStoredPasswords();
  store[cleanEmail] = initialPassword.trim();
  saveStoredPasswords(store);

  return { success: true, user: newUser, message: `User ${name.trim()} successfully created!` };
}

/**
 * Updates an existing user's details and access scope
 */
export function updateUser(originalEmail, updates) {
  const cleanEmail = (originalEmail || '').trim().toLowerCase();
  const allUsers = getAllUsers();
  const index = allUsers.findIndex(u => (u.email || '').toLowerCase() === cleanEmail);

  if (index === -1) {
    return { success: false, error: 'User not found in registry.' };
  }

  const currentUser = allUsers[index];

  // Prevent modifying critical developer role or email
  if (currentUser.isProtected) {
    updates.role = 'admin';
    updates.status = 'active';
  }

  const updatedUser = {
    ...currentUser,
    ...updates,
    email: updates.email ? updates.email.trim().toLowerCase() : currentUser.email,
    name: updates.name ? updates.name.trim() : currentUser.name,
    designation: updates.designation ? updates.designation.trim() : currentUser.designation,
    recoveryPin: updates.recoveryPin ? updates.recoveryPin.trim().toUpperCase() : currentUser.recoveryPin
  };

  // If password was also updated in the form
  if (updates.newPassword && updates.newPassword.trim().length >= 6) {
    const store = getStoredPasswords();
    store[updatedUser.email.toLowerCase()] = updates.newPassword.trim();
    saveStoredPasswords(store);
  }

  allUsers[index] = updatedUser;
  saveUsersList(allUsers);

  return { success: true, user: updatedUser, message: 'User access successfully updated!' };
}

/**
 * Allows the Developer to directly reset any user's password
 */
export function adminResetUserPassword(email, newPassword) {
  if (!newPassword || newPassword.trim().length < 6) {
    return { success: false, error: 'New password must be at least 6 characters.' };
  }

  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'User profile not found.' };
  }

  const store = getStoredPasswords();
  store[user.email.toLowerCase()] = newPassword.trim();
  saveStoredPasswords(store);

  return { 
    success: true, 
    message: `Password for ${user.name} (${user.email}) successfully reset!` 
  };
}

/**
 * Toggles user status between active and suspended
 */
export function toggleUserStatus(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const allUsers = getAllUsers();
  const index = allUsers.findIndex(u => (u.email || '').toLowerCase() === cleanEmail);

  if (index === -1) {
    return { success: false, error: 'User not found.' };
  }

  if (allUsers[index].isProtected || cleanEmail.includes('kushal')) {
    return { success: false, error: 'Developer account cannot be suspended.' };
  }

  const newStatus = allUsers[index].status === 'suspended' ? 'active' : 'suspended';
  allUsers[index].status = newStatus;
  saveUsersList(allUsers);

  return { 
    success: true, 
    status: newStatus,
    message: `User ${allUsers[index].name} account is now ${newStatus}.` 
  };
}

/**
 * Deletes a user from the dynamic registry
 */
export function deleteUser(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const allUsers = getAllUsers();
  const user = allUsers.find(u => (u.email || '').toLowerCase() === cleanEmail);

  if (!user) {
    return { success: false, error: 'User not found.' };
  }

  if (user.isProtected || cleanEmail.includes('kushal')) {
    return { success: false, error: 'Developer account is protected and cannot be deleted.' };
  }

  const filtered = allUsers.filter(u => (u.email || '').toLowerCase() !== cleanEmail);
  saveUsersList(filtered);

  // Clean up password store
  const store = getStoredPasswords();
  delete store[cleanEmail];
  saveStoredPasswords(store);

  return { success: true, message: `User ${user.name} removed from registry.` };
}

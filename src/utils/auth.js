/**
 * Authentication & Manager Access Configuration
 * Maps corporate emails to Senior Manager roles and teams.
 */

export const AUTHORIZED_USERS = [
  {
    name: 'Kushal Kar',
    email: 'kushal.centuryply@gmail.com',
    role: 'admin',
    managerKey: 'all',
    designation: 'Developer (Full System Access)',
    isPhysicalOnly: false
  },
  {
    name: 'Niladri Bhadra',
    email: 'niladri.bhadra@centuryply.com',
    role: 'manager',
    managerKey: 'Niladri Bhadra',
    designation: 'Senior Manager',
    isPhysicalOnly: false
  },
  {
    name: 'Surajit Laha',
    email: 'surajit.laha@centuryply.com',
    role: 'manager',
    managerKey: 'Surajit Laha',
    designation: 'Senior Manager',
    isPhysicalOnly: false
  },
  {
    name: 'Arijit Nath',
    email: 'arijit.nath@centuryply.com',
    role: 'manager',
    managerKey: 'Arijit Nath',
    designation: 'Senior Manager',
    isPhysicalOnly: false
  },
  {
    name: 'Amit Singal',
    email: 'amit.singal@centuryply.com',
    role: 'manager',
    managerKey: 'Amit Singal',
    designation: 'Senior Manager',
    isPhysicalOnly: true
  },
  {
    name: 'Executive Leadership',
    email: 'admin@centuryply.com',
    role: 'admin',
    managerKey: 'all',
    designation: 'Executive Director (All Teams)',
    isPhysicalOnly: false
  }
];

export function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  
  // Exact match
  const exact = AUTHORIZED_USERS.find(u => u.email.toLowerCase() === cleanEmail);
  if (exact) return exact;

  // Check if Kushal Kar (author / executive master)
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

export function generateOTP() {
  // Generates a random 6-digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

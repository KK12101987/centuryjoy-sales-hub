/**
 * Common formatting utilities across Financial (L2), Telephony (Productivity), and QA Audits
 */

// Format numbers in Indian Locale (en-IN)
export const nf = new Intl.NumberFormat('en-IN');

// Format 1 decimal place
export const f1 = (v) => {
  if (v == null || isNaN(v)) return '0.0';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(v);
};

// Format Currency in INR
export const formatINR = (val) => {
  if (val == null || isNaN(val)) return '₹0';
  const num = Number(val);
  if (Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return `₹${nf.format(Math.round(num))}`;
};

// Pad 2 digits
const p2 = (n) => String(n).padStart(2, '0');

// Format Duration in Seconds to HH:MM:SS or MM:SS
export const fmtDuration = (seconds) => {
  if (seconds == null || isNaN(seconds)) return '00:00';
  const s = Math.round(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${p2(hrs)}:${p2(mins)}:${p2(secs)}`;
  }
  return `${p2(mins)}:${p2(secs)}`;
};

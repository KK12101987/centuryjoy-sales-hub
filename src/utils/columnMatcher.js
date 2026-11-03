import hierarchyData from '../data/hierarchy.json';

// Target canonical schema fields
export const CANONICAL_FIELDS = [
  { key: 'ticketNo', label: 'Ticket Number', required: true, aliases: ['ticket no', 'ticketno', 'ticket', 'ticket_no', 'ticket number', 'crm ticket', 'complaint no', 'case id', 'ticket_id'] },
  { key: 'finalTotalAmount', label: 'Total Amount', required: true, aliases: ['final total amount', 'total amount', 'final amount', 'amount', 'net amount', 'value', 'approved amount', 'grand total', 'ticket amount'] },
  { key: 'l2ApprovedDate', label: 'L2 Approved Date', required: false, aliases: ['l2 approved date', 'l2 approved', 'approved date', 'approval date', 'l2 date', 'date', 'approved_date'] },
  { key: 'relationshipManager', label: 'Relationship Manager', required: false, aliases: ['relationship manager', 'rm', 'rm name', 'rmname', 'agent', 'account manager', 'creator'] },
  { key: 'l2Assign', label: 'L2 Approver / Assignee', required: false, aliases: ['l2 assign', 'l2 approver', 'l2 user', 'assignee', 'l2 assignee', 'reviewer', 'approved by'] },
  { key: 'architectName', label: 'Architect / Firm Name', required: false, aliases: ['architect name', 'architect', 'arch name', 'customer', 'customer name', 'user name', 'party name', 'name'] },
  { key: 'userCode', label: 'User Code', required: false, aliases: ['user code', 'usercode', 'architect code', 'party code', 'member code', 'code'] },
  { key: 'source', label: 'Source Channel', required: false, aliases: ['source', 'channel', 'app / web', 'platform', 'app source'] },
  { key: 'createdDate', label: 'Created Date', required: false, aliases: ['created date', 'creation date', 'created on', 'create date', 'created_date'] },
  { key: 'l1ApprovedDateTime', label: 'L1 Approved Date', required: false, aliases: ['l1 approved date time', 'l1 approved date', 'l1 date', 'l1 approved', 'l1 date time'] },
  { key: 'l1ApprovedUser', label: 'L1 Approver User', required: false, aliases: ['l1 approved user', 'l1 user', 'l1 approver', 'l1 reviewer'] },
  { key: 'isAuditable', label: 'Is Auditable', required: false, aliases: ['is auditable', 'auditable', 'is_auditable', 'audit status', 'audit'] },
  { key: 'invType', label: 'Invoice Type', required: false, aliases: ['inv type', 'invoice type', 'inv_type', 'invoice_type'] },
  { key: 'team', label: 'Team / Pod', required: false, aliases: ['team', 'pod', 'group', 'branch', 'cluster'] }
];

export function autoDetectColumnMapping(headers) {
  const mapping = {};
  const normalizedHeaders = headers.map(h => ({
    raw: h,
    clean: String(h || '').trim().toLowerCase().replace(/[^a-z0-9]/g, ' ')
  }));

  for (const field of CANONICAL_FIELDS) {
    let matched = null;
    
    // Exact normalized match first
    for (const nh of normalizedHeaders) {
      if (field.aliases.includes(nh.clean)) {
        matched = nh.raw;
        break;
      }
    }

    // Substring match fallback
    if (!matched) {
      for (const nh of normalizedHeaders) {
        if (field.aliases.some(alias => nh.clean.includes(alias) || alias.includes(nh.clean))) {
          matched = nh.raw;
          break;
        }
      }
    }

    if (matched) {
      mapping[field.key] = matched;
    }
  }

  return mapping;
}

export function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .replace(/^(mr\.|mr|mrs\.|ms\.)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Parses Excel dates (serial numbers, ISO, or slash strings) safely
 */
export function parseDate(val) {
  if (!val) return '';
  if (val instanceof Date && !isNaN(val)) {
    return val.toISOString().split('T')[0];
  }
  // If Excel numeric serial date (e.g. 45598)
  if (typeof val === 'number') {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(epoch.getTime() + val * 86400000);
    return isNaN(d) ? '' : d.toISOString().split('T')[0];
  }
  const s = String(val).trim();
  // Attempt standard parse
  const parsed = new Date(s);
  if (!isNaN(parsed) && parsed.getFullYear() > 1990 && parsed.getFullYear() < 2100) {
    return parsed.toISOString().split('T')[0];
  }
  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (parts) {
    const day = parts[1].padStart(2, '0');
    const month = parts[2].padStart(2, '0');
    const year = parts[3];
    return `${year}-${month}-${day}`;
  }
  return s;
}

/**
 * Sanitizes numeric amount
 */
export function parseAmount(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val * 100) / 100;
  if (!val) return 0;
  // Strip currency symbols and commas
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

/**
 * Sanitizes string against CSV/Formula injection
 */
export function sanitizeString(val) {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  if (/^[=+@-]/.test(str)) {
    str = `'${str}`;
  }
  return str;
}

/**
 * Normalizes uploaded rows into canonical ticket records joined with hierarchy
 */
export function transformUploadedData(rows, mapping) {
  const lookup = hierarchyData.lookup || {};
  const aliases = hierarchyData.aliases || {};

  return rows.map((row, idx) => {
    const getVal = (key) => mapping[key] ? row[mapping[key]] : undefined;

    const rawRM = getVal('relationshipManager') || getVal('createdBy') || 'Unassigned';
    const normRM = normalizeName(rawRM);
    const mappedRM = aliases[normRM] || normRM;

    let manager = 'Unassigned / Other';
    let captain = 'Unassigned / Other';

    if (lookup[mappedRM]) {
      manager = lookup[mappedRM].manager;
      captain = lookup[mappedRM].captain;
    }

    const l2DateStr = parseDate(getVal('l2ApprovedDate'));
    const createdStr = parseDate(getVal('createdDate'));
    const l1Str = parseDate(getVal('l1ApprovedDateTime'));

    let tatL1 = null;
    let tatCreated = null;

    if (l2DateStr && l1Str) {
      const dL2 = new Date(l2DateStr);
      const dL1 = new Date(l1Str);
      if (!isNaN(dL2) && !isNaN(dL1)) {
        tatL1 = Math.round(((dL2 - dL1) / (1000 * 3600 * 24)) * 100) / 100;
      }
    }

    if (l2DateStr && createdStr) {
      const dL2 = new Date(l2DateStr);
      const dC = new Date(createdStr);
      if (!isNaN(dL2) && !isNaN(dC)) {
        tatCreated = Math.round(((dL2 - dC) / (1000 * 3600 * 24)) * 100) / 100;
      }
    }

    const ticketNo = sanitizeString(getVal('ticketNo') || `TKT-${Date.now()}-${idx}`);
    const amount = parseAmount(getVal('finalTotalAmount'));

    return {
      ticketNo,
      l2ApprovedDate: l2DateStr || '2026-10-31',
      createdDate: createdStr || l2DateStr || '',
      l1ApprovedDateTime: l1Str || '',
      source: sanitizeString(getVal('source') || 'CenturyJoy'),
      architectName: sanitizeString(getVal('architectName') || 'N/A'),
      userCode: sanitizeString(getVal('userCode') || 'N/A'),
      relationshipManager: sanitizeString(rawRM),
      createdBy: sanitizeString(getVal('createdBy') || rawRM),
      finalTotalAmount: amount,
      isAuditable: sanitizeString(getVal('isAuditable') || 'No'),
      invType: sanitizeString(getVal('invType') || 'Auditable'),
      l1ApprovedUser: sanitizeString(getVal('l1ApprovedUser') || 'Auto'),
      l2Assign: sanitizeString(getVal('l2Assign') || 'Kushal'),
      l2Status: 'Approved',
      team: sanitizeString(getVal('team') || captain),
      captain,
      manager,
      tatL1ToL2Days: tatL1,
      tatCreatedToL2Days: tatCreated
    };
  });
}

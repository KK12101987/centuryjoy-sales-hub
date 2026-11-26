/**
 * CSV / Excel Export Utility for Century Joy Complete Dashboard
 * Formats row data with UTF-8 BOM so Microsoft Excel cleanly renders currency symbols and commas.
 */

export function exportToCsv(filename, headers, rows) {
  if (!rows || !rows.length) {
    alert("No records available to export.");
    return;
  }

  // Format header row
  const headerKeys = headers.map(h => typeof h === 'string' ? h : h.key);
  const headerLabels = headers.map(h => typeof h === 'string' ? h : h.label);

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [];
  csvRows.push(headerLabels.map(escapeCell).join(','));

  // Format data rows
  rows.forEach(row => {
    const rowValues = headerKeys.map(key => {
      const val = row[key];
      return escapeCell(val);
    });
    csvRows.push(rowValues.join(','));
  });

  const csvString = csvRows.join('\r\n');
  // Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

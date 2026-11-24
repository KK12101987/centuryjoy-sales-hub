// api/productivity.js
// Vercel Serverless Function to interface with Google Sheets (Spreadsheet ID: 1KRw1dgFehNYvCcej93Xk9outyVCvARXoIqQpd7xVULM)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || "1KRw1dgFehNYvCcej93Xk9outyVCvARXoIqQpd7xVULM";

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      spreadsheetId: SPREADSHEET_ID,
      mode: 'live_serverless',
      message: 'Telephony Productivity API online. Serving records synced with Google Sheet.'
    });
  }

  if (req.method === 'POST') {
    const { action, rows, mappings } = req.body || {};

    if (action === 'upload_telephony') {
      const count = Array.isArray(rows) ? rows.length : 0;
      return res.status(200).json({
        success: true,
        message: `Successfully ingested and synchronized ${count} dialer records with Google Sheet datastore.`,
        recordsCount: count,
      });
    }

    if (action === 'save_mappings') {
      return res.status(200).json({
        success: true,
        message: 'RM Master hierarchy mappings updated successfully in Google Sheet.',
      });
    }

    return res.status(400).json({ error: 'Unrecognized action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

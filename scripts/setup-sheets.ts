// Setup Google Sheets spreadsheet for SPMB AI
// Usage: npx tsx scripts/setup-sheets.ts <spreadsheetId>
// Requires GOOGLE_SERVICE_ACCOUNT_KEY env var

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { ALL_TABLES } from '../src/lib/sheet-config';

async function main() {
  const spreadsheetId = process.argv[2];
  if (!spreadsheetId) {
    console.error('Usage: npx tsx scripts/setup-sheets.ts <spreadsheetId>');
    console.error('Set GOOGLE_SERVICE_ACCOUNT_KEY environment variable');
    process.exit(1);
  }

  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    console.error('Error: GOOGLE_SERVICE_ACCOUNT_KEY not set');
    process.exit(1);
  }

  let credentials: { client_email: string; private_key: string };
  try {
    credentials = JSON.parse(key);
  } catch {
    credentials = JSON.parse(Buffer.from(key, 'base64').toString());
  }

  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Get existing sheets
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const existingSheets = spreadsheet.data.sheets?.map((s) => s.properties?.title) || [];

  console.log(`Spreadsheet: "${spreadsheet.data.properties?.title}"`);
  console.log(`Existing sheets: ${existingSheets.join(', ') || '(none)'}`);
  console.log('');

  for (const [name, table] of Object.entries(ALL_TABLES)) {
    const headers = table.headers.join('\t');
    console.log(`${name}: ${headers}`);

    if (!existingSheets.includes(name)) {
      // Create sheet tab
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: { title: name },
            },
          }],
        },
      });
      console.log(`  -> Created sheet "${name}"`);

      // Add header row
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${name}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [table.headers],
        },
      });
      console.log(`  -> Set headers: ${table.headers.join(', ')}`);
    } else {
      console.log(`  -> Sheet "${name}" already exists`);
    }
    console.log('');
  }

  console.log('========================================');
  console.log('Setup complete!');
  console.log('');
  console.log('Set these env vars:');
  console.log(`  GOOGLE_SPREADSHEET_ID="${spreadsheetId}"`);
  console.log('  GOOGLE_SERVICE_ACCOUNT_KEY=<your-service-account-key-json>`');
  console.log('');
  console.log('Make sure the spreadsheet is shared with your service account email.');
}

main().catch(console.error);

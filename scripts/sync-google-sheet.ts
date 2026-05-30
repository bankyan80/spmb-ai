#!/usr/bin/env npx tsx
/**
 * SPMB AI - Sync Google Sheets
 * Menyinkronkan data dari Prisma/SQLite ke Google Sheets
 *
 * Penggunaan:
 *   npx tsx scripts/sync-google-sheet.ts --sheet [SPREADSHEET_ID]
 *   npx tsx scripts/sync-google-sheet.ts --sheet [ID] --reset
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Google Sheets API akan menggunakan Service Account
// File credentials disimpan di GOOGLE_SERVICE_ACCOUNT_JSON environment variable
async function getGoogleSheetsClient() {
  try {
    const { google } = await import('googleapis');
    
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON tidak ditemukan di environment');
    }

    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client as any });
  } catch (error: any) {
    console.error('Gagal inisialisasi Google Sheets:', error.message);
    return null;
  }
}

function objectToRows(data: any[], headers: string[]): string[][] {
  const rows: string[][] = [headers];
  for (const item of data) {
    const row = headers.map(h => {
      const keys = h.split('.');
      let val: any = item;
      for (const k of keys) {
        if (val && typeof val === 'object') val = val[k];
        else val = undefined;
      }
      return val !== null && val !== undefined ? String(val) : '';
    });
    rows.push(row);
  }
  return rows;
}

async function main() {
  const args = process.argv.slice(2);
  const sheetIndex = args.indexOf('--sheet');
  const spreadsheetId = sheetIndex !== -1 ? args[sheetIndex + 1] : null;

  if (!spreadsheetId) {
    console.log('Usage: npx tsx scripts/sync-google-sheet.ts --sheet [SPREADSHEET_ID]');
    console.log('Set env GOOGLE_SERVICE_ACCOUNT_JSON for auth');
    process.exit(1);
  }

  console.log(`📊 Sync ke Google Sheets (ID: ${spreadsheetId})...\n`);

  const sheets = await getGoogleSheetsClient();
  if (!sheets) {
    console.log('⚠️  Google Sheets tidak tersedia. Hanya menampilkan data yang akan disync:\n');
  }

  // Ambil data dari database
  const applicants = await prisma.applicant.findMany({
    include: { school: { select: { namaSekolah: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const schools = await prisma.school.findMany({ orderBy: { namaSekolah: 'asc' } });

  console.log(`  📋 ${schools.length} sekolah SD`);
  console.log(`  👤 ${applicants.length} pemohon/pendaftar`);

  if (sheets) {
    try {
      // Sheet: Sekolah
      const schoolHeaders = ['namaSekolah', 'npsn', 'jenjang', 'alamat', 'desa', 'kecamatan', 'kuota', 'sisaKuota'];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sekolah!A1',
        valueInputOption: 'RAW',
        requestBody: { values: objectToRows(schools, schoolHeaders) },
      });
      console.log('  ✅ Sheet "Sekolah" diupdate');

      // Sheet: Pemohon
      const applicantHeaders = [
        'nomorPendaftaran', 'nik', 'namaSiswa', 'jenisKelamin', 'agama',
        'desa', 'kecamatan', 'school.namaSekolah', 'jalur', 'statusBerkas',
        'statusPendaftaran', 'createdAt',
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Pemohon!A1',
        valueInputOption: 'RAW',
        requestBody: { values: objectToRows(applicants, applicantHeaders) },
      });
      console.log('  ✅ Sheet "Pemohon" diupdate');

      console.log('\n✅ Semua data tersinkron ke Google Sheets!');
    } catch (error: any) {
      console.error('❌ Error sync sheets:', error.message);
    }
  } else {
    console.log('\nContoh data:');
    console.log('  Sekolah:', JSON.stringify(schools.slice(0, 2), null, 2));
    console.log('  Pemohon:', JSON.stringify(applicants.slice(0, 1), null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
#!/usr/bin/env npx tsx
/**
 * SPMB SD 2026/2027 - CLI Import Siswa TK/PAUD/KB dari CSV / Google Sheet
 *
 * Penggunaan:
 *   npx tsx scripts/import-siswa.ts --url <CSV_URL> --npsn <NPSN_LEMBAGA>
 *   npx tsx scripts/import-siswa.ts --url <CSV_URL> --lembaga-id <CUID>
 *   npx tsx scripts/import-siswa.ts --file <LOCAL_CSV_PATH> --npsn <NPSN_LEMBAGA>
 *   npx tsx scripts/import-siswa.ts --sheet <GOOGLE_SHEET_URL> --npsn <NPSN_LEMBAGA>
 *
 * Opsi:
 *   --url         URL file CSV (direct download link)
 *   --sheet       Google Sheets URL (otomatis dikonversi ke CSV export)
 *   --file        Path file CSV lokal
 *   --npsn        NPSN lembaga PAUD (akan dicari di database)
 *   --lembaga-id  ID lembaga PAUD langsung (CUID)
 *   --delimiter   Delimiter CSV (default: ",")
 *   --dry-run     Simulasi import tanpa menyimpan ke database
 *   --help        Tampilkan bantuan
 *
 * Format CSV yang diharapkan (header):
 *   nis,nisn,nama_siswa,nik,tempat_lahir,tanggal_lahir,jenis_kelamin,agama,
 *   alamat,rt,rw,desa,kecamatan,nama_ayah,nik_ayah,pekerjaan_ayah,
 *   nama_ibu,nik_ibu,pekerjaan_ibu,no_hp_ortu,tahun_ajaran,kelas,
 *   tahun_masuk,catatan
 *
 * Tanggal format: YYYY-MM-DD (contoh: 2019-05-15)
 */

import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { finished } from 'stream/promises';

// ============================================
// Parse CLI Arguments
// ============================================

interface CliArgs {
  url?: string;
  file?: string;
  sheet?: string;
  npsn?: string;
  lembagaId?: string;
  delimiter?: string;
  dryRun?: boolean;
  help?: boolean;
}

function parseArgs(): CliArgs {
  const args: CliArgs = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--url':
        args.url = argv[++i];
        break;
      case '--file':
        args.file = argv[++i];
        break;
      case '--sheet':
        args.sheet = argv[++i];
        break;
      case '--npsn':
        args.npsn = argv[++i];
        break;
      case '--lembaga-id':
        args.lembagaId = argv[++i];
        break;
      case '--delimiter':
        args.delimiter = argv[++i];
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
    }
  }

  return args;
}

function showHelp(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║     SPMB SD 2026/2027 - Import Siswa TK/PAUD/KB             ║
║          (CSV / Google Sheets)                              ║
╚══════════════════════════════════════════════════════════════╝

Penggunaan:
  npx tsx scripts/import-siswa.ts --url <CSV_URL> --npsn <NPSN>
  npx tsx scripts/import-siswa.ts --file <CSV_PATH> --npsn <NPSN>
  npx tsx scripts/import-siswa.ts --sheet <GOOGLE_SHEET_URL> --npsn <NPSN>

Opsi:
  --url <URL>           URL file CSV (direct download link)
  --file <PATH>         Path file CSV lokal
  --sheet <URL>         Google Sheets URL (otomatis dikonversi ke CSV)
  --npsn <NPSN>         NPSN lembaga PAUD
  --lembaga-id <ID>     ID lembaga PAUD (alternatif NPSN)
  --delimiter <CHAR>    Delimiter CSV (default: ",")
  --dry-run             Simulasi tanpa menyimpan data
  --help, -h            Tampilkan bantuan ini

Google Sheets:
  --sheet mendukung format:
    https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0
    https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv
  Pastikan sheet sudah di-set "Anyone with the link can view"

Format CSV (header wajib):
  nis,nisn,nama_siswa,nik,tempat_lahir,tanggal_lahir,
  jenis_kelamin,agama,alamat,rt,rw,desa,kecamatan,
  nama_ayah,nik_ayah,pekerjaan_ayah,nama_ibu,nik_ibu,
  pekerjaan_ibu,no_hp_ortu,tahun_ajaran,kelas,
  tahun_masuk,catatan

Catatan:
  - Kolom "nama_siswa" wajib diisi
  - Format tanggal: YYYY-MM-DD
  - Hanya baris dengan nama_siswa yang akan diimport
  - Data duplikat (berdasarkan NIK + lembaga) akan di-update

Contoh:
  # Import dari Google Sheet
  npx tsx scripts/import-siswa.ts --sheet "https://docs.google.com/spreadsheets/d/abc123/edit" --npsn 30100001

  # Import dari URL CSV
  npx tsx scripts/import-siswa.ts --url "https://example.com/data.csv" --npsn 30100001

  # Import dari file lokal
  npx tsx scripts/import-siswa.ts --file ./data-siswa.csv --npsn 30100001

  # Dry run (simulasi)
  npx tsx scripts/import-siswa.ts --file ./data.csv --npsn 30100001 --dry-run
`);
}

// ============================================
// CSV Column Mapping
// ============================================

const COLUMN_MAP: Record<string, string> = {
  'nis': 'nis',
  'nisn': 'nisn',
  'nama_siswa': 'namaSiswa',
  'nama': 'namaSiswa',
  'nama lengkap': 'namaSiswa',
  'nik': 'nik',
  'tempat_lahir': 'tempatLahir',
  'tempat lahir': 'tempatLahir',
  'tanggal_lahir': 'tanggalLahir',
  'tanggal lahir': 'tanggalLahir',
  'tgl_lahir': 'tanggalLahir',
  'tgl lahir': 'tanggalLahir',
  'jenis_kelamin': 'jenisKelamin',
  'jenis kelamin': 'jenisKelamin',
  'jk': 'jenisKelamin',
  'jk_lk': 'jenisKelamin',
  'agama': 'agama',
  'alamat': 'alamat',
  'rt': 'rt',
  'rw': 'rw',
  'desa': 'desa',
  'kelurahan': 'desa',
  'kecamatan': 'kecamatan',
  'nama_ayah': 'namaAyah',
  'nama ayah': 'namaAyah',
  'ayah': 'namaAyah',
  'nik_ayah': 'nikAyah',
  'nik ayah': 'nikAyah',
  'pekerjaan_ayah': 'pekerjaanAyah',
  'pekerjaan ayah': 'pekerjaanAyah',
  'kerja_ayah': 'pekerjaanAyah',
  'nama_ibu': 'namaIbu',
  'nama ibu': 'namaIbu',
  'ibu': 'namaIbu',
  'nik_ibu': 'nikIbu',
  'nik ibu': 'nikIbu',
  'pekerjaan_ibu': 'pekerjaanIbu',
  'pekerjaan ibu': 'pekerjaanIbu',
  'kerja_ibu': 'pekerjaanIbu',
  'no_hp_ortu': 'noHpOrtu',
  'no hp ortu': 'noHpOrtu',
  'no_hp': 'noHpOrtu',
  'no hp': 'noHpOrtu',
  'telepon': 'noHpOrtu',
  'tahun_ajaran': 'tahunAjaran',
  'tahun ajaran': 'tahunAjaran',
  'kelas': 'kelas',
  'tahun_masuk': 'tahunMasuk',
  'tahun masuk': 'tahunMasuk',
  'catatan': 'catatan',
  'keterangan': 'catatan',
};

// ============================================
// Data Parsing Helpers
// ============================================

function normalizeColumnName(col: string): string {
  const trimmed = col.trim().toLowerCase();
  return COLUMN_MAP[trimmed] || trimmed;
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value || value.trim() === '') return null;
  const trimmed = value.trim();

  // Format: YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const date = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    if (!isNaN(date.getTime())) return date;
  }

  // Format: DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const date = new Date(parseInt(dmyMatch[3]), parseInt(dmyMatch[2]) - 1, parseInt(dmyMatch[1]));
    if (!isNaN(date.getTime())) return date;
  }

  // Fallback
  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function normalizeJenisKelamin(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null;
  const v = value.trim().toLowerCase();
  if (v === 'l' || v === 'lk' || v === 'laki-laki' || v === 'laki laki' || v === 'pria') return 'Laki-laki';
  if (v === 'p' || v === 'pr' || v === 'perempuan' || v === 'wanita') return 'Perempuan';
  return value.trim();
}

function cleanString(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null;
  return value.trim();
}

// ============================================
// CSV Parser
// ============================================

interface ParsedRow {
  [key: string]: string;
}

async function parseCsvFromStream(
  stream: NodeJS.ReadableStream,
  delimiter: string = ','
): Promise<ParsedRow[]> {
  const records: ParsedRow[] = [];

  const parser = parse({
    columns: (headers: string[]) => headers.map(normalizeColumnName),
    delimiter,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_quotes: true,
    bom: true,
  });

  parser.on('readable', () => {
    let record;
    while ((record = parser.read()) !== null) {
      records.push(record);
    }
  });

  stream.pipe(parser);
  await finished(parser);

  return records;
}

async function parseCsvFromUrl(url: string, delimiter: string = ','): Promise<ParsedRow[]> {
  console.log(`📥 Mengunduh CSV dari URL: ${url}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Gagal mengunduh CSV: HTTP ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  console.log(`   Content-Type: ${contentType}`);

  const text = await response.text();
  const { Readable } = await import('stream');
  const stream = Readable.from([text]);

  return parseCsvFromStream(stream, delimiter);
}

async function parseCsvFromFile(filePath: string, delimiter: string = ','): Promise<ParsedRow[]> {
  console.log(`📂 Membaca file CSV: ${filePath}`);
  const stream = createReadStream(filePath, { encoding: 'utf-8' });
  return parseCsvFromStream(stream, delimiter);
}

// ============================================
// Map CSV row to SiswaTK data
// ============================================

interface SiswaTKData {
  nis: string | null;
  nisn: string | null;
  namaSiswa: string;
  nik: string | null;
  tempatLahir: string | null;
  tanggalLahir: Date | null;
  jenisKelamin: string | null;
  agama: string | null;
  alamat: string | null;
  rt: string | null;
  rw: string | null;
  desa: string | null;
  kecamatan: string | null;
  namaAyah: string | null;
  nikAyah: string | null;
  pekerjaanAyah: string | null;
  namaIbu: string | null;
  nikIbu: string | null;
  pekerjaanIbu: string | null;
  noHpOrtu: string | null;
  tahunAjaran: string | null;
  kelas: string | null;
  tahunMasuk: string | null;
  catatan: string | null;
  lembagaPaudId: string;
}

function mapRowToSiswa(row: ParsedRow, lembagaPaudId: string): SiswaTKData | null {
  const namaSiswa = cleanString(row['namaSiswa']);
  if (!namaSiswa) return null; // Skip baris tanpa nama

  return {
    nis: cleanString(row['nis']),
    nisn: cleanString(row['nisn']),
    namaSiswa,
    nik: cleanString(row['nik']),
    tempatLahir: cleanString(row['tempatLahir']),
    tanggalLahir: parseDate(row['tanggalLahir'] || null),
    jenisKelamin: normalizeJenisKelamin(row['jenisKelamin']),
    agama: cleanString(row['agama']),
    alamat: cleanString(row['alamat']),
    rt: cleanString(row['rt']),
    rw: cleanString(row['rw']),
    desa: cleanString(row['desa']),
    kecamatan: cleanString(row['kecamatan']),
    namaAyah: cleanString(row['namaAyah']),
    nikAyah: cleanString(row['nikAyah']),
    pekerjaanAyah: cleanString(row['pekerjaanAyah']),
    namaIbu: cleanString(row['namaIbu']),
    nikIbu: cleanString(row['nikIbu']),
    pekerjaanIbu: cleanString(row['pekerjaanIbu']),
    noHpOrtu: cleanString(row['noHpOrtu']),
    tahunAjaran: cleanString(row['tahunAjaran']),
    kelas: cleanString(row['kelas']),
    tahunMasuk: cleanString(row['tahunMasuk']),
    catatan: cleanString(row['catatan']),
    lembagaPaudId,
  };
}

// ============================================
// Main Import Logic
// ============================================

async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // Validate required args
  if (!args.url && !args.file && !args.sheet) {
    console.error('❌ Error: Harus menyertakan --url, --file, atau --sheet');
    console.error('   Gunakan --help untuk bantuan');
    process.exit(1);
  }

  if (!args.npsn && !args.lembagaId) {
    console.error('❌ Error: Harus menyertakan --npsn atau --lembaga-id');
    console.error('   Gunakan --help untuk bantuan');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const delimiter = args.delimiter || ',';

  try {
    // ========================================
    // Step 1: Resolve LembagaPaud
    // ========================================
    console.log('\n🏫 Mencari lembaga PAUD...');

    let lembagaPaudId: string;

    if (args.lembagaId) {
      const lembaga = await prisma.lembagaPaud.findUnique({
        where: { id: args.lembagaId },
      });
      if (!lembaga) {
        console.error(`❌ Lembaga dengan ID "${args.lembagaId}" tidak ditemukan`);
        process.exit(1);
      }
      lembagaPaudId = lembaga.id;
      console.log(`   ✅ ${lembaga.namaLembaga} (${lembaga.jenisLembaga})`);
      console.log(`   NPSN: ${lembaga.npsn} | Kecamatan: ${lembaga.kecamatan}`);
    } else {
      const lembaga = await prisma.lembagaPaud.findUnique({
        where: { npsn: args.npsn! },
      });
      if (!lembaga) {
        console.error(`❌ Lembaga dengan NPSN "${args.npsn}" tidak ditemukan`);
        console.error('   Pastikan lembaga sudah terdaftar di database.');
        console.error('   Gunakan: npx tsx scripts/seed-lembaga.ts untuk menambahkan lembaga.');
        process.exit(1);
      }
      lembagaPaudId = lembaga.id;
      console.log(`   ✅ ${lembaga.namaLembaga} (${lembaga.jenisLembaga})`);
      console.log(`   NPSN: ${lembaga.npsn} | Kecamatan: ${lembaga.kecamatan}`);
    }

    // ========================================
    // Step 2: Parse CSV
    // ========================================
    let records: ParsedRow[];

    if (args.sheet) {
      // Use the sheet URL directly (supports both published CSV and edit URLs)
      let csvUrl = args.sheet;

      // If it's a Google Sheets edit URL, convert to CSV export
      const sheetsMatch = args.sheet.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (sheetsMatch && !args.sheet.includes('/pub?')) {
        const spreadsheetId = sheetsMatch[1];
        const gidMatch = args.sheet.match(/[?&]gid=(\d+)/);
        const gid = gidMatch ? gidMatch[1] : '0';
        csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
        console.log(`🔗 Google Sheet URL dikonversi ke CSV export`);
      } else {
        console.log(`📥 Menggunakan URL langsung (published CSV)`);
      }

      records = await parseCsvFromUrl(csvUrl, delimiter);
    } else if (args.url) {
      records = await parseCsvFromUrl(args.url, delimiter);
    } else {
      records = await parseCsvFromFile(args.file!, delimiter);
    }

    console.log(`\n📊 Total baris data: ${records.length}`);

    if (records.length === 0) {
      console.log('⚠️  Tidak ada data ditemukan dalam CSV');
      process.exit(0);
    }

    // Show header preview
    const firstRecord = records[0];
    const headers = Object.keys(firstRecord);
    console.log(`   Kolom terdeteksi (${headers.length}): ${headers.join(', ')}`);

    // ========================================
    // Step 3: Map & Validate
    // ========================================
    console.log('\n🔄 Memetakan dan memvalidasi data...');

    const mappedData: SiswaTKData[] = [];
    const errors: { row: number; error: string }[] = [];

    records.forEach((row, index) => {
      const mapped = mapRowToSiswa(row, lembagaPaudId);
      if (mapped) {
        mappedData.push(mapped);
      } else {
        errors.push({ row: index + 2, error: 'nama_siswa kosong atau tidak valid' });
      }
    });

    console.log(`   ✅ Data valid: ${mappedData.length}`);
    if (errors.length > 0) {
      console.log(`   ⚠️  Data tidak valid: ${errors.length}`);
      errors.slice(0, 5).forEach(e => {
        console.log(`      Baris ${e.row}: ${e.error}`);
      });
      if (errors.length > 5) {
        console.log(`      ... dan ${errors.length - 5} lainnya`);
      }
    }

    if (mappedData.length === 0) {
      console.log('❌ Tidak ada data valid untuk diimport');
      process.exit(1);
    }

    // ========================================
    // Step 4: Dry Run or Import
    // ========================================
    if (args.dryRun) {
      console.log('\n🧪 DRY RUN - Data tidak akan disimpan ke database');
      console.log('\n📋 Preview data yang akan diimport:');
      mappedData.slice(0, 5).forEach((data, i) => {
        console.log(`   ${i + 1}. ${data.namaSiswa} | NIK: ${data.nik || '-'} | Lahir: ${data.tanggalLahir ? data.tanggalLahir.toISOString().split('T')[0] : '-'} | Kelas: ${data.kelas || '-'}`);
      });
      if (mappedData.length > 5) {
        console.log(`   ... dan ${mappedData.length - 5} data lainnya`);
      }
      console.log(`\n   Total yang akan diimport: ${mappedData.length} siswa`);
      process.exit(0);
    }

    // ========================================
    // Step 5: Create Import Log
    // ========================================
    const importLog = await prisma.importLog.create({
      data: {
        fileName: args.sheet ? 'google-sheet.csv' : args.url ? args.url.split('/').pop() || 'remote.csv' : args.file!.split('/').pop() || 'local.csv',
        sourceUrl: args.sheet || args.url || `file://${args.file}`,
        lembagaPaudId,
        totalRecords: records.length,
        status: 'processing',
      },
    });

    console.log(`\n📝 Import log dibuat: ${importLog.id}`);

    // ========================================
    // Step 6: Import Data (Batch)
    // ========================================
    console.log('\n💾 Mengimport data ke database...');

    let importedCount = 0;
    let failedCount = 0;
    const failedDetails: { row: number; error: string }[] = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < mappedData.length; i += BATCH_SIZE) {
      const batch = mappedData.slice(i, i + BATCH_SIZE);

      for (const data of batch) {
        try {
          // Check for duplicate by NIK + lembagaPaudId
          if (data.nik) {
            const existing = await prisma.siswaTK.findFirst({
              where: {
                nik: data.nik,
                lembagaPaudId: data.lembagaPaudId,
              },
            });
            if (existing) {
              // Update existing record
              await prisma.siswaTK.update({
                where: { id: existing.id },
                data: {
                  nis: data.nis,
                  nisn: data.nisn,
                  namaSiswa: data.namaSiswa,
                  tempatLahir: data.tempatLahir,
                  tanggalLahir: data.tanggalLahir,
                  jenisKelamin: data.jenisKelamin,
                  agama: data.agama,
                  alamat: data.alamat,
                  rt: data.rt,
                  rw: data.rw,
                  desa: data.desa,
                  kecamatan: data.kecamatan,
                  namaAyah: data.namaAyah,
                  nikAyah: data.nikAyah,
                  pekerjaanAyah: data.pekerjaanAyah,
                  namaIbu: data.namaIbu,
                  nikIbu: data.nikIbu,
                  pekerjaanIbu: data.pekerjaanIbu,
                  noHpOrtu: data.noHpOrtu,
                  tahunAjaran: data.tahunAjaran,
                  kelas: data.kelas,
                  tahunMasuk: data.tahunMasuk,
                  catatan: data.catatan,
                },
              });
              importedCount++;
              continue;
            }
          }

          // Create new record
          await prisma.siswaTK.create({ data });
          importedCount++;
        } catch (err: any) {
          failedCount++;
          failedDetails.push({
            row: i + mappedData.indexOf(data) + 2,
            error: err.message || 'Unknown error',
          });
        }
      }

      // Progress
      const progress = Math.min(i + BATCH_SIZE, mappedData.length);
      process.stdout.write(`   Progress: ${progress}/${mappedData.length} (${Math.round(progress / mappedData.length * 100)}%)\r`);
    }

    console.log('');

    // ========================================
    // Step 7: Update Import Log
    // ========================================
    const finalStatus = failedCount === 0
      ? 'completed'
      : importedCount > 0
        ? 'completed_with_errors'
        : 'failed';

    await prisma.importLog.update({
      where: { id: importLog.id },
      data: {
        importedRecords: importedCount,
        failedRecords: failedCount,
        failedDetails: failedDetails.length > 0 ? JSON.stringify(failedDetails) : null,
        status: finalStatus,
        completedAt: new Date(),
        errorMessage: failedCount > 0 ? `${failedCount} record gagal diimport` : null,
      },
    });

    // ========================================
    // Summary
    // ========================================
    console.log('\n' + '═'.repeat(55));
    console.log('  📊 RINGKASAN IMPORT');
    console.log('═'.repeat(55));
    console.log(`  Status     : ${finalStatus === 'completed' ? '✅ BERHASIL' : finalStatus === 'completed_with_errors' ? '⚠️ SELESAI DENGAN ERROR' : '❌ GAGAL'}`);
    console.log(`  Total baris: ${records.length}`);
    console.log(`  Diimport   : ${importedCount}`);
    console.log(`  Gagal      : ${failedCount}`);
    console.log(`  Import ID  : ${importLog.id}`);
    console.log('═'.repeat(55));

    if (failedDetails.length > 0 && failedDetails.length <= 10) {
      console.log('\n  Detail error:');
      failedDetails.forEach(d => {
        console.log(`    Baris ${d.row}: ${d.error}`);
      });
    } else if (failedDetails.length > 10) {
      console.log(`\n  ${failedDetails.length} error terjadi. Lihat ImportLog ID ${importLog.id} untuk detail.`);
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

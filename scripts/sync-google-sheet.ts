#!/usr/bin/env npx tsx
/**
 * SPMB AI - Sync Siswa TK/PAUD/KB dari Google Sheet (Format Dapodik)
 *
 * Penggunaan:
 *   npx tsx scripts/sync-google-sheet.ts --sheet "URL" --npsn 30100001
 *   npx tsx scripts/sync-google-sheet.ts --sheet "URL" --npsn 30100001 --dry-run
 *
 * Mendukung format Dapodik (multi-row header, 66 kolom)
 */

import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

interface CliArgs {
  sheet?: string;
  npsn?: string;
  lembagaId?: string;
  dryRun?: boolean;
}

function parseArgs(): CliArgs {
  const args: CliArgs = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--sheet': args.sheet = argv[++i]; break;
      case '--npsn': args.npsn = argv[++i]; break;
      case '--lembaga-id': args.lembagaId = argv[++i]; break;
      case '--dry-run': args.dryRun = true; break;
    }
  }
  return args;
}

function parseDate(value: string): Date | null {
  if (!value || value.trim() === '' || value === '0') return null;
  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const d = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function parseIntOrNull(v: string | undefined): number | null {
  if (!v || v.trim() === '' || v.trim() === '-') return null;
  const n = parseInt(v.trim());
  return isNaN(n) ? null : n;
}

function clean(v: string | undefined): string | null {
  if (!v || v.trim() === '' || v.trim() === '-') return null;
  return v.trim();
}

// Dapodik column index → SiswaTK field mapping
const COLUMN_MAP: Record<number, { field: string; transform?: (v: string) => any }> = {
  1: { field: 'namaSiswa' },
  2: { field: 'nipd' },
  3: { field: 'jenisKelamin' },
  4: { field: 'nisn' },
  5: { field: 'tempatLahir' },
  6: { field: 'tanggalLahir', transform: (v) => parseDate(v) },
  7: { field: 'nik' },
  8: { field: 'agama' },
  9: { field: 'alamat' },
  10: { field: 'rt' },
  11: { field: 'rw' },
  12: { field: 'dusun' },
  13: { field: 'kelurahan' },
  14: { field: 'kecamatan' },
  15: { field: 'kodePos' },
  16: { field: 'jenisTinggal' },
  17: { field: 'alatTransportasi' },
  18: { field: 'telepon' },
  19: { field: 'hp' },
  20: { field: 'email' },
  22: { field: 'penerimaKPS' },
  23: { field: 'noKPS' },
  24: { field: 'namaAyah' },
  25: { field: 'tahunLahirAyah' },
  26: { field: 'jenjangPendidikanAyah' },
  27: { field: 'pekerjaanAyah' },
  28: { field: 'penghasilanAyah' },
  29: { field: 'nikAyah' },
  30: { field: 'namaIbu' },
  31: { field: 'tahunLahirIbu' },
  32: { field: 'jenjangPendidikanIbu' },
  33: { field: 'pekerjaanIbu' },
  34: { field: 'penghasilanIbu' },
  35: { field: 'nikIbu' },
  36: { field: 'namaWali' },
  37: { field: 'tahunLahirWali' },
  38: { field: 'jenjangPendidikanWali' },
  39: { field: 'pekerjaanWali' },
  40: { field: 'penghasilanWali' },
  41: { field: 'nikWali' },
  42: { field: 'rombel' },
  45: { field: 'penerimaKIP' },
  46: { field: 'nomorKIP' },
  47: { field: 'namaDiKIP' },
  48: { field: 'nomorKKS' },
  49: { field: 'noRegAktaLahir' },
  53: { field: 'layakPIP' },
  54: { field: 'alasanPIP' },
  55: { field: 'kebutuhanKhusus' },
  56: { field: 'sekolahAsal' },
  57: { field: 'anakKe', transform: (v) => parseIntOrNull(v) },
  58: { field: 'lintang' },
  59: { field: 'bujur' },
  60: { field: 'noKK' },
  61: { field: 'beratBadan', transform: (v) => parseIntOrNull(v) },
  62: { field: 'tinggiBadan', transform: (v) => parseIntOrNull(v) },
  63: { field: 'lingkarKepala', transform: (v) => parseIntOrNull(v) },
  64: { field: 'jmlSaudaraKandung', transform: (v) => parseIntOrNull(v) },
  65: { field: 'jarakRumahKm', transform: (v) => parseIntOrNull(v) },
};

async function main() {
  const args = parseArgs();
  if (!args.sheet) { console.error('❌ --sheet wajib diisi'); process.exit(1); }
  if (!args.npsn && !args.lembagaId) { console.error('❌ --npsn atau --lembaga-id wajib'); process.exit(1); }

  const prisma = new PrismaClient({ log: [] });

  try {
    // Find lembaga
    let lembagaId: string, lembagaNama: string;
    if (args.lembagaId) {
      const l = await prisma.lembagaPaud.findUniqueOrThrow({ where: { id: args.lembagaId } });
      lembagaId = l.id; lembagaNama = l.namaLembaga;
    } else {
      const l = await prisma.lembagaPaud.findUniqueOrThrow({ where: { npsn: args.npsn! } });
      lembagaId = l.id; lembagaNama = l.namaLembaga;
    }
    console.log(`\n🏫 ${lembagaNama} (NPSN: ${args.npsn || args.lembagaId})`);

    // Fetch CSV
    console.log(`📥 Mengunduh data dari Google Sheet...`);
    const csvUrl = args.sheet;
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();

    // Parse all rows
    const allRows: string[][] = [];
    const parser = parse({ skip_empty_lines: true, trim: true, relax_column_count: true, relax_quotes: true, bom: true });
    const stream = Readable.from([csvText]);

    await new Promise<void>((resolve, reject) => {
      parser.on('readable', () => { let r; while ((r = parser.read()) !== null) allRows.push(r); });
      parser.on('end', resolve);
      parser.on('error', reject);
      stream.pipe(parser);
    });

    // Dapodik: skip first 6 rows (title+info+header+subheader), data starts row 7
    const dataRows = allRows.slice(6);
    console.log(`📊 Total data siswa: ${dataRows.length}`);

    if (args.dryRun) {
      console.log('\n🧪 DRY RUN Preview:');
      dataRows.slice(0, 5).forEach((row, i) => {
        console.log(`  ${i+1}. ${row[1]} | NIK: ${row[7]} | Lahir: ${row[6]} | Rombel: ${row[42]}`);
      });
      if (dataRows.length > 5) console.log(`  ... dan ${dataRows.length - 5} lainnya`);
      process.exit(0);
    }

    // Import
    let imported = 0, failed = 0;
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const namaSiswa = clean(row[1]);
      if (!namaSiswa) { failed++; continue; }

      try {
        const dataRecord: Record<string, any> = { lembagaPaudId: lembagaId, namaSiswa };
        for (const [colIdx, mapping] of Object.entries(COLUMN_MAP)) {
          const rawValue = row[parseInt(colIdx)] || '';
          const value = mapping.transform ? mapping.transform(rawValue) : clean(rawValue);
          if (value !== null && value !== undefined) dataRecord[mapping.field] = value;
        }

        const nik = dataRecord.nik as string | undefined;
        if (nik) {
          const existing = await prisma.siswaTK.findFirst({ where: { nik, lembagaPaudId: lembagaId } });
          if (existing) {
            const { lembagaPaudId: _, namaSiswa: __, ...updateData } = dataRecord;
            await prisma.siswaTK.update({ where: { id: existing.id }, data: updateData });
            imported++; continue;
          }
        }
        await prisma.siswaTK.create({ data: dataRecord as any });
        imported++;
      } catch (err: any) {
        failed++;
        console.error(`  ⚠️ Baris ${i+7}: ${err.message?.substring(0, 100)}`);
      }
    }

    // Create import log
    await prisma.importLog.create({
      data: {
        fileName: 'google-sheet-dapodik.csv',
        sourceUrl: args.sheet,
        lembagaPaudId: lembagaId,
        totalRecords: dataRows.length,
        importedRecords: imported,
        failedRecords: failed,
        status: failed === 0 ? 'completed' : imported > 0 ? 'completed_with_errors' : 'failed',
        completedAt: new Date(),
      },
    });

    console.log('\n' + '═'.repeat(50));
    console.log(`  ✅ Diimport: ${imported} | ❌ Gagal: ${failed}`);
    console.log('═'.repeat(50));

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

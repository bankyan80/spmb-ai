import { usersTable, schoolsTable } from '../src/lib/sheet-config';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQwXli99Usgtlcu6XFfTZD4qWQsVSq3WZN5DE8-YgtRzaDsk9i8jPfm5pr-qsWwKWJqBZtoC83YwSKg/pub?gid=1362908136&single=true&output=csv';

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/sdn/g, 'sd negeri')
    .replace(/sdit/g, 'sd it')
    .trim();
}

function isSDSchool(schoolName: string): boolean {
  if (!schoolName) return false;
  const upper = schoolName.toUpperCase();
  return upper.startsWith('SD') || upper.startsWith('SDIT');
}

async function main() {
  console.log('Fetching CSV...');
  const res = await fetch(CSV_URL);
  const csvText = await res.text();

  const lines = csvText.split('\n').filter(Boolean);
  if (lines.length < 2) {
    console.error('CSV kosong atau hanya header');
    process.exit(1);
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const vals: string[] = [];
    let current = '';
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { vals.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    vals.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] || ''; });
    return row;
  });

  console.log(`Total baris CSV: ${rows.length}`);

  const sdRows = rows.filter((r) => isSDSchool(r.schoolName));
  console.log(`Baris dengan SD saja: ${sdRows.length}`);

  console.log('\nMencari data schools dari sistem...');
  let existingSchools: Record<string, unknown>[] = [];
  try {
    existingSchools = await schoolsTable.findAll();
    console.log(`Ditemukan ${existingSchools.length} schools di sistem`);
  } catch {
    console.log('Tidak bisa fetch schools, akan pakai schoolName langsung');
  }

  const schoolNameToId: Record<string, string> = {};
  for (const s of existingSchools) {
    const name = (s.namaSekolah as string) || '';
    const id = (s.schoolId as string) || '';
    if (name && id) {
      schoolNameToId[normalizeName(name)] = id;
    }
  }

  console.log('\nMemulai import user SD...');
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of sdRows) {
    try {
      const uid = row.uid || row.id;
      if (!uid) {
        console.log(`  [SKIP] No UID: ${row.displayName}`);
        skipped++;
        continue;
      }

      const existing = await usersTable.findById(uid, 'uid');

      const schoolId = schoolNameToId[normalizeName(row.schoolName)] || '';

      const userData: Record<string, unknown> = {
        uid,
        email: row.email || '',
        nama: row.displayName || row.schoolName || '',
        role: row.role || 'operator_sekolah',
        schoolId,
        statusAktif: true,
        updatedAt: row.updatedAt || new Date().toISOString(),
      };

      if (existing) {
        await usersTable.update(uid, userData, 'uid');
        console.log(`  [UPDATE] ${userData.nama} (${userData.email}) -> ${row.schoolName}`);
      } else {
        userData.createdAt = row.createdAt || new Date().toISOString();
        await usersTable.create(userData as Record<string, unknown>);
        console.log(`  [CREATE] ${userData.nama} (${userData.email}) -> ${row.schoolName}`);
      }
      imported++;
    } catch (err) {
      console.error(`  [ERROR] ${row.displayName}: ${err instanceof Error ? err.message : err}`);
      errors++;
    }
  }

  console.log('\n========================================');
  console.log('Selesai!');
  console.log(`  Berhasil: ${imported}`);
  console.log(`  Dilewati: ${skipped}`);
  console.log(`  Gagal:    ${errors}`);
  console.log('========================================');
}

main().catch(console.error);

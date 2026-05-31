import { NextRequest, NextResponse } from 'next/server';
import { siswaTKTable, lembagaPaudTable, importLogTable } from '@/lib/sheet-config';
import { verifyAuth, unauthorized } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const { sheetUrl, npsn, lembagaPaudId, delimiter = ',' } = body;

    if (!sheetUrl) {
      return NextResponse.json({ success: false, error: 'URL Google Sheet wajib diisi' }, { status: 400 });
    }

    if (!npsn && !lembagaPaudId) {
      return NextResponse.json({ success: false, error: 'NPSN atau lembagaPaudId wajib diisi' }, { status: 400 });
    }

    // Find lembaga from sheets
    const allLembaga = await lembagaPaudTable.findAll();
    let lembagaId: string;
    let lembagaNama: string;

    if (lembagaPaudId) {
      const lembaga = allLembaga.find((l) => l.id === lembagaPaudId);
      if (!lembaga) {
        return NextResponse.json({ success: false, error: `Lembaga dengan ID "${lembagaPaudId}" tidak ditemukan` }, { status: 404 });
      }
      lembagaId = lembaga.id as string;
      lembagaNama = lembaga.namaLembaga as string;
    } else {
      const lembaga = allLembaga.find((l) => l.npsn === npsn);
      if (!lembaga) {
        return NextResponse.json({ success: false, error: `Lembaga dengan NPSN "${npsn}" tidak ditemukan` }, { status: 404 });
      }
      lembagaId = lembaga.id as string;
      lembagaNama = lembaga.namaLembaga as string;
    }

    // Convert Google Sheets URL to CSV export URL
    let csvUrl = sheetUrl;
    const sheetsMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (sheetsMatch && !sheetUrl.includes('/pub?') && !sheetUrl.includes('output=csv')) {
      const spreadsheetId = sheetsMatch[1];
      const gidMatch = sheetUrl.match(/[?&]gid=(\d+)/);
      const gid = gidMatch ? gidMatch[1] : '0';
      csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
    }

    const response = await fetch(csvUrl);
    if (!response.ok) {
      return NextResponse.json({ success: false, error: `Gagal mengambil data: HTTP ${response.status}` }, { status: 400 });
    }

    const csvText = await response.text();
    const { parse } = await import('csv-parse');
    const { Readable } = await import('stream');

    const allRows: string[][] = [];
    const parser = parse({
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      relax_quotes: true,
      bom: true,
      delimiter,
    });

    const stream = Readable.from([csvText]);
    await new Promise<void>((resolve, reject) => {
      parser.on('readable', () => {
        let record;
        while ((record = parser.read()) !== null) allRows.push(record);
      });
      parser.on('end', resolve);
      parser.on('error', reject);
      stream.pipe(parser);
    });

    const dataRows = allRows.slice(6);

    // Create import log
    const importLog = await importLogTable.create({
      id: `import-${Date.now()}`,
      fileName: 'google-sheet-dapodik.csv',
      sourceUrl: sheetUrl,
      lembagaPaudId: lembagaId,
      totalRecords: dataRows.length,
      importedRecords: 0,
      failedRecords: 0,
      failedDetails: null,
      status: 'processing',
      errorMessage: null,
      importedAt: new Date().toISOString(),
      completedAt: null,
    });

    let importedCount = 0;
    let failedCount = 0;
    const failedDetails: { row: number; error: string }[] = [];

    // Get existing siswa for this lembaga
    const existingSiswa = await siswaTKTable.findAll();
    const existingByNik = new Map<string, Record<string, unknown>>();
    existingSiswa.forEach((s) => {
      if (s.nik && s.lembagaPaudId === lembagaId) {
        existingByNik.set(s.nik as string, s);
      }
    });

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const namaSiswa = (row[1] || '').trim();
      if (!namaSiswa) {
        failedCount++;
        failedDetails.push({ row: i + 7, error: 'Nama siswa kosong' });
        continue;
      }

      try {
        const nik = (row[7] || '').trim() || undefined;

        const record: Record<string, unknown> = {
          lembagaPaudId,
          nipd: row[2]?.trim() || null,
          nisn: row[4]?.trim() || null,
          namaSiswa,
          nik: nik || null,
          tempatLahir: row[5]?.trim() || null,
          jenisKelamin: (row[3] || '').trim() === 'L' ? 'L' : (row[3] || '').trim() === 'P' ? 'P' : null,
          agama: row[8]?.trim() || null,
          alamat: row[9]?.trim() || null,
          rt: row[10]?.trim() || null,
          rw: row[11]?.trim() || null,
          dusun: row[12]?.trim() || null,
          kelurahan: row[13]?.trim() || null,
          kecamatan: row[14]?.trim() || null,
          kodePos: row[15]?.trim() || null,
          namaAyah: row[24]?.trim() || null,
          namaIbu: row[30]?.trim() || null,
          noKK: row[60]?.trim() || null,
          statusAktif: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (nik && existingByNik.has(nik)) {
          const existing = existingByNik.get(nik)!;
          await siswaTKTable.update(existing.id as string, record);
        } else {
          record.id = `siswa-${Date.now()}-${i}`;
          await siswaTKTable.create(record as Record<string, unknown>);
        }
        importedCount++;
      } catch (err: unknown) {
        failedCount++;
        failedDetails.push({ row: i + 7, error: err instanceof Error ? err.message.substring(0, 200) : 'Unknown error' });
      }
    }

    const finalStatus = failedCount === 0 ? 'completed' : importedCount > 0 ? 'completed_with_errors' : 'failed';

    await importLogTable.update(importLog.id as string, {
      importedRecords: importedCount,
      failedRecords: failedCount,
      failedDetails: failedDetails.length > 0 ? JSON.stringify(failedDetails.slice(0, 20)) : null,
      status: finalStatus,
      completedAt: new Date().toISOString(),
      errorMessage: failedCount > 0 ? `${failedCount} record gagal` : null,
    });

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi Google Sheet untuk ${lembagaNama} selesai`,
      importLogId: importLog.id,
      totalRecords: dataRows.length,
      importedRecords: importedCount,
      failedRecords: failedCount,
      status: finalStatus,
      failedDetails: failedDetails.slice(0, 5),
    });
  } catch (error: unknown) {
    console.error('Error syncing Google Sheet:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

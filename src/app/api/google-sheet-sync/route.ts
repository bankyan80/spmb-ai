import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/google-sheet-sync
// Sync student data from a Google Sheets published CSV URL (Dapodik format)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sheetUrl, npsn, lembagaPaudId, delimiter = ',' } = body;

    if (!sheetUrl) {
      return NextResponse.json(
        { success: false, error: 'URL Google Sheet wajib diisi' },
        { status: 400 }
      );
    }

    if (!npsn && !lembagaPaudId) {
      return NextResponse.json(
        { success: false, error: 'NPSN atau lembagaPaudId wajib diisi' },
        { status: 400 }
      );
    }

    // Find lembaga
    let lembagaId: string;
    let lembagaNama: string;

    if (lembagaPaudId) {
      const lembaga = await db.lembagaPaud.findUnique({ where: { id: lembagaPaudId } });
      if (!lembaga) {
        return NextResponse.json(
          { success: false, error: `Lembaga dengan ID "${lembagaPaudId}" tidak ditemukan` },
          { status: 404 }
        );
      }
      lembagaId = lembaga.id;
      lembagaNama = lembaga.namaLembaga;
    } else {
      const lembaga = await db.lembagaPaud.findUnique({ where: { npsn } });
      if (!lembaga) {
        return NextResponse.json(
          { success: false, error: `Lembaga dengan NPSN "${npsn}" tidak ditemukan` },
          { status: 404 }
        );
      }
      lembagaId = lembaga.id;
      lembagaNama = lembaga.namaLembaga;
    }

    // Convert Google Sheets URL to CSV export URL if needed
    let csvUrl = sheetUrl;

    // If it's a Google Sheets edit URL (not already a CSV/published URL), convert
    const sheetsMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (sheetsMatch && !sheetUrl.includes('/pub?') && !sheetUrl.includes('output=csv')) {
      const spreadsheetId = sheetsMatch[1];
      const gidMatch = sheetUrl.match(/[?&]gid=(\d+)/);
      const gid = gidMatch ? gidMatch[1] : '0';
      csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
    }
    // If it's already a published CSV URL (contains /pub? and output=csv), use as-is

    // Fetch CSV
    const response = await fetch(csvUrl);
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Gagal mengambil data: HTTP ${response.status}` },
        { status: 400 }
      );
    }

    const csvText = await response.text();

    // Parse CSV - Dapodik format has multi-row headers (rows 1-4 are title/info, row 5=headers, row 6=sub-headers)
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
        while ((record = parser.read()) !== null) {
          allRows.push(record);
        }
      });
      parser.on('end', resolve);
      parser.on('error', reject);
      stream.pipe(parser);
    });

    // Dapodik format: skip first 4 rows (title + info), row 5 = header, row 6 = sub-header, data starts row 7
    const headerRow = allRows[4] || [];
    const subHeaderRow = allRows[5] || [];
    const dataRows = allRows.slice(6);

    // Map Dapodik column indices to SiswaTK fields
    // Based on actual Dapodik CSV format
    const columnMap: Record<number, { field: string; transform?: (v: string) => any }> = {
      0: { field: '_skip' },   // No
      1: { field: 'namaSiswa' }, // Nama
      2: { field: 'nipd' },     // NIPD
      3: { field: 'jenisKelamin' }, // JK (L/P)
      4: { field: 'nisn' },     // NISN
      5: { field: 'tempatLahir' }, // Tempat Lahir
      6: { field: 'tanggalLahir', transform: (v: string) => parseDate(v) }, // Tanggal Lahir
      7: { field: 'nik' },      // NIK
      8: { field: 'agama' },    // Agama
      9: { field: 'alamat' },   // Alamat
      10: { field: 'rt' },      // RT
      11: { field: 'rw' },      // RW
      12: { field: 'dusun' },   // Dusun
      13: { field: 'kelurahan' }, // Kelurahan
      14: { field: 'kecamatan' }, // Kecamatan
      15: { field: 'kodePos' }, // Kode Pos
      16: { field: 'jenisTinggal' }, // Jenis Tinggal
      17: { field: 'alatTransportasi' }, // Alat Transportasi
      18: { field: 'telepon' }, // Telepon
      19: { field: 'hp' },      // HP
      20: { field: 'email' },   // E-Mail
      21: { field: '_skip' },   // SKHUN
      22: { field: 'penerimaKPS' }, // Penerima KPS
      23: { field: 'noKPS' },   // No. KPS
      // Data Ayah
      24: { field: 'namaAyah' }, // Nama Ayah
      25: { field: 'tahunLahirAyah' }, // Tahun Lahir Ayah
      26: { field: 'jenjangPendidikanAyah' }, // Jenjang Pendidikan Ayah
      27: { field: 'pekerjaanAyah' }, // Pekerjaan Ayah
      28: { field: 'penghasilanAyah' }, // Penghasilan Ayah
      29: { field: 'nikAyah' }, // NIK Ayah
      // Data Ibu
      30: { field: 'namaIbu' }, // Nama Ibu
      31: { field: 'tahunLahirIbu' }, // Tahun Lahir Ibu
      32: { field: 'jenjangPendidikanIbu' }, // Jenjang Pendidikan Ibu
      33: { field: 'pekerjaanIbu' }, // Pekerjaan Ibu
      34: { field: 'penghasilanIbu' }, // Penghasilan Ibu
      35: { field: 'nikIbu' }, // NIK Ibu
      // Data Wali
      36: { field: 'namaWali' }, // Nama Wali
      37: { field: 'tahunLahirWali' }, // Tahun Lahir Wali
      38: { field: 'jenjangPendidikanWali' }, // Jenjang Pendidikan Wali
      39: { field: 'pekerjaanWali' }, // Pekerjaan Wali
      40: { field: 'penghasilanWali' }, // Penghasilan Wali
      41: { field: 'nikWali' }, // NIK Wali
      // Akademik & Lainnya
      42: { field: 'rombel' },  // Rombel Saat Ini
      43: { field: '_skip' },   // No Peserta Ujian Nasional
      44: { field: '_skip' },   // No Seri Ijazah
      45: { field: 'penerimaKIP' }, // Penerima KIP
      46: { field: 'nomorKIP' }, // Nomor KIP
      47: { field: 'namaDiKIP' }, // Nama di KIP
      48: { field: 'nomorKKS' }, // Nomor KKS
      49: { field: 'noRegAktaLahir' }, // No Registrasi Akta Lahir
      50: { field: '_skip' },   // Bank
      51: { field: '_skip' },   // Nomor Rekening Bank
      52: { field: '_skip' },   // Rekening Atas Nama
      53: { field: 'layakPIP' }, // Layak PIP
      54: { field: 'alasanPIP' }, // Alasan Layak PIP
      55: { field: 'kebutuhanKhusus' }, // Kebutuhan Khusus
      56: { field: 'sekolahAsal' }, // Sekolah Asal
      57: { field: 'anakKe', transform: (v: string) => parseIntOrNull(v) }, // Anak ke-berapa
      58: { field: 'lintang' }, // Lintang
      59: { field: 'bujur' },   // Bujur
      60: { field: 'noKK' },    // No KK
      61: { field: 'beratBadan', transform: (v: string) => parseIntOrNull(v) }, // Berat Badan
      62: { field: 'tinggiBadan', transform: (v: string) => parseIntOrNull(v) }, // Tinggi Badan
      63: { field: 'lingkarKepala', transform: (v: string) => parseIntOrNull(v) }, // Lingkar Kepala
      64: { field: 'jmlSaudaraKandung', transform: (v: string) => parseIntOrNull(v) }, // Jml Saudara
      65: { field: 'jarakRumahKm', transform: (v: string) => parseIntOrNull(v) }, // Jarak Rumah
    };

    function parseDate(value: string): Date | null {
      if (!value || value.trim() === '' || value === '0') return null;
      const trimmed = value.trim();
      const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (isoMatch) {
        const d = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
        if (!isNaN(d.getTime())) return d;
      }
      const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (dmyMatch) {
        const d = new Date(parseInt(dmyMatch[3]), parseInt(dmyMatch[2]) - 1, parseInt(dmyMatch[1]));
        if (!isNaN(d.getTime())) return d;
      }
      return null;
    }

    function parseIntOrNull(v: string): number | null {
      if (!v || v.trim() === '' || v === '0') return v === '0' ? 0 : null;
      const n = parseInt(v.trim());
      return isNaN(n) ? null : n;
    }

    function cleanString(v: string | undefined): string | null {
      if (!v || v.trim() === '' || v.trim() === '-') return null;
      return v.trim();
    }

    // Create import log
    const importLog = await db.importLog.create({
      data: {
        fileName: 'google-sheet-dapodik.csv',
        sourceUrl: sheetUrl,
        lembagaPaudId: lembagaId,
        totalRecords: dataRows.length,
        status: 'processing',
      },
    });

    // Process records
    let importedCount = 0;
    let failedCount = 0;
    const failedDetails: { row: number; error: string }[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const namaSiswa = cleanString(row[1]);

      if (!namaSiswa) {
        failedCount++;
        failedDetails.push({ row: i + 7, error: 'Nama siswa kosong' });
        continue;
      }

      try {
        // Build data object from column map
        const dataRecord: Record<string, any> = { lembagaPaudId: lembagaId, namaSiswa };

        for (const [colIdx, mapping] of Object.entries(columnMap)) {
          if (mapping.field === '_skip') continue;
          const rawValue = row[parseInt(colIdx)] || '';
          const value = mapping.transform ? mapping.transform(rawValue) : cleanString(rawValue);
          if (value !== null && value !== undefined) {
            dataRecord[mapping.field] = value;
          }
        }

        const nik = dataRecord.nik as string | undefined;

        // Check duplicate by NIK + lembagaPaudId
        if (nik) {
          const existing = await db.siswaTK.findFirst({
            where: { nik, lembagaPaudId: lembagaId },
          });

          if (existing) {
            // Update existing
            const { lembagaPaudId: _, namaSiswa: __, ...updateData } = dataRecord;
            await db.siswaTK.update({
              where: { id: existing.id },
              data: updateData,
            });
            importedCount++;
            continue;
          }
        }

        // Create new
        await db.siswaTK.create({ data: dataRecord as any });
        importedCount++;
      } catch (err: any) {
        failedCount++;
        failedDetails.push({ row: i + 7, error: err.message?.substring(0, 200) || 'Unknown error' });
      }
    }

    // Update import log
    const finalStatus = failedCount === 0
      ? 'completed'
      : importedCount > 0
        ? 'completed_with_errors'
        : 'failed';

    await db.importLog.update({
      where: { id: importLog.id },
      data: {
        importedRecords: importedCount,
        failedRecords: failedCount,
        failedDetails: failedDetails.length > 0 ? JSON.stringify(failedDetails.slice(0, 20)) : null,
        status: finalStatus,
        completedAt: new Date(),
        errorMessage: failedCount > 0 ? `${failedCount} record gagal` : null,
      },
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

  } catch (error: any) {
    console.error('Error syncing Google Sheet:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

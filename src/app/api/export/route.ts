// SPMB AI - Export Excel API Route
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { applicants, schoolName } = await req.json();

    // Generate CSV content (simplified Excel export)
    const headers = [
      'No',
      'Nomor Pendaftaran',
      'Tanggal Daftar',
      'NIK',
      'NISN',
      'Nama Siswa',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Usia',
      'Jenis Kelamin',
      'Alamat',
      'Nama Ayah',
      'Nama Ibu',
      'No HP Orang Tua',
      'Sekolah Tujuan',
      'Jalur Pendaftaran',
      'Status Berkas',
      'Status Pendaftaran',
      'Catatan Operator',
      'Tanggal Verifikasi',
      'Nama Verifikator',
    ];

    const rows = applicants.map((a: any, i: number) => {
      const age = a.tanggalLahir
        ? Math.floor(
            (Date.now() - new Date(a.tanggalLahir).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : '-';
      return [
        i + 1,
        a.nomorPendaftaran,
        a.createdAt ? new Date(a.createdAt).toLocaleDateString('id-ID') : '',
        a.nik,
        a.nisn || '-',
        a.namaSiswa,
        a.tempatLahir,
        a.tanggalLahir,
        age,
        a.jenisKelamin,
        a.alamat,
        a.namaAyah,
        a.namaIbu,
        a.noHpOrtu,
        a.namaSekolah,
        a.jalur,
        a.statusBerkas,
        a.statusPendaftaran,
        a.catatanOperator || '',
        a.updatedAt ? new Date(a.updatedAt).toLocaleDateString('id-ID') : '',
        '-',
      ];
    });

    // Create CSV
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const filename = schoolName
      ? `pendaftar-spmb-${schoolName.toLowerCase().replace(/\s+/g, '-')}.csv`
      : 'pendaftar-spmb-semua-sekolah.csv';

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export gagal' }, { status: 500 });
  }
}

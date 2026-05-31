import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorized } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorized();

    const { applicants, schoolName } = await req.json();

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

    const rows = (applicants || []).map((a: Record<string, unknown>, i: number) => {
      const age = a.tanggalLahir
        ? Math.floor(
            (Date.now() - new Date(a.tanggalLahir as string).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : '-';
      return [
        i + 1,
        a.nomorPendaftaran,
        a.createdAt ? new Date(a.createdAt as string).toLocaleDateString('id-ID') : '',
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
        a.updatedAt ? new Date(a.updatedAt as string).toLocaleDateString('id-ID') : '',
        '-',
      ];
    });

    function sanitizeCsvCell(value: unknown): string {
      const str = String(value ?? '');
      const escaped = str.replace(/"/g, '""');
      return /^[=+\-@]/.test(escaped) ? `"'${escaped}"` : `"${escaped}"`;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map((row: unknown[]) =>
        row.map((cell) => sanitizeCsvCell(cell)).join(',')
      ),
    ].join('\n');

    const filename = schoolName
      ? `pendaftar-spmb-${(schoolName as string).toLowerCase().replace(/\s+/g, '-')}.csv`
      : 'pendaftar-spmb-semua-sekolah.csv';

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export gagal' }, { status: 500 });
  }
}

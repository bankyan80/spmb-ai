import { NextRequest, NextResponse } from 'next/server';
import { siswaTKTable, lembagaPaudTable } from '@/lib/sheet-config';
import { lulusanTKPaudKb, LulusanTK } from '@/lib/portal-dinas-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nik = searchParams.get('nik');

    if (!nik) {
      return NextResponse.json(
        { success: false, error: 'Parameter NIK wajib diisi' },
        { status: 400 },
      );
    }

    // Try Google Sheets first, fallback to portal-dinas data
    let siswa: Record<string, unknown> | undefined;

    try {
      const allSiswa = await siswaTKTable.findAll();
      siswa = allSiswa.find((s) => s.nik === nik);
    } catch {
      // Google Sheets not available, use portal-dinas data
    }

    if (!siswa) {
      const portalSiswa = lulusanTKPaudKb.find((s) => s.nik === nik);
      if (portalSiswa) {
        return NextResponse.json({
          success: true,
          data: mapPortalToSiswa(portalSiswa),
        });
      }
    }

    if (!siswa) {
      return NextResponse.json(
        { success: false, data: null, message: 'Data siswa tidak ditemukan' },
      );
    }

    // Google Sheets fallback: look up lembaga
    let lembaga: Record<string, unknown> | undefined;
    try {
      const allLembaga = await lembagaPaudTable.findAll();
      lembaga = allLembaga.find((l) => l.id === siswa!.lembagaPaudId);
    } catch {
      // ignore - lembaga lookup not available
    }

    return NextResponse.json({
      success: true,
      data: {
        ...siswa,
        lembagaPaud: lembaga || null,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Gagal mencari data siswa' },
      { status: 500 },
    );
  }
}

function mapPortalToSiswa(s: LulusanTK): Record<string, unknown> {
  return {
    id: `portal-${s.nik}`,
    nik: s.nik,
    nisn: s.nisn,
    namaSiswa: s.nama,
    tempatLahir: s.tempatLahir,
    tanggalLahir: s.tanggalLahir,
    jenisKelamin: s.jenisKelamin,
    agama: s.agama,
    alamat: s.alamat,
    desa: s.desa,
    kecamatan: s.kecamatan,
    namaAyah: s.namaAyah,
    nikAyah: s.nikAyah,
    namaIbu: s.namaIbu,
    nikIbu: s.nikIbu,
    lembagaPaud: {
      nama: s.sekolahAsal,
      jenjang: s.jenjang,
      npsn: s.npsn,
    },
    statusAktif: true,
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/siswa-tk/lookup?nik=xxx
// Lookup siswa TK/PAUD/KB by NIK for auto-fill registration form
// Data source: Google Sheets (Dapodik format)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nik = searchParams.get('nik');

    if (!nik || nik.length !== 16) {
      return NextResponse.json(
        { success: false, error: 'NIK harus 16 digit' },
        { status: 400 }
      );
    }

    // Search in SiswaTK database (from Google Sheets / Dapodik import)
    const siswa = await db.siswaTK.findFirst({
      where: {
        nik,
        statusAktif: true,
      },
      include: {
        lembagaPaud: {
          select: {
            id: true,
            namaLembaga: true,
            npsn: true,
            jenisLembaga: true,
            kecamatan: true,
          },
        },
      },
    });

    if (!siswa) {
      return NextResponse.json({
        success: true,
        found: false,
        message: 'Data siswa dengan NIK tersebut tidak ditemukan di database TK/PAUD/KB',
        data: null,
      });
    }

    // Map to registration form fields (Dapodik → SPMB format)
    const autoFillData = {
      // Data Siswa
      nik: siswa.nik,
      nisn: siswa.nisn || '',
      namaSiswa: siswa.namaSiswa,
      tempatLahir: siswa.tempatLahir || '',
      tanggalLahir: siswa.tanggalLahir
        ? siswa.tanggalLahir.toISOString().split('T')[0]
        : '',
      jenisKelamin: siswa.jenisKelamin === 'P' ? 'Perempuan' : siswa.jenisKelamin === 'L' ? 'Laki-laki' : siswa.jenisKelamin || '',
      agama: siswa.agama || '',

      // Data Alamat
      alamat: siswa.alamat || '',
      rt: siswa.rt || '',
      rw: siswa.rw || '',
      dusun: siswa.dusun || '',
      kelurahan: siswa.kelurahan || '',
      desa: siswa.kelurahan || '', // alias for compatibility
      kecamatan: siswa.kecamatan || '',
      kodePos: siswa.kodePos || '',
      jenisTinggal: siswa.jenisTinggal || '',
      alatTransportasi: siswa.alatTransportasi || '',

      // Data Kontak
      telepon: siswa.telepon || '',
      noHpOrtu: siswa.hp || siswa.telepon || '', // HP utama untuk SPMB
      hp: siswa.hp || '',
      email: siswa.email || '',

      // Data Ayah
      namaAyah: siswa.namaAyah || '',
      tahunLahirAyah: siswa.tahunLahirAyah || '',
      jenjangPendidikanAyah: siswa.jenjangPendidikanAyah || '',
      pekerjaanAyah: siswa.pekerjaanAyah || '',
      penghasilanAyah: siswa.penghasilanAyah || '',
      nikAyah: siswa.nikAyah || '',

      // Data Ibu
      namaIbu: siswa.namaIbu || '',
      tahunLahirIbu: siswa.tahunLahirIbu || '',
      jenjangPendidikanIbu: siswa.jenjangPendidikanIbu || '',
      pekerjaanIbu: siswa.pekerjaanIbu || '',
      penghasilanIbu: siswa.penghasilanIbu || '',
      nikIbu: siswa.nikIbu || '',

      // Data Wali
      namaWali: siswa.namaWali || '',
      pekerjaanWali: siswa.pekerjaanWali || '',
      nikWali: siswa.nikWali || '',

      // Data Bantuan
      penerimaKIP: siswa.penerimaKIP || '',
      nomorKIP: siswa.nomorKIP || '',
      noKK: siswa.noKK || '',

      // Data Lainnya
      kebutuhanKhusus: siswa.kebutuhanKhusus || '',
      anakKe: siswa.anakKe || null,
      jmlSaudaraKandung: siswa.jmlSaudaraKandung || null,

      // Info asal lembaga
      asalLembaga: {
        nama: siswa.lembagaPaud.namaLembaga,
        npsn: siswa.lembagaPaud.npsn,
        jenis: siswa.lembagaPaud.jenisLembaga,
        rombel: siswa.rombel,
        tahunAjaran: siswa.tahunAjaran,
      },
    };

    return NextResponse.json({
      success: true,
      found: true,
      message: `Data ditemukan: ${siswa.namaSiswa} dari ${siswa.lembagaPaud.namaLembaga}`,
      data: autoFillData,
    });

  } catch (error: any) {
    console.error('Error looking up NIK:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

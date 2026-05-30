import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/siswa-tk - Query siswa TK/PAUD/KB
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filters
    const lembagaPaudId = searchParams.get('lembagaPaudId') || undefined;
    const npsn = searchParams.get('npsn') || undefined;
    const kecamatan = searchParams.get('kecamatan') || undefined;
    const desa = searchParams.get('desa') || undefined;
    const jenisLembaga = searchParams.get('jenisLembaga') || undefined;
    const namaSiswa = searchParams.get('namaSiswa') || undefined;
    const nik = searchParams.get('nik') || undefined;
    const kelas = searchParams.get('kelas') || undefined;
    const tahunAjaran = searchParams.get('tahunAjaran') || undefined;
    const statusAktif = searchParams.get('statusAktif');

    // Build where clause
    const where: any = {};

    if (lembagaPaudId) {
      where.lembagaPaudId = lembagaPaudId;
    }

    if (npsn || kecamatan || desa || jenisLembaga) {
      where.lembagaPaud = {};
      if (npsn) where.lembagaPaud.npsn = npsn;
      if (kecamatan) where.lembagaPaud.kecamatan = kecamatan;
      if (desa) where.lembagaPaud.desa = desa;
      if (jenisLembaga) where.lembagaPaud.jenisLembaga = jenisLembaga;
    }

    if (namaSiswa) {
      where.namaSiswa = { contains: namaSiswa };
    }

    if (nik) {
      where.nik = nik;
    }

    // Note: rombel is used instead of kelas in the schema
    if (kelas) {
      where.rombel = kelas;
    }

    if (tahunAjaran) {
      where.tahunAjaran = tahunAjaran;
    }

    if (statusAktif !== null && statusAktif !== undefined && statusAktif !== '') {
      where.statusAktif = statusAktif === 'true';
    }

    // Query
    const [siswa, total] = await Promise.all([
      db.siswaTK.findMany({
        where,
        include: {
          lembagaPaud: {
            select: {
              id: true,
              namaLembaga: true,
              npsn: true,
              jenisLembaga: true,
              desa: true,
              kecamatan: true,
            },
          },
        },
        orderBy: { namaSiswa: 'asc' },
        skip,
        take: limit,
      }),
      db.siswaTK.count({ where }),
    ]);

    // Stats summary
    const stats = await db.siswaTK.aggregate({
      where: { statusAktif: true },
      _count: true,
    });

    const lembagaCount = await db.lembagaPaud.count({
      where: { statusAktif: true },
    });

    // Siswa per kecamatan
    const perKecamatan = await db.siswaTK.groupBy({
      by: ['kecamatan'],
      where: { statusAktif: true, kecamatan: { not: null } },
      _count: true,
    });

    // Siswa per jenis lembaga - use raw query for SQLite since groupBy doesn't support relation counts
    const perJenisLembaga = await db.$queryRaw<
      { jenisLembaga: string; jumlah: number }[]
    >`
      SELECT lp.jenisLembaga, COUNT(st.id) as jumlah
      FROM LembagaPaud lp
      LEFT JOIN SiswaTK st ON st.lembagaPaudId = lp.id AND st.statusAktif = 1
      WHERE lp.statusAktif = 1
      GROUP BY lp.jenisLembaga
    `;

    return NextResponse.json({
      success: true,
      data: siswa,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalSiswaAktif: stats._count,
        totalLembaga: lembagaCount,
        perKecamatan: perKecamatan.map(item => ({
          kecamatan: item.kecamatan,
          jumlah: item._count,
        })),
        perJenisLembaga: perJenisLembaga.map(item => ({
          jenisLembaga: item.jenisLembaga,
          jumlah: Number(item.jumlah),
        })),
      },
    });

  } catch (error: any) {
    console.error('Error fetching siswa TK:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/siswa-tk - Create single siswa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const siswa = await db.siswaTK.create({
      data: {
        lembagaPaudId: body.lembagaPaudId,
        nipd: body.nipd || null,
        nisn: body.nisn || null,
        namaSiswa: body.namaSiswa,
        nik: body.nik || null,
        tempatLahir: body.tempatLahir || null,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,
        jenisKelamin: body.jenisKelamin || null,
        agama: body.agama || null,
        alamat: body.alamat || null,
        rt: body.rt || null,
        rw: body.rw || null,
        kelurahan: body.kelurahan || body.desa || null,
        kecamatan: body.kecamatan || null,
        namaAyah: body.namaAyah || null,
        nikAyah: body.nikAyah || null,
        pekerjaanAyah: body.pekerjaanAyah || null,
        namaIbu: body.namaIbu || null,
        nikIbu: body.nikIbu || null,
        pekerjaanIbu: body.pekerjaanIbu || null,
        hp: body.hp || body.noHpOrtu || null,
        tahunAjaran: body.tahunAjaran || null,
        rombel: body.rombel || body.kelas || null,
        tahunMasuk: body.tahunMasuk || null,
        catatan: body.catatan || null,
      },
      include: {
        lembagaPaud: {
          select: {
            namaLembaga: true,
            npsn: true,
            jenisLembaga: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: siswa }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating siswa TK:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

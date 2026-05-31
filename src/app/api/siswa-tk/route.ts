import { NextRequest, NextResponse } from 'next/server';
import { siswaTKTable } from '@/lib/sheet-config';
import { lulusanTKPaudKb, LulusanTK } from '@/lib/portal-dinas-data';

function mapPortalToSiswaList(): Record<string, unknown>[] {
  return lulusanTKPaudKb.map((s) => ({
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
    lembagaPaudId: s.jenjang ? `${s.jenjang}-${s.npsn}` : '',
    statusAktif: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

async function getAllSiswa(): Promise<Record<string, unknown>[]> {
  try {
    return await siswaTKTable.findAll() as Record<string, unknown>[];
  } catch {
    return mapPortalToSiswaList();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lembagaPaudId = searchParams.get('lembagaPaudId');
    const kecamatan = searchParams.get('kecamatan');
    const keyword = searchParams.get('keyword');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const stats = searchParams.get('stats') === 'true';

    let data = await getAllSiswa();

    if (lembagaPaudId) data = data.filter((r) => r.lembagaPaudId === lembagaPaudId);
    if (kecamatan) data = data.filter((r) => r.kecamatan === kecamatan);
    if (keyword) {
      const kw = keyword.toLowerCase();
      data = data.filter(
        (r) =>
          (r.namaSiswa && String(r.namaSiswa).toLowerCase().includes(kw)) ||
          (r.nik && String(r.nik).includes(kw)) ||
          (r.nisn && String(r.nisn).includes(kw)),
      );
    }

    if (stats) {
      const totalSiswaAktif = data.filter((r) => r.statusAktif).length;
      const lembagaIds = new Set(data.map((r) => r.lembagaPaudId));
      const perKecamatan: Record<string, number> = {};
      data.forEach((r) => {
        const k = (r.kecamatan as string) || 'unknown';
        perKecamatan[k] = (perKecamatan[k] || 0) + 1;
      });

      const allLembaga = await getAllLembaga();
      const perJenisLembaga: Record<string, number> = {};
      allLembaga.forEach((l) => {
        const j = (l.jenisLembaga as string) || 'unknown';
        perJenisLembaga[j] = (perJenisLembaga[j] || 0) + 1;
      });

      return NextResponse.json({
        success: true,
        data: {
          totalSiswaAktif,
          totalLembaga: lembagaIds.size,
          perKecamatan: Array.from(perKecamatan.entries()).map(([kec, jumlah]) => ({ kecamatan: kec, jumlah })),
          perJenisLembaga: Array.from(perJenisLembaga.entries()).map(([jenis, jumlah]) => ({ jenisLembaga: jenis, jumlah })),
        },
      });
    }

    const total = data.length;
    const paginated = data.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Gagal mengambil data siswa' },
      { status: 500 },
    );
  }
}

async function getAllLembaga(): Promise<Record<string, unknown>[]> {
  try {
    const { lembagaPaudTable } = await import('@/lib/sheet-config');
    return await lembagaPaudTable.findAll() as Record<string, unknown>[];
  } catch {
    // Generate from portal data
    const seen = new Set<string>();
    const result: Record<string, unknown>[] = [];
    lulusanTKPaudKb.forEach((s) => {
      const key = `${s.jenjang}-${s.npsn}`;
      if (!seen.has(key) && s.sekolahAsal) {
        seen.add(key);
        result.push({
          id: key,
          nama: s.sekolahAsal,
          jenisLembaga: s.jenjang,
          npsn: s.npsn,
        });
      }
    });
    return result;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const record: Record<string, unknown> = {
      id: body.id || `siswa-${Date.now()}`,
      lembagaPaudId: body.lembagaPaudId || '',
      namaSiswa: body.namaSiswa || '',
      ...body,
      statusAktif: body.statusAktif ?? true,
      createdAt: now,
      updatedAt: now,
    };

    await siswaTKTable.create(record);
    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Gagal menyimpan data siswa' },
      { status: 400 },
    );
  }
}

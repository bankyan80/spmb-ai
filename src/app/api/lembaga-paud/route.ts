import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/lembaga-paud - Query lembaga PAUD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const kecamatan = searchParams.get('kecamatan') || undefined;
    const desa = searchParams.get('desa') || undefined;
    const jenisLembaga = searchParams.get('jenisLembaga') || undefined;
    const namaLembaga = searchParams.get('namaLembaga') || undefined;
    const npsn = searchParams.get('npsn') || undefined;

    const where: any = { statusAktif: true };

    if (kecamatan) where.kecamatan = kecamatan;
    if (desa) where.desa = desa;
    if (jenisLembaga) where.jenisLembaga = jenisLembaga;
    if (namaLembaga) where.namaLembaga = { contains: namaLembaga };
    if (npsn) where.npsn = npsn;

    const lembaga = await db.lembagaPaud.findMany({
      where,
      include: {
        _count: { select: { siswa: true, importLogs: true } },
      },
      orderBy: { namaLembaga: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: lembaga,
    });

  } catch (error: any) {
    console.error('Error fetching lembaga PAUD:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { lembagaPaudTable } from '@/lib/sheet-config';
import { lulusanTKPaudKb } from '@/lib/portal-dinas-data';

async function getAllLembaga(): Promise<Record<string, unknown>[]> {
  try {
    return await lembagaPaudTable.findAll() as Record<string, unknown>[];
  } catch {
    const seen = new Map<string, Record<string, unknown>>();
    lulusanTKPaudKb.forEach((s) => {
      const key = `${s.jenjang}-${s.npsn}`;
      if (!seen.has(key) && s.sekolahAsal) {
        seen.set(key, {
          id: key,
          npsn: s.npsn,
          namaLembaga: s.sekolahAsal,
          jenisLembaga: s.jenjang,
          kecamatan: s.kecamatan || 'Lemahabang',
          desa: s.desa || '',
          statusAktif: true,
        });
      }
    });
    return Array.from(seen.values());
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kecamatan = searchParams.get('kecamatan');
    const desa = searchParams.get('desa');
    const jenis = searchParams.get('jenis');
    const nama = searchParams.get('nama');
    const npsn = searchParams.get('npsn');

    let data = await getAllLembaga();

    if (kecamatan) data = data.filter((r) => r.kecamatan === kecamatan);
    if (desa) data = data.filter((r) => r.desa === desa);
    if (jenis) data = data.filter((r) => r.jenisLembaga === jenis);
    if (nama) data = data.filter((r) => r.namaLembaga && String(r.namaLembaga).toLowerCase().includes(nama.toLowerCase()));
    if (npsn) data = data.filter((r) => r.npsn === npsn);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Gagal mengambil data lembaga' },
      { status: 500 }
    );
  }
}

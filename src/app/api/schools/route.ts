import { NextRequest, NextResponse } from 'next/server';
import { schoolsTable } from '@/lib/sheet-config';
import { verifyAuth, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kecamatan = searchParams.get('kecamatan');
    const aktif = searchParams.get('aktif');

    let schools = await schoolsTable.findAll();

    if (kecamatan) schools = schools.filter((s) => s.kecamatan === kecamatan);
    if (aktif === 'true') schools = schools.filter((s) => s.statusAktif === true);

    const data = schools.map((s) => ({
      ...s,
      _count: { applicants: 0 },
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorized();

    const body = await request.json();
    const now = new Date().toISOString();
    const school = {
      schoolId: body.schoolId || `sch-${Date.now()}`,
      namaSekolah: body.namaSekolah,
      npsn: body.npsn,
      jenjang: body.jenjang || 'SD',
      alamat: body.alamat,
      desa: body.desa,
      kecamatan: body.kecamatan,
      latitude: body.latitude || 0,
      longitude: body.longitude || 0,
      kuota: body.kuota || 0,
      sisaKuota: body.sisaKuota || body.kuota || 0,
      statusAktif: body.statusAktif ?? true,
      createdAt: now,
      updatedAt: now,
    };

    await schoolsTable.create(school);
    return NextResponse.json({ success: true, data: school }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorized();

    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID sekolah wajib diisi' }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();
    const result = await schoolsTable.update(id, updates);
    if (!result) {
      return NextResponse.json({ success: false, error: 'Sekolah tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID sekolah wajib diisi' }, { status: 400 });
    }
    await schoolsTable.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 400 }
    );
  }
}

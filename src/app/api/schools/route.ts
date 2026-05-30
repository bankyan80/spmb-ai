import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kecamatan = searchParams.get('kecamatan') || undefined;
    const aktif = searchParams.get('aktif');

    const where: any = {};
    if (kecamatan) where.kecamatan = kecamatan;
    if (aktif === 'true') where.statusAktif = true;

    const schools = await db.school.findMany({
      where,
      include: { _count: { select: { applicants: true } } },
      orderBy: { namaSekolah: 'asc' },
    });

    return NextResponse.json({ success: true, data: schools });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const school = await db.school.create({ data: body });
    return NextResponse.json({ success: true, data: school }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const school = await db.school.update({ where: { id }, data: updates });
    return NextResponse.json({ success: true, data: school });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new Error('id required');
    await db.school.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
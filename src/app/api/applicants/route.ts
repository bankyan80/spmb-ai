import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || undefined;
    const status = searchParams.get('status') || undefined;
    const jalur = searchParams.get('jalur') || undefined;
    const keyword = searchParams.get('keyword') || undefined;

    const where: any = {};
    if (schoolId) where.schoolId = schoolId;
    if (status) where.statusPendaftaran = status;
    if (jalur) where.jalur = jalur;
    if (keyword) {
      where.OR = [
        { namaSiswa: { contains: keyword } },
        { nik: { contains: keyword } },
        { nomorPendaftaran: { contains: keyword } },
      ];
    }

    const applicants = await db.applicant.findMany({
      where,
      include: { school: { select: { namaSekolah: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: applicants });
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

    // Generate nomor pendaftaran
    const count = await db.applicant.count();
    const nomorPendaftaran = `SPMB-2026-${String(count + 1).padStart(6, '0')}`;

    const applicant = await db.applicant.create({
      data: {
        ...body,
        nomorPendaftaran,
      },
    });

    return NextResponse.json({ success: true, data: applicant }, { status: 201 });
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
    const applicant = await db.applicant.update({ where: { id }, data: updates });
    return NextResponse.json({ success: true, data: applicant });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
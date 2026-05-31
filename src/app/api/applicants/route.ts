import { NextRequest, NextResponse } from 'next/server';
import { applicantsTable } from '@/lib/sheet-config';
import { verifyAuth, unauthorized } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const status = searchParams.get('status');
    const jalur = searchParams.get('jalur');
    const keyword = searchParams.get('keyword');

    let applicants = await applicantsTable.findAll();

    if (schoolId) applicants = applicants.filter((a) => a.schoolId === schoolId);
    if (status) applicants = applicants.filter((a) => a.statusPendaftaran === status);
    if (jalur) applicants = applicants.filter((a) => a.jalur === jalur);
    if (keyword) {
      const kw = keyword.toLowerCase();
      applicants = applicants.filter(
        (a) =>
          (a.namaSiswa && String(a.namaSiswa).toLowerCase().includes(kw)) ||
          (a.nik && String(a.nik).includes(kw)) ||
          (a.nomorPendaftaran && String(a.nomorPendaftaran).includes(kw)),
      );
    }

    return NextResponse.json({ success: true, data: applicants });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const count = await applicantsTable.count();
    const nomorPendaftaran = `SPMB-2026-${String(count + 1).padStart(6, '0')}`;

    const applicant: Record<string, unknown> = {
      applicantId: body.applicantId || `app-${Date.now()}`,
      nomorPendaftaran,
      nik: body.nik || '',
      nisn: body.nisn || '',
      namaSiswa: body.namaSiswa || '',
      tempatLahir: body.tempatLahir || '',
      tanggalLahir: body.tanggalLahir || '',
      jenisKelamin: body.jenisKelamin || '',
      agama: body.agama || '',
      alamat: body.alamat || '',
      desa: body.desa || '',
      kecamatan: body.kecamatan || '',
      namaAyah: body.namaAyah || '',
      nikAyah: body.nikAyah || '',
      pekerjaanAyah: body.pekerjaanAyah || '',
      namaIbu: body.namaIbu || '',
      nikIbu: body.nikIbu || '',
      pekerjaanIbu: body.pekerjaanIbu || '',
      noHpOrtu: body.noHpOrtu || '',
      schoolId: body.schoolId || '',
      namaSekolah: body.namaSekolah || '',
      jalur: body.jalur || 'domisili',
      statusBerkas: body.statusBerkas || 'belum_lengkap',
      statusPendaftaran: body.statusPendaftaran || 'draft',
      catatanOperator: body.catatanOperator || '',
      createdAt: now,
      updatedAt: now,
    };

    await applicantsTable.create(applicant);
    return NextResponse.json({ success: true, data: applicant }, { status: 201 });
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
      return NextResponse.json({ success: false, error: 'ID pendaftar wajib diisi' }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();
    const result = await applicantsTable.update(id, updates);
    if (!result) {
      return NextResponse.json({ success: false, error: 'Pendaftar tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/drive';
import { documentsTable } from '@/lib/sheet-config';
import { verifyAuth, unauthorized } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const applicantId = formData.get('applicantId') as string | null;
    const jenisDokumen = formData.get('jenisDokumen') as string || 'dokumen';

    if (!file) {
      return NextResponse.json({ success: false, error: 'File wajib diupload' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadFile(buffer, file.name, file.type);

    const docId = `doc-${Date.now()}`;
    const doc = {
      documentId: docId,
      applicantId: applicantId || '',
      jenisDokumen,
      fileUrl: uploaded.webViewLink,
      statusVerifikasi: 'belum_diverifikasi',
      catatan: null,
      uploadedAt: new Date().toISOString(),
    };

    await documentsTable.create(doc);

    return NextResponse.json({
      success: true,
      data: {
        ...doc,
        driveFileId: uploaded.id,
        driveFileSize: uploaded.size,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload gagal' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');

    let docs = await documentsTable.findAll();
    if (applicantId) docs = docs.filter((d) => d.applicantId === applicantId);

    return NextResponse.json({ success: true, data: docs });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Gagal mengambil data dokumen' },
      { status: 500 },
    );
  }
}

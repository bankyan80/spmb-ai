import { NextRequest, NextResponse } from 'next/server';
import { chatAISettingsTable } from '@/lib/sheet-config';
import { verifyAuth, unauthorized } from '@/lib/auth';

const DEFAULT_SETTINGS: Record<string, unknown> = {
  id: 'default',
  modelAI: 'gemini-2.0-flash',
  aktifkanGoogleSearch: true,
  aktifkanSlowTyping: true,
  kecepatanTyping: 'normal',
  maksimalHasilGoogle: 5,
  sumberUtama: 'data_aplikasi',
  sumberTambahan: 'google_search',
  systemPrompt: null,
  pesanFallback: 'Maaf, saya tidak dapat memproses pertanyaan Anda saat ini. Silakan coba lagi atau hubungi panitia SPMB.',
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

export async function GET() {
  try {
    const all = await chatAISettingsTable.findAll();
    const settings = all[0] || DEFAULT_SETTINGS;
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS, { status: 200 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) return unauthorized();

    const body = await req.json();
    const all = await chatAISettingsTable.findAll();
    const existing = all[0];

    const merged = {
      ...DEFAULT_SETTINGS,
      ...(existing || {}),
      ...body,
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      await chatAISettingsTable.update(existing.id as string, merged);
    } else {
      merged.createdAt = new Date().toISOString();
      await chatAISettingsTable.create(merged);
    }

    return NextResponse.json(merged);
  } catch (error: unknown) {
    console.error('ChatSettings PUT error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan' }, { status: 500 });
  }
}

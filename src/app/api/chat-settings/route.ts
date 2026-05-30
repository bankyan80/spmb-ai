// Chat AI Settings API Route
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEFAULT_SETTINGS = {
  modelAI: 'gemini-2.0-flash',
  aktifkanGoogleSearch: true,
  aktifkanSlowTyping: true,
  kecepatanTyping: 'normal',
  maksimalHasilGoogle: 5,
  sumberUtama: 'data_aplikasi',
  sumberTambahan: 'google_search',
  systemPrompt: null,
  pesanFallback: 'Maaf, saya tidak dapat memproses pertanyaan Anda saat ini. Silakan coba lagi atau hubungi panitia SPMB.',
};

// GET - Retrieve chat AI settings
export async function GET() {
  try {
    let settings = await db.chatAISettings.findFirst();

    if (!settings) {
      // Create default settings if none exist
      settings = await db.chatAISettings.create({
        data: DEFAULT_SETTINGS,
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('ChatSettings GET error:', error);
    return NextResponse.json(DEFAULT_SETTINGS, { status: 200 });
  }
}

// PUT - Update chat AI settings
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    let settings = await db.chatAISettings.findFirst();

    if (!settings) {
      // Create with provided values
      settings = await db.chatAISettings.create({
        data: {
          modelAI: body.modelAI || DEFAULT_SETTINGS.modelAI,
          aktifkanGoogleSearch: body.aktifkanGoogleSearch ?? DEFAULT_SETTINGS.aktifkanGoogleSearch,
          aktifkanSlowTyping: body.aktifkanSlowTyping ?? DEFAULT_SETTINGS.aktifkanSlowTyping,
          kecepatanTyping: body.kecepatanTyping || DEFAULT_SETTINGS.kecepatanTyping,
          maksimalHasilGoogle: body.maksimalHasilGoogle ?? DEFAULT_SETTINGS.maksimalHasilGoogle,
          sumberUtama: body.sumberUtama || DEFAULT_SETTINGS.sumberUtama,
          sumberTambahan: body.sumberTambahan || DEFAULT_SETTINGS.sumberTambahan,
          systemPrompt: body.systemPrompt ?? DEFAULT_SETTINGS.systemPrompt,
          pesanFallback: body.pesanFallback || DEFAULT_SETTINGS.pesanFallback,
        },
      });
    } else {
      // Update existing
      settings = await db.chatAISettings.update({
        where: { id: settings.id },
        data: {
          ...(body.modelAI !== undefined && { modelAI: body.modelAI }),
          ...(body.aktifkanGoogleSearch !== undefined && { aktifkanGoogleSearch: body.aktifkanGoogleSearch }),
          ...(body.aktifkanSlowTyping !== undefined && { aktifkanSlowTyping: body.aktifkanSlowTyping }),
          ...(body.kecepatanTyping !== undefined && { kecepatanTyping: body.kecepatanTyping }),
          ...(body.maksimalHasilGoogle !== undefined && { maksimalHasilGoogle: body.maksimalHasilGoogle }),
          ...(body.sumberUtama !== undefined && { sumberUtama: body.sumberUtama }),
          ...(body.sumberTambahan !== undefined && { sumberTambahan: body.sumberTambahan }),
          ...(body.systemPrompt !== undefined && { systemPrompt: body.systemPrompt }),
          ...(body.pesanFallback !== undefined && { pesanFallback: body.pesanFallback }),
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('ChatSettings PUT error:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan pengaturan' },
      { status: 500 }
    );
  }
}

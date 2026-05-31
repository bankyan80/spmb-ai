// SPMB SD 2026/2027 Chat API Route - Enhanced with Analysis, Google Search, and App Data
import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { schoolsTable, chatAISettingsTable } from '@/lib/sheet-config';

const DEFAULT_SYSTEM_PROMPT = `Kamu adalah asisten Chat SPMB SD 2026/2027 yang menggunakan model Gemini 2.0 Flash.

Sebelum menjawab, analisa maksud pertanyaan pengguna terlebih dahulu.

Tentukan apakah pertanyaan harus dijawab dari data aplikasi, dari pencarian Google, atau gabungan keduanya.

Prioritaskan data aplikasi sebagai sumber utama untuk semua hal yang berkaitan dengan aturan SPMB, jadwal, kuota, sekolah, status pendaftaran, pengumuman, dan daftar ulang.

Gunakan pencarian Google hanya sebagai sumber tambahan untuk pertanyaan umum yang tidak tersedia di data aplikasi.

Jangan memberikan keputusan final sendiri.

Jika jawaban berkaitan dengan status diterima, cadangan, tidak diterima, verifikasi dokumen, atau hasil pengumuman, gunakan hanya data operator/admin dari database aplikasi.

Jawablah dengan bahasa Indonesia yang ramah, sopan, jelas, dan bertahap.

Buat jawaban terasa seperti sedang diketik oleh manusia. Jawaban panjang harus dipecah menjadi beberapa bubble pendek.

Jika data belum lengkap, tanyakan data tambahan satu per satu.

Jangan menjawab terlalu kaku.

Jangan mengarang aturan SPMB.

Jika menggunakan informasi dari Google, jelaskan bahwa informasi tersebut hanya referensi tambahan dan keputusan tetap mengikuti panitia SPMB.`;

const ANALYSIS_PROMPT = `Kamu adalah sistem analisa pertanyaan untuk Chat SPMB SD 2026/2027.

Tugas: Analisa pertanyaan pengguna dan tentukan kategori serta sumber jawaban terbaik.

Kategori yang tersedia:
- info_spmb: Pertanyaan tentang informasi umum SPMB (jadwal, aturan, prosedur)
- usia_anak: Pertanyaan tentang usia anak, syarat usia, perhitungan usia
- domisili: Pertanyaan tentang domisili, sekolah terdekat, lokasi
- pendaftaran: Pertanyaan tentang cara mendaftar, formulir, proses pendaftaran
- status_daftar: Pertanyaan tentang status pendaftaran, nomor registrasi, verifikasi
- pengumuman: Pertanyaan tentang hasil pengumuman, diterima/tidak diterima
- daftar_ulang: Pertanyaan tentang daftar ulang, proses setelah diterima
- keluhan: Keluhan, perbaikan data, laporan masalah
- umum: Pertanyaan umum di luar kategori di atas

Sumber jawaban:
- data_aplikasi: Pertanyaan yang HARUS dijawab dari data aplikasi (status pendaftaran, jadwal resmi, kuota, aturan SPMB, pengumuman resmi, verifikasi dokumen, daftar ulang)
- google_search: Pertanyaan umum yang membutuhkan informasi terbaru (penjelasan istilah, cara scan dokumen, cara membuat PDF, penjelasan umum pendidikan)
- gabungan: Pertanyaan yang membutuhkan data aplikasi + informasi tambahan dari Google

ATURAN PENTING:
1. Jika pertanyaan tentang data personal pendaftaran (status, nomor registrasi, dokumen, pengumuman pribadi, daftar ulang) -> WAJIB data_aplikasi
2. Jika pertanyaan tentang aturan resmi SPMB yang sudah diatur admin (jadwal, kuota, syarat usia, jalur, dokumen) -> WAJIB data_aplikasi
3. Jika pertanyaan umum (cara scan, cara buat PDF, penjelasan istilah, info pendidikan umum) -> google_search
4. Jika pertanyaan campuran (misal: syarat usia + penjelasan umum tentang pendidikan) -> gabungan

Berikan output dalam format JSON saja (tanpa markdown):
{
  "kategori": "nama_kategori",
  "sumberJawaban": "data_aplikasi atau google_search atau gabungan",
  "menggunakanDataAplikasi": true/false,
  "menggunakanGoogleSearch": true/false,
  "queryGoogle": "query pencarian Google jika diperlukan, atau null",
  "analisaSingkat": "penjelasan singkat mengapa kategori dan sumber ini dipilih"
}`;

async function getChatSettings() {
  try {
    const all = await chatAISettingsTable.findAll();
    return all[0] || null;
  } catch {
    return null;
  }
}

async function analyzeQuestion(message: string, zai: unknown): Promise<{
  kategori: string;
  sumberJawaban: string;
  menggunakanDataAplikasi: boolean;
  menggunakanGoogleSearch: boolean;
  queryGoogle: string | null;
  analisaSingkat: string;
}> {
  const ZAIClient = zai as { chat: { completions: { create: (opts: Record<string, unknown>) => Promise<unknown> } } };
  try {
    const completion = await ZAIClient.chat.completions.create({
      messages: [
        { role: 'system', content: ANALYSIS_PROMPT },
        { role: 'user', content: message },
      ],
      temperature: 0.1,
      max_tokens: 300,
    }) as { choices?: Array<{ message?: { content?: string } }> };

    const responseText = completion.choices?.[0]?.message?.content || '';

    let jsonStr = responseText;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const analysis = JSON.parse(jsonStr);
    return {
      kategori: analysis.kategori || 'umum',
      sumberJawaban: analysis.sumberJawaban || 'data_aplikasi',
      menggunakanDataAplikasi: analysis.menggunakanDataAplikasi ?? true,
      menggunakanGoogleSearch: analysis.menggunakanGoogleSearch ?? false,
      queryGoogle: analysis.queryGoogle || null,
      analisaSingkat: analysis.analisaSingkat || '',
    };
  } catch {
    return fallbackAnalysis(message);
  }
}

function fallbackAnalysis(message: string) {
  const lower = message.toLowerCase();
  let kategori = 'umum';
  let sumberJawaban = 'data_aplikasi';
  let menggunakanDataAplikasi = true;
  let menggunakanGoogleSearch = false;
  let queryGoogle: string | null = null;

  if (lower.includes('status') || lower.includes('nomor registrasi') || lower.includes('verifikasi')) {
    kategori = 'status_daftar';
  } else if (lower.includes('usia') || lower.includes('umur') || lower.includes('lahir')) {
    kategori = 'usia_anak';
  } else if (lower.includes('domisili') || lower.includes('sekolah terdekat') || lower.includes('lokasi')) {
    kategori = 'domisili';
  } else if (lower.includes('daftar') || lower.includes('pendaftaran') || lower.includes('mendaftar')) {
    kategori = 'pendaftaran';
  } else if (lower.includes('pengumuman') || lower.includes('hasil') || lower.includes('diterima')) {
    kategori = 'pengumuman';
  } else if (lower.includes('daftar ulang')) {
    kategori = 'daftar_ulang';
  } else if (lower.includes('info') || lower.includes('jadwal') || lower.includes('kuota') || lower.includes('syarat')) {
    kategori = 'info_spmb';
  } else if (lower.includes('keluhan') || lower.includes('masalah') || lower.includes('perbaikan') || lower.includes('salah')) {
    kategori = 'keluhan';
  } else if (lower.includes('scan') || lower.includes('pdf') || lower.includes('cara') || lower.includes('istilah')) {
    kategori = 'umum';
    sumberJawaban = 'google_search';
    menggunakanDataAplikasi = false;
    menggunakanGoogleSearch = true;
    queryGoogle = message;
  } else {
    kategori = 'umum';
    sumberJawaban = 'gabungan';
    menggunakanGoogleSearch = true;
    queryGoogle = message;
  }

  return { kategori, sumberJawaban, menggunakanDataAplikasi, menggunakanGoogleSearch, queryGoogle, analisaSingkat: `Analisa fallback: kategori ${kategori}, sumber ${sumberJawaban}` };
}

async function searchGoogle(query: string, maxResults: number, zai: unknown): Promise<string | null> {
  const ZAIClient = zai as { functions: { invoke: (name: string, params: Record<string, unknown>) => Promise<unknown> } };
  try {
    const searchResults = await ZAIClient.functions.invoke('web_search', { query, num: maxResults }) as Array<Record<string, unknown>> | null;
    if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) return null;

    return searchResults.slice(0, maxResults).map((r, i) =>
      `[${i + 1}] ${r.name || 'Sumber'}: ${r.snippet || ''} (${r.url || ''})`
    ).join('\n');
  } catch {
    return null;
  }
}

async function saveAnalysisLog(analysis: Record<string, unknown>, jawabanAkhir: string, _waktuAnalisa: number) {
  try {
    const { chatAnalysisLogTable } = await import('@/lib/sheet-config');
    await chatAnalysisLogTable.create({
      id: `alog-${Date.now()}`,
      parentId: null,
      pertanyaan: (analysis.pertanyaan as string) || '',
      kategoriPertanyaan: analysis.kategori as string,
      sumberJawaban: analysis.sumberJawaban as string,
      menggunakanDataAplikasi: !!analysis.menggunakanDataAplikasi,
      menggunakanGoogleSearch: !!analysis.menggunakanGoogleSearch,
      queryGoogle: (analysis.queryGoogle as string) || null,
      hasilRingkasanGoogle: (analysis.hasilRingkasanGoogle as string) || null,
      jawabanAkhir,
      model: 'gemini-2.0-flash',
      waktuAnalisa: _waktuAnalisa,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // non-critical
  }
}

function getActionButtons(kategori: string) {
  const buttonMap: Record<string, Array<{ id: string; label: string; page: string; color: string }>> = {
    info_spmb: [
      { id: 'cek-usia', label: 'Cek Usia Anak', page: 'cek-usia', color: '#009688' },
      { id: 'cek-domisili', label: 'Cek Domisili', page: 'cek-domisili', color: '#43A047' },
      { id: 'daftar', label: 'Lanjut Daftar', page: 'registration', color: '#1565C0' },
    ],
    usia_anak: [
      { id: 'cek-usia', label: 'Cek Usia Anak', page: 'cek-usia', color: '#009688' },
      { id: 'daftar', label: 'Lanjut Daftar', page: 'registration', color: '#1565C0' },
    ],
    domisili: [
      { id: 'cek-domisili', label: 'Cek Domisili', page: 'cek-domisili', color: '#43A047' },
      { id: 'daftar', label: 'Lanjut Daftar', page: 'registration', color: '#1565C0' },
    ],
    pendaftaran: [
      { id: 'daftar', label: 'Lanjut Daftar', page: 'registration', color: '#1565C0' },
      { id: 'cek-usia', label: 'Cek Usia Anak', page: 'cek-usia', color: '#009688' },
      { id: 'cek-domisili', label: 'Cek Domisili', page: 'cek-domisili', color: '#43A047' },
    ],
    status_daftar: [
      { id: 'status-daftar', label: 'Cek Status', page: 'status-daftar', color: '#009688' },
      { id: 'hubungi-panitia', label: 'Hubungi Panitia', page: 'bantuan', color: '#F59E0B' },
    ],
    pengumuman: [
      { id: 'pengumuman', label: 'Lihat Pengumuman', page: 'pengumuman', color: '#F59E0B' },
      { id: 'daftar-ulang', label: 'Daftar Ulang', page: 'daftar-ulang', color: '#43A047' },
    ],
    daftar_ulang: [
      { id: 'daftar-ulang', label: 'Daftar Ulang', page: 'daftar-ulang', color: '#43A047' },
      { id: 'hubungi-panitia', label: 'Hubungi Panitia', page: 'bantuan', color: '#F59E0B' },
    ],
    keluhan: [
      { id: 'hubungi-panitia', label: 'Hubungi Panitia', page: 'bantuan', color: '#F59E0B' },
      { id: 'upload-ulang', label: 'Upload Ulang Dokumen', page: 'status-daftar', color: '#009688' },
    ],
    umum: [
      { id: 'info-pendaftaran', label: 'Info Pendaftaran', page: 'info-pendaftaran', color: '#1565C0' },
      { id: 'daftar', label: 'Lanjut Daftar', page: 'registration', color: '#1565C0' },
    ],
  };

  return buttonMap[kategori] || buttonMap['umum'];
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { message } = body;

    let appDataContext = '';
    try {
      const schools = await schoolsTable.findAll();
      if (schools.length > 0) {
        const names = schools.filter((s) => s.statusAktif).map((s) => s.namaSekolah).filter(Boolean);
        appDataContext = `Sekolah tersedia: ${names.join(', ')}`;
      }
    } catch {
      // context not critical
    }

    if (!message?.trim()) {
      return NextResponse.json({
        reply: 'Silakan ketik pertanyaan Anda terkait SPMB SD.',
        kategori: 'umum',
        sumberJawaban: 'data_aplikasi',
        actionButtons: getActionButtons('umum'),
      });
    }

    const settings = await getChatSettings();
    const systemPrompt = (settings?.systemPrompt as string) || DEFAULT_SYSTEM_PROMPT;

    const zai = await ZAI.create();

    const analysis = await analyzeQuestion(message, zai);

    let appDataInfo = '';
    if (analysis.menggunakanDataAplikasi && appDataContext) {
      appDataInfo = `\n\nInformasi data aplikasi yang tersedia:\n${appDataContext}`;
    }

    let googleSearchInfo = '';
    let hasilRingkasanGoogle: string | null = null;

    if (analysis.menggunakanGoogleSearch && analysis.queryGoogle && (settings?.aktifkanGoogleSearch as boolean) !== false) {
      try {
        const searchResult = await searchGoogle(
          analysis.queryGoogle,
          (settings?.maksimalHasilGoogle as number) || 5,
          zai,
        );
        if (searchResult) {
          hasilRingkasanGoogle = searchResult;
          googleSearchInfo = `\n\nInformasi tambahan dari pencarian Google (ini hanya referensi, keputusan tetap mengikuti panitia SPMB):\n${searchResult}`;
        }
      } catch {
        // search failed
      }
    }

    if (analysis.menggunakanGoogleSearch && (settings?.aktifkanGoogleSearch as boolean) === false) {
      googleSearchInfo = '\n\nCatatan: Pencarian Google tidak diaktifkan. Jawaban hanya berdasarkan data aplikasi dan pengetahuan umum. Jika membutuhkan kepastian, sarankan pengguna menghubungi panitia SPMB.';
    }

    const sourceInstruction = analysis.sumberJawaban === 'data_aplikasi'
      ? 'Jawab berdasarkan data aplikasi yang tersedia. Mulai dengan: "Baik Bapak/Ibu, saya cek dulu ya. Dari data SPMB yang tersedia di aplikasi, ketentuannya seperti berikut..."'
      : analysis.sumberJawaban === 'google_search'
        ? 'Jawab berdasarkan informasi dari pencarian Google. Mulai dengan: "Baik Bapak/Ibu, saya bantu analisa. Karena informasi ini tidak tersedia lengkap di data aplikasi, saya akan menggunakan informasi tambahan dari pencarian Google, namun keputusan tetap mengikuti aturan resmi panitia SPMB."'
        : 'Jawab berdasarkan data aplikasi sebagai sumber utama, dengan informasi tambahan dari Google. Jelaskan mana yang dari data aplikasi dan mana yang dari referensi tambahan.';

    const finalPrompt = `${systemPrompt}\n\nInstruksi sumber jawaban: ${sourceInstruction}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: finalPrompt + appDataInfo + googleSearchInfo },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = (completion.choices?.[0]?.message?.content as string) || (settings?.pesanFallback as string) || 'Maaf, saya tidak dapat memproses pertanyaan Anda saat ini.';

    const waktuAnalisa = Date.now() - startTime;
    await saveAnalysisLog({ pertanyaan: message, ...analysis, hasilRingkasanGoogle }, reply, waktuAnalisa);

    return NextResponse.json({
      reply,
      kategori: analysis.kategori,
      sumberJawaban: analysis.sumberJawaban,
      menggunakanDataAplikasi: analysis.menggunakanDataAplikasi,
      menggunakanGoogleSearch: analysis.menggunakanGoogleSearch && !!hasilRingkasanGoogle,
      actionButtons: getActionButtons(analysis.kategori),
      typingMode: (settings?.aktifkanSlowTyping as boolean) !== false ? 'slow' : 'instant',
      typingSpeed: (settings?.kecepatanTyping as string) || 'normal',
      analysisId: null,
      model: (settings?.modelAI as string) || 'gemini-2.0-flash',
    });
  } catch {
    return NextResponse.json({
      reply: 'Maaf, layanan AI sedang tidak tersedia. Silakan gunakan menu cepat untuk mengakses layanan SPMB.',
      kategori: 'umum',
      sumberJabawan: 'data_aplikasi',
      actionButtons: getActionButtons('umum'),
      typingMode: 'slow',
      typingSpeed: 'normal',
      model: 'gemini-2.0-flash',
    });
  }
}

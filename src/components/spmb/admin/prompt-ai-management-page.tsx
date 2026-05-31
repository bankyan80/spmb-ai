'use client';

import React, { useState } from 'react';
import { MessageSquare, Save } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const DEFAULT_PROMPT = `Kamu adalah asisten AI SPMB (Seleksi Penerimaan Murid Baru) untuk pendaftaran siswa SD. Tugasmu adalah membantu orang tua/wali calon siswa dengan memberikan informasi yang akurat dan ramah terkait:

1. Proses pendaftaran SPMB SD
2. Syarat dan dokumen yang diperlukan
3. Jadwal penting SPMB
4. Informasi sekolah tujuan
5. Cek usia dan domisili
6. Status pendaftaran

Selalu gunakan bahasa Indonesia yang baik dan sopan. Berikan jawaban yang jelas, ringkas, dan membantu. Jika tidak tahu jawabannya, arahkan orang tua untuk menghubungi panitia SPMB.`;

const SAMPLE_QUESTIONS = [
  'Apa syarat pendaftaran SPMB SD?',
  'Kapan jadwal pendaftaran dibuka?',
  'Bagaimana cara cek status pendaftaran?',
  'Berapa usia minimal untuk masuk SD?',
];

export function PromptAiManagementPage() {
  const store = useSpmbStore();

  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState('');
  const [previewAnswer, setPreviewAnswer] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePreview = async (question: string) => {
    setPreviewQuestion(question);
    setPreviewLoading(true);
    setPreviewAnswer('');

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const responses: Record<string, string> = {
      'Apa syarat pendaftaran SPMB SD?':
        'Syarat pendaftaran SPMB SD meliputi:\n1. Kartu Keluarga (KK)\n2. Akta Kelahiran\n3. KTP Orang Tua/Wali\n4. KIP/KKS/PKH (jika ada)\n5. Dokumen Pendukung (jika ada)\n\nPastikan semua dokumen sudah disiapkan sebelum mendaftar ya, Bapak/Ibu. 😊',
      'Kapan jadwal pendaftaran dibuka?':
        'Pendaftaran SPMB SD Tahun Ajaran 2026/2027 dibuka mulai 15 Januari 2026 sampai 31 Januari 2026. Jangan sampai terlewat ya, Bapak/Ibu! 📅',
      'Bagaimana cara cek status pendaftaran?':
        'Untuk cek status pendaftaran, Anda bisa:\n1. Login melalui aplikasi SPMB SD menggunakan No HP/NIK/Nomor Registrasi\n2. Pilih menu "Status Pendaftaran"\n3. Lihat status terkini pendaftaran anak Anda\n\nStatus akan diperbarui oleh operator setelah verifikasi berkas. 📋',
      'Berapa usia minimal untuk masuk SD?':
        'Usia minimal untuk masuk SD adalah 6 tahun pada tanggal acuan 1 Juli 2026. Usia prioritas diberikan untuk anak yang berusia 7 tahun ke atas. Jika anak Anda berusia kurang dari 6 tahun, diperlukan rekomendasi khusus. 🎒',
    };

    setPreviewAnswer(responses[question] || 'Maaf, saya belum bisa menjawab pertanyaan tersebut. Silakan hubungi panitia SPMB untuk informasi lebih lanjut.');
    setPreviewLoading(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl">
      {/* System prompt editor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <MessageSquare className="size-4" style={{ color: '#6366F1' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            System Prompt AI
          </h2>
        </div>
        <div className="p-4 space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="border-gray-200 min-h-[200px] md:min-h-[300px] font-mono text-xs leading-relaxed resize-none"
            placeholder="Masukkan system prompt untuk AI..."
          />
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Prompt ini akan digunakan sebagai instruksi sistem untuk AI chatbot SPMB
          </p>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full md:w-auto text-white font-semibold"
            style={{ backgroundColor: '#43A047' }}
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </div>
            ) : saved ? (
              '✓ Tersimpan'
            ) : (
              <div className="flex items-center gap-2">
                <Save className="size-4" />
                Simpan Prompt
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Preview section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Preview Respons AI
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
            Coba pertanyaan sample untuk melihat bagaimana AI merespons
          </p>
        </div>
        <div className="p-4 space-y-3">
          {/* Sample question buttons */}
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handlePreview(q)}
                className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50"
                style={{
                  borderColor: previewQuestion === q ? '#6366F1' : '#E5E7EB',
                  color: previewQuestion === q ? '#6366F1' : '#6B7280',
                  backgroundColor: previewQuestion === q ? '#EEF2FF' : 'transparent',
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Preview answer */}
          {previewLoading && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#F3F4F6' }}>
              <div className="flex items-center gap-2">
                <div className="size-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                <span className="text-xs" style={{ color: '#6B7280' }}>AI sedang berpikir...</span>
              </div>
            </div>
          )}

          {previewAnswer && !previewLoading && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#F3F4F6' }}>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex items-center justify-center size-6 rounded-full"
                  style={{ backgroundColor: '#6366F1' }}
                >
                  <MessageSquare className="size-3 text-white" />
                </div>
                <span className="text-xs font-medium" style={{ color: '#6366F1' }}>
                  AI SPMB
                </span>
              </div>
              <p
                className="text-xs leading-relaxed whitespace-pre-line"
                style={{ color: '#1F2937' }}
              >
                {previewAnswer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

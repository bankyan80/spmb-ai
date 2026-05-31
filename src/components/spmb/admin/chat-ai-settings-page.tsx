'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Database, Globe, Type, Zap, MessageSquare, AlertTriangle, RefreshCw } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ChatAISettings } from '@/lib/types';

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

const DEFAULT_FALLBACK = 'Maaf, saya tidak dapat memproses pertanyaan Anda saat ini. Silakan coba lagi atau hubungi panitia SPMB.';

export function ChatAiSettingsPage() {
  const { chatAISettings, setChatAISettings } = useSpmbStore();

  const [form, setForm] = useState<ChatAISettings>(chatAISettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/chat-settings');
        if (res.ok) {
          const data = await res.json();
          setForm(data);
          setChatAISettings(data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [setChatAISettings]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/chat-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelAI: form.modelAI,
          aktifkanGoogleSearch: form.aktifkanGoogleSearch,
          aktifkanSlowTyping: form.aktifkanSlowTyping,
          kecepatanTyping: form.kecepatanTyping,
          maksimalHasilGoogle: form.maksimalHasilGoogle,
          sumberUtama: form.sumberUtama,
          sumberTambahan: form.sumberTambahan,
          systemPrompt: form.systemPrompt,
          pesanFallback: form.pesanFallback,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setForm(data);
        setChatAISettings(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError('Gagal menyimpan pengaturan. Silakan coba lagi.');
      }
    } catch {
      setError('Gagal menyimpan pengaturan. Periksa koneksi internet Anda.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPrompt = () => {
    setForm(prev => ({ ...prev, systemPrompt: DEFAULT_SYSTEM_PROMPT }));
  };

  const handleResetFallback = () => {
    setForm(prev => ({ ...prev, pesanFallback: DEFAULT_FALLBACK }));
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <RefreshCw className="size-5 animate-spin" style={{ color: '#1565C0' }} />
          <span className="text-sm" style={{ color: '#6B7280' }}>Memuat pengaturan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center size-10 rounded-xl"
            style={{ backgroundColor: '#1565C010' }}
          >
            <Settings className="size-5" style={{ color: '#1565C0' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#1F2937' }}>Pengaturan Chat AI</h1>
            <p className="text-xs" style={{ color: '#6B7280' }}>Konfigurasi model AI, sumber jawaban, dan tampilan chat</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="text-white font-semibold"
          style={{ backgroundColor: saved ? '#43A047' : '#1565C0' }}
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </div>
          ) : saved ? (
            'Tersimpan'
          ) : (
            <div className="flex items-center gap-2">
              <Save className="size-4" />
              Simpan
            </div>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
          <AlertTriangle className="size-4 shrink-0" style={{ color: '#DC2626' }} />
          <span className="text-sm" style={{ color: '#DC2626' }}>{error}</span>
        </div>
      )}

      {/* Model & Source Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Zap className="size-4" style={{ color: '#1565C0' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Model & Sumber Jawaban</h2>
        </div>
        <div className="p-4 space-y-4">
          {/* Model AI */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
              Model AI
            </label>
            <input
              type="text"
              value={form.modelAI}
              onChange={(e) => setForm(prev => ({ ...prev, modelAI: e.target.value }))}
              className="w-full h-10 rounded-lg border px-3 text-sm outline-none transition-colors"
              style={{ borderColor: '#E5E7EB', color: '#1F2937' }}
              onFocus={(e) => e.target.style.borderColor = '#1565C0'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Model AI yang digunakan untuk chat</p>
          </div>

          {/* Source settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                <Database className="size-3.5 inline mr-1" style={{ color: '#43A047' }} />
                Sumber Utama
              </label>
              <input
                type="text"
                value={form.sumberUtama}
                onChange={(e) => setForm(prev => ({ ...prev, sumberUtama: e.target.value }))}
                className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                style={{ borderColor: '#E5E7EB', color: '#1F2937' }}
                onFocus={(e) => e.target.style.borderColor = '#1565C0'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                <Globe className="size-3.5 inline mr-1" style={{ color: '#1565C0' }} />
                Sumber Tambahan
              </label>
              <input
                type="text"
                value={form.sumberTambahan}
                onChange={(e) => setForm(prev => ({ ...prev, sumberTambahan: e.target.value }))}
                className="w-full h-10 rounded-lg border px-3 text-sm outline-none"
                style={{ borderColor: '#E5E7EB', color: '#1F2937' }}
                onFocus={(e) => e.target.style.borderColor = '#1565C0'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Google Search Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Globe className="size-4" style={{ color: '#1565C0' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Pencarian Google</h2>
        </div>
        <div className="p-4 space-y-4">
          {/* Aktifkan Google Search */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#374151' }}>Aktifkan pencarian Google</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Izinkan AI mencari informasi tambahan melalui Google</p>
            </div>
            <button
              onClick={() => setForm(prev => ({ ...prev, aktifkanGoogleSearch: !prev.aktifkanGoogleSearch }))}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ backgroundColor: form.aktifkanGoogleSearch ? '#1565C0' : '#D1D5DB' }}
            >
              <span
                className="inline-block size-4 transform rounded-full bg-white transition-transform shadow-sm"
                style={{ transform: form.aktifkanGoogleSearch ? 'translateX(24px)' : 'translateX(4px)' }}
              />
            </button>
          </div>

          {/* Maksimal hasil Google */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
              Maksimal hasil Google
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={3}
                max={5}
                value={form.maksimalHasilGoogle}
                onChange={(e) => setForm(prev => ({ ...prev, maksimalHasilGoogle: parseInt(e.target.value) }))}
                className="flex-1 accent-blue-600"
              />
              <span className="text-sm font-medium min-w-[60px] text-center px-2 py-1 rounded-md" style={{ backgroundColor: '#EFF6FF', color: '#1565C0' }}>
                {form.maksimalHasilGoogle} sumber
              </span>
            </div>
          </div>

          {!form.aktifkanGoogleSearch && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <AlertTriangle className="size-4 shrink-0" style={{ color: '#D97706' }} />
              <span className="text-xs" style={{ color: '#92400E' }}>
                Jika Google Search dinonaktifkan, AI hanya akan menjawab berdasarkan data aplikasi dan pengetahuan umum. Pengguna akan disarankan menghubungi panitia untuk informasi yang membutuhkan kepastian.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Typing Animation Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Type className="size-4" style={{ color: '#009688' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Efek Mengetik</h2>
        </div>
        <div className="p-4 space-y-4">
          {/* Aktifkan Slow Typing */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#374151' }}>Aktifkan slow typing</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Tampilkan teks jawaban secara bertahap seperti diketik</p>
            </div>
            <button
              onClick={() => setForm(prev => ({ ...prev, aktifkanSlowTyping: !prev.aktifkanSlowTyping }))}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ backgroundColor: form.aktifkanSlowTyping ? '#009688' : '#D1D5DB' }}
            >
              <span
                className="inline-block size-4 transform rounded-full bg-white transition-transform shadow-sm"
                style={{ transform: form.aktifkanSlowTyping ? 'translateX(24px)' : 'translateX(4px)' }}
              />
            </button>
          </div>

          {/* Kecepatan Typing */}
          {form.aktifkanSlowTyping && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Kecepatan typing
              </label>
              <div className="flex gap-2">
                {(['lambat', 'normal', 'cepat'] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setForm(prev => ({ ...prev, kecepatanTyping: speed }))}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: form.kecepatanTyping === speed ? '#00968810' : '#F9FAFB',
                      color: form.kecepatanTyping === speed ? '#009688' : '#6B7280',
                      border: `1px solid ${form.kecepatanTyping === speed ? '#00968830' : '#E5E7EB'}`,
                    }}
                  >
                    {speed.charAt(0).toUpperCase() + speed.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Prompt */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4" style={{ color: '#6366F1' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Prompt Sistem AI</h2>
          </div>
          <button
            onClick={handleResetPrompt}
            className="text-xs px-2 py-1 rounded-md transition-colors hover:bg-gray-100"
            style={{ color: '#6B7280', border: '1px solid #E5E7EB' }}
          >
            Reset ke Default
          </button>
        </div>
        <div className="p-4 space-y-3">
          <Textarea
            value={form.systemPrompt || ''}
            onChange={(e) => setForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
            className="border-gray-200 min-h-[200px] md:min-h-[300px] font-mono text-xs leading-relaxed resize-none"
            placeholder="Masukkan system prompt untuk AI..."
          />
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Prompt ini mengatur cara AI menganalisa dan menjawab pertanyaan. Ubah dengan hati-hati.
          </p>
        </div>
      </div>

      {/* Fallback Message */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4" style={{ color: '#F59E0B' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>Pesan Fallback</h2>
          </div>
          <button
            onClick={handleResetFallback}
            className="text-xs px-2 py-1 rounded-md transition-colors hover:bg-gray-100"
            style={{ color: '#6B7280', border: '1px solid #E5E7EB' }}
          >
            Reset ke Default
          </button>
        </div>
        <div className="p-4 space-y-3">
          <Textarea
            value={form.pesanFallback}
            onChange={(e) => setForm(prev => ({ ...prev, pesanFallback: e.target.value }))}
            className="border-gray-200 min-h-[80px] text-sm leading-relaxed resize-none"
            placeholder="Pesan jika AI gagal merespons..."
          />
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Pesan yang ditampilkan ketika AI tidak dapat memproses pertanyaan
          </p>
        </div>
      </div>

      {/* Save button at bottom */}
      <div className="flex justify-end pb-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="text-white font-semibold px-8"
          style={{ backgroundColor: saved ? '#43A047' : '#1565C0' }}
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </div>
          ) : saved ? (
            'Tersimpan'
          ) : (
            <div className="flex items-center gap-2">
              <Save className="size-4" />
              Simpan Pengaturan
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}

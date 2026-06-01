'use client';

import React, { useState } from 'react';
import { Baby, CheckCircle, XCircle, AlertTriangle, ArrowRight, BookX, Search, User } from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { SpmbHeader } from '@/components/spmb/shared/spmb-header';
import { calculateAge, formatDate } from '@/lib/business-logic';
import type { AgeCheckResult } from '@/lib/types';

export function CekUsiaPage() {
  const { navigateTo, goBack, settings } = useSpmbStore();

  const [nik, setNik] = useState('');
  const [namaAnak, setNamaAnak] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [tahunPendaftaran, setTahunPendaftaran] = useState('2026');
  const [result, setResult] = useState<AgeCheckResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [nikChecking, setNikChecking] = useState(false);
  const [nikFound, setNikFound] = useState<string | null>(null);
  const [nikError, setNikError] = useState<string | null>(null);

  const checkNik = async (value: string) => {
    if (value.length !== 16) {
      setNikFound(null);
      setNikError(null);
      return;
    }

    setNikChecking(true);
    setNikFound(null);
    setNikError(null);

    try {
      const res = await fetch(`/api/siswa-tk/lookup?nik=${value}`);
      const data = await res.json();

      if (data.success && data.data) {
        const d = data.data;
        if (d.namaSiswa) setNamaAnak(d.namaSiswa);
        if (d.tanggalLahir) setTanggalLahir(d.tanggalLahir);
        setNikFound(d.namaSiswa || 'Data ditemukan');
      } else {
        setNikError('NIK tidak ditemukan di database. Silakan isi manual.');
      }
    } catch {
      setNikError('Gagal mencari NIK. Silakan isi manual.');
    } finally {
      setNikChecking(false);
    }
  };

  const handleCekUsia = () => {
    if (!namaAnak.trim() || !tanggalLahir) return;

    setIsCalculating(true);

    setTimeout(() => {
      const referenceDate = settings.tanggalAcuanUsia;
      const ageResult = calculateAge(tanggalLahir, referenceDate, settings.usiaMinimalSD, settings.usiaPrioritasSD);
      ageResult.namaAnak = namaAnak.trim();
      setResult(ageResult);
      setIsCalculating(false);
    }, 500);
  };

  const getStatusConfig = (status: AgeCheckResult['statusUsia']) => {
    switch (status) {
      case 'memenuhi_syarat':
        return {
          icon: <CheckCircle className="size-6" />,
          label: 'Memenuhi Syarat',
          bgColor: '#E8F5E9',
          textColor: '#2E7D32',
          borderColor: '#A5D6A7',
        };
      case 'belum_memenuhi':
        return {
          icon: <XCircle className="size-6" />,
          label: 'Belum Memenuhi',
          bgColor: '#FFEBEE',
          textColor: '#C62828',
          borderColor: '#EF9A9A',
        };
      case 'perlu_rekomendasi':
        return {
          icon: <AlertTriangle className="size-6" />,
          label: 'Perlu Rekomendasi',
          bgColor: '#FFF3E0',
          textColor: '#E65100',
          borderColor: '#FFCC80',
        };
    }
  };

  const isFormValid = namaAnak.trim() && tanggalLahir;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      <SpmbHeader
        title="Cek Usia Anak"
        showBack
        onBack={() => goBack()}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-4 space-y-4">
        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex items-center justify-center size-9 rounded-lg"
              style={{ backgroundColor: '#E0F2F1' }}
            >
              <Baby className="size-5" style={{ color: '#009688' }} />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
              Cek Usia Anak
            </h2>
          </div>

          <div className="space-y-4">
            {/* NIK */}
            <div>
              <label
                htmlFor="nik"
                className="block text-xs font-medium mb-1.5"
                style={{ color: '#6B7280' }}
              >
                NIK Anak
              </label>
              <div className="relative">
                <input
                  id="nik"
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setNik(val);
                    if (val.length === 16) checkNik(val);
                    if (val.length < 16) {
                      setNikFound(null);
                      setNikError(null);
                    }
                  }}
                  placeholder="Cari data via 16 digit NIK"
                  className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors pr-10"
                  style={{
                    borderColor: nikFound ? '#43A047' : nikError ? '#EF4444' : '#E5E7EB',
                    backgroundColor: nikFound ? '#F0FFF4' : '#F9FAFB',
                    color: '#1F2937',
                  }}
                  onFocus={(e) => { if (!nikFound && !nikError) e.target.style.borderColor = '#009688'; }}
                  onBlur={(e) => { e.target.style.borderColor = nikFound ? '#43A047' : nikError ? '#EF4444' : '#E5E7EB'; }}
                />
                {nikChecking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="size-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                )}
                {!nikChecking && nikFound && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="size-5" style={{ color: '#43A047' }} />
                  </div>
                )}
              </div>
              {nikFound && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#2E7D32' }}>
                  <CheckCircle className="size-3" />
                  Data ditemukan — {nikFound}
                </p>
              )}
              {nikError && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#EF4444' }}>
                  <AlertTriangle className="size-3" />
                  {nikError}
                </p>
              )}
            </div>

            <div className="h-px" style={{ backgroundColor: '#E5E7EB' }} />

            {/* Nama Anak */}
            <div>
              <label
                htmlFor="nama-anak"
                className="block text-xs font-medium mb-1.5"
                style={{ color: '#6B7280' }}
              >
                Nama Anak
              </label>
              <input
                id="nama-anak"
                type="text"
                value={namaAnak}
                onChange={(e) => setNamaAnak(e.target.value)}
                placeholder="Masukkan nama lengkap anak"
                className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
                onFocus={(e) => { e.target.style.borderColor = '#009688'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
              />
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label
                htmlFor="tanggal-lahir"
                className="block text-xs font-medium mb-1.5"
                style={{ color: '#6B7280' }}
              >
                Tanggal Lahir
              </label>
              <input
                id="tanggal-lahir"
                type="date"
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
                onFocus={(e) => { e.target.style.borderColor = '#009688'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
              />
            </div>

            {/* Tahun Pendaftaran */}
            <div>
              <label
                htmlFor="tahun-pendaftaran"
                className="block text-xs font-medium mb-1.5"
                style={{ color: '#6B7280' }}
              >
                Tahun Pendaftaran
              </label>
              <select
                id="tahun-pendaftaran"
                value={tahunPendaftaran}
                onChange={(e) => setTahunPendaftaran(e.target.value)}
                className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors appearance-none"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
                onFocus={(e) => { e.target.style.borderColor = '#009688'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
              >
                <option value="2026">2026/2027</option>
                <option value="2027">2027/2028</option>
              </select>
            </div>

            {/* Cek Usia Button */}
            <button
              onClick={handleCekUsia}
              disabled={!isFormValid || isCalculating}
              className="w-full h-12 rounded-lg text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ backgroundColor: isFormValid ? '#1565C0' : '#9CA3AF' }}
            >
              {isCalculating ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menghitung...
                </>
              ) : (
                <>
                  <Baby className="size-4" />
                  Cek Usia
                </>
              )}
            </button>
          </div>
        </div>

        {/* Reference Info */}
        <div
          className="rounded-xl p-3 text-xs"
          style={{ backgroundColor: '#E3F2FD', color: '#1565C0', border: '1px solid #BBDEFB' }}
        >
          <p className="font-medium mb-1">Informasi Acuan:</p>
          <p>Tanggal acuan usia: <strong>{formatDate(settings.tanggalAcuanUsia)}</strong></p>
          <p>Usia minimal SD: <strong>{settings.usiaMinimalSD} tahun</strong></p>
          <p>Usia prioritas SD: <strong>{settings.usiaPrioritasSD} tahun (wajib diterima)</strong></p>
          <p>Pengecualian: <strong>5 tahun 6 bulan</strong> (dengan rekomendasi psikolog)</p>
        </div>

        {/* Result Card */}
        {result && (
          <div
            className="bg-white rounded-xl shadow-sm border overflow-hidden"
            style={{ borderColor: getStatusConfig(result.statusUsia).borderColor }}
          >
            {/* Status Header */}
            {(() => {
              const config = getStatusConfig(result.statusUsia);
              return (
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <div style={{ color: config.textColor }}>{config.icon}</div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: config.textColor }}>
                      {config.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: config.textColor, opacity: 0.8 }}>
                      {result.pesan}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Detail */}
            <div className="px-4 py-3 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: '#6B7280' }}>Nama Anak</span>
                <span className="text-sm font-medium" style={{ color: '#1F2937' }}>{result.namaAnak}</span>
              </div>
              <div className="h-px" style={{ backgroundColor: '#F3F4F6' }} />
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: '#6B7280' }}>Tanggal Lahir</span>
                <span className="text-sm font-medium" style={{ color: '#1F2937' }}>
                  {formatDate(result.tanggalLahir)}
                </span>
              </div>
              <div className="h-px" style={{ backgroundColor: '#F3F4F6' }} />
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: '#6B7280' }}>
                  Usia per {formatDate(settings.tanggalAcuanUsia)}
                </span>
                <span className="text-sm font-bold" style={{ color: '#1F2937' }}>
                  {result.usiaTahun} tahun {result.usiaBulan} bulan {result.usiaHari} hari
                </span>
              </div>
              <div className="h-px" style={{ backgroundColor: '#F3F4F6' }} />
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: '#6B7280' }}>Status</span>
                {(() => {
                  const config = getStatusConfig(result.statusUsia);
                  return (
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: config.bgColor, color: config.textColor }}
                    >
                      {config.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Extra Info for perlu_rekomendasi */}
            {result.statusUsia === 'perlu_rekomendasi' && (
              <div
                className="mx-4 mb-3 rounded-lg p-3 text-xs flex items-start gap-2"
                style={{ backgroundColor: '#FFF3E0', color: '#E65100', border: '1px solid #FFCC80' }}
              >
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Diperlukan Surat Rekomendasi Psikolog</p>
                  <p className="mt-0.5">
                    Anak dengan usia di bawah 6 tahun namun minimal 5 tahun 6 bulan dapat mendaftar dengan melampirkan surat rekomendasi tertulis dari psikolog profesional (atau dewan guru sekolah jika psikolog tidak tersedia).
                  </p>
                </div>
              </div>
            )}

            {/* Dilarang Calistung Info */}
            <div
              className="mx-4 mb-3 rounded-lg p-3 text-xs flex items-start gap-2"
              style={{ backgroundColor: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' }}
            >
              <BookX className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Dilarang Tes Calistung</p>
                <p className="mt-0.5">
                  Sesuai regulasi Kemendikdasmen, sekolah dilarang keras mengadakan tes membaca, menulis, dan berhitung sebagai syarat masuk SD.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 pb-4 pt-2 space-y-2">
              {result.statusUsia === 'memenuhi_syarat' && (
                <button
                  onClick={() => navigateTo('registration')}
                  className="w-full h-11 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{ backgroundColor: '#43A047' }}
                >
                  Lanjut Daftar
                  <ArrowRight className="size-4" />
                </button>
              )}
              <button
                onClick={() => navigateTo('info-pendaftaran')}
                className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: '#E3F2FD',
                  color: '#1565C0',
                  border: '1px solid #BBDEFB',
                }}
              >
                Lihat Aturan Usia
              </button>
              <button
                onClick={() => navigateTo('bantuan')}
                className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: '#F9FAFB',
                  color: '#6B7280',
                  border: '1px solid #E5E7EB',
                }}
              >
                Hubungi Panitia
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

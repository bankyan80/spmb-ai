'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Bell,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  ChevronRight,
  MapPin,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpmbStore } from '@/lib/store';
import { SpmbHeader } from '@/components/spmb/shared/spmb-header';
import { StatusBadge } from '@/components/spmb/shared/status-badge';
import { formatDate, getJalurLabel } from '@/lib/business-logic';
import type { Applicant } from '@/lib/types';

// Confetti particle component
function ConfettiEffect() {
  const [particles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number; size: number; rotate: number; duration: number; isRound: boolean }>>(() => {
    const colors = ['#43A047', '#1565C0', '#F59E0B', '#EF4444', '#009688', '#9C27B0', '#FF5722'];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1,
      size: 4 + Math.random() * 8,
      rotate: 360 + Math.random() * 360,
      duration: 2 + Math.random() * 2,
      isRound: Math.random() > 0.5,
    }));
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}%`, y: `${p.y}%`, rotate: 0, opacity: 1 }}
          animate={{
            y: '110%',
            rotate: p.rotate,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeIn',
          }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isRound ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

type HasilPengumuman = 'diterima' | 'cadangan' | 'tidak_diterima';

function getResultConfig(hasil: HasilPengumuman) {
  switch (hasil) {
    case 'diterima':
      return {
        icon: <CheckCircle className="size-12" />,
        label: 'DITERIMA',
        bgColor: '#E8F5E9',
        accentColor: '#43A047',
        textColor: '#2E7D32',
        borderColor: '#A5D6A7',
        message: 'Selamat! Anda dinyatakan diterima di sekolah tujuan.',
      };
    case 'cadangan':
      return {
        icon: <Info className="size-12" />,
        label: 'CADANGAN',
        bgColor: '#E3F2FD',
        accentColor: '#1565C0',
        textColor: '#0D47A1',
        borderColor: '#90CAF9',
        message: 'Anda masuk dalam daftar cadangan. Tunggu informasi selanjutnya.',
      };
    case 'tidak_diterima':
      return {
        icon: <XCircle className="size-12" />,
        label: 'TIDAK DITERIMA',
        bgColor: '#FFEBEE',
        accentColor: '#EF4444',
        textColor: '#C62828',
        borderColor: '#EF9A9A',
        message: 'Mohon maaf, Anda belum diterima di sekolah tujuan.',
      };
  }
}

export function PengumumanPage() {
  const { navigateTo, goBack, applicants } = useSpmbStore();

  const [nomorRegistrasi, setNomorRegistrasi] = useState('');
  const [searchResult, setSearchResult] = useState<Applicant | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSearch = () => {
    if (!nomorRegistrasi.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    setNotFound(false);
    setShowConfetti(false);

    setTimeout(() => {
      const found = applicants.find(
        (a) => a.nomorPendaftaran === nomorRegistrasi.trim()
      );

      if (found) {
        setSearchResult(found);
        setNotFound(false);
        // Show confetti for diterima
        if (found.statusPendaftaran === 'diterima') {
          setShowConfetti(true);
        }
      } else {
        setSearchResult(null);
        setNotFound(true);
      }
      setIsSearching(false);
    }, 600);
  };

  // Determine hasil pengumuman from status
  const getHasilPengumuman = (status: string): HasilPengumuman | null => {
    if (status === 'diterima' || status === 'sudah_daftar_ulang') return 'diterima';
    if (status === 'cadangan') return 'cadangan';
    if (status === 'tidak_diterima') return 'tidak_diterima';
    // For other statuses like terverifikasi, menunggu_verifikasi, etc., we show as pending
    return null;
  };

  const hasilPengumuman = searchResult ? getHasilPengumuman(searchResult.statusPendaftaran) : null;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      <SpmbHeader
        title="Pengumuman"
        showBack
        onBack={() => goBack()}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-4 space-y-4">
        {/* Search Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex items-center justify-center size-8 rounded-lg"
              style={{ backgroundColor: '#FFF7ED' }}
            >
              <Bell className="size-4" style={{ color: '#F59E0B' }} />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
              Cek Pengumuman Hasil SPMB
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
                Nomor Registrasi
              </label>
              <input
                type="text"
                value={nomorRegistrasi}
                onChange={(e) => setNomorRegistrasi(e.target.value)}
                placeholder="SPMB-2026-XXXXXX"
                className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
                onFocus={(e) => { e.target.style.borderColor = '#1565C0'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={!nomorRegistrasi.trim() || isSearching}
              className="w-full h-12 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ backgroundColor: nomorRegistrasi.trim() ? '#F59E0B' : '#9CA3AF' }}
            >
              {isSearching ? (
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="size-4" />
                  Cek Pengumuman
                </>
              )}
            </button>
          </div>
        </div>

        {/* Not Found */}
        <AnimatePresence>
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center"
            >
              <div
                className="flex items-center justify-center size-16 rounded-full mx-auto mb-3"
                style={{ backgroundColor: '#FEE2E2' }}
              >
                <AlertCircle className="size-8" style={{ color: '#EF4444' }} />
              </div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: '#1F2937' }}>
                Data Tidak Ditemukan
              </h3>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Nomor registrasi tidak ditemukan. Pastikan nomor yang dimasukkan sudah benar.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {searchResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Big result card */}
              {hasilPengumuman && (() => {
                const config = getResultConfig(hasilPengumuman);
                return (
                  <div
                    className="relative rounded-2xl shadow-lg border overflow-hidden"
                    style={{
                      borderColor: config.borderColor,
                    }}
                  >
                    {/* Confetti for diterima */}
                    {showConfetti && <ConfettiEffect />}

                    {/* Main content */}
                    <div
                      className="p-6 text-center"
                      style={{ backgroundColor: config.bgColor }}
                    >
                      <div className="relative z-10">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                          className="flex items-center justify-center mx-auto mb-4"
                          style={{ color: config.accentColor }}
                        >
                          {config.icon}
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <h2
                            className="text-2xl font-black mb-2 tracking-wide"
                            style={{ color: config.textColor }}
                          >
                            {config.label}
                          </h2>
                          <p className="text-sm" style={{ color: config.textColor, opacity: 0.8 }}>
                            {config.message}
                          </p>
                        </motion.div>
                      </div>
                    </div>

                    {/* Detail section */}
                    <div className="p-4 bg-white space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs" style={{ color: '#6B7280' }}>Nomor Registrasi</span>
                        <span className="text-sm font-bold" style={{ color: '#1565C0' }}>
                          {searchResult.nomorPendaftaran}
                        </span>
                      </div>
                      <div className="h-px" style={{ backgroundColor: '#F3F4F6' }} />
                      <div className="flex justify-between items-center">
                        <span className="text-xs" style={{ color: '#6B7280' }}>Nama Siswa</span>
                        <span className="text-sm font-medium" style={{ color: '#1F2937' }}>
                          {searchResult.namaSiswa}
                        </span>
                      </div>
                      <div className="h-px" style={{ backgroundColor: '#F3F4F6' }} />
                      <div className="flex justify-between items-center">
                        <span className="text-xs" style={{ color: '#6B7280' }}>Sekolah Tujuan</span>
                        <span className="text-sm font-medium" style={{ color: '#1F2937' }}>
                          {searchResult.namaSekolah}
                        </span>
                      </div>
                      <div className="h-px" style={{ backgroundColor: '#F3F4F6' }} />
                      <div className="flex justify-between items-center">
                        <span className="text-xs" style={{ color: '#6B7280' }}>Jalur Pendaftaran</span>
                        <span className="text-sm font-medium" style={{ color: '#1F2937' }}>
                          {getJalurLabel(searchResult.jalur)}
                        </span>
                      </div>

                      {searchResult.catatanOperator && (
                        <>
                          <div className="h-px" style={{ backgroundColor: '#F3F4F6' }} />
                          <div>
                            <span className="text-xs" style={{ color: '#6B7280' }}>Catatan</span>
                            <p className="text-xs mt-1 p-2 rounded-lg" style={{ backgroundColor: '#F9FAFB', color: '#1F2937' }}>
                              {searchResult.catatanOperator}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action buttons based on result */}
                    <div className="px-4 pb-4 pt-1 space-y-2 bg-white">
                      {hasilPengumuman === 'diterima' && (
                        <button
                          onClick={() => navigateTo('daftar-ulang')}
                          className="w-full h-12 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                          style={{ backgroundColor: '#43A047' }}
                        >
                          <CheckCircle className="size-5" />
                          Daftar Ulang Sekarang
                          <ChevronRight className="size-4" />
                        </button>
                      )}

                      {hasilPengumuman === 'cadangan' && (
                        <>
                          <div
                            className="rounded-xl p-4 border"
                            style={{
                              backgroundColor: '#E3F2FD',
                              borderColor: '#90CAF9',
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <Info className="size-5 shrink-0 mt-0.5" style={{ color: '#1565C0' }} />
                              <div>
                                <p className="text-sm font-semibold" style={{ color: '#0D47A1' }}>
                                  Anda Berada di Daftar Cadangan
                                </p>
                                <p className="text-xs mt-1 leading-relaxed" style={{ color: '#1565C0' }}>
                                  Anda akan dipanggil jika masih terdapat kuota tersisa setelah proses pendaftaran utama selesai. Pantau terus status pendaftaran Anda.
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => navigateTo('status-daftar')}
                            className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            style={{
                              backgroundColor: '#E3F2FD',
                              color: '#1565C0',
                              border: '1px solid #BBDEFB',
                            }}
                          >
                            <Sparkles className="size-4" />
                            Cek Status Pendaftaran
                          </button>
                        </>
                      )}

                      {hasilPengumuman === 'tidak_diterima' && (
                        <div className="space-y-2">
                          <button
                            onClick={() => navigateTo('cek-domisili')}
                            className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            style={{
                              backgroundColor: '#E3F2FD',
                              color: '#1565C0',
                              border: '1px solid #BBDEFB',
                            }}
                          >
                            <MapPin className="size-4" />
                            Cari Sekolah dengan Kuota
                          </button>
                          <button
                            onClick={() => navigateTo('bantuan')}
                            className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            style={{
                              backgroundColor: '#F9FAFB',
                              color: '#6B7280',
                              border: '1px solid #E5E7EB',
                            }}
                          >
                            <HelpCircle className="size-4" />
                            Hubungi Panitia
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Status not yet determined */}
              {searchResult && !hasilPengumuman && (
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    backgroundColor: '#FFF7ED',
                    borderColor: '#F59E0B50',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#92400E' }}>
                        Pengumuman Belum Tersedia
                      </p>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: '#92400E' }}>
                        Status pendaftaran Anda saat ini adalah{' '}
                        <StatusBadge status={searchResult.statusPendaftaran} />.
                        Pengumuman hasil SPMB belum tersedia untuk pendaftaran Anda.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick search suggestions */}
        {!searchResult && !notFound && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-medium mb-3" style={{ color: '#6B7280' }}>
              Cek pengumuman dengan nomor berikut (demo):
            </p>
            <div className="space-y-2">
              {applicants.slice(0, 4).map((a) => (
                <button
                  key={a.applicantId}
                  onClick={() => setNomorRegistrasi(a.nomorPendaftaran)}
                  className="w-full text-left p-3 rounded-lg border transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#1565C0' }}>
                        {a.nomorPendaftaran}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#6B7280' }}>
                        {a.namaSiswa} - {a.namaSekolah}
                      </p>
                    </div>
                    <StatusBadge status={a.statusPendaftaran} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

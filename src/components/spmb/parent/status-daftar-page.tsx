'use client';

import React, { useState } from 'react';
import {
  Search,
  ClipboardCheck,
  AlertCircle,
  CheckCircle,
  FileText,
  Edit,
  Upload,
  Phone,
  Calendar,
  Clock,
  ChevronRight,
  PartyPopper,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpmbStore } from '@/lib/store';
import { SpmbHeader } from '@/components/spmb/shared/spmb-header';
import { StatusBadge } from '@/components/spmb/shared/status-badge';
import { formatDate, formatDateTime, getJalurLabel } from '@/lib/business-logic';
import type { Applicant } from '@/lib/types';

type SearchType = 'noreg' | 'nik' | 'nohp';

const searchTypeOptions: { id: SearchType; label: string; placeholder: string }[] = [
  { id: 'noreg', label: 'Nomor Registrasi', placeholder: 'SPMB-2026-XXXXXX' },
  { id: 'nik', label: 'NIK Siswa', placeholder: '16 digit NIK siswa' },
  { id: 'nohp', label: 'Nomor HP', placeholder: '08xxxxxxxxxx' },
];

// Timeline steps for status visualization
const statusTimeline = [
  { key: 'terkirim', label: 'Terkirim', icon: FileText },
  { key: 'menunggu_verifikasi', label: 'Menunggu Verifikasi', icon: Clock },
  { key: 'terverifikasi', label: 'Terverifikasi', icon: CheckCircle },
  { key: 'diterima', label: 'Diterima', icon: CheckCircle },
];

function getStatusStepIndex(status: string): number {
  const statusOrder = [
    'draft',
    'terkirim',
    'menunggu_verifikasi',
    'perlu_perbaikan',
    'terverifikasi',
    'diterima',
    'cadangan',
    'tidak_diterima',
    'sudah_daftar_ulang',
  ];
  const idx = statusOrder.indexOf(status);
  if (status === 'perlu_perbaikan') return 1; // Goes back to verification step
  if (status === 'cadangan') return 3;
  if (status === 'tidak_diterima') return 2;
  if (status === 'sudah_daftar_ulang') return 4;
  return idx >= 0 ? idx : 0;
}

export function StatusDaftarPage() {
  const { navigateTo, applicants } = useSpmbStore();

  const [searchType, setSearchType] = useState<SearchType>('noreg');
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState<Applicant | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchValue.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    setNotFound(false);

    setTimeout(() => {
      let found: Applicant | undefined;

      if (searchType === 'noreg') {
        found = applicants.find((a) => a.nomorPendaftaran === searchValue.trim());
      } else if (searchType === 'nik') {
        found = applicants.find((a) => a.nik === searchValue.trim());
      } else if (searchType === 'nohp') {
        found = applicants.find((a) => a.noHpOrtu === searchValue.trim());
      }

      if (found) {
        setSearchResult(found);
        setNotFound(false);
      } else {
        setSearchResult(null);
        setNotFound(true);
      }
      setIsSearching(false);
    }, 500);
  };

  const currentStepIdx = searchResult
    ? getStatusStepIndex(searchResult.statusPendaftaran)
    : 0;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      <SpmbHeader
        title="Status Pendaftaran"
        showBack
        onBack={() => navigateTo('chat-ai')}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-4 space-y-4">
        {/* Search Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex items-center justify-center size-8 rounded-lg"
              style={{ backgroundColor: '#E3F2FD' }}
            >
              <Search className="size-4" style={{ color: '#1565C0' }} />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
              Cek Status Pendaftaran
            </h2>
          </div>

          {/* Search type radio */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#6B7280' }}>
                Cari berdasarkan
              </label>
              <div className="flex gap-2 flex-wrap">
                {searchTypeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSearchType(opt.id);
                      setSearchValue('');
                      setSearchResult(null);
                      setNotFound(false);
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: searchType === opt.id ? '#E3F2FD' : '#F9FAFB',
                      color: searchType === opt.id ? '#1565C0' : '#6B7280',
                      border: `1px solid ${searchType === opt.id ? '#1565C0' : '#E5E7EB'}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search input */}
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchTypeOptions.find((o) => o.id === searchType)?.placeholder}
                  className="flex-1 h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
                  style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
                  onFocus={(e) => { e.target.style.borderColor = '#1565C0'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                />
                <button
                  onClick={handleSearch}
                  disabled={!searchValue.trim() || isSearching}
                  className="h-11 px-4 rounded-lg text-white text-sm font-semibold flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
                  style={{ backgroundColor: searchValue.trim() ? '#1565C0' : '#9CA3AF' }}
                >
                  {isSearching ? (
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  Cek
                </button>
              </div>
            </div>
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
                Pastikan data yang dimasukkan sudah benar atau coba metode pencarian lain.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Result */}
        <AnimatePresence>
          {searchResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Main result card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  className="px-4 py-3 flex items-center gap-2"
                  style={{ backgroundColor: '#E3F2FD' }}
                >
                  <ClipboardCheck className="size-4" style={{ color: '#1565C0' }} />
                  <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                    Hasil Pencarian
                  </h3>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs" style={{ color: '#6B7280' }}>Nomor Pendaftaran</span>
                    <span className="text-sm font-bold" style={{ color: '#1565C0' }}>
                      {searchResult.nomorPendaftaran}
                    </span>
                  </div>
                  <div className="h-px" style={{ backgroundColor: '#F3F4F6' }} />
                  <div className="flex justify-between items-start">
                    <span className="text-xs" style={{ color: '#6B7280' }}>Nama Siswa</span>
                    <span className="text-sm font-medium" style={{ color: '#1F2937' }}>
                      {searchResult.namaSiswa}
                    </span>
                  </div>
                  <div className="h-px" style={{ backgroundColor: '#F3F4F6' }} />
                  <div className="flex justify-between items-start">
                    <span className="text-xs" style={{ color: '#6B7280' }}>Sekolah Tujuan</span>
                    <span className="text-sm font-medium" style={{ color: '#1F2937' }}>
                      {searchResult.namaSekolah}
                    </span>
                  </div>
                  <div className="h-px" style={{ backgroundColor: '#F3F4F6' }} />
                  <div className="flex justify-between items-start">
                    <span className="text-xs" style={{ color: '#6B7280' }}>Jalur Pendaftaran</span>
                    <span className="text-sm font-medium" style={{ color: '#1F2937' }}>
                      {getJalurLabel(searchResult.jalur)}
                    </span>
                  </div>
                  <div className="h-px" style={{ backgroundColor: '#F3F4F6' }} />
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: '#6B7280' }}>Status Berkas</span>
                    <StatusBadge status={searchResult.statusBerkas} />
                  </div>
                  <div className="h-px" style={{ backgroundColor: '#F3F4F6' }} />
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: '#6B7280' }}>Status Pendaftaran</span>
                    <StatusBadge status={searchResult.statusPendaftaran} />
                  </div>

                  {searchResult.catatanOperator && (
                    <>
                      <div className="h-px" style={{ backgroundColor: '#F3F4F6' }} />
                      <div>
                        <span className="text-xs" style={{ color: '#6B7280' }}>Catatan Operator</span>
                        <p className="text-xs mt-1 p-2 rounded-lg" style={{ backgroundColor: '#FFF7ED', color: '#92400E' }}>
                          {searchResult.catatanOperator}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="flex items-center justify-center size-8 rounded-lg"
                    style={{ backgroundColor: '#E0F2F1' }}
                  >
                    <Clock className="size-4" style={{ color: '#009688' }} />
                  </div>
                  <h3 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                    Timeline Status
                  </h3>
                </div>

                <div className="space-y-0">
                  {statusTimeline.map((step, index) => {
                    const isCompleted = currentStepIdx > index;
                    const isCurrent = currentStepIdx === index;
                    const isUpcoming = currentStepIdx < index;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex gap-3">
                        {/* Timeline line and dot */}
                        <div className="flex flex-col items-center">
                          <div
                            className="flex items-center justify-center size-8 rounded-full shrink-0"
                            style={{
                              backgroundColor: isCompleted
                                ? '#43A047'
                                : isCurrent
                                  ? '#1565C0'
                                  : '#E5E7EB',
                              color: isCompleted || isCurrent ? '#FFFFFF' : '#9CA3AF',
                            }}
                          >
                            {isCompleted ? (
                              <CheckCircle className="size-4" />
                            ) : (
                              <Icon className="size-4" />
                            )}
                          </div>
                          {index < statusTimeline.length - 1 && (
                            <div
                              className="w-0.5 h-8"
                              style={{
                                backgroundColor: isCompleted ? '#43A047' : '#E5E7EB',
                              }}
                            />
                          )}
                        </div>

                        {/* Label */}
                        <div className="pt-1.5 pb-4">
                          <p
                            className="text-xs font-medium"
                            style={{
                              color: isCompleted
                                ? '#43A047'
                                : isCurrent
                                  ? '#1565C0'
                                  : '#9CA3AF',
                            }}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-[10px] mt-0.5" style={{ color: '#6B7280' }}>
                              Status saat ini
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Conditional: Perlu Perbaikan */}
              {searchResult.statusPendaftaran === 'perlu_perbaikan' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Orange warning card */}
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
                          Perlu Perbaikan Data
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#92400E' }}>
                          {searchResult.catatanOperator || 'Harap perbaiki data atau dokumen yang diminta.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigateTo('registration')}
                      className="flex-1 h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      style={{
                        backgroundColor: '#E3F2FD',
                        color: '#1565C0',
                        border: '1px solid #BBDEFB',
                      }}
                    >
                      <Edit className="size-4" />
                      Edit Data
                    </button>
                    <button
                      onClick={() => navigateTo('registration')}
                      className="flex-1 h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      style={{
                        backgroundColor: '#FFF7ED',
                        color: '#F59E0B',
                        border: '1px solid #F59E0B50',
                      }}
                    >
                      <Upload className="size-4" />
                      Upload Ulang
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Conditional: Diterima */}
              {searchResult.statusPendaftaran === 'diterima' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Green congratulations card */}
                  <div
                    className="rounded-xl p-4 border"
                    style={{
                      background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                      borderColor: '#A5D6A7',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center size-10 rounded-full shrink-0"
                        style={{ backgroundColor: '#43A047' }}
                      >
                        <PartyPopper className="size-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#2E7D32' }}>
                          Selamat! Pendaftaran Diterima
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#388E3C' }}>
                          Silakan lakukan daftar ulang untuk melengkapi proses.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigateTo('daftar-ulang')}
                    className="w-full h-12 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    style={{ backgroundColor: '#43A047' }}
                  >
                    <CheckCircle className="size-4" />
                    Daftar Ulang
                  </button>
                </motion.div>
              )}

              {/* Conditional: Sudah Daftar Ulang */}
              {searchResult.statusPendaftaran === 'sudah_daftar_ulang' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className="rounded-xl p-4 border"
                    style={{
                      background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                      borderColor: '#A5D6A7',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center size-10 rounded-full shrink-0"
                        style={{ backgroundColor: '#43A047' }}
                      >
                        <CheckCircle className="size-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#2E7D32' }}>
                          Sudah Daftar Ulang
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#388E3C' }}>
                          Proses pendaftaran Anda telah selesai.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick search suggestions */}
        {!searchResult && !notFound && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-medium mb-3" style={{ color: '#6B7280' }}>
              Coba cari dengan data berikut (demo):
            </p>
            <div className="space-y-2">
              {applicants.slice(0, 3).map((a) => (
                <button
                  key={a.applicantId}
                  onClick={() => {
                    setSearchType('noreg');
                    setSearchValue(a.nomorPendaftaran);
                  }}
                  className="w-full text-left p-3 rounded-lg border transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <p className="text-xs font-medium" style={{ color: '#1565C0' }}>
                    {a.nomorPendaftaran}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#6B7280' }}>
                    {a.namaSiswa} - {a.namaSekolah}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

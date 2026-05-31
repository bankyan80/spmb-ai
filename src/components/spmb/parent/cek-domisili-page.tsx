'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  School,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { SpmbHeader } from '@/components/spmb/shared/spmb-header';
import { findNearestSchools, checkQuota } from '@/lib/business-logic';
import type { SchoolDistance } from '@/lib/types';

const MOCK_LAT = -6.36;
const MOCK_LON = 106.91;

export function CekDomisiliPage() {
  const { navigateTo, goBack, schools, updateRegistrationData } = useSpmbStore();

  const [alamat, setAlamat] = useState('');
  const [desa, setDesa] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SchoolDistance[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [usingGps, setUsingGps] = useState(false);

  const handleUseGps = () => {
    setUsingGps(true);
    setAlamat('Jl. Raya Lemahabang No. 45 RT 003/RW 005');
    setDesa('Lemahabang');
    setKecamatan('Lemahabang');
  };

  const handleSearch = () => {
    if (!desa.trim() && !kecamatan.trim() && !alamat.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate search with mock GPS coordinates
    setTimeout(() => {
      const nearest = findNearestSchools(MOCK_LAT, MOCK_LON, schools, 10);
      setResults(nearest);
      setIsSearching(false);
    }, 800);
  };

  const handlePilihSekolah = (schoolDistance: SchoolDistance) => {
    const school = schoolDistance.school;
    const quotaCheck = checkQuota(school);
    if (quotaCheck.statusKuota === 'Penuh') return;

    updateRegistrationData({
      schoolId: school.schoolId,
      namaSekolah: school.namaSekolah,
      alamat: alamat,
      desa: desa,
      kecamatan: kecamatan,
    });
    navigateTo('registration');
  };

  const getQuotaBadgeConfig = (statusKuota: string) => {
    switch (statusKuota) {
      case 'Tersedia':
        return { bgColor: '#E8F5E9', textColor: '#2E7D32', icon: <CheckCircle className="size-3.5" /> };
      case 'Hampir Penuh':
        return { bgColor: '#FEF3C7', textColor: '#D97706', icon: <AlertCircle className="size-3.5" /> };
      case 'Penuh':
        return { bgColor: '#FFEBEE', textColor: '#C62828', icon: <XCircle className="size-3.5" /> };
      default:
        return { bgColor: '#F3F4F6', textColor: '#6B7280', icon: null };
    }
  };

  const isFormValid = alamat.trim() || desa.trim() || kecamatan.trim();

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      {/* Header */}
      <SpmbHeader
        title="Cek Domisili"
        showBack
        onBack={() => goBack()}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-4 space-y-4">
        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex items-center justify-center size-9 rounded-lg"
              style={{ backgroundColor: '#E8F5E9' }}
            >
              <MapPin className="size-5" style={{ color: '#43A047' }} />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
              Alamat Domisili
            </h2>
          </div>

          <div className="space-y-4">
            {/* Alamat Lengkap */}
            <div>
              <label
                htmlFor="alamat"
                className="block text-xs font-medium mb-1.5"
                style={{ color: '#6B7280' }}
              >
                Alamat Lengkap
              </label>
              <textarea
                id="alamat"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Masukkan alamat lengkap"
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors resize-none"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
                onFocus={(e) => { e.target.style.borderColor = '#43A047'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
              />
            </div>

            {/* Desa/Kelurahan */}
            <div>
              <label
                htmlFor="desa"
                className="block text-xs font-medium mb-1.5"
                style={{ color: '#6B7280' }}
              >
                Desa/Kelurahan
              </label>
              <input
                id="desa"
                type="text"
                value={desa}
                onChange={(e) => setDesa(e.target.value)}
                placeholder="Masukkan desa/kelurahan"
                className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
                onFocus={(e) => { e.target.style.borderColor = '#43A047'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
              />
            </div>

            {/* Kecamatan */}
            <div>
              <label
                htmlFor="kecamatan"
                className="block text-xs font-medium mb-1.5"
                style={{ color: '#6B7280' }}
              >
                Kecamatan
              </label>
              <input
                id="kecamatan"
                type="text"
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                placeholder="Masukkan kecamatan"
                className="w-full h-11 rounded-lg border px-3 text-sm outline-none transition-colors"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', color: '#1F2937' }}
                onFocus={(e) => { e.target.style.borderColor = '#43A047'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
              />
            </div>

            {/* GPS Button */}
            <button
              onClick={handleUseGps}
              className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                backgroundColor: '#F3F8FF',
                color: '#1565C0',
                border: '1px solid #BBDEFB',
              }}
            >
              <Navigation className="size-4" />
              {usingGps ? 'Lokasi GPS Terdeteksi' : 'Gunakan Lokasi GPS'}
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!isFormValid || isSearching}
              className="w-full h-12 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{ backgroundColor: isFormValid ? '#1565C0' : '#9CA3AF' }}
            >
              {isSearching ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mencari...
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  Cari Sekolah Terdekat
                </>
              )}
            </button>
          </div>
        </div>

        {/* GPS Info */}
        {usingGps && (
          <div
            className="rounded-xl p-3 text-xs flex items-center gap-2"
            style={{ backgroundColor: '#E3F2FD', color: '#1565C0', border: '1px solid #BBDEFB' }}
          >
            <Navigation className="size-4 shrink-0" />
            <p>Lokasi GPS terdeteksi: {MOCK_LAT}, {MOCK_LON} (Lemahabang, Bekasi)</p>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center gap-3">
              <div className="size-10 rounded-full border-3 border-blue-200 border-t-[#1565C0] animate-spin" style={{ borderWidth: '3px' }} />
              <p className="text-sm" style={{ color: '#6B7280' }}>Mencari sekolah terdekat...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isSearching && results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <School className="size-5" style={{ color: '#1565C0' }} />
              <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                Sekolah Terdekat ({results.length} sekolah)
              </h2>
            </div>

            {results.map((schoolDist, idx) => {
              const school = schoolDist.school;
              const quotaCheck = checkQuota(school);
              const badgeConfig = getQuotaBadgeConfig(quotaCheck.statusKuota);
              const isFull = quotaCheck.statusKuota === 'Penuh';

              return (
                <div
                  key={school.schoolId}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* School Header */}
                  <div className="flex items-start justify-between gap-2 px-4 pt-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex items-center justify-center size-6 rounded-full shrink-0 text-[10px] font-bold"
                          style={{ backgroundColor: '#E3F2FD', color: '#1565C0' }}
                        >
                          {idx + 1}
                        </span>
                        <p className="text-sm font-semibold truncate" style={{ color: '#1F2937' }}>
                          {school.namaSekolah}
                        </p>
                      </div>
                      <p className="text-xs mt-1 ml-8" style={{ color: '#6B7280' }}>
                        {school.alamat}
                      </p>
                    </div>
                  </div>

                  {/* Distance & Quota */}
                  <div className="px-4 pt-3 pb-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" style={{ color: '#6B7280' }} />
                        <span className="text-sm font-bold" style={{ color: '#1565C0' }}>
                          {schoolDist.jarakKm} km
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: badgeConfig.bgColor, color: badgeConfig.textColor }}
                        >
                          {badgeConfig.icon}
                          {quotaCheck.statusKuota}
                        </span>
                      </div>
                    </div>

                    {/* Quota Bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.round((school.sisaKuota / school.kuota) * 100)}%`,
                            backgroundColor: isFull ? '#EF4444' : quotaCheck.statusKuota === 'Hampir Penuh' ? '#F59E0B' : '#43A047',
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium shrink-0" style={{ color: '#1F2937' }}>
                        {school.sisaKuota}/{school.kuota}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="px-4 py-3">
                    {isFull ? (
                      <div
                        className="rounded-lg p-3 text-xs flex items-start gap-2"
                        style={{ backgroundColor: '#FFEBEE', color: '#C62828' }}
                      >
                        <XCircle className="size-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Sekolah Penuh</p>
                          <p className="mt-0.5" style={{ color: '#E53935' }}>
                            Kuota sekolah ini sudah terpenuhi. Silakan pilih sekolah lain yang masih tersedia.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePilihSekolah(schoolDist)}
                        className="w-full h-10 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        style={{ backgroundColor: '#1565C0' }}
                      >
                        Pilih Sekolah
                        <ArrowRight className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Lanjut Daftar Button */}
            <button
              onClick={() => navigateTo('registration')}
              className="w-full h-12 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2"
              style={{ backgroundColor: '#43A047' }}
            >
              Lanjut Daftar
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {/* No Results */}
        {hasSearched && !isSearching && results.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <School className="size-10 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
            <p className="text-sm font-medium" style={{ color: '#1F2937' }}>
              Tidak ada sekolah ditemukan
            </p>
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
              Coba ubah alamat atau gunakan fitur GPS untuk lokasi yang lebih akurat.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

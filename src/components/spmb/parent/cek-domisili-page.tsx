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
  ExternalLink,
  Route,
} from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { SpmbHeader } from '@/components/spmb/shared/spmb-header';
import { findNearestSchools, checkQuota, formatDistance } from '@/lib/business-logic';
import type { SchoolDistance } from '@/lib/types';

export function CekDomisiliPage() {
  const { navigateTo, goBack, schools, updateRegistrationData } = useSpmbStore();

  const [alamat, setAlamat] = useState('');
  const [desa, setDesa] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SchoolDistance[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [usingGps, setUsingGps] = useState(false);
  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLon, setGpsLon] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS tidak didukung di perangkat ini');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLat(pos.coords.latitude);
        setGpsLon(pos.coords.longitude);
        setUsingGps(true);
        setGpsLoading(false);
        setDesa('Lemahabang');
        setKecamatan('Lemahabang');
        setAlamat(`Lokasi GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        setGpsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGpsError('Aplikasi membutuhkan izin lokasi untuk membantu mencari sekolah dasar terdekat berdasarkan domisili calon siswa. Aktifkan GPS di pengaturan perangkat.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGpsError('Lokasi tidak tersedia. Coba di luar ruangan.');
            break;
          default:
            setGpsError('Gagal mendapatkan lokasi. Coba lagi.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const handleSearch = () => {
    if (!desa.trim() && !kecamatan.trim() && !alamat.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    const lat = gpsLat ?? -6.8333;
    const lon = gpsLon ?? 108.6333;

    setTimeout(() => {
      const nearest = findNearestSchools(lat, lon, schools, 10);
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
      latitudeDomisili: gpsLat ?? undefined,
      longitudeDomisili: gpsLon ?? undefined,
      jarakDomisiliKm: schoolDistance.jarakKm,
      schoolLatitude: school.latitude,
      schoolLongitude: school.longitude,
      jalurRekomendasi: 'domisili',
      hasilCekDomisili: {
        schoolId: school.schoolId,
        namaSekolah: school.namaSekolah,
        jarakDomisiliKm: schoolDistance.jarakKm,
        sisaKuota: school.sisaKuota,
        statusKuota: quotaCheck.statusKuota,
        checkedAt: new Date().toISOString(),
      },
    });
    navigateTo('registration');
  };

  const getQuotaBadgeConfig = (statusKuota: string) => {
    switch (statusKuota) {
      case 'Tersedia':
        return { bgColor: '#E8F5E9', textColor: '#2E7D32', icon: <CheckCircle className="size-3.5" /> };
      case 'Terbatas':
        return { bgColor: '#FFF3E0', textColor: '#E65100', icon: <AlertCircle className="size-3.5" /> };
      case 'Penuh':
        return { bgColor: '#FFEBEE', textColor: '#C62828', icon: <XCircle className="size-3.5" /> };
      default:
        return { bgColor: '#F3F4F6', textColor: '#6B7280', icon: null };
    }
  };

  const isFormValid = alamat.trim() || desa.trim() || kecamatan.trim();
  const nearestAvailable = results.find((r) => checkQuota(r.school).statusKuota !== 'Penuh');

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      <SpmbHeader
        title="Cek Domisili"
        showBack
        onBack={() => goBack()}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-4 space-y-4">
        <p className="text-xs" style={{ color: '#6B7280' }}>
          Cari sekolah dasar terdekat berdasarkan lokasi rumah calon siswa.
        </p>

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
            <div>
              <label htmlFor="alamat" className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
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

            <div>
              <label htmlFor="desa" className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
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

            <div>
              <label htmlFor="kecamatan" className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>
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
              disabled={gpsLoading}
              className="w-full h-12 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              style={{
                backgroundColor: gpsLat !== null ? '#E8F5E9' : '#F3F8FF',
                color: gpsLat !== null ? '#2E7D32' : '#1565C0',
                border: `1px solid ${gpsLat !== null ? '#C8E6C9' : '#BBDEFB'}`,
              }}
            >
              {gpsLoading ? (
                <>
                  <div className="size-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  Mendeteksi lokasi...
                </>
              ) : gpsLat !== null ? (
                <>
                  <CheckCircle className="size-4" />
                  Lokasi GPS Aktif
                </>
              ) : (
                <>
                  <Navigation className="size-4" />
                  Ambil Lokasi GPS
                </>
              )}
            </button>

            {gpsError && (
              <div className="rounded-xl p-3 text-xs flex items-start gap-2" style={{ backgroundColor: '#FFF3E0', color: '#E65100', border: '1px solid #FFE0B2' }}>
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Lokasi tidak terdeteksi</p>
                  <p className="mt-0.5">{gpsError}</p>
                  <p className="mt-1">Tidak apa-apa Bapak/Ibu. Jika lokasi GPS tidak diaktifkan, silakan ketik alamat lengkap rumah calon siswa agar saya bantu cek secara manual.</p>
                </div>
              </div>
            )}

            {usingGps && gpsLat !== null && gpsLon !== null && (
              <div className="rounded-xl p-3 text-xs flex items-center gap-2" style={{ backgroundColor: '#E3F2FD', color: '#1565C0', border: '1px solid #BBDEFB' }}>
                <Navigation className="size-4 shrink-0" />
                <p>Lokasi GPS terdeteksi: {gpsLat.toFixed(4)}, {gpsLon.toFixed(4)} (Kec. Lemahabang)</p>
              </div>
            )}

            {/* Cari Button */}
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
                  Cek Sekolah Terdekat
                </>
              )}
            </button>
          </div>
        </div>

        {/* KK Info */}
        {!hasSearched && (
          <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: '#FFF3E0', color: '#E65100', border: '1px solid #FFCC80' }}>
            <div className="flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Syarat KK Jalur Domisili</p>
                <p className="mt-0.5">
                  Kartu Keluarga (KK) harus diterbitkan <strong>paling singkat 1 tahun</strong> sebelum tanggal pendaftaran dibuka. Pastikan data KK sinkron dengan akta kelahiran untuk menghindari penolakan otomatis oleh sistem.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isSearching && results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <School className="size-5" style={{ color: '#1565C0' }} />
              <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                Sekolah Terdekat
              </h2>
            </div>

            {/* Recommendation */}
            {nearestAvailable && (
              <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', border: '1px solid #C8E6C9' }}>
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Rekomendasi</p>
                    <p className="mt-0.5">
                      {nearestAvailable.school.namaSekolah} — jarak {formatDistance(nearestAvailable.jarakKm)}, sisa kuota {nearestAvailable.school.sisaKuota} siswa.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {results.slice(0, 5).map((schoolDist, idx) => {
              const school = schoolDist.school;
              const quotaCheck = checkQuota(school);
              const badgeConfig = getQuotaBadgeConfig(quotaCheck.statusKuota);
              const isFull = quotaCheck.statusKuota === 'Penuh';
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${school.latitude},${school.longitude}`;
              const routeUrl = gpsLat !== null && gpsLon !== null
                ? `https://www.google.com/maps/dir/?api=1&origin=${gpsLat},${gpsLon}&destination=${school.latitude},${school.longitude}&travelmode=driving`
                : null;

              return (
                <div
                  key={school.schoolId}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
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
                        Desa {school.desa}, Kec. {school.kecamatan}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pt-3 pb-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" style={{ color: '#6B7280' }} />
                        <span className="text-sm font-bold" style={{ color: '#1565C0' }}>
                          {formatDistance(schoolDist.jarakKm)}
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

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.round((school.sisaKuota / Math.max(school.kuota, 1)) * 100))}%`,
                            backgroundColor: isFull ? '#EF4444' : quotaCheck.statusKuota === 'Terbatas' ? '#F59E0B' : '#43A047',
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium shrink-0" style={{ color: '#1F2937' }}>
                        Sisa: {school.sisaKuota}
                      </span>
                    </div>
                  </div>

                  {isFull && (
                    <div className="px-4 pt-2">
                      <div className="rounded-lg p-2.5 text-xs" style={{ backgroundColor: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2' }}>
                        <p className="font-medium">{school.namaSekolah} paling dekat, tetapi kuota sudah penuh.</p>
                        <p className="mt-0.5">Silakan pilih sekolah alternatif yang masih memiliki kuota.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 px-4 py-3">
                    {!isFull && (
                      <button
                        onClick={() => handlePilihSekolah(schoolDist)}
                        className="flex-1 h-10 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                        style={{ backgroundColor: '#1565C0' }}
                      >
                        Pilih Sekolah
                        <ArrowRight className="size-3.5" />
                      </button>
                    )}
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-10 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                      style={{
                        backgroundColor: '#F3F8FF',
                        color: '#1565C0',
                        border: '1px solid #BBDEFB',
                      }}
                    >
                      <ExternalLink className="size-3.5" />
                      Lihat Maps
                    </a>
                    {routeUrl && (
                      <a
                        href={routeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-10 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                        style={{
                          backgroundColor: '#F3F8FF',
                          color: '#43A047',
                          border: '1px solid #C8E6C9',
                        }}
                      >
                        <Route className="size-3.5" />
                        Lihat Rute
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Lanjut Daftar */}
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

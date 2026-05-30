'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Trophy,
} from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { StatusBadge } from '@/components/spmb/shared/status-badge';
import { StatCard } from '@/components/spmb/shared/stat-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { canVerifyApplicant, getJalurLabel } from '@/lib/business-logic';

export function OperatorApplicantsPage() {
  const store = useSpmbStore();
  const {
    applicants,
    schools,
    currentUser,
    filterSekolah,
    filterJalur,
    filterStatus,
    filterStatusBerkas,
    filterTanggal,
    searchKeyword,
    setFilterSekolah,
    setFilterJalur,
    setFilterStatus,
    setFilterStatusBerkas,
    setFilterTanggal,
    setSearchKeyword,
    resetFilters,
    setSelectedApplicant,
    navigateTo,
  } = store;

  const [showFilters, setShowFilters] = useState(false);

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    let result = [...applicants];

    if (filterSekolah && filterSekolah !== 'semua') {
      result = result.filter((a) => a.schoolId === filterSekolah);
    }
    if (filterJalur && filterJalur !== 'semua') {
      result = result.filter((a) => a.jalur === filterJalur);
    }
    if (filterStatus && filterStatus !== 'semua') {
      result = result.filter((a) => a.statusPendaftaran === filterStatus);
    }
    if (filterStatusBerkas && filterStatusBerkas !== 'semua') {
      result = result.filter((a) => a.statusBerkas === filterStatusBerkas);
    }
    if (filterTanggal) {
      result = result.filter((a) => a.createdAt && a.createdAt.startsWith(filterTanggal));
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.namaSiswa.toLowerCase().includes(kw) ||
          a.nik.includes(kw) ||
          a.nisn.toLowerCase().includes(kw) ||
          a.nomorPendaftaran.toLowerCase().includes(kw)
      );
    }

    return result;
  }, [applicants, filterSekolah, filterJalur, filterStatus, filterStatusBerkas, filterTanggal, searchKeyword]);

  // Statistics
  const totalPendaftar = applicants.length;
  const terverifikasi = applicants.filter(
    (a) => a.statusPendaftaran === 'terverifikasi' || a.statusPendaftaran === 'diterima'
  ).length;
  const belumDiverifikasi = applicants.filter(
    (a) => a.statusPendaftaran === 'menunggu_verifikasi' || a.statusPendaftaran === 'terkirim'
  ).length;

  // School ranking
  const schoolRanking = useMemo(() => {
    const countMap: Record<string, number> = {};
    applicants.forEach((a) => {
      countMap[a.schoolId] = (countMap[a.schoolId] || 0) + 1;
    });
    return Object.entries(countMap)
      .map(([schoolId, count]) => {
        const school = schools.find((s) => s.schoolId === schoolId);
        return { schoolId, namaSekolah: school?.namaSekolah || 'Unknown', count };
      })
      .sort((a, b) => b.count - a.count);
  }, [applicants, schools]);

  // Can verify check
  const canVerify = (applicantSchoolId: string): boolean => {
    if (!currentUser) return false;
    return canVerifyApplicant(currentUser.role, currentUser.schoolId, applicantSchoolId);
  };

  const isOperatorOnly = currentUser?.role === 'operator';

  // Export handler
  const handleExport = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicants: filteredApplicants,
          schoolName: filterSekolah !== 'semua' ? schools.find((s) => s.schoolId === filterSekolah)?.namaSekolah : '',
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pendaftar-spmb-${filterSekolah !== 'semua' ? 'sekolah' : 'semua'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch {
      console.error('Export failed');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Statistics cards */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
        <StatCard
          title="Total Pendaftar"
          value={totalPendaftar}
          icon={<Users className="size-5" />}
          color="#1565C0"
        />
        <StatCard
          title="Terverifikasi"
          value={terverifikasi}
          icon={<CheckCircle className="size-5" />}
          color="#43A047"
        />
        <StatCard
          title="Belum Verifikasi"
          value={belumDiverifikasi}
          icon={<Clock className="size-5" />}
          color="#F59E0B"
        />
      </div>

      {/* School ranking section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Trophy className="size-4" style={{ color: '#F59E0B' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#1F2937' }}>
            Sekolah Terbanyak Pendaftar
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {schoolRanking.slice(0, 5).map((item, idx) => (
            <div
              key={item.schoolId}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <span
                className="flex items-center justify-center size-7 rounded-full text-xs font-bold shrink-0"
                style={{
                  backgroundColor: idx === 0 ? '#FEF3C7' : idx === 1 ? '#F3F4F6' : idx === 2 ? '#FED7AA' : '#F9FAFB',
                  color: idx === 0 ? '#D97706' : idx === 1 ? '#6B7280' : idx === 2 ? '#EA580C' : '#9CA3AF',
                }}
              >
                {idx + 1}
              </span>
              <span className="text-sm font-medium truncate flex-1" style={{ color: '#1F2937' }}>
                {item.namaSekolah}
              </span>
              <span className="text-sm font-semibold shrink-0" style={{ color: '#1565C0' }}>
                {item.count} pendaftar
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: '#6B7280' }} />
        <Input
          placeholder="Cari Nama/NIK/NISN/Nomor Registrasi..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="pl-9 bg-white border-gray-200"
        />
      </div>

      {/* Filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors w-full"
        style={{ color: '#1F2937' }}
      >
        <Filter className="size-4" style={{ color: '#6B7280' }} />
        <span className="flex-1 text-left">Filter & Pencarian Lanjutan</span>
        {showFilters ? (
          <ChevronUp className="size-4" style={{ color: '#6B7280' }} />
        ) : (
          <ChevronDown className="size-4" style={{ color: '#6B7280' }} />
        )}
      </button>

      {/* Collapsible filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          {/* Filter Sekolah */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
              Filter Sekolah
            </label>
            <select
              value={filterSekolah}
              onChange={(e) => setFilterSekolah(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="semua">Semua Sekolah</option>
              {schools.map((s) => (
                <option key={s.schoolId} value={s.schoolId}>
                  {s.namaSekolah}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Jalur */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
              Filter Jalur Pendaftaran
            </label>
            <select
              value={filterJalur}
              onChange={(e) => setFilterJalur(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="semua">Semua Jalur</option>
              <option value="domisili">Jalur Domisili</option>
              <option value="afirmasi">Jalur Afirmasi</option>
              <option value="mutasi">Jalur Mutasi</option>
              <option value="prestasi">Jalur Prestasi</option>
              <option value="zoning">Jalur Zoning</option>
            </select>
          </div>

          {/* Filter Status Berkas */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
              Filter Status Berkas
            </label>
            <select
              value={filterStatusBerkas}
              onChange={(e) => setFilterStatusBerkas(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="semua">Semua Status Berkas</option>
              <option value="lengkap">Lengkap</option>
              <option value="belum_lengkap">Belum Lengkap</option>
              <option value="perlu_perbaikan">Perlu Perbaikan</option>
            </select>
          </div>

          {/* Filter Status Pendaftaran */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
              Filter Status Pendaftaran
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            >
              <option value="semua">Semua Status Pendaftaran</option>
              <option value="draft">Draft</option>
              <option value="terkirim">Terkirim</option>
              <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
              <option value="perlu_perbaikan">Perlu Perbaikan</option>
              <option value="terverifikasi">Terverifikasi</option>
              <option value="diterima">Diterima</option>
              <option value="cadangan">Cadangan</option>
              <option value="tidak_diterima">Tidak Diterima</option>
            </select>
          </div>

          {/* Filter Tanggal */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
              Filter Tanggal Daftar
            </label>
            <Input
              type="date"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
              className="bg-white border-gray-200"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex-1 text-sm"
            >
              Reset Filter
            </Button>
            <Button
              onClick={handleExport}
              className="flex-1 text-white text-sm"
              style={{ backgroundColor: '#43A047' }}
            >
              <Download className="size-4 mr-1" />
              Unduh Excel
            </Button>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: '#6B7280' }}>
          Menampilkan {filteredApplicants.length} dari {totalPendaftar} pendaftar
        </p>
        {!showFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-xs h-7"
            style={{ color: '#43A047', borderColor: '#43A047' }}
          >
            <Download className="size-3 mr-1" />
            Unduh
          </Button>
        )}
      </div>

      {/* Desktop: Table view for md+ screens */}
      <div className="hidden md:block">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100" style={{ backgroundColor: '#F8FAFC' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6B7280' }}>Nama Siswa</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6B7280' }}>Sekolah</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6B7280' }}>No. Pendaftaran</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6B7280' }}>Jalur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6B7280' }}>Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6B7280' }}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <Users className="size-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
                      <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
                        Tidak ada data pendaftar ditemukan
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((applicant) => {
                    const canVerifyThis = canVerify(applicant.schoolId);
                    return (
                      <tr key={applicant.applicantId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{applicant.namaSiswa}</p>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>NIK: {applicant.nik}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm" style={{ color: '#1F2937' }}>{applicant.namaSekolah}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-mono" style={{ color: '#6B7280' }}>{applicant.nomorPendaftaran}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs" style={{ color: '#6B7280' }}>{getJalurLabel(applicant.jalur)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={applicant.statusPendaftaran} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => {
                                setSelectedApplicant(applicant);
                                navigateTo('applicant-detail');
                              }}
                            >
                              <Eye className="size-3 mr-1" />
                              Detail
                            </Button>
                            {canVerifyThis && (
                              <Button
                                size="sm"
                                className="text-xs h-7 text-white"
                                style={{ backgroundColor: '#43A047' }}
                                onClick={() => {
                                  setSelectedApplicant(applicant);
                                  navigateTo('verification');
                                }}
                              >
                                <ShieldCheck className="size-3 mr-1" />
                                Verifikasi
                              </Button>
                            )}
                            {isOperatorOnly && !canVerifyThis && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7"
                                disabled
                              >
                                <Eye className="size-3 mr-1" />
                                Hanya Lihat
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile: Card list view */}
      <div className="md:hidden space-y-3">
        {filteredApplicants.length === 0 ? (
          <div className="text-center py-12">
            <Users className="size-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
            <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
              Tidak ada data pendaftar ditemukan
            </p>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
              Coba ubah filter atau kata kunci pencarian
            </p>
          </div>
        ) : (
          filteredApplicants.map((applicant) => {
            const canVerifyThis = canVerify(applicant.schoolId);

            return (
              <div
                key={applicant.applicantId}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: '#1F2937' }}
                    >
                      {applicant.namaSiswa}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                      {applicant.namaSekolah}
                    </p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>
                      {applicant.nomorPendaftaran} • {getJalurLabel(applicant.jalur)}
                    </p>
                  </div>
                  <StatusBadge status={applicant.statusPendaftaran} />
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      setSelectedApplicant(applicant);
                      navigateTo('applicant-detail');
                    }}
                  >
                    <Eye className="size-3 mr-1" />
                    Detail
                  </Button>

                  {canVerifyThis ? (
                    <>
                      <Button
                        size="sm"
                        className="text-xs h-7 text-white"
                        style={{ backgroundColor: '#43A047' }}
                        onClick={() => {
                          setSelectedApplicant(applicant);
                          navigateTo('verification');
                        }}
                      >
                        <ShieldCheck className="size-3 mr-1" />
                        Verifikasi
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        style={{ color: '#F59E0B', borderColor: '#F59E0B' }}
                        onClick={() => {
                          setSelectedApplicant(applicant);
                          navigateTo('verification');
                        }}
                      >
                        <AlertTriangle className="size-3 mr-1" />
                        Perlu Perbaikan
                      </Button>
                    </>
                  ) : isOperatorOnly ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      disabled
                    >
                      <Eye className="size-3 mr-1" />
                      Hanya Lihat
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

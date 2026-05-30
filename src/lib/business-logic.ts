// SPMB AI - Business Logic Functions

import { AgeCheckResult, SchoolDistance, School } from './types';

export function calculateAge(
  birthDate: string,
  referenceDate: string
): AgeCheckResult {
  const birth = new Date(birthDate);
  const reference = new Date(referenceDate);

  let tahun = reference.getFullYear() - birth.getFullYear();
  let bulan = reference.getMonth() - birth.getMonth();
  let hari = reference.getDate() - birth.getDate();

  if (hari < 0) {
    bulan--;
    const lastMonth = new Date(reference.getFullYear(), reference.getMonth(), 0);
    hari += lastMonth.getDate();
  }

  if (bulan < 0) {
    tahun--;
    bulan += 12;
  }

  const usiaMinimalSD = 6;
  const usiaPrioritasSD = 7;

  let statusUsia: AgeCheckResult['statusUsia'];
  let pesan: string;

  if (tahun > usiaMinimalSD || (tahun === usiaMinimalSD && bulan >= 0)) {
    if (tahun >= usiaPrioritasSD) {
      statusUsia = 'memenuhi_syarat';
      pesan = `Usia anak ${tahun} tahun ${bulan} bulan. Memenuhi syarat usia untuk masuk SD.`;
    } else if (tahun === usiaMinimalSD) {
      statusUsia = 'memenuhi_syarat';
      pesan = `Usia anak ${tahun} tahun ${bulan} bulan. Memenuhi syarat usia minimal untuk masuk SD.`;
    } else {
      statusUsia = 'memenuhi_syarat';
      pesan = `Usia anak ${tahun} tahun ${bulan} bulan. Memenuhi syarat usia untuk masuk SD.`;
    }
  } else if (tahun === usiaMinimalSD - 1 && bulan >= 6) {
    statusUsia = 'perlu_rekomendasi';
    pesan = `Usia anak ${tahun} tahun ${bulan} bulan. Belum memenuhi usia minimal, namun mendekati. Diperlukan rekomendasi khusus.`;
  } else {
    statusUsia = 'belum_memenuhi';
    pesan = `Usia anak ${tahun} tahun ${bulan} bulan. Belum memenuhi syarat usia minimal ${usiaMinimalSD} tahun untuk masuk SD.`;
  }

  return {
    namaAnak: '',
    tanggalLahir: birthDate,
    usiaTahun: tahun,
    usiaBulan: bulan,
    usiaHari: hari,
    statusUsia,
    pesan,
  };
}

let registrationCounter = 124;

export function generateRegistrationNumber(tahun: string = '2026'): string {
  registrationCounter++;
  const nomorUrut = String(registrationCounter).padStart(6, '0');
  return `SPMB-${tahun}-${nomorUrut}`;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function findNearestSchools(
  userLat: number,
  userLon: number,
  schools: School[],
  maxResults: number = 5
): SchoolDistance[] {
  const distances: SchoolDistance[] = schools
    .filter(s => s.statusAktif)
    .map(school => ({
      school,
      jarakKm: calculateDistance(userLat, userLon, school.latitude, school.longitude),
    }))
    .sort((a, b) => a.jarakKm - b.jarakKm)
    .slice(0, maxResults);

  return distances;
}

export function checkQuota(school: School): { sisaKuota: number; statusKuota: string } {
  if (school.sisaKuota <= 0) {
    return { sisaKuota: 0, statusKuota: 'Penuh' };
  } else if (school.sisaKuota <= school.kuota * 0.2) {
    return { sisaKuota: school.sisaKuota, statusKuota: 'Hampir Penuh' };
  } else {
    return { sisaKuota: school.sisaKuota, statusKuota: 'Tersedia' };
  }
}

export function canVerifyApplicant(
  currentUserRole: string,
  currentUserSchoolId: string,
  applicantSchoolId: string
): boolean {
  if (currentUserRole === 'admin') {
    return true;
  }
  if (currentUserRole === 'operator') {
    return currentUserSchoolId === applicantSchoolId;
  }
  return false;
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'terverifikasi':
    case 'diterima':
    case 'sudah_daftar_ulang':
    case 'lengkap':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'belum_lengkap':
    case 'menunggu_verifikasi':
    case 'terkirim':
    case 'draft':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'perlu_perbaikan':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'cadangan':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'tidak_diterima':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    terkirim: 'Terkirim',
    menunggu_verifikasi: 'Menunggu Verifikasi',
    perlu_perbaikan: 'Perlu Perbaikan',
    terverifikasi: 'Terverifikasi',
    diterima: 'Diterima',
    cadangan: 'Cadangan',
    tidak_diterima: 'Tidak Diterima',
    sudah_daftar_ulang: 'Sudah Daftar Ulang',
    lengkap: 'Lengkap',
    belum_lengkap: 'Belum Lengkap',
  };
  return labels[status] || status;
}

export function getJalurLabel(jalur: string): string {
  const labels: Record<string, string> = {
    domisili: 'Jalur Domisili',
    afirmasi: 'Jalur Afirmasi',
    mutasi: 'Jalur Mutasi',
    prestasi: 'Jalur Prestasi',
    zoning: 'Jalur Zoning',
  };
  return labels[jalur] || jalur;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

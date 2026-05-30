// SPMB AI - TypeScript Types

export type AppPage =
  | 'splash'
  | 'chat-ai'
  | 'info-pendaftaran'
  | 'cek-usia'
  | 'cek-domisili'
  | 'registration'
  | 'status-daftar'
  | 'pengumuman'
  | 'daftar-ulang'
  | 'bantuan'
  | 'petugas-login'
  | 'operator-applicants'
  | 'applicant-detail'
  | 'verification'
  | 'admin-dashboard'
  | 'school-management'
  | 'quota-management'
  | 'schedule-management'
  | 'requirement-management'
  | 'announcement-management'
  | 'prompt-ai-management'
  | 'chat-ai-settings'
  | 'operator-account'
  | 'rekap';

export type UserRole = 'parent' | 'operator' | 'admin';

export type StatusBerkas = 'lengkap' | 'belum_lengkap' | 'perlu_perbaikan';

export type StatusPendaftaran =
  | 'draft'
  | 'terkirim'
  | 'menunggu_verifikasi'
  | 'perlu_perbaikan'
  | 'terverifikasi'
  | 'diterima'
  | 'cadangan'
  | 'tidak_diterima'
  | 'sudah_daftar_ulang';

export type StatusDaftarUlang = 'menunggu_verifikasi' | 'terverifikasi' | 'perlu_perbaikan';

export type JalurPendaftaran = 'domisili' | 'afirmasi' | 'mutasi' | 'prestasi' | 'zoning';

export interface User {
  uid: string;
  nama: string;
  email: string;
  role: UserRole;
  schoolId: string;
  statusAktif: boolean;
  createdAt: string;
}

export interface ParentAccess {
  parentId: string;
  namaOrangTua: string;
  noHp: string;
  nikSiswa: string;
  applicantId: string;
  lastLogin: string;
}

export interface School {
  schoolId: string;
  namaSekolah: string;
  npsn: string;
  jenjang: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  latitude: number;
  longitude: number;
  kuota: number;
  sisaKuota: number;
  statusAktif: boolean;
}

export interface Applicant {
  applicantId: string;
  nomorPendaftaran: string;
  nik: string;
  nisn: string;
  namaSiswa: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  namaAyah: string;
  nikAyah: string;
  pekerjaanAyah: string;
  namaIbu: string;
  nikIbu: string;
  pekerjaanIbu: string;
  noHpOrtu: string;
  schoolId: string;
  namaSekolah: string;
  jalur: JalurPendaftaran;
  statusBerkas: StatusBerkas;
  statusPendaftaran: StatusPendaftaran;
  catatanOperator: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  documentId: string;
  applicantId: string;
  jenisDokumen: string;
  fileUrl: string;
  statusVerifikasi: string;
  catatan: string;
  uploadedAt: string;
}

export interface ReRegistration {
  reRegistrationId: string;
  applicantId: string;
  nomorPendaftaran: string;
  statusDaftarUlang: StatusDaftarUlang;
  dataSiswaLengkap: boolean;
  dokumenLengkap: boolean;
  catatanOperator: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsSPMB {
  tahunAjaran: string;
  tanggalAcuanUsia: string;
  usiaMinimalSD: number;
  usiaPrioritasSD: number;
  usiaPengecualianBulan: number;
  kuotaDomisili: number;
  kuotaAfirmasi: number;
  kuotaMutasi: number;
  statusPendaftaran: string;
  updatedAt: string;
}

export interface Announcement {
  announcementId: string;
  title: string;
  content: string;
  tahunAjaran: string;
  statusPublikasi: string;
  createdAt: string;
}

export interface ChatLog {
  chatId: string;
  parentId: string;
  menu: string;
  pertanyaan: string;
  jawaban: string;
  sumber: string;
  typingMode: 'slow' | 'instant';
  typingSpeed: 'lambat' | 'normal' | 'cepat';
  sourceType: 'data_aplikasi' | 'google_search' | 'gabungan' | null;
  analysisId: string | null;
  model: string;
  createdAt: string;
}

export interface VerificationLog {
  logId: string;
  applicantId: string;
  schoolId: string;
  operatorId: string;
  namaOperator: string;
  aksi: string;
  statusSebelum: string;
  statusSesudah: string;
  catatan: string;
  waktuAksi: string;
}

export interface ActivityLog {
  activityId: string;
  userId: string;
  role: string;
  aksi: string;
  targetId: string;
  deskripsi: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
  menu?: string;
  typingMode?: 'slow' | 'instant';
  typingSpeed?: 'lambat' | 'normal' | 'cepat';
  sourceType?: 'data_aplikasi' | 'google_search' | 'gabungan';
  analysisId?: string;
  model?: string;
  actionButtons?: ChatActionButton[];
  statusIndicator?: ChatStatusIndicator;
  isTyping?: boolean; // For slow typing animation
  displayedContent?: string; // Currently displayed content during typing
}

export type ChatStatusIndicator =
  | 'menganalisa'
  | 'mengecek_data'
  | 'mencari_referensi'
  | 'menyusun_jawaban'
  | null;

export interface ChatActionButton {
  id: string;
  label: string;
  page: AppPage;
  color: string;
}

export interface AgeCheckResult {
  namaAnak: string;
  tanggalLahir: string;
  usiaTahun: number;
  usiaBulan: number;
  usiaHari: number;
  statusUsia: 'memenuhi_syarat' | 'belum_memenuhi' | 'perlu_rekomendasi';
  pesan: string;
}

export interface SchoolDistance {
  school: School;
  jarakKm: number;
}

export interface RegistrationStep {
  step: number;
  title: string;
  completed: boolean;
}

export interface ReRegistrationForm {
  nomorPendaftaran: string;
  nikSiswa: string;
  nisn: string;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  alamatLengkap: string;
  dataAyah: string;
  dataIbu: string;
  noHpAktif: string;
  sekolahAsalTk: string;
  kontakDarurat: string;
  dataKesehatan: string;
}

// ============================================
// TK/PAUD/KB Database Types
// ============================================

export type JenisLembaga = 'TK' | 'PAUD' | 'KB' | 'RA' | 'SPS';

export interface LembagaPaud {
  id: string;
  namaLembaga: string;
  npsn: string;
  jenisLembaga: JenisLembaga;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  penanggungJawab: string | null;
  noTelp: string | null;
  email: string | null;
  statusAktif: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    siswa: number;
    importLogs: number;
  };
}

export interface SiswaTK {
  id: string;
  lembagaPaudId: string;
  // Identitas
  nipd: string | null;
  nisn: string | null;
  namaSiswa: string;
  nik: string | null;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  jenisKelamin: string | null;
  agama: string | null;
  // Alamat
  alamat: string | null;
  rt: string | null;
  rw: string | null;
  dusun: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kodePos: string | null;
  jenisTinggal: string | null;
  alatTransportasi: string | null;
  // Kontak
  telepon: string | null;
  hp: string | null;
  email: string | null;
  // Data Ayah
  namaAyah: string | null;
  tahunLahirAyah: string | null;
  jenjangPendidikanAyah: string | null;
  pekerjaanAyah: string | null;
  penghasilanAyah: string | null;
  nikAyah: string | null;
  // Data Ibu
  namaIbu: string | null;
  tahunLahirIbu: string | null;
  jenjangPendidikanIbu: string | null;
  pekerjaanIbu: string | null;
  penghasilanIbu: string | null;
  nikIbu: string | null;
  // Data Wali
  namaWali: string | null;
  tahunLahirWali: string | null;
  jenjangPendidikanWali: string | null;
  pekerjaanWali: string | null;
  penghasilanWali: string | null;
  nikWali: string | null;
  // Kelas & Akademik
  rombel: string | null;
  tahunAjaran: string | null;
  tahunMasuk: string | null;
  // Bantuan Sosial
  penerimaKPS: string | null;
  noKPS: string | null;
  penerimaKIP: string | null;
  nomorKIP: string | null;
  namaDiKIP: string | null;
  nomorKKS: string | null;
  noRegAktaLahir: string | null;
  layakPIP: string | null;
  alasanPIP: string | null;
  // Data Lainnya
  kebutuhanKhusus: string | null;
  sekolahAsal: string | null;
  anakKe: number | null;
  noKK: string | null;
  beratBadan: number | null;
  tinggiBadan: number | null;
  lingkarKepala: number | null;
  jmlSaudaraKandung: number | null;
  jarakRumahKm: number | null;
  lintang: string | null;
  bujur: string | null;
  // Metadata
  statusAktif: boolean;
  catatan: string | null;
  createdAt: string;
  updatedAt: string;
  lembagaPaud?: LembagaPaud;
}

export interface ImportLog {
  id: string;
  fileName: string;
  sourceUrl: string;
  lembagaPaudId: string;
  totalRecords: number;
  importedRecords: number;
  failedRecords: number;
  failedDetails: string | null;
  status: 'processing' | 'completed' | 'completed_with_errors' | 'failed';
  errorMessage: string | null;
  importedAt: string;
  completedAt: string | null;
  lembagaPaud?: LembagaPaud;
}

export interface SiswaTKStats {
  totalSiswaAktif: number;
  totalLembaga: number;
  perKecamatan: { kecamatan: string | null; jumlah: number }[];
  perJenisLembaga: { jenisLembaga: string; jumlah: number }[];
}

// ============================================
// Chat AI Settings & Analysis Types
// ============================================

export interface ChatAISettings {
  id: string;
  modelAI: string;
  aktifkanGoogleSearch: boolean;
  aktifkanSlowTyping: boolean;
  kecepatanTyping: 'lambat' | 'normal' | 'cepat';
  maksimalHasilGoogle: number;
  sumberUtama: string;
  sumberTambahan: string;
  systemPrompt: string | null;
  pesanFallback: string;
  updatedAt: string;
  createdAt: string;
}

export interface ChatAnalysisLogEntry {
  id: string;
  parentId: string | null;
  pertanyaan: string;
  kategoriPertanyaan: string;
  sumberJawaban: string;
  menggunakanDataAplikasi: boolean;
  menggunakanGoogleSearch: boolean;
  queryGoogle: string | null;
  hasilRingkasanGoogle: string | null;
  jawabanAkhir: string | null;
  model: string;
  waktuAnalisa: number | null;
  createdAt: string;
}

export type KategoriPertanyaan =
  | 'info_spmb'
  | 'usia_anak'
  | 'domisili'
  | 'pendaftaran'
  | 'status_daftar'
  | 'pengumuman'
  | 'daftar_ulang'
  | 'keluhan'
  | 'umum';

export type SumberJawaban = 'data_aplikasi' | 'google_search' | 'gabungan';

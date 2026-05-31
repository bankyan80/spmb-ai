import { SheetTable, ColumnDef } from './sheets';

// ============================================
// Column definitions for each spreadsheet table
// ============================================

const SchoolColumns: ColumnDef[] = [
  { field: 'schoolId', type: 'string' },
  { field: 'namaSekolah', type: 'string' },
  { field: 'npsn', type: 'string' },
  { field: 'jenjang', type: 'string' },
  { field: 'alamat', type: 'string' },
  { field: 'desa', type: 'string' },
  { field: 'kecamatan', type: 'string' },
  { field: 'latitude', type: 'number' },
  { field: 'longitude', type: 'number' },
  { field: 'kuota', type: 'number' },
  { field: 'sisaKuota', type: 'number' },
  { field: 'statusAktif', type: 'boolean' },
  { field: 'createdAt', type: 'string' },
  { field: 'updatedAt', type: 'string' },
];

const ApplicantColumns: ColumnDef[] = [
  { field: 'applicantId', type: 'string' },
  { field: 'nomorPendaftaran', type: 'string' },
  { field: 'nik', type: 'string' },
  { field: 'nisn', type: 'string' },
  { field: 'namaSiswa', type: 'string' },
  { field: 'tempatLahir', type: 'string' },
  { field: 'tanggalLahir', type: 'string' },
  { field: 'jenisKelamin', type: 'string' },
  { field: 'agama', type: 'string' },
  { field: 'alamat', type: 'string' },
  { field: 'desa', type: 'string' },
  { field: 'kecamatan', type: 'string' },
  { field: 'namaAyah', type: 'string' },
  { field: 'nikAyah', type: 'string' },
  { field: 'pekerjaanAyah', type: 'string' },
  { field: 'namaIbu', type: 'string' },
  { field: 'nikIbu', type: 'string' },
  { field: 'pekerjaanIbu', type: 'string' },
  { field: 'noHpOrtu', type: 'string' },
  { field: 'schoolId', type: 'string' },
  { field: 'namaSekolah', type: 'string' },
  { field: 'jalur', type: 'string' },
  { field: 'statusBerkas', type: 'string' },
  { field: 'statusPendaftaran', type: 'string' },
  { field: 'catatanOperator', type: 'string' },
  { field: 'createdAt', type: 'string' },
  { field: 'updatedAt', type: 'string' },
];

const DocumentColumns: ColumnDef[] = [
  { field: 'documentId', type: 'string' },
  { field: 'applicantId', type: 'string' },
  { field: 'jenisDokumen', type: 'string' },
  { field: 'fileUrl', type: 'string' },
  { field: 'statusVerifikasi', type: 'string' },
  { field: 'catatan', type: 'string' },
  { field: 'uploadedAt', type: 'string' },
];

const ReRegistrationColumns: ColumnDef[] = [
  { field: 'reRegistrationId', type: 'string' },
  { field: 'applicantId', type: 'string' },
  { field: 'nomorPendaftaran', type: 'string' },
  { field: 'statusDaftarUlang', type: 'string' },
  { field: 'dataSiswaLengkap', type: 'boolean' },
  { field: 'dokumenLengkap', type: 'boolean' },
  { field: 'catatanOperator', type: 'string' },
  { field: 'createdAt', type: 'string' },
  { field: 'updatedAt', type: 'string' },
];

const UserColumns: ColumnDef[] = [
  { field: 'uid', type: 'string' },
  { field: 'email', type: 'string' },
  { field: 'nama', type: 'string' },
  { field: 'role', type: 'string' },
  { field: 'schoolId', type: 'string' },
  { field: 'statusAktif', type: 'boolean' },
  { field: 'createdAt', type: 'string' },
  { field: 'updatedAt', type: 'string' },
];

const AnnouncementColumns: ColumnDef[] = [
  { field: 'announcementId', type: 'string' },
  { field: 'title', type: 'string' },
  { field: 'content', type: 'string' },
  { field: 'tahunAjaran', type: 'string' },
  { field: 'statusPublikasi', type: 'string' },
  { field: 'createdAt', type: 'string' },
  { field: 'updatedAt', type: 'string' },
];

const LembagaPaudColumns: ColumnDef[] = [
  { field: 'id', type: 'string' },
  { field: 'namaLembaga', type: 'string' },
  { field: 'npsn', type: 'string' },
  { field: 'jenisLembaga', type: 'string' },
  { field: 'alamat', type: 'string' },
  { field: 'desa', type: 'string' },
  { field: 'kecamatan', type: 'string' },
  { field: 'kabupaten', type: 'string' },
  { field: 'provinsi', type: 'string' },
  { field: 'penanggungJawab', type: 'string' },
  { field: 'noTelp', type: 'string' },
  { field: 'email', type: 'string' },
  { field: 'statusAktif', type: 'boolean' },
  { field: 'createdAt', type: 'string' },
  { field: 'updatedAt', type: 'string' },
];

const SiswaTKColumns: ColumnDef[] = [
  { field: 'id', type: 'string' },
  { field: 'lembagaPaudId', type: 'string' },
  { field: 'nipd', type: 'string' },
  { field: 'nisn', type: 'string' },
  { field: 'namaSiswa', type: 'string' },
  { field: 'nik', type: 'string' },
  { field: 'tempatLahir', type: 'string' },
  { field: 'tanggalLahir', type: 'string' },
  { field: 'jenisKelamin', type: 'string' },
  { field: 'agama', type: 'string' },
  { field: 'alamat', type: 'string' },
  { field: 'rt', type: 'string' },
  { field: 'rw', type: 'string' },
  { field: 'dusun', type: 'string' },
  { field: 'kelurahan', type: 'string' },
  { field: 'kecamatan', type: 'string' },
  { field: 'kodePos', type: 'string' },
  { field: 'jenisTinggal', type: 'string' },
  { field: 'alatTransportasi', type: 'string' },
  { field: 'telepon', type: 'string' },
  { field: 'hp', type: 'string' },
  { field: 'email', type: 'string' },
  { field: 'namaAyah', type: 'string' },
  { field: 'tahunLahirAyah', type: 'string' },
  { field: 'jenjangPendidikanAyah', type: 'string' },
  { field: 'pekerjaanAyah', type: 'string' },
  { field: 'penghasilanAyah', type: 'string' },
  { field: 'nikAyah', type: 'string' },
  { field: 'namaIbu', type: 'string' },
  { field: 'tahunLahirIbu', type: 'string' },
  { field: 'jenjangPendidikanIbu', type: 'string' },
  { field: 'pekerjaanIbu', type: 'string' },
  { field: 'penghasilanIbu', type: 'string' },
  { field: 'nikIbu', type: 'string' },
  { field: 'namaWali', type: 'string' },
  { field: 'tahunLahirWali', type: 'string' },
  { field: 'jenjangPendidikanWali', type: 'string' },
  { field: 'pekerjaanWali', type: 'string' },
  { field: 'penghasilanWali', type: 'string' },
  { field: 'nikWali', type: 'string' },
  { field: 'rombel', type: 'string' },
  { field: 'tahunAjaran', type: 'string' },
  { field: 'tahunMasuk', type: 'string' },
  { field: 'penerimaKPS', type: 'string' },
  { field: 'noKPS', type: 'string' },
  { field: 'penerimaKIP', type: 'string' },
  { field: 'nomorKIP', type: 'string' },
  { field: 'namaDiKIP', type: 'string' },
  { field: 'nomorKKS', type: 'string' },
  { field: 'noRegAktaLahir', type: 'string' },
  { field: 'layakPIP', type: 'string' },
  { field: 'alasanPIP', type: 'string' },
  { field: 'kebutuhanKhusus', type: 'string' },
  { field: 'sekolahAsal', type: 'string' },
  { field: 'anakKe', type: 'number' },
  { field: 'noKK', type: 'string' },
  { field: 'beratBadan', type: 'number' },
  { field: 'tinggiBadan', type: 'number' },
  { field: 'lingkarKepala', type: 'number' },
  { field: 'jmlSaudaraKandung', type: 'number' },
  { field: 'jarakRumahKm', type: 'number' },
  { field: 'lintang', type: 'string' },
  { field: 'bujur', type: 'string' },
  { field: 'statusAktif', type: 'boolean' },
  { field: 'catatan', type: 'string' },
  { field: 'createdAt', type: 'string' },
  { field: 'updatedAt', type: 'string' },
];

const ImportLogColumns: ColumnDef[] = [
  { field: 'id', type: 'string' },
  { field: 'fileName', type: 'string' },
  { field: 'sourceUrl', type: 'string' },
  { field: 'lembagaPaudId', type: 'string' },
  { field: 'totalRecords', type: 'number' },
  { field: 'importedRecords', type: 'number' },
  { field: 'failedRecords', type: 'number' },
  { field: 'failedDetails', type: 'string' },
  { field: 'status', type: 'string' },
  { field: 'errorMessage', type: 'string' },
  { field: 'importedAt', type: 'string' },
  { field: 'completedAt', type: 'string' },
];

const ChatAISettingsColumns: ColumnDef[] = [
  { field: 'id', type: 'string' },
  { field: 'modelAI', type: 'string' },
  { field: 'aktifkanGoogleSearch', type: 'boolean' },
  { field: 'aktifkanSlowTyping', type: 'boolean' },
  { field: 'kecepatanTyping', type: 'string' },
  { field: 'maksimalHasilGoogle', type: 'number' },
  { field: 'sumberUtama', type: 'string' },
  { field: 'sumberTambahan', type: 'string' },
  { field: 'systemPrompt', type: 'string' },
  { field: 'pesanFallback', type: 'string' },
  { field: 'updatedAt', type: 'string' },
  { field: 'createdAt', type: 'string' },
];

const ChatAnalysisLogColumns: ColumnDef[] = [
  { field: 'id', type: 'string' },
  { field: 'parentId', type: 'string' },
  { field: 'pertanyaan', type: 'string' },
  { field: 'kategoriPertanyaan', type: 'string' },
  { field: 'sumberJawaban', type: 'string' },
  { field: 'menggunakanDataAplikasi', type: 'boolean' },
  { field: 'menggunakanGoogleSearch', type: 'boolean' },
  { field: 'queryGoogle', type: 'string' },
  { field: 'hasilRingkasanGoogle', type: 'string' },
  { field: 'jawabanAkhir', type: 'string' },
  { field: 'model', type: 'string' },
  { field: 'waktuAnalisa', type: 'number' },
  { field: 'createdAt', type: 'string' },
];

const ChatLogColumns: ColumnDef[] = [
  { field: 'id', type: 'string' },
  { field: 'parentId', type: 'string' },
  { field: 'role', type: 'string' },
  { field: 'content', type: 'string' },
  { field: 'menu', type: 'string' },
  { field: 'typingMode', type: 'string' },
  { field: 'typingSpeed', type: 'string' },
  { field: 'sourceType', type: 'string' },
  { field: 'analysisId', type: 'string' },
  { field: 'model', type: 'string' },
  { field: 'createdAt', type: 'string' },
];

// ============================================
// Table instances (singletons)
// ============================================

export const schoolsTable = new SheetTable<Record<string, unknown>>('Sekolah', SchoolColumns);
export const applicantsTable = new SheetTable<Record<string, unknown>>('Pendaftar', ApplicantColumns);
export const documentsTable = new SheetTable<Record<string, unknown>>('Dokumen', DocumentColumns);
export const reregistrationsTable = new SheetTable<Record<string, unknown>>('DaftarUlang', ReRegistrationColumns);
export const usersTable = new SheetTable<Record<string, unknown>>('User', UserColumns);
export const announcementsTable = new SheetTable<Record<string, unknown>>('Pengumuman', AnnouncementColumns);
export const lembagaPaudTable = new SheetTable<Record<string, unknown>>('LembagaPaud', LembagaPaudColumns);
export const siswaTKTable = new SheetTable<Record<string, unknown>>('SiswaTK', SiswaTKColumns);
export const importLogTable = new SheetTable<Record<string, unknown>>('ImportLog', ImportLogColumns);
export const chatAISettingsTable = new SheetTable<Record<string, unknown>>('ChatAISettings', ChatAISettingsColumns);
export const chatAnalysisLogTable = new SheetTable<Record<string, unknown>>('ChatAnalysisLog', ChatAnalysisLogColumns);
export const chatLogTable = new SheetTable<Record<string, unknown>>('ChatLog', ChatLogColumns);

// ============================================
// Map of all tables for initialization
// ============================================

export const ALL_TABLES: Record<string, SheetTable<Record<string, unknown>>> = {
  Sekolah: schoolsTable,
  Pendaftar: applicantsTable,
  Dokumen: documentsTable,
  DaftarUlang: reregistrationsTable,
  User: usersTable,
  Pengumuman: announcementsTable,
  LembagaPaud: lembagaPaudTable,
  SiswaTK: siswaTKTable,
  ImportLog: importLogTable,
  ChatAISettings: chatAISettingsTable,
  ChatAnalysisLog: chatAnalysisLogTable,
  ChatLog: chatLogTable,
};

// SPMB SD 2026/2027 - Mock Data for Demo

import { School, Applicant, SettingsSPMB, User, Announcement } from './types';

export const mockSchools: School[] = [
  { schoolId: 'sch-20215216', npsn: '20215216', namaSekolah: 'SD NEGERI 1 ASEM', jenjang: 'SD', alamat: '', desa: 'Asem', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20215230', npsn: '20215230', namaSekolah: 'SD NEGERI 1 BELAWA', jenjang: 'SD', alamat: '', desa: 'Belawa', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20215287', npsn: '20215287', namaSekolah: 'SD NEGERI 1 CIPEUJEUH KULON', jenjang: 'SD', alamat: '', desa: 'Cipeujeuh Kulon', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20215286', npsn: '20215286', namaSekolah: 'SD NEGERI 1 CIPEUJEUH WETAN', jenjang: 'SD', alamat: '', desa: 'Cipeujeuh Wetan', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 80, sisaKuota: 80, statusAktif: true },
  { schoolId: 'sch-20215162', npsn: '20215162', namaSekolah: 'SD NEGERI 1 LEMAHABANG', jenjang: 'SD', alamat: '', desa: 'Lemahabang', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 80, sisaKuota: 80, statusAktif: true },
  { schoolId: 'sch-20215161', npsn: '20215161', namaSekolah: 'SD NEGERI 1 LEMAHABANG KULON', jenjang: 'SD', alamat: '', desa: 'Lemahabang Kulon', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 80, sisaKuota: 80, statusAktif: true },
  { schoolId: 'sch-20215164', npsn: '20215164', namaSekolah: 'SD NEGERI 1 LEUWIDINGDING', jenjang: 'SD', alamat: '', desa: 'Leuwidingding', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20246442', npsn: '20246442', namaSekolah: 'SD NEGERI 1 PICUNGPUGUR', jenjang: 'SD', alamat: '', desa: 'Picungpugur', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20215517', npsn: '20215517', namaSekolah: 'SD NEGERI 1 SARAJAYA', jenjang: 'SD', alamat: '', desa: 'Sarajaya', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20215506', npsn: '20215506', namaSekolah: 'SD NEGERI 1 SIGONG', jenjang: 'SD', alamat: '', desa: 'Sigong', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20215464', npsn: '20215464', namaSekolah: 'SD NEGERI 1 SINDANGLAUT', jenjang: 'SD', alamat: '', desa: 'Sindang Laut', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20246445', npsn: '20246445', namaSekolah: 'SD NEGERI 1 TUK KARANGSUWUNG', jenjang: 'SD', alamat: '', desa: 'Tuk Karangsuwung', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 80, sisaKuota: 80, statusAktif: true },
  { schoolId: 'sch-20215584', npsn: '20215584', namaSekolah: 'SD NEGERI 1 WANGKELANG', jenjang: 'SD', alamat: '', desa: 'Wangkelang', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20215564', npsn: '20215564', namaSekolah: 'SD NEGERI 2 BELAWA', jenjang: 'SD', alamat: '', desa: 'Belawa', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20215381', npsn: '20215381', namaSekolah: 'SD NEGERI 2 CIPEUJEUH KULON', jenjang: 'SD', alamat: '', desa: 'Cipeujeuh Kulon', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 80, sisaKuota: 80, statusAktif: true },
  { schoolId: 'sch-20215380', npsn: '20215380', namaSekolah: 'SD NEGERI 2 CIPEUJEUH WETAN', jenjang: 'SD', alamat: '', desa: 'Cipeujeuh Wetan', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20214656', npsn: '20214656', namaSekolah: 'SD NEGERI 2 LEMAHABANG', jenjang: 'SD', alamat: '', desa: 'Lemahabang', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 80, sisaKuota: 80, statusAktif: true },
  { schoolId: 'sch-20214726', npsn: '20214726', namaSekolah: 'SD NEGERI 2 SARAJAYA', jenjang: 'SD', alamat: '', desa: 'Sarajaya', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20214479', npsn: '20214479', namaSekolah: 'SD NEGERI 3 CIPEUJEUH WETAN', jenjang: 'SD', alamat: '', desa: 'Cipeujeuh Wetan', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20214570', npsn: '20214570', namaSekolah: 'SD NEGERI 3 SIGONG', jenjang: 'SD', alamat: '', desa: 'Sigong', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20244513', npsn: '20244513', namaSekolah: 'SD NEGERI 4 SIGONG', jenjang: 'SD', alamat: '', desa: 'Sigong', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 40, sisaKuota: 40, statusAktif: true },
  { schoolId: 'sch-20215221', npsn: '20215221', namaSekolah: 'SDIT AL IRSYAD AL ISLAMIYAH', jenjang: 'SD', alamat: '', desa: 'Lemahabang', kecamatan: 'Lemahabang', latitude: 0, longitude: 0, kuota: 160, sisaKuota: 160, statusAktif: true },
];

const _schoolNameToId: Record<string, string> = {};
for (const s of mockSchools) {
  const key = s.namaSekolah.toLowerCase().replace(/[^a-z0-9]/g, '');
  _schoolNameToId[key] = s.schoolId;
  const alt = key.replace(/sdn/g, 'sdnegeri');
  _schoolNameToId[alt] = s.schoolId;
}
function schoolId(name: string): string {
  return _schoolNameToId[name.toLowerCase().replace(/[^a-z0-9]/g, '')] || '';
}

export const mockApplicants: Applicant[] = [];

export const mockSettings: SettingsSPMB = {
  tahunAjaran: '2026/2027',
  tanggalAcuanUsia: '2026-07-01',
  usiaMinimalSD: 6,
  usiaPrioritasSD: 7,
  usiaPengecualianBulan: 6,
  kuotaDomisili: 60,
  kuotaAfirmasi: 15,
  kuotaMutasi: 10,
  statusPendaftaran: 'dibuka',
  updatedAt: '2026-01-10T10:00:00Z',
};

// Users imported from CSV (SD-only operator accounts)
const csvUserData: { uid: string; nama: string; email: string; schoolName: string }[] = [
  { uid: '0WUmasEzHCeLgIivwAUf7JFHork1', nama: 'Garnis N.F', email: 'garnis589@gmail.com', schoolName: 'SD NEGERI 1 ASEM' },
  { uid: '72pYPzOKp2Y6gWORApuQ31mdAOM2', nama: 'Fajar Sidik', email: 'fajarsidik10.id@gmail.com', schoolName: 'SD NEGERI 3 SIGONG' },
  { uid: '8oTmoHc8oeZR6GRsBBJ4wExuRg53', nama: 'gina maulidah', email: 'ginamaulidah26@gmail.com', schoolName: 'SD NEGERI 2 CIPEUJEUH KULON' },
  { uid: '9yfxqVztRraRktPkjE3jG1ExUiC2', nama: 'SD NEGERI 1 SIGONG', email: 'sdnegerisigong1@gmail.com', schoolName: 'SD NEGERI 1 SIGONG' },
  { uid: 'CaqthbevHLRkeEp28TMzpRCsxw22', nama: 'Luthfi Firmansyah', email: 'luthfifirmansyah78@admin.sd.belajar.id', schoolName: 'SD NEGERI 2 LEMAHABANG' },
  { uid: 'DN9BApPjBfOR0UVDg1usVRwtNFp1', nama: 'SD NEGERI 1 CIPEUJEUH KULON', email: 'sdnegeri1cipeujeuhkulon@gmail.com', schoolName: 'SD NEGERI 1 CIPEUJEUH KULON' },
  { uid: 'KuTzWsWOORZ2FJoTTR0dmug7aCC3', nama: 'SDN 3 Cipeujeuh Wetan', email: 'sdn3cipwet@gmail.com', schoolName: 'SD NEGERI 3 CIPEUJEUH WETAN' },
  { uid: 'LM39IQWnXpXw2BWHXwth34raNSE3', nama: 'SDN 1 LEMAHABANG', email: 'sdnsatulemahabang@gmail.com', schoolName: 'SD NEGERI 1 LEMAHABANG' },
  { uid: 'NOEyh4jhdqOAmc21iHRpMAdhyvq1', nama: 'Luthfi Firmansyah', email: 'lut.firman88@gmail.com', schoolName: 'SD NEGERI 2 LEMAHABANG' },
  { uid: 'Ps8I4gX43dRYYHzrtgG73QjMG0u2', nama: 'SDN 1 PICUNGPUGUR', email: 'sdn1picungpugur01@gmail.com', schoolName: 'SD NEGERI 1 PICUNGPUGUR' },
  { uid: 'QBrtbiFXSjcjs8iA8iEpMcGvfhp1', nama: 'SDN 2 SARAJAYA', email: 'sdnsarajayadua@gmail.com', schoolName: 'SD NEGERI 2 SARAJAYA' },
  { uid: 'R1Pv8CgSiAb4UA4UAlUbfK9Mi8h1', nama: 'spmb-sd 2026', email: 'spmb.sd.017@gmail.com', schoolName: 'SD NEGERI 1 LEMAHABANG' },
  { uid: 'SYdrDc6flccSQlzeJO4k5Sn0RLj2', nama: 'Diyan Hidayat', email: 'diyan.hidayat93@gmail.com', schoolName: 'SD NEGERI 1 SARAJAYA' },
  { uid: 'Y7nBxv0GcMgo8get9Uc9Y4HLT7G3', nama: 'SD NEGERI 1 CIPEUJEUH WETAN', email: 'sdncipwet1@gmail.com', schoolName: 'SD NEGERI 1 CIPEUJEUH WETAN' },
  { uid: 'hMsMiQcHuObkNzAQRfGBgppB1a32', nama: 'SDIT AL IRSYAD AL ISLAMIYYAH LEMAHABANG KAB CIREBON', email: 'sditalirsyadla@gmail.com', schoolName: 'SDIT AL IRSYAD AL ISLAMIYAH' },
  { uid: 'pfeBqUGnyUXePHcTAnXsiNXdBZP2', nama: 'nurdin ramadon', email: 'nurdinramadon590@gmail.com', schoolName: 'SD NEGERI 2 BELAWA' },
  { uid: 'qQFdtWtvyGMNAETaRPKP4IZEt033', nama: 'sdn1 sindanglaut', email: 'sdnsatusindanglaut@gmail.com', schoolName: 'SD NEGERI 1 SINDANGLAUT' },
  { uid: 'teOk9YZWnqNfXatnvcnDyO20aMD2', nama: 'Shepta Wijaya', email: 'shepta24@gmail.com', schoolName: 'SD NEGERI 1 SIGONG' },
  { uid: 'v2bLEHet9rcA4S1ehCzWBqEsjwE3', nama: 'Sdnsatu Wangkelang', email: 'sdnsatuw@gmail.com', schoolName: 'SD NEGERI 1 WANGKELANG' },
  { uid: 'vZfr6hJYqRhS15rBjtGUrnmnoPT2', nama: 'Jaja', email: 'jajacrb21@gmail.com', schoolName: 'SD NEGERI 1 PICUNGPUGUR' },
  { uid: 'xSY97tqZcKTGoaJZmR0Z20993KH3', nama: 'sdn2 cipeujeuhkulon', email: 'sdncipeujeuhkulon2@gmail.com', schoolName: 'SD NEGERI 2 CIPEUJEUH KULON' },
  { uid: 'c5WcxuExJmSIvmxMrygwXHwr0A83', nama: 'sdndua cipeujeuhwetan', email: 'sdnduacipeujeuhwetan@gmail.com', schoolName: 'SD NEGERI 2 CIPEUJEUH WETAN' },
  { uid: 'kdPlDz5cMaZQtMtsS4XDTZhjkQF2', nama: 'endang kasmara', email: 'endangkasmara679@gmail.com', schoolName: 'SD NEGERI 2 CIPEUJEUH WETAN' },
  { uid: 'sB0iLrghppTANSud1sJpmB4HlR82', nama: 'MAMAN JOHARI', email: 'mamanjohari0607@gmail.com', schoolName: 'SD NEGERI 1 BELAWA' },
];

const NOW = '2026-05-31T00:00:00Z';

const csvUsers: User[] = csvUserData.map((u) => ({
  uid: u.uid,
  nama: u.nama,
  email: u.email,
  role: 'operator' as const,
  schoolId: schoolId(u.schoolName),
  statusAktif: true,
  createdAt: NOW,
  mustChangePassword: true,
}));

export const mockUsers: User[] = [
  {
    uid: 'usr-admin',
    nama: 'Admin SPMB',
    email: 'admin@spmb.kec.id',
    role: 'admin',
    schoolId: '',
    statusAktif: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  ...csvUsers,
];

export const mockAnnouncements: Announcement[] = [
  {
    announcementId: 'ann-001',
    title: 'Pembukaan Pendaftaran SPMB SD 2026/2027',
    content: 'Diberitahukan kepada orang tua/wali calon siswa bahwa pendaftaran SPMB SD Tahun Ajaran 2026/2027 telah dibuka mulai tanggal 15 Januari 2026. Silakan melakukan pendaftaran melalui aplikasi SPMB SD atau datang langsung ke sekolah tujuan.',
    tahunAjaran: '2026/2027',
    statusPublikasi: 'publish',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    announcementId: 'ann-002',
    title: 'Jadwal Verifikasi Berkas',
    content: 'Verifikasi berkas pendaftaran akan dilaksanakan pada tanggal 1-15 Februari 2026 di masing-masing sekolah tujuan. Harap membawa dokumen asli sesuai dengan yang diupload.',
    tahunAjaran: '2026/2027',
    statusPublikasi: 'publish',
    createdAt: '2026-01-25T10:00:00Z',
  },
  {
    announcementId: 'ann-003',
    title: 'Pengumuman Hasil SPMB',
    content: 'Pengumuman hasil SPMB SD Tahun Ajaran 2026/2027 akan diumumkan pada tanggal 1 Maret 2026. Orang tua/wali dapat mengecek hasil melalui aplikasi SPMB SD.',
    tahunAjaran: '2026/2027',
    statusPublikasi: 'publish',
    createdAt: '2026-02-20T09:00:00Z',
  },
];

export const spmbSchedule = {
  pendaftaran: '15 Januari - 31 Januari 2026',
  verifikasi: '1 Februari - 15 Februari 2026',
  pengumuman: '1 Maret 2026',
  daftarUlang: '2 Maret - 15 Maret 2026',
};

export const syaratDokumen = [
  'Kartu Keluarga (KK)',
  'Akta Kelahiran',
  'KTP Orang Tua/Wali',
  'KIP/KKS/PKH (jika ada)',
  'Dokumen Pendukung (jika ada)',
];

export const jalurPendaftaran = [
  { id: 'domisili', nama: 'Jalur Domisili', kuota: 70, deskripsi: 'Calon siswa yang berdomisili di sekitar sekolah' },
  { id: 'afirmasi', nama: 'Jalur Afirmasi', kuota: 15, deskripsi: 'Calon siswa dari keluarga kurang mampu (KIP/KKS/PKH)' },
  { id: 'mutasi', nama: 'Jalur Mutasi', kuota: 15, deskripsi: 'Calon siswa orang tua pindah tugas' },
];

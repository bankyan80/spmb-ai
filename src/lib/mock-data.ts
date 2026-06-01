// SPMB SD 2026/2027 - Mock Data for Demo

import { School, Applicant, SettingsSPMB, User, Announcement } from './types';

const SCHOOL_COORDS: Record<string, [number, number]> = {
  '20215287': [-6.831667, 108.615000],
  '20215230': [-6.832500, 108.585556],
  '20215216': [-6.844444, 108.620000],
  '20214570': [-6.835556, 108.639722],
  '20214479': [-6.827222, 108.620556],
  '20214656': [-6.831389, 108.628056],
  '20214726': [-6.838611, 108.643611],
  '20215464': [-6.836111, 108.620278],
  '20215161': [-6.824444, 108.628611],
  '20215164': [-6.843611, 108.624444],
  '20215221': [-6.827222, 108.628333],
  '20215381': [-6.831944, 108.606944],
  '20215380': [-6.830556, 108.625556],
  '20215286': [-6.835278, 108.621111],
  '20215506': [-6.837500, 108.639722],
  '20215517': [-6.843333, 108.643056],
  '20215564': [-6.835556, 108.582222],
  '20246442': [-6.851556, 108.625444],
  '20246445': [-6.835000, 108.630000],
  '20215162': [-6.831944, 108.629444],
  '20215584': [-6.833889, 108.574722],
  '20244513': [-6.827206, 108.647168],
};

function coords(npsn: string): [number, number] {
  return SCHOOL_COORDS[npsn] || [-6.8333, 108.6333];
}

const SCHOOL_DATA: (Omit<School, 'schoolId' | 'latitude' | 'longitude'>)[] = [
  { npsn: '20215216', namaSekolah: 'SD NEGERI 1 ASEM', jenjang: 'SD', alamat: 'Jl. Raya Asem, Kec. Lemahabang', desa: 'Asem', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20215230', namaSekolah: 'SD NEGERI 1 BELAWA', jenjang: 'SD', alamat: 'Jl. Raya Belawa, Kec. Lemahabang', desa: 'Belawa', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20215287', namaSekolah: 'SD NEGERI 1 CIPEUJEUH KULON', jenjang: 'SD', alamat: 'Jl. Raya Cipeujeuh Kulon, Kec. Lemahabang', desa: 'Cipeujeuh Kulon', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20215286', namaSekolah: 'SD NEGERI 1 CIPEUJEUH WETAN', jenjang: 'SD', alamat: 'Jl. Raya Cipeujeuh Wetan, Kec. Lemahabang', desa: 'Cipeujeuh Wetan', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 80, sisaKuota: 80, statusAktif: true },
  { npsn: '20215162', namaSekolah: 'SD NEGERI 1 LEMAHABANG', jenjang: 'SD', alamat: 'Jl. Raya Lemahabang, Kec. Lemahabang', desa: 'Lemahabang', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 80, sisaKuota: 80, statusAktif: true },
  { npsn: '20215161', namaSekolah: 'SD NEGERI 1 LEMAHABANG KULON', jenjang: 'SD', alamat: 'Jl. Raya Lemahabang Kulon, Kec. Lemahabang', desa: 'Lemahabang Kulon', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 80, sisaKuota: 80, statusAktif: true },
  { npsn: '20215164', namaSekolah: 'SD NEGERI 1 LEUWIDINGDING', jenjang: 'SD', alamat: 'Jl. Raya Leuwidingding, Kec. Lemahabang', desa: 'Leuwidingding', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20246442', namaSekolah: 'SD NEGERI 1 PICUNGPUGUR', jenjang: 'SD', alamat: 'Jl. Raya Picungpugur, Kec. Lemahabang', desa: 'Picungpugur', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20215517', namaSekolah: 'SD NEGERI 1 SARAJAYA', jenjang: 'SD', alamat: 'Jl. Raya Sarajaya, Kec. Lemahabang', desa: 'Sarajaya', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20215506', namaSekolah: 'SD NEGERI 1 SIGONG', jenjang: 'SD', alamat: 'Jl. Raya Sigong, Kec. Lemahabang', desa: 'Sigong', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20215464', namaSekolah: 'SD NEGERI 1 SINDANGLAUT', jenjang: 'SD', alamat: 'Jl. Raya Sindang Laut, Kec. Lemahabang', desa: 'Sindang Laut', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20246445', namaSekolah: 'SD NEGERI 1 TUK KARANGSUWUNG', jenjang: 'SD', alamat: 'Jl. Raya Tuk Karangsuwung, Kec. Lemahabang', desa: 'Tuk Karangsuwung', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 80, sisaKuota: 80, statusAktif: true },
  { npsn: '20215584', namaSekolah: 'SD NEGERI 1 WANGKELANG', jenjang: 'SD', alamat: 'Jl. Raya Wangkelang, Kec. Lemahabang', desa: 'Wangkelang', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20215564', namaSekolah: 'SD NEGERI 2 BELAWA', jenjang: 'SD', alamat: 'Jl. Raya Belawa, Kec. Lemahabang', desa: 'Belawa', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20215381', namaSekolah: 'SD NEGERI 2 CIPEUJEUH KULON', jenjang: 'SD', alamat: 'Jl. Raya Cipeujeuh Kulon, Kec. Lemahabang', desa: 'Cipeujeuh Kulon', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 80, sisaKuota: 80, statusAktif: true },
  { npsn: '20215380', namaSekolah: 'SD NEGERI 2 CIPEUJEUH WETAN', jenjang: 'SD', alamat: 'Jl. Raya Cipeujeuh Wetan, Kec. Lemahabang', desa: 'Cipeujeuh Wetan', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20214656', namaSekolah: 'SD NEGERI 2 LEMAHABANG', jenjang: 'SD', alamat: 'Jl. Raya Lemahabang, Kec. Lemahabang', desa: 'Lemahabang', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 80, sisaKuota: 80, statusAktif: true },
  { npsn: '20214726', namaSekolah: 'SD NEGERI 2 SARAJAYA', jenjang: 'SD', alamat: 'Jl. Raya Sarajaya, Kec. Lemahabang', desa: 'Sarajaya', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20214479', namaSekolah: 'SD NEGERI 3 CIPEUJEUH WETAN', jenjang: 'SD', alamat: 'Jl. Raya Cipeujeuh Wetan, Kec. Lemahabang', desa: 'Cipeujeuh Wetan', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20214570', namaSekolah: 'SD NEGERI 3 SIGONG', jenjang: 'SD', alamat: 'Jl. Raya Sigong, Kec. Lemahabang', desa: 'Sigong', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20244513', namaSekolah: 'SD NEGERI 4 SIGONG', jenjang: 'SD', alamat: 'Jl. Raya Sigong, Kec. Lemahabang', desa: 'Sigong', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 40, sisaKuota: 40, statusAktif: true },
  { npsn: '20215221', namaSekolah: 'SDIT AL IRSYAD AL ISLAMIYAH', jenjang: 'SD', alamat: 'Jl. Raya Lemahabang, Kec. Lemahabang', desa: 'Lemahabang', kecamatan: 'Lemahabang', kabupaten: 'Cirebon', kuota: 160, sisaKuota: 160, statusAktif: true },
];

export const mockSchools: School[] = SCHOOL_DATA.map((s) => {
  const [lat, lng] = coords(s.npsn);
  return { ...s, schoolId: `sch-${s.npsn}`, latitude: lat, longitude: lng };
});

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
  {
    uid: 'usr-kecamatan',
    nama: 'Yanuar Hidayat',
    email: 'yanuarhidayat80@gmail.com',
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

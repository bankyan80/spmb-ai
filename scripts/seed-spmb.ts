#!/usr/bin/env npx tsx
/**
 * SPMB AI - Seed Database SPMB SD (Sekolah, Pemohon, Pengguna, Pengaturan)
 *
 * Penggunaan:
 *   npx tsx scripts/seed-spmb.ts              # Seed semua data default
 *   npx tsx scripts/seed-spmb.ts --reset       # Reset dan seed ulang
 *   npx tsx scripts/seed-spmb.ts --list        # Lihat daftar sekolah
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

const defaultSchools = [
  { npsn: '20215216', namaSekolah: 'SD NEGERI 1 ASEM', desa: 'Asem', kuota: 40 },
  { npsn: '20215230', namaSekolah: 'SD NEGERI 1 BELAWA', desa: 'Belawa', kuota: 40 },
  { npsn: '20215287', namaSekolah: 'SD NEGERI 1 CIPEUJEUH KULON', desa: 'Cipeujeuh Kulon', kuota: 40 },
  { npsn: '20215286', namaSekolah: 'SD NEGERI 1 CIPEUJEUH WETAN', desa: 'Cipeujeuh Wetan', kuota: 80 },
  { npsn: '20215162', namaSekolah: 'SD NEGERI 1 LEMAHABANG', desa: 'Lemahabang', kuota: 80 },
  { npsn: '20215161', namaSekolah: 'SD NEGERI 1 LEMAHABANG KULON', desa: 'Lemahabang Kulon', kuota: 80 },
  { npsn: '20215164', namaSekolah: 'SD NEGERI 1 LEUWIDINGDING', desa: 'Leuwidingding', kuota: 40 },
  { npsn: '20246442', namaSekolah: 'SD NEGERI 1 PICUNGPUGUR', desa: 'Picungpugur', kuota: 40 },
  { npsn: '20215517', namaSekolah: 'SD NEGERI 1 SARAJAYA', desa: 'Sarajaya', kuota: 40 },
  { npsn: '20215506', namaSekolah: 'SD NEGERI 1 SIGONG', desa: 'Sigong', kuota: 40 },
  { npsn: '20215464', namaSekolah: 'SD NEGERI 1 SINDANGLAUT', desa: 'Sindang Laut', kuota: 40 },
  { npsn: '20246445', namaSekolah: 'SD NEGERI 1 TUK KARANGSUWUNG', desa: 'Tuk Karangsuwung', kuota: 80 },
  { npsn: '20215584', namaSekolah: 'SD NEGERI 1 WANGKELANG', desa: 'Wangkelang', kuota: 40 },
  { npsn: '20215564', namaSekolah: 'SD NEGERI 2 BELAWA', desa: 'Belawa', kuota: 40 },
  { npsn: '20215381', namaSekolah: 'SD NEGERI 2 CIPEUJEUH KULON', desa: 'Cipeujeuh Kulon', kuota: 80 },
  { npsn: '20215380', namaSekolah: 'SD NEGERI 2 CIPEUJEUH WETAN', desa: 'Cipeujeuh Wetan', kuota: 40 },
  { npsn: '20214656', namaSekolah: 'SD NEGERI 2 LEMAHABANG', desa: 'Lemahabang', kuota: 80 },
  { npsn: '20214726', namaSekolah: 'SD NEGERI 2 SARAJAYA', desa: 'Sarajaya', kuota: 40 },
  { npsn: '20214479', namaSekolah: 'SD NEGERI 3 CIPEUJEUH WETAN', desa: 'Cipeujeuh Wetan', kuota: 40 },
  { npsn: '20214570', namaSekolah: 'SD NEGERI 3 SIGONG', desa: 'Sigong', kuota: 40 },
  { npsn: '20244513', namaSekolah: 'SD NEGERI 4 SIGONG', desa: 'Sigong', kuota: 40 },
  { npsn: '20215221', namaSekolah: 'SDIT AL IRSYAD AL ISLAMIYAH', desa: 'Lemahabang', kuota: 160 },
].map(s => {
  const [lat, lng] = SCHOOL_COORDS[s.npsn] || [-6.8333, 108.6333];
  return {
    schoolId: `SCH-${s.npsn}`,
    npsn: s.npsn,
    namaSekolah: s.namaSekolah,
    jenjang: 'SD',
    kecamatan: 'Lemahabang',
    kabupaten: 'Cirebon',
    alamat: `Jl. Raya ${s.desa}, Kec. Lemahabang`,
    desa: s.desa,
    latitude: lat,
    longitude: lng,
    kuota: s.kuota,
    sisaKuota: s.kuota,
    statusAktif: true,
  };
});

const defaultUsers = [
  { uid: 'admin-spmb', email: 'admin@spmb.ai', nama: 'Admin SPMB', role: 'admin', schoolId: null, statusAktif: true },
  { uid: 'operator-sdn1-lmh', email: 'operator1@spmb.ai', nama: 'Operator SDN 1 Lemahabang', role: 'operator', statusAktif: true },
  { uid: 'operator-sdn2-blw', email: 'operator2@spmb.ai', nama: 'Operator SDN 2 Belawa', role: 'operator', statusAktif: true },
];

async function main() {
  const args = process.argv.slice(2);
  const isReset = args.includes('--reset');
  const isList = args.includes('--list');

  if (isReset) {
    console.log('⚠️  Mereset data SPMB...');
    await prisma.reRegistration.deleteMany();
    await prisma.document.deleteMany();
    await prisma.applicant.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.chatAISettings.deleteMany();
    await prisma.user.deleteMany();
    await prisma.school.deleteMany();
    console.log('✅ Data SPMB direset');
  }

  if (isList) {
    const schools = await prisma.school.findMany({ orderBy: { namaSekolah: 'asc' } });
    console.log(`\n📋 Daftar Sekolah (${schools.length}):`);
    schools.forEach(s => {
      console.log(`   ${s.npsn} - ${s.namaSekolah} (kuota: ${s.kuota}, sisa: ${s.sisaKuota})`);
    });
    return;
  }

  // Seed Schools
  console.log('\n📚 Menambahkan data sekolah...');
  for (const school of defaultSchools) {
    const existing = await prisma.school.findUnique({ where: { npsn: school.npsn } });
    if (!existing) {
      const created = await prisma.school.create({ data: school });
      console.log(`  ✅ ${created.namaSekolah} (${created.npsn})`);
    } else {
      console.log(`  ⏭️  ${school.namaSekolah} sudah ada`);
    }
  }

  // Get schools for relations
  const schools = await prisma.school.findMany();

  // Seed Users
  console.log('\n👤 Menambahkan data pengguna...');
  for (const user of defaultUsers) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existing) {
      let schoolId: string | null = null;
      if (user.email === 'operator1@spmb.ai') {
        const sdn1 = schools.find(s => s.npsn === '20215082');
        schoolId = sdn1?.schoolId || null;
      } else if (user.email === 'operator2@spmb.ai') {
        const sdn2 = schools.find(s => s.npsn === '20215428');
        schoolId = sdn2?.schoolId || null;
      }
      await prisma.user.create({
        data: { ...user, schoolId },
      });
      console.log(`  ✅ ${user.email} (${user.role})`);
    } else {
      console.log(`  ⏭️  ${user.email} sudah ada`);
    }
  }

  // Seed Announcements
  console.log('\n📢 Menambahkan pengumuman...');
  const existingAnnouncements = await prisma.announcement.count();
  if (existingAnnouncements === 0) {
    await prisma.announcement.create({
      data: {
        announcementId: 'annc-pendaftaran-2025',
        title: 'Pembukaan Pendaftaran SPMB Tahun Ajaran 2025/2026',
        content: 'Diberitahukan kepada seluruh orang tua/wali calon siswa bahwa pendaftaran SPMB SD tahun ajaran 2025/2026 telah dibuka. Pendaftaran dilaksanakan secara online melalui aplikasi SPMB AI.',
        tahunAjaran: '2025/2026',
        statusPublikasi: 'published',
      },
    });
    await prisma.announcement.create({
      data: {
        announcementId: 'annc-jadwal-2025',
        title: 'Jadwal Seleksi SPMB 2025/2026',
        content: 'Pendaftaran: 1 Juni - 30 Juni 2026\nVerifikasi Berkas: 1 Juli - 15 Juli 2026\nPengumuman: 20 Juli 2026\nDaftar Ulang: 21 Juli - 31 Juli 2026',
        tahunAjaran: '2025/2026',
        statusPublikasi: 'published',
      },
    });
    console.log('  ✅ 2 pengumuman dibuat');
  } else {
    console.log('  ⏭️  Pengumuman sudah ada');
  }

  console.log('\n✅ Seeding SPMB selesai!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
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

const defaultSchools = [
  { namaSekolah: 'SDN 1 Cipeujeuh Kulon', npsn: '20215183', desa: 'Cipeujeuh Kulon', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 1 Cipeujeuh Wetan', npsn: '20215184', desa: 'Cipeujeuh Wetan', kecamatan: 'Lemahabang', kuota: 80 },
  { namaSekolah: 'SDN 1 Lemahabang', npsn: '20215082', desa: 'Lemahabang', kecamatan: 'Lemahabang', kuota: 80 },
  { namaSekolah: 'SDN 1 Lemahabang Kulon', npsn: '20215083', desa: 'Lemahabang Kulon', kecamatan: 'Lemahabang', kuota: 80 },
  { namaSekolah: 'SDN 1 Belawa', npsn: '20215079', desa: 'Belawa', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 1 Asem', npsn: '20215065', desa: 'Asem', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 1 Sigong', npsn: '20215064', desa: 'Sigong', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 1 Sindang Laut', npsn: '20215041', desa: 'Sindang Laut', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 1 Picung Pugur', npsn: '20215042', desa: 'Picung Pugur', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 1 Tuk Karangsuwung', npsn: '20215509', desa: 'Tuk Karangsuwung', kecamatan: 'Lemahabang', kuota: 80 },
  { namaSekolah: 'SDN 2 Cipeujeuh Kulon', npsn: '20215507', desa: 'Cipeujeuh Kulon', kecamatan: 'Lemahabang', kuota: 80 },
  { namaSekolah: 'SDN 2 Cipeujeuh Wetan', npsn: '20215508', desa: 'Cipeujeuh Wetan', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 2 Lemahabang Kulon', npsn: '20215444', desa: 'Lemahabang Kulon', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 2 Belawa', npsn: '20215428', desa: 'Belawa', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 2 Asem', npsn: '20215414', desa: 'Asem', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 2 Sigong', npsn: '20215413', desa: 'Sigong', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 2 Picung Pugur', npsn: '20215392', desa: 'Picung Pugur', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 2 Tuk Karangsuwung', npsn: '20215354', desa: 'Tuk Karangsuwung', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 3 Cipeujeuh Wetan', npsn: '20215355', desa: 'Cipeujeuh Wetan', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 3 Lemahabang Kulon', npsn: '20215341', desa: 'Lemahabang Kulon', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDN 4 Cipeujeuh Wetan', npsn: '20214695', desa: 'Cipeujeuh Wetan', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD IT Al Irsyad Al Islamiyyah', npsn: '20215221', desa: 'Lemahabang', kecamatan: 'Lemahabang', kuota: 160 },
].map(s => ({
  ...s,
  schoolId: `SCH-${s.npsn}`,
  jenjang: 'SD',
  alamat: `Jl. Raya ${s.desa}, Kec. Lemahabang`,
  latitude: -6.8333,
  longitude: 108.6333,
  sisaKuota: s.kuota,
  statusAktif: true,
}));

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
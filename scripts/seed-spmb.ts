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
  Asem: [-6.8350, 108.6250],
  Belawa: [-6.8400, 108.6400],
  'Cipeujeuh Kulon': [-6.8280, 108.6180],
  'Cipeujeuh Wetan': [-6.8250, 108.6300],
  Lemahabang: [-6.8333, 108.6350],
  'Lemahabang Kulon': [-6.8300, 108.6280],
  Leuwidingding: [-6.8380, 108.6450],
  Picungpugur: [-6.8420, 108.6500],
  Sarajaya: [-6.8450, 108.6550],
  Sigong: [-6.8200, 108.6200],
  'Sindang Laut': [-6.8480, 108.6600],
  'Tuk Karangsuwung': [-6.8180, 108.6150],
  Wangkelang: [-6.8500, 108.6650],
};

function coords(desa: string): [number, number] {
  return SCHOOL_COORDS[desa] || [-6.8333, 108.6333];
}

const defaultSchools = [
  { namaSekolah: 'SD NEGERI 1 ASEM', npsn: '20215216', desa: 'Asem', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 1 BELAWA', npsn: '20215230', desa: 'Belawa', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 1 CIPEUJEUH KULON', npsn: '20215287', desa: 'Cipeujeuh Kulon', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 1 CIPEUJEUH WETAN', npsn: '20215286', desa: 'Cipeujeuh Wetan', kecamatan: 'Lemahabang', kuota: 80 },
  { namaSekolah: 'SD NEGERI 1 LEMAHABANG', npsn: '20215162', desa: 'Lemahabang', kecamatan: 'Lemahabang', kuota: 80 },
  { namaSekolah: 'SD NEGERI 1 LEMAHABANG KULON', npsn: '20215161', desa: 'Lemahabang Kulon', kecamatan: 'Lemahabang', kuota: 80 },
  { namaSekolah: 'SD NEGERI 1 LEUWIDINGDING', npsn: '20215164', desa: 'Leuwidingding', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 1 PICUNGPUGUR', npsn: '20246442', desa: 'Picungpugur', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 1 SARAJAYA', npsn: '20215517', desa: 'Sarajaya', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 1 SIGONG', npsn: '20215506', desa: 'Sigong', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 1 SINDANGLAUT', npsn: '20215464', desa: 'Sindang Laut', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 1 TUK KARANGSUWUNG', npsn: '20246445', desa: 'Tuk Karangsuwung', kecamatan: 'Lemahabang', kuota: 80 },
  { namaSekolah: 'SD NEGERI 1 WANGKELANG', npsn: '20215584', desa: 'Wangkelang', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 2 BELAWA', npsn: '20215564', desa: 'Belawa', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 2 CIPEUJEUH KULON', npsn: '20215381', desa: 'Cipeujeuh Kulon', kecamatan: 'Lemahabang', kuota: 80 },
  { namaSekolah: 'SD NEGERI 2 CIPEUJEUH WETAN', npsn: '20215380', desa: 'Cipeujeuh Wetan', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 2 LEMAHABANG', npsn: '20214656', desa: 'Lemahabang', kecamatan: 'Lemahabang', kuota: 80 },
  { namaSekolah: 'SD NEGERI 2 SARAJAYA', npsn: '20214726', desa: 'Sarajaya', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 3 CIPEUJEUH WETAN', npsn: '20214479', desa: 'Cipeujeuh Wetan', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 3 SIGONG', npsn: '20214570', desa: 'Sigong', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SD NEGERI 4 SIGONG', npsn: '20244513', desa: 'Sigong', kecamatan: 'Lemahabang', kuota: 40 },
  { namaSekolah: 'SDIT AL IRSYAD AL ISLAMIYAH', npsn: '20215221', desa: 'Lemahabang', kecamatan: 'Lemahabang', kuota: 160 },
].map(s => ({
  ...s,
  schoolId: `SCH-${s.npsn}`,
  jenjang: 'SD',
  alamat: `Jl. Raya ${s.desa}, Kec. Lemahabang`,
  latitude: coords(s.desa)[0],
  longitude: coords(s.desa)[1],
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
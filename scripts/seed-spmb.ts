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
  {
    namaSekolah: 'SDN 1 Lemahabang',
    npsn: '20100011',
    jenjang: 'SD',
    alamat: 'Jl. Merdeka No. 10, Lemahabang',
    desa: 'Lemahabang',
    kecamatan: 'Lemahabang',
    latitude: -6.3617,
    longitude: 106.9086,
    kuota: 120,
    sisaKuota: 45,
    statusAktif: true,
  },
  {
    namaSekolah: 'SDN 2 Lemahabang',
    npsn: '20100012',
    jenjang: 'SD',
    alamat: 'Jl. Pendidikan No. 5, Lemahabang',
    desa: 'Lemahabang',
    kecamatan: 'Lemahabang',
    latitude: -6.3580,
    longitude: 106.9120,
    kuota: 100,
    sisaKuota: 22,
    statusAktif: true,
  },
  {
    namaSekolah: 'SDN 1 Belawa',
    npsn: '20100013',
    jenjang: 'SD',
    alamat: 'Jl. Belawa Raya No. 8, Belawa',
    desa: 'Belawa',
    kecamatan: 'Belawa',
    latitude: -6.3450,
    longitude: 106.8950,
    kuota: 80,
    sisaKuota: 38,
    statusAktif: true,
  },
  {
    namaSekolah: 'SDN 2 Belawa',
    npsn: '20100014',
    jenjang: 'SD',
    alamat: 'Jl. Sukamaju No. 3, Belawa',
    desa: 'Belawa',
    kecamatan: 'Belawa',
    latitude: -6.3420,
    longitude: 106.9000,
    kuota: 60,
    sisaKuota: 0,
    statusAktif: true,
  },
  {
    namaSekolah: 'SDN 1 Cikarang',
    npsn: '20100015',
    jenjang: 'SD',
    alamat: 'Jl. Cikarang Utama No. 12, Cikarang',
    desa: 'Cikarang',
    kecamatan: 'Cikarang',
    latitude: -6.3100,
    longitude: 107.1500,
    kuota: 150,
    sisaKuota: 78,
    statusAktif: true,
  },
  {
    namaSekolah: 'SDN 2 Cikarang',
    npsn: '20100016',
    jenjang: 'SD',
    alamat: 'Jl. Industri No. 7, Cikarang',
    desa: 'Cikarang',
    kecamatan: 'Cikarang',
    latitude: -6.3050,
    longitude: 107.1550,
    kuota: 90,
    sisaKuota: 15,
    statusAktif: true,
  },
];

const defaultUsers = [
  { email: 'admin@spmb.ai', nama: 'Admin SPMB', role: 'admin', schoolId: null, statusAktif: true },
  { email: 'operator1@spmb.ai', nama: 'Operator SDN 1 Lemahabang', role: 'operator', statusAktif: true },
  { email: 'operator2@spmb.ai', nama: 'Operator SDN 2 Belawa', role: 'operator', statusAktif: true },
];

async function main() {
  const args = process.argv.slice(2);
  const isReset = args.includes('--reset');
  const isList = args.includes('--list');

  if (isReset) {
    console.log('⚠️  Mereset data SPMB...');
    await prisma.verificationLog.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.parentAccess.deleteMany();
    await prisma.reRegistration.deleteMany();
    await prisma.document.deleteMany();
    await prisma.applicant.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.settingsSPMB.deleteMany();
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
        const sdn1 = schools.find(s => s.npsn === '20100011');
        schoolId = sdn1?.id || null;
      } else if (user.email === 'operator2@spmb.ai') {
        const sdn2 = schools.find(s => s.npsn === '20100014');
        schoolId = sdn2?.id || null;
      }
      await prisma.user.create({
        data: { ...user, schoolId },
      });
      console.log(`  ✅ ${user.email} (${user.role})`);
    } else {
      console.log(`  ⏭️  ${user.email} sudah ada`);
    }
  }

  // Seed Settings
  console.log('\n⚙️  Menambahkan pengaturan SPMB...');
  const existingSettings = await prisma.settingsSPMB.findFirst();
  if (!existingSettings) {
    await prisma.settingsSPMB.create({
      data: {
        tahunAjaran: '2025/2026',
        tanggalAcuanUsia: '2026-07-01',
        usiaMinimalSD: 6,
        usiaPrioritasSD: 7,
        usiaPengecualianBulan: 6,
        kuotaDomisili: 60,
        kuotaAfirmasi: 15,
        kuotaMutasi: 5,
        statusPendaftaran: 'dibuka',
      },
    });
    console.log('  ✅ Pengaturan SPMB dibuat');
  } else {
    console.log('  ⏭️  Pengaturan sudah ada');
  }

  // Seed Announcements
  console.log('\n📢 Menambahkan pengumuman...');
  const existingAnnouncements = await prisma.announcement.count();
  if (existingAnnouncements === 0) {
    await prisma.announcement.create({
      data: {
        title: 'Pembukaan Pendaftaran SPMB Tahun Ajaran 2025/2026',
        content: 'Diberitahukan kepada seluruh orang tua/wali calon siswa bahwa pendaftaran SPMB SD tahun ajaran 2025/2026 telah dibuka. Pendaftaran dilaksanakan secara online melalui aplikasi SPMB AI.',
        tahunAjaran: '2025/2026',
        statusPublikasi: 'published',
      },
    });
    await prisma.announcement.create({
      data: {
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
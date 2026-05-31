#!/usr/bin/env npx tsx
/**
 * SPMB SD 2026/2027 - Seed Database Lembaga PAUD (TK/PAUD/KB/RA)
 *
 * Penggunaan:
 *   npx tsx scripts/seed-lembaga.ts                    # Seed semua data default
 *   npx tsx scripts/seed-lembaga.ts --reset            # Reset dan seed ulang
 *   npx tsx scripts/seed-lembaga.ts --list             # Lihat daftar lembaga
 */

import { PrismaClient } from '@prisma/client';

// ============================================
// Data Lembaga PAUD Default (Kec. Lemahabang & sekitarnya)
// ============================================

const defaultLembaga = [
  {
    namaLembaga: 'TK Aisyiyah Lemahabang',
    npsn: '30100001',
    jenisLembaga: 'TK',
    alamat: 'Blok Manis, Lemahabang',
    desa: 'Karangsembung',
    kecamatan: 'Lemah Abang',
    kabupaten: 'Cirebon',
    provinsi: 'Jawa Barat',
    penanggungJawab: 'Muslimah',
    noTelp: null,
    email: 'tkaisyiyah.aisyiyah@yahoo.com',
    statusAktif: true,
  },
  {
    namaLembaga: 'PAUD Ceria Bangsa',
    npsn: '30100002',
    jenisLembaga: 'PAUD',
    alamat: 'Jl. Pendidikan No. 12, RT 002/RW 003',
    desa: 'Lemahabang',
    kecamatan: 'Lemah Abang',
    kabupaten: 'Cirebon',
    provinsi: 'Jawa Barat',
    penanggungJawab: 'Dra. Rina Wulandari',
    noTelp: '0231-881234',
    email: 'paud.ceria@spmb.kec.id',
    statusAktif: true,
  },
  {
    namaLembaga: 'KB Melati Harapan',
    npsn: '30100003',
    jenisLembaga: 'KB',
    alamat: 'Jl. Harapan No. 8, RT 005/RW 001',
    desa: 'Lemahabang',
    kecamatan: 'Lemah Abang',
    kabupaten: 'Cirebon',
    provinsi: 'Jawa Barat',
    penanggungJawab: 'Endang Sulistyowati, S.Pd',
    noTelp: '0231-881235',
    email: 'kb.melati@spmb.kec.id',
    statusAktif: true,
  },
  {
    namaLembaga: 'RA Al-Mukhlisin',
    npsn: '30100004',
    jenisLembaga: 'RA',
    alamat: 'Jl. Pesantren No. 3, RT 001/RW 004',
    desa: 'Lemahabang',
    kecamatan: 'Lemah Abang',
    kabupaten: 'Cirebon',
    provinsi: 'Jawa Barat',
    penanggungJawab: 'Ust. Ahmad Fauzi, S.Ag',
    noTelp: '0231-881236',
    email: 'ra.almukhlisin@spmb.kec.id',
    statusAktif: true,
  },
  {
    namaLembaga: 'TK Kartini Belawa',
    npsn: '30100005',
    jenisLembaga: 'TK',
    alamat: 'Jl. Kartini No. 20, RT 004/RW 002',
    desa: 'Belawa',
    kecamatan: 'Belawa',
    kabupaten: 'Cirebon',
    provinsi: 'Jawa Barat',
    penanggungJawab: 'Sri Mulyani, S.Pd',
    noTelp: '0231-881237',
    email: 'tk.kartini@spmb.kec.id',
    statusAktif: true,
  },
  {
    namaLembaga: 'PAUD Bunga Bangsa Belawa',
    npsn: '30100006',
    jenisLembaga: 'PAUD',
    alamat: 'Jl. Belawa Raya No. 15, RT 003/RW 005',
    desa: 'Belawa',
    kecamatan: 'Belawa',
    kabupaten: 'Cirebon',
    provinsi: 'Jawa Barat',
    penanggungJawab: 'Nurhasanah, S.Pd.I',
    noTelp: '0231-881238',
    email: 'paud.bungabangsa@spmb.kec.id',
    statusAktif: true,
  },
  {
    namaLembaga: 'KB Cendekia Cikarang',
    npsn: '30100007',
    jenisLembaga: 'KB',
    alamat: 'Jl. Cendekia No. 7, RT 006/RW 003',
    desa: 'Cikarang',
    kecamatan: 'Cikarang',
    kabupaten: 'Cirebon',
    provinsi: 'Jawa Barat',
    penanggungJawab: 'Dewi Kartika, M.Pd',
    noTelp: '0231-881239',
    email: 'kb.cendekia@spmb.kec.id',
    statusAktif: true,
  },
  {
    namaLembaga: 'TK Negeri Pembina Cikarang',
    npsn: '30100008',
    jenisLembaga: 'TK',
    alamat: 'Jl. Cikarang Utama No. 25, RT 002/RW 001',
    desa: 'Cikarang',
    kecamatan: 'Cikarang',
    kabupaten: 'Cirebon',
    provinsi: 'Jawa Barat',
    penanggungJawab: 'Hj. Ratna Dewi, S.Pd, M.Pd',
    noTelp: '0231-881240',
    email: 'tk.pembina@spmb.kec.id',
    statusAktif: true,
  },
];

// ============================================
// Main
// ============================================

async function main() {
  const prisma = new PrismaClient();
  const args = process.argv.slice(2);

  try {
    // --list: show all lembaga
    if (args.includes('--list')) {
      console.log('\n🏫 Daftar Lembaga PAUD:\n');
      const lembagaList = await prisma.lembagaPaud.findMany({
        orderBy: { kecamatan: 'asc' },
        include: { _count: { select: { siswa: true } } },
      });

      if (lembagaList.length === 0) {
        console.log('   (Belum ada data lembaga)');
      } else {
        lembagaList.forEach((l, i) => {
          console.log(`   ${i + 1}. ${l.namaLembaga}`);
          console.log(`      NPSN: ${l.npsn} | Jenis: ${l.jenisLembaga} | Desa: ${l.desa}, Kec. ${l.kecamatan}`);
          console.log(`      Jumlah Siswa: ${l._count.siswa} | Status: ${l.statusAktif ? 'Aktif' : 'Nonaktif'}`);
          console.log(`      ID: ${l.id}`);
          console.log('');
        });
        console.log(`   Total: ${lembagaList.length} lembaga`);
      }

      await prisma.$disconnect();
      return;
    }

    // --reset: clear all data
    if (args.includes('--reset')) {
      console.log('\n🔄 Mereset database...');
      await prisma.importLog.deleteMany();
      await prisma.siswaTK.deleteMany();
      await prisma.lembagaPaud.deleteMany();
      console.log('   ✅ Semua data lembaga dan siswa telah dihapus');
    }

    // Seed lembaga
    console.log('\n🌱 Menyimpan data lembaga PAUD...');

    let createdCount = 0;
    let skippedCount = 0;

    for (const lembaga of defaultLembaga) {
      const existing = await prisma.lembagaPaud.findUnique({
        where: { npsn: lembaga.npsn },
      });

      if (existing) {
        console.log(`   ⏭️  Skip ${lembaga.namaLembaga} (NPSN ${lembaga.npsn} sudah ada)`);
        skippedCount++;
        continue;
      }

      await prisma.lembagaPaud.create({ data: lembaga });
      console.log(`   ✅ ${lembaga.namaLembaga} (${lembaga.jenisLembaga}) - ${lembaga.desa}, ${lembaga.kecamatan}`);
      createdCount++;
    }

    console.log(`\n   Lembaga baru: ${createdCount} | Sudah ada: ${skippedCount}`);

    // Summary
    const totalLembaga = await prisma.lembagaPaud.count();
    const totalSiswa = await prisma.siswaTK.count();

    console.log('\n' + '═'.repeat(50));
    console.log('  📊 RINGKASAN DATABASE');
    console.log('═'.repeat(50));
    console.log(`  Total Lembaga PAUD : ${totalLembaga}`);
    console.log(`  Total Siswa TK     : ${totalSiswa}`);
    console.log('═'.repeat(50));

    console.log('\n💡 Sync data dari Google Sheet (Dapodik):');
    console.log('   npx tsx scripts/import-siswa.ts --sheet "GOOGLE_SHEET_URL" --npsn 30100001');
    console.log('   atau via API: POST /api/google-sheet-sync');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

'use client';

import React from 'react';
import {
  School,
  Users,
  Calendar,
  PieChart,
  Route,
  FileText,
  MessageSquare,
  Megaphone,
  MapPin,
  UserCog,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { StatCard } from '@/components/spmb/shared/stat-card';

export function AdminDashboardPage() {
  const store = useSpmbStore();
  const { applicants, schools, currentUser, navigateTo } = store;

  const totalPendaftar = applicants.length;
  const totalSekolah = schools.length;
  const terverifikasi = applicants.filter(
    (a) => a.statusPendaftaran === 'terverifikasi' || a.statusPendaftaran === 'diterima'
  ).length;
  const belumDiverifikasi = applicants.filter(
    (a) => a.statusPendaftaran === 'menunggu_verifikasi' || a.statusPendaftaran === 'terkirim'
  ).length;

  const menuItems = [
    {
      icon: <School className="size-5" />,
      title: 'Data Semua Sekolah',
      description: 'Kelola data sekolah dan NPSN',
      color: '#1565C0',
      page: 'school-management' as const,
    },
    {
      icon: <Users className="size-5" />,
      title: 'Data Semua Pendaftar',
      description: 'Lihat dan verifikasi pendaftar',
      color: '#009688',
      page: 'operator-applicants' as const,
    },
    {
      icon: <Calendar className="size-5" />,
      title: 'Pengaturan Jadwal SPMB',
      description: 'Atur jadwal dan tahun ajaran',
      color: '#7C3AED',
      page: 'schedule-management' as const,
    },
    {
      icon: <PieChart className="size-5" />,
      title: 'Pengaturan Kuota',
      description: 'Atur kuota per jalur & sekolah',
      color: '#F59E0B',
      page: 'quota-management' as const,
    },
    {
      icon: <Route className="size-5" />,
      title: 'Pengaturan Jalur Pendaftaran',
      description: 'Kelola jalur dan syarat masuk',
      color: '#EF4444',
      page: 'requirement-management' as const,
    },
    {
      icon: <FileText className="size-5" />,
      title: 'Pengaturan Syarat Dokumen',
      description: 'Kelola syarat dokumen pendaftaran',
      color: '#10B981',
      page: 'requirement-management' as const,
    },
    {
      icon: <MessageSquare className="size-5" />,
      title: 'Pengaturan Chat AI',
      description: 'Atur prompt dan respons AI',
      color: '#6366F1',
      page: 'prompt-ai-management' as const,
    },
    {
      icon: <Megaphone className="size-5" />,
      title: 'Pengumuman',
      description: 'Kelola pengumuman SPMB',
      color: '#EC4899',
      page: 'announcement-management' as const,
    },
    {
      icon: <MapPin className="size-5" />,
      title: 'Rekap Kecamatan/Kabupaten',
      description: 'Statistik pendaftar per wilayah',
      color: '#14B8A6',
      page: 'rekap' as const,
    },
    {
      icon: <UserCog className="size-5" />,
      title: 'Manajemen Akun Operator',
      description: 'Kelola akun operator sekolah',
      color: '#0D47A1',
      page: 'operator-account' as const,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Welcome message */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
        <p className="text-sm" style={{ color: '#6B7280' }}>
          Selamat datang,
        </p>
        <p className="text-lg md:text-xl font-bold" style={{ color: '#1F2937' }}>
          {currentUser?.nama || 'Admin'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
          Admin Kecamatan SPMB
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Total Pendaftar"
          value={totalPendaftar}
          icon={<Users className="size-5" />}
          color="#1565C0"
        />
        <StatCard
          title="Total Sekolah"
          value={totalSekolah}
          icon={<School className="size-5" />}
          color="#009688"
        />
        <StatCard
          title="Terverifikasi"
          value={terverifikasi}
          icon={<CheckCircle className="size-5" />}
          color="#43A047"
        />
        <StatCard
          title="Belum Diverifikasi"
          value={belumDiverifikasi}
          icon={<Clock className="size-5" />}
          color="#F59E0B"
        />
      </div>

      {/* Menu grid */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F2937' }}>
          Menu Admin
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {menuItems.map((item) => (
            <button
              key={item.title}
              onClick={() => navigateTo(item.page)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-left hover:shadow-md active:shadow-sm transition-shadow"
            >
              <div
                className="flex items-center justify-center size-10 rounded-xl mb-3"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <div style={{ color: item.color }}>{item.icon}</div>
              </div>
              <p className="text-xs font-semibold leading-tight" style={{ color: '#1F2937' }}>
                {item.title}
              </p>
              <p className="text-xs mt-1 leading-tight" style={{ color: '#9CA3AF' }}>
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

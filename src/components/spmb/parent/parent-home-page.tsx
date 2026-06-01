'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Baby,
  MapPin,
  ClipboardList,
  ClipboardCheck,
  Bell,
  CheckCircle,
  FileText,
  ChevronRight,
  EllipsisVertical,
  Shield,
} from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { SpmbHeader } from '@/components/spmb/shared/spmb-header';
import { BottomNavigation, type BottomTab } from '@/components/spmb/shared/bottom-navigation';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import type { AppPage } from '@/lib/types';

interface MenuCard {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  page: AppPage;
}

// Row 1: Cek Usia Anak, Cek Domisili
// Row 2: Daftar, Status Daftar
// Row 3: Pengumuman, Daftar Ulang
// Row 4: Info Pendaftaran (center/full width)
const menuCards: MenuCard[] = [
  {
    id: 'cek-usia',
    label: 'Cek Usia Anak',
    description: 'Periksa kelayakan usia',
    icon: Baby,
    color: '#009688',
    bgColor: '#E0F2F1',
    page: 'cek-usia',
  },
  {
    id: 'cek-domisili',
    label: 'Cek Domisili',
    description: 'Cari sekolah terdekat',
    icon: MapPin,
    color: '#43A047',
    bgColor: '#E8F5E9',
    page: 'cek-domisili',
  },
  {
    id: 'daftar',
    label: 'Daftar',
    description: 'Daftarkan anak Anda',
    icon: ClipboardList,
    color: '#1565C0',
    bgColor: '#E3F2FD',
    page: 'registration',
  },
  {
    id: 'status-daftar',
    label: 'Status Daftar',
    description: 'Lihat status pendaftaran',
    icon: ClipboardCheck,
    color: '#009688',
    bgColor: '#E0F2F1',
    page: 'status-daftar',
  },
  {
    id: 'pengumuman',
    label: 'Pengumuman',
    description: 'Hasil seleksi SPMB',
    icon: Bell,
    color: '#F59E0B',
    bgColor: '#FFF8E1',
    page: 'pengumuman',
  },
  {
    id: 'daftar-ulang',
    label: 'Daftar Ulang',
    description: 'Proses daftar ulang',
    icon: CheckCircle,
    color: '#43A047',
    bgColor: '#E8F5E9',
    page: 'daftar-ulang',
  },
];

const infoPendaftaran: MenuCard = {
  id: 'info-pendaftaran',
  label: 'Info Pendaftaran',
  description: 'Informasi lengkap pendaftaran SPMB SD',
  icon: FileText,
  color: '#0D47A1',
  bgColor: '#E3F2FD',
  page: 'info-pendaftaran',
};

export function ParentHomePage() {
  const { parentAccess, navigateTo } = useSpmbStore();

  const namaOrangTua = parentAccess?.namaOrangTua || 'Orang Tua/Wali';

  const handleMenuClick = (card: MenuCard) => {
    navigateTo(card.page);
  };

  const handleTabChange = (tab: BottomTab) => {
    const tabToPage: Record<BottomTab, AppPage> = {
      'beranda': 'beranda',
      'chat-ai': 'chat-ai',
      'daftar': 'registration',
      'status': 'status-daftar',
      'bantuan': 'bantuan',
    };
    navigateTo(tabToPage[tab]);
  };

  return (
    <div className="flex flex-col min-h-screen relative" style={{ backgroundColor: '#F3F8FF' }}>
      {/* Background image with overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/assets/images/anak_anak_ceria_di_halaman_sekolah.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(243,248,255,0.92) 0%, rgba(243,248,255,0.98) 50%, #F3F8FF 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
      <SpmbHeader
        title="SPMB SD 2026/2027"
        showBack={false}
        rightAction={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center size-9 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
                aria-label="Menu"
              >
                <EllipsisVertical className="size-5 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              <DropdownMenuItem onClick={() => navigateTo('petugas-login')}>
                <Shield className="size-4 mr-2" />
                Login Petugas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Main content */}
      <main className="flex-1 px-4 py-5 pb-20">
        {/* Welcome card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-5 mb-6 shadow-md"
          style={{
            background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-12 rounded-xl bg-white/20 shrink-0">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect x="4" y="10" width="20" height="14" rx="2" fill="white" opacity="0.3" />
                <path d="M2 12L14 4L26 12H2Z" fill="white" opacity="0.4" />
                <rect x="10" y="16" width="8" height="8" rx="1" fill="white" opacity="0.5" />
                <circle cx="14" cy="9" r="2" fill="white" opacity="0.5" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white/80 text-xs font-medium">Selamat datang,</p>
              <p className="text-white font-semibold text-base truncate">{namaOrangTua}</p>
            </div>
          </div>
          <p className="text-white/70 text-xs mt-3 leading-relaxed">
            Akses layanan SPMB SD Tahun Ajaran 2026/2027 melalui menu di bawah
          </p>
        </motion.div>

        {/* Menu Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F2937' }}>
            Menu Layanan
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {menuCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleMenuClick(card)}
                  className="flex flex-col items-center justify-center gap-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md active:shadow-sm min-h-[110px]"
                >
                  <div
                    className="flex items-center justify-center size-12 rounded-xl"
                    style={{
                      backgroundColor: card.bgColor,
                    }}
                  >
                    <Icon className="size-6" style={{ color: card.color }} strokeWidth={2} />
                  </div>
                  <span
                    className="text-xs font-semibold text-center leading-tight"
                    style={{ color: '#1F2937' }}
                  >
                    {card.label}
                  </span>
                  <span
                    className="text-[10px] text-center leading-tight"
                    style={{ color: '#9CA3AF' }}
                  >
                    {card.description}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Info Pendaftaran - Full width center */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleMenuClick(infoPendaftaran)}
            className="w-full mt-3 flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md"
            style={{
              borderLeft: `4px solid ${infoPendaftaran.color}`,
            }}
          >
            <div
              className="flex items-center justify-center size-12 rounded-xl shrink-0"
              style={{ backgroundColor: infoPendaftaran.bgColor }}
            >
              <FileText className="size-6" style={{ color: infoPendaftaran.color }} strokeWidth={2} />
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="font-semibold text-sm" style={{ color: '#1F2937' }}>
                {infoPendaftaran.label}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: '#9CA3AF' }}>
                {infoPendaftaran.description}
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0" style={{ color: '#9CA3AF' }} />
          </motion.button>
        </motion.div>

        {/* Chat AI Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-4"
        >
          <button
            onClick={() => navigateTo('chat-ai')}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 shadow-sm border transition-all hover:shadow-md active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #E3F2FD 0%, #E8F5E9 100%)',
              borderColor: '#90CAF950',
            }}
          >
            <div
              className="flex items-center justify-center size-10 rounded-xl shrink-0"
              style={{ backgroundColor: '#1565C015' }}
            >
              <MessageSquare className="size-5" style={{ color: '#1565C0' }} strokeWidth={2} />
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="font-semibold text-xs" style={{ color: '#1565C0' }}>
                Tanya SPMB SD
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: '#6B7280' }}>
                Tanyakan informasi seputar SPMB SD
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0" style={{ color: '#1565C0' }} />
          </button>
        </motion.div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="mt-4 rounded-xl p-4 border"
          style={{
            backgroundColor: '#FFF7ED',
            borderColor: '#F59E0B30',
          }}
        >
          <div className="flex items-start gap-3">
            <Bell className="size-5 shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#92400E' }}>
                Pendaftaran Dibuka!
              </p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: '#92400E' }}>
                SPMB SD Tahun Ajaran 2026/2027 telah dibuka. Segera daftarkan putra-putri Anda.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab="beranda" onTabChange={handleTabChange} />
      </div>
    </div>
  );
}

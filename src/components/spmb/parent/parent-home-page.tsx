'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  LogOut,
  MessageSquare,
  FileText,
  Baby,
  MapPin,
  ClipboardList,
  ClipboardCheck,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import { SpmbHeader } from '@/components/spmb/shared/spmb-header';
import type { AppPage } from '@/lib/types';

interface MenuCard {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  page: AppPage;
  isLarge?: boolean;
}

const menuCards: MenuCard[] = [
  {
    id: 'chat-ai',
    label: 'Chat AI',
    icon: MessageSquare,
    color: '#1565C0',
    page: 'chat-ai',
    isLarge: true,
  },
  {
    id: 'info-pendaftaran',
    label: 'Info Pendaftaran',
    icon: FileText,
    color: '#0D47A1',
    page: 'info-pendaftaran',
  },
  {
    id: 'cek-usia',
    label: 'Cek Usia Anak',
    icon: Baby,
    color: '#009688',
    page: 'cek-usia',
  },
  {
    id: 'cek-domisili',
    label: 'Cek Domisili',
    icon: MapPin,
    color: '#43A047',
    page: 'cek-domisili',
  },
  {
    id: 'daftar',
    label: 'Daftar',
    icon: ClipboardList,
    color: '#1565C0',
    page: 'registration',
  },
  {
    id: 'status-daftar',
    label: 'Status Daftar',
    icon: ClipboardCheck,
    color: '#009688',
    page: 'status-daftar',
  },
  {
    id: 'pengumuman',
    label: 'Pengumuman',
    icon: Bell,
    color: '#F59E0B',
    page: 'pengumuman',
  },
  {
    id: 'daftar-ulang',
    label: 'Daftar Ulang',
    icon: CheckCircle,
    color: '#43A047',
    page: 'daftar-ulang',
  },
];

export function ParentHomePage() {
  const { parentAccess, logout, navigateTo } = useSpmbStore();

  const namaOrangTua = parentAccess?.namaOrangTua || 'Orang Tua/Wali';

  const handleMenuClick = (card: MenuCard) => {
    navigateTo(card.page);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      {/* Header */}
      <SpmbHeader
        title="SPMB AI"
        showBack={false}
        rightAction={
          <button
            onClick={logout}
            className="flex items-center justify-center size-9 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
            aria-label="Keluar"
          >
            <LogOut className="size-5 text-white" />
          </button>
        }
      />

      {/* Main content */}
      <main className="flex-1 px-4 py-5 pb-4">
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
              <MessageSquare className="size-6 text-white" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white/80 text-xs font-medium">Selamat datang,</p>
              <p className="text-white font-semibold text-base truncate">{namaOrangTua}</p>
            </div>
          </div>
          <p className="text-white/70 text-xs mt-3 leading-relaxed">
            Gunakan menu di bawah untuk mengakses layanan SPMB SD Tahun Ajaran 2026/2027
          </p>
        </motion.div>

        {/* Quick menu grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#1F2937' }}>
            Menu Layanan
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {/* Chat AI - Large card spanning full width */}
            {menuCards.filter((c) => c.isLarge).map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleMenuClick(card)}
                  className="col-span-2 flex items-center gap-4 bg-white rounded-2xl p-5 shadow-md border border-gray-100 transition-all hover:shadow-lg"
                  style={{
                    borderLeft: `4px solid ${card.color}`,
                  }}
                >
                  <div
                    className="flex items-center justify-center size-14 rounded-xl shrink-0"
                    style={{
                      backgroundColor: `${card.color}12`,
                    }}
                  >
                    <Icon className="size-7" style={{ color: card.color }} strokeWidth={2} />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="font-semibold text-base" style={{ color: '#1F2937' }}>
                      {card.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                      Tanyakan apa saja tentang SPMB SD
                    </p>
                  </div>
                  <div
                    className="size-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${card.color}12` }}
                  >
                    <svg
                      className="size-4"
                      style={{ color: card.color }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </motion.button>
              );
            })}

            {/* Regular menu cards */}
            {menuCards.filter((c) => !c.isLarge).map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleMenuClick(card)}
                  className="flex flex-col items-center justify-center gap-2.5 bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md min-h-[100px]"
                  style={{
                    borderLeft: `3px solid ${card.color}`,
                  }}
                >
                  <div
                    className="flex items-center justify-center size-11 rounded-lg"
                    style={{
                      backgroundColor: `${card.color}12`,
                    }}
                  >
                    <Icon className="size-5" style={{ color: card.color }} />
                  </div>
                  <span
                    className="text-xs font-medium text-center leading-tight"
                    style={{ color: '#1F2937' }}
                  >
                    {card.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-5 rounded-xl p-4 border"
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

    </div>
  );
}

'use client';

import React from 'react';
import { useSpmbStore } from '@/lib/store';
import type { AppPage } from '@/lib/types';

interface QuickMenuItem {
  id: string;
  label: string;
  color: string;
  page: AppPage;
}

const menuItems: QuickMenuItem[] = [
  {
    id: 'info-pendaftaran',
    label: 'Info Pendaftaran',
    color: '#1565C0',
    page: 'info-pendaftaran',
  },
  {
    id: 'cek-usia',
    label: 'Cek Usia Anak',
    color: '#009688',
    page: 'cek-usia',
  },
  {
    id: 'cek-domisili',
    label: 'Cek Domisili',
    color: '#43A047',
    page: 'cek-domisili',
  },
  {
    id: 'daftar',
    label: 'Daftar',
    color: '#1565C0',
    page: 'registration',
  },
  {
    id: 'status-daftar',
    label: 'Status Daftar',
    color: '#009688',
    page: 'status-daftar',
  },
  {
    id: 'pengumuman',
    label: 'Pengumuman',
    color: '#F59E0B',
    page: 'pengumuman',
  },
  {
    id: 'daftar-ulang',
    label: 'Daftar Ulang',
    color: '#43A047',
    page: 'daftar-ulang',
  },
];

interface QuickMenuGridProps {
  onMenuClick?: (itemId: string) => void;
}

export function QuickMenuGrid({ onMenuClick }: QuickMenuGridProps) {
  const navigateTo = useSpmbStore((s) => s.navigateTo);

  const handleMenuClick = (item: QuickMenuItem) => {
    if (onMenuClick) {
      onMenuClick(item.id);
      return; // Don't navigate — parent component handles the action
    }
    navigateTo(item.page);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleMenuClick(item)}
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:shadow-sm active:scale-[0.97] focus:outline-none"
          style={{
            backgroundColor: `${item.color}10`,
            color: item.color,
            border: `1px solid ${item.color}25`,
          }}
          aria-label={item.label}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

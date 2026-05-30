'use client';

import React, { useState } from 'react';
import {
  Users,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useSpmbStore } from '@/lib/store';
import type { AppPage } from '@/lib/types';

interface NavItem {
  id: AppPage;
  label: string;
  icon: React.ElementType;
  section?: string;
}

const operatorNavItems: NavItem[] = [
  { id: 'operator-applicants', label: 'Data Pendaftar', icon: Users, section: 'Petugas Sekolah' },
];

interface OperatorLayoutProps {
  children: React.ReactNode;
}

export function OperatorLayout({ children }: OperatorLayoutProps) {
  const { currentPage, navigateTo, currentUser, logout } = useSpmbStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic page title for sub-pages not in nav
  const getDynamicPageTitle = (): string => {
    if (currentPage === 'applicant-detail') return 'Detail Pendaftar';
    if (currentPage === 'verification') return 'Verifikasi';
    return operatorNavItems.find((item) => item.id === currentPage)?.label || 'Petugas';
  };

  const pageTitle = getDynamicPageTitle();

  // Group nav items by section
  const sections = operatorNavItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || 'Lainnya';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const handleNavClick = (page: AppPage) => {
    navigateTo(page);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigateTo('chat-ai');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Title */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-white/15">
            <Shield className="size-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-white truncate">SPMB AI</h1>
            <p className="text-xs text-white/60">Petugas Sekolah</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
        {Object.entries(sections).map(([sectionName, items]) => (
          <div key={sectionName} className="mb-3">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {sectionName}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const isActive = currentPage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="size-[18px] shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User info & logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="flex items-center justify-center size-9 rounded-full bg-white/15 shrink-0">
            <span className="text-sm font-bold text-white">
              {currentUser?.nama?.charAt(0)?.toUpperCase() || 'P'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {currentUser?.nama || 'Petugas'}
            </p>
            <p className="text-xs text-white/50 truncate">
              {currentUser?.email || 'petugas@spmb.kec.id'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="size-[18px]" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F3F8FF' }}>
      {/* Desktop sidebar - fixed */}
      <aside
        className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30"
        style={{
          background: 'linear-gradient(180deg, #00796B 0%, #009688 100%)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Sidebar panel */}
          <aside
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 shadow-2xl transform transition-transform duration-300"
            style={{
              background: 'linear-gradient(180deg, #00796B 0%, #009688 100%)',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup menu"
            >
              <X className="size-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 md:hidden flex items-center gap-3 px-4 py-3 shadow-md"
          style={{
            background: 'linear-gradient(135deg, #009688 0%, #00796B 100%)',
            borderRadius: '0 0 16px 16px',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Buka menu"
          >
            <Menu className="size-5" />
          </button>
          <h1 className="text-lg font-semibold text-white truncate">{pageTitle}</h1>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

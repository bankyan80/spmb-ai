'use client';

import React from 'react';
import { Home, MessageSquare, FileText, ClipboardCheck, HelpCircle } from 'lucide-react';

export type BottomTab = 'beranda' | 'chat-ai' | 'daftar' | 'status' | 'bantuan';

interface BottomNavigationProps {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}

const tabs: { id: BottomTab; label: string; icon: React.ElementType }[] = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'chat-ai', label: 'Info AI', icon: MessageSquare },
  { id: 'daftar', label: 'Daftar', icon: FileText },
  { id: 'status', label: 'Status', icon: ClipboardCheck },
  { id: 'bantuan', label: 'Bantuan', icon: HelpCircle },
];

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom"
      style={{ boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors focus:outline-none active:scale-95"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className="size-5 transition-colors"
                style={{ color: isActive ? '#1565C0' : '#6B7280' }}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className="text-[10px] font-medium leading-tight transition-colors"
                style={{ color: isActive ? '#1565C0' : '#6B7280' }}
              >
                {tab.label}
              </span>
              {isActive && (
                <div
                  className="w-5 h-0.5 rounded-full mt-0.5"
                  style={{ backgroundColor: '#1565C0' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

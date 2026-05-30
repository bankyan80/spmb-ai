'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpmbHeaderProps {
  title: string;
  showBack: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function SpmbHeader({ title, showBack, onBack, rightAction }: SpmbHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 shadow-md"
      style={{
        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
        borderRadius: '0 0 16px 16px',
      }}
    >
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/10 active:bg-white/20 shrink-0"
            aria-label="Kembali"
          >
            <ArrowLeft className="size-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
      </div>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </header>
  );
}

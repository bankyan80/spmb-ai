'use client';

import React from 'react';
import { Bot } from 'lucide-react';

export function AiAvatar() {
  return (
    <div
      className="size-[60px] rounded-full flex items-center justify-center shrink-0 shadow-md"
      style={{
        background: 'linear-gradient(135deg, #009688 0%, #1565C0 100%)',
      }}
      aria-label="AI Assistant"
    >
      <Bot className="size-7 text-white" strokeWidth={2} />
    </div>
  );
}

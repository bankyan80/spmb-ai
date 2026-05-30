'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 p-4">
        <div
          className="flex items-center justify-center size-12 rounded-xl shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate" style={{ color: '#6B7280' }}>
            {title}
          </p>
          <p className="text-xl font-bold mt-0.5 truncate" style={{ color: '#1F2937' }}>
            {value}
          </p>
        </div>
      </div>
      {/* Color accent bar on left */}
      <div className="h-0.5 w-full" style={{ backgroundColor: color }} />
    </div>
  );
}

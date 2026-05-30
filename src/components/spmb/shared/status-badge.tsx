'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusLabel, getStatusBadgeColor } from '@/lib/business-logic';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = getStatusLabel(status);
  const colorClasses = getStatusBadgeColor(status);

  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${colorClasses}`}
    >
      {label}
    </Badge>
  );
}

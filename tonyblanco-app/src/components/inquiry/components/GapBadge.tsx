// components/inquiry/components/GapBadge.tsx
import React from 'react';
import type { GapPriority } from '../InquiryWidget.types';

interface GapBadgeProps {
  priority: GapPriority;
  count?: number;
  size?: 'sm' | 'md';
}

const PRIORITY_CONFIG = {
  critical: {
    icon: '🔴',
    label: 'Crítico',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  important: {
    icon: '🟡',
    label: 'Importante',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  optional: {
    icon: '🟢',
    label: 'Opcional',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
};

export const GapBadge: React.FC<GapBadgeProps> = ({ 
  priority, 
  count,
  size = 'sm' 
}) => {
  const config = PRIORITY_CONFIG[priority];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${config.color} ${config.bgColor} ${config.borderColor} ${sizeClasses}`}
      role="status"
      aria-label={`Prioridad: ${config.label}${count ? `, ${count} pendientes` : ''}`}
    >
      <span>{config.icon}</span>
      {count !== undefined && (
        <span className="font-semibold">{count}</span>
      )}
    </span>
  );
};

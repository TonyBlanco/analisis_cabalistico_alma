'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  userType?: string;
  className?: string;
}

export default function RoleBadge({ userType, className }: RoleBadgeProps) {
  if (!userType) {
    return null;
  }

  const roleConfig = {
    personal: {
      label: '👤 Personal',
      variant: 'default' as const,
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    therapist: {
      label: '👨‍⚕️ Terapeuta',
      variant: 'secondary' as const,
      className: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    patient: {
      label: '🏥 Paciente',
      variant: 'outline' as const,
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    visitor: {
      label: '👋 Visitante',
      variant: 'outline' as const,
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  };

  const config = roleConfig[userType as keyof typeof roleConfig] || {
    label: userType,
    variant: 'outline' as const,
    className: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
'use client';

import { motion } from 'framer-motion';
import { Sparkles, Calendar, User } from 'lucide-react';

interface SoulIdentityHeaderProps {
  userName?: string;
  birthDate?: string;
  reportDate?: Date;
}

export default function SoulIdentityHeader({
  userName = 'Alma Sagrada',
  birthDate,
  reportDate = new Date()
}: SoulIdentityHeaderProps) {
  // Parse birthDate correctly - backend sends DD/MM/YYYY format
  const parseBirthDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;
    
    // Try DD/MM/YYYY format first (backend format)
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Try YYYY-MM-DD format (ISO)
    const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) {
      const [, year, month, day] = iso;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Fallback to Date constructor (risky but last resort)
    return new Date(dateStr);
  };

  const birthDateObj = parseBirthDate(birthDate);
  const formattedBirthDate = birthDateObj
    ? birthDateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  const formattedReportDate = reportDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 p-8 md:p-12"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
      
      {/* Sacred geometry pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="sacred-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="2" fill="white" />
              <circle cx="0" cy="0" r="2" fill="white" />
              <circle cx="80" cy="0" r="2" fill="white" />
              <circle cx="0" cy="80" r="2" fill="white" />
              <circle cx="80" cy="80" r="2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sacred-grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Icon banner */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6 flex items-center justify-center"
        >
          <div className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-4 shadow-2xl shadow-purple-500/50">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-2 text-center text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent"
        >
          Mapa del Alma
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8 text-center text-2xl md:text-3xl font-semibold text-purple-200"
        >
          {userName}
        </motion.h2>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {birthDate && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-4"
            >
              <Calendar className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-xs text-purple-300 font-medium">Nacimiento</p>
                <p className="text-sm text-white">{formattedBirthDate}</p>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-4"
          >
            <User className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="text-xs text-indigo-300 font-medium">Reporte generado</p>
              <p className="text-sm text-white">{formattedReportDate}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

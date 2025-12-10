'use client';

import { TestModule, ACCESS_LEVEL_NAMES, ACCESS_HIERARCHY } from '@/lib/test-types';
import Link from 'next/link';

interface TestCardProps {
  test: TestModule;
  userLevel: string;
}

export default function TestCard({ test, userLevel }: TestCardProps) {
  const canAccess = test.is_available;
  const userAccess = test.user_access;
  
  // Calcular si está bloqueado por nivel
  const isLockedByLevel = !canAccess && (
    ACCESS_HIERARCHY[userLevel as keyof typeof ACCESS_HIERARCHY] <
    ACCESS_HIERARCHY[test.required_access_level as keyof typeof ACCESS_HIERARCHY]
  );
  
  // Calcular si alcanzó el límite mensual
  const hasReachedLimit = userAccess && 
    userAccess.monthly_limit !== null && 
    userAccess.current_month_uses >= userAccess.monthly_limit;

  return (
    <div className={`
      relative bg-gradient-to-br from-gray-900 to-gray-800 
      border rounded-xl p-6 transition-all duration-300
      ${canAccess && userAccess?.can_use 
        ? 'border-purple-500/30 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer' 
        : 'border-gray-700 opacity-60'
      }
    `}>
      {/* Badge de estado */}
      <div className="absolute top-4 right-4">
        {isLockedByLevel && (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
            🔒 Requiere {ACCESS_LEVEL_NAMES[test.required_access_level as keyof typeof ACCESS_LEVEL_NAMES]}
          </span>
        )}
        {hasReachedLimit && (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
            ⚠️ Límite alcanzado
          </span>
        )}
        {userAccess?.has_special_access && (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
            ⭐ Acceso especial
          </span>
        )}
      </div>

      {/* Icono del test */}
      <div className="mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-3xl">
          {test.icon || '📊'}
        </div>
      </div>

      {/* Información del test */}
      <h3 className="text-xl font-bold text-white mb-2">
        {test.name}
      </h3>
      
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {test.description}
      </p>

      {/* Estadísticas de uso */}
      {userAccess && (
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1 text-gray-400">
            <span>📈</span>
            <span>{userAccess.uses_count} usos</span>
          </div>
          
          {userAccess.monthly_limit !== null && (
            <div className="flex items-center gap-1 text-gray-400">
              <span>📅</span>
              <span>
                {userAccess.current_month_uses}/{userAccess.monthly_limit} este mes
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-gray-400">
            <span>⏱️</span>
            <span>{test.estimated_duration} min</span>
          </div>
        </div>
      )}

      {/* Botón de acción */}
      <div className="mt-4">
        {canAccess && userAccess?.can_use ? (
          <Link
            href={`/tests/${test.code}`}
            className="block w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg text-center hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Realizar Test
          </Link>
        ) : isLockedByLevel ? (
          <Link
            href="/pricing"
            className="block w-full px-4 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg text-center hover:bg-gray-600 transition-all"
          >
            Actualizar Plan
          </Link>
        ) : hasReachedLimit ? (
          <button
            disabled
            className="w-full px-4 py-2 bg-gray-800 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
          >
            Límite Alcanzado
          </button>
        ) : (
          <button
            disabled
            className="w-full px-4 py-2 bg-gray-800 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
          >
            No Disponible
          </button>
        )}
      </div>

      {/* Último uso */}
      {userAccess?.last_used && (
        <p className="text-xs text-gray-500 mt-2">
          Último uso: {new Date(userAccess.last_used).toLocaleDateString('es-ES')}
        </p>
      )}
    </div>
  );
}

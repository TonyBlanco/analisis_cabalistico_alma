'use client';

import { memo, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { SessionComparison as SessionComparisonType } from './timeline-types';
import type { RegionIntensity, HeatmapConfig } from './types';
import BodyVisualization2D from './BodyVisualization2D';

// ============================================
// SESSION COMPARISON COMPONENT
// PROMPT #7: Timeline y Comparación de Sesiones
// ============================================

interface SessionComparisonProps {
  comparison: SessionComparisonType;
  onClose: () => void;
}

/**
 * Side-by-side comparison of two sessions with heatmap visualization
 */
function SessionComparisonComponent({
  comparison,
  onClose,
}: SessionComparisonProps) {
  const { sessionA, sessionB, differences } = comparison;

  // Default heatmap config for comparison view (read-only)
  const heatmapConfig: HeatmapConfig = useMemo(
    () => ({
      enabled: true,
      showLabels: true,
      opacity: 0.6,
      colorScheme: 'default',
    }),
    []
  );

  // No-op handler for read-only visualization
  const handleRegionSelect = useCallback(() => {
    // Read-only in comparison mode
  }, []);

  // Calculate overall change summary
  const changeSummary = useMemo(() => {
    const totalChanges = differences.intensityChanges.length;
    const improvements = differences.intensityChanges.filter(
      (c) => c.changePercent < 0
    ).length;
    const worsenings = differences.intensityChanges.filter(
      (c) => c.changePercent > 0
    ).length;
    const unchanged = totalChanges - improvements - worsenings;

    return { improvements, worsenings, unchanged };
  }, [differences.intensityChanges]);

  // Handle keyboard close
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-title"
    >
      <div className="bio-card max-w-7xl w-full max-h-[95vh] overflow-y-auto rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3
              id="comparison-title"
              className="text-xl font-bold text-gray-900 flex items-center gap-2"
            >
              <span>🔍</span> Comparación de Sesiones
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Análisis lado a lado de evolución entre sesiones
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Cerrar comparación"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Side by Side Sessions */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Session A (Earlier) */}
            <SessionCard
              session={sessionA}
              label="A"
              labelColor="bg-blue-500"
              subtitle="Sesión anterior"
              heatmapData={sessionA.heatmapData}
              heatmapConfig={heatmapConfig}
              onRegionSelect={handleRegionSelect}
            />

            {/* Session B (Later) */}
            <SessionCard
              session={sessionB}
              label="B"
              labelColor="bg-purple-500"
              subtitle="Sesión posterior"
              heatmapData={sessionB.heatmapData}
              heatmapConfig={heatmapConfig}
              onRegionSelect={handleRegionSelect}
            />
          </div>

          {/* Differences Summary */}
          <div className="bio-card-glass rounded-2xl p-6 space-y-6">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <span>📊</span> Resumen de Cambios
            </h4>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickStat
                label="Nuevas Regiones"
                value={differences.newRegions.length}
                icon="✨"
                color="text-blue-600"
              />
              <QuickStat
                label="Resueltas"
                value={differences.resolvedRegions.length}
                icon="✅"
                color="text-green-600"
              />
              <QuickStat
                label="Persistentes"
                value={differences.persistentRegions.length}
                icon="🔄"
                color="text-amber-600"
              />
              <QuickStat
                label="Mejorías"
                value={changeSummary.improvements}
                icon="📉"
                color="text-emerald-600"
              />
            </div>

            {/* Detailed Changes */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* New Regions */}
              <RegionList
                title="Nuevas Regiones"
                icon="✨"
                regions={differences.newRegions}
                emptyText="Ninguna región nueva"
                badgeColor="bg-blue-100 text-blue-700"
              />

              {/* Resolved Regions */}
              <RegionList
                title="Regiones Resueltas"
                icon="✅"
                regions={differences.resolvedRegions}
                emptyText="Ninguna región resuelta"
                badgeColor="bg-green-100 text-green-700"
              />

              {/* Persistent Regions */}
              <RegionList
                title="Regiones Persistentes"
                icon="🔄"
                regions={differences.persistentRegions}
                emptyText="Ninguna región persistente"
                badgeColor="bg-amber-100 text-amber-700"
              />
            </div>

            {/* Intensity Changes */}
            {differences.intensityChanges.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-gray-600 mb-3 flex items-center gap-2">
                  <span>📈</span> Cambios de Intensidad
                </h5>
                <div className="space-y-2">
                  {differences.intensityChanges.map((change) => (
                    <IntensityChangeRow
                      key={change.regionId}
                      change={change}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interpretation Notes */}
          <div className="bio-card rounded-xl p-4 bg-indigo-50/50 border border-indigo-100">
            <h5 className="text-xs font-semibold text-indigo-800 mb-2 flex items-center gap-2">
              <span>💡</span> Guía de Interpretación
            </h5>
            <ul className="text-xs text-indigo-700 space-y-1">
              <li>
                • <strong>Nuevas regiones</strong>: Áreas que surgieron en la
                sesión B (posible manifestación somática nueva)
              </li>
              <li>
                • <strong>Regiones resueltas</strong>: Áreas que estaban en A
                pero no en B (posible liberación)
              </li>
              <li>
                • <strong>Persistentes</strong>: Áreas presentes en ambas
                sesiones (patrones crónicos o en proceso)
              </li>
              <li>
                • <strong>↓ Intensidad</strong>: Reducción de intensidad
                (mejoría)
              </li>
              <li>
                • <strong>↑ Intensidad</strong>: Aumento de intensidad
                (agravamiento o mayor conciencia)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

interface SessionCardProps {
  session: SessionComparisonType['sessionA'];
  label: string;
  labelColor: string;
  subtitle: string;
  heatmapData?: RegionIntensity[];
  heatmapConfig: HeatmapConfig;
  onRegionSelect: (regionId: string | null) => void;
}

function SessionCard({
  session,
  label,
  labelColor,
  subtitle,
  heatmapData,
  heatmapConfig,
  onRegionSelect,
}: SessionCardProps) {
  return (
    <div className="space-y-4">
      {/* Session Header */}
      <div className="bio-card-glass p-4 flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full ${labelColor} text-white flex items-center justify-center font-bold text-sm`}
        >
          {label}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{subtitle}</p>
          <p className="text-xs text-gray-600">
            {format(new Date(session.date), "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        {session.synthesisCompleted && (
          <span className="ml-auto bio-badge bio-badge-success text-xs">
            ✓ Completa
          </span>
        )}
      </div>

      {/* Body Visualization */}
      <div className="bio-card rounded-xl p-4">
        <BodyVisualization2D
          anatomy="unknown"
          selectedRegionId={null}
          onRegionSelect={onRegionSelect}
          heatmapData={heatmapData}
          heatmapConfig={heatmapConfig}
          disabled
        />
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bio-card rounded-lg p-2">
          <div className="text-lg font-bold text-gray-900">
            {session.observationsCount}
          </div>
          <div className="text-xs text-gray-500">Observaciones</div>
        </div>
        <div className="bio-card rounded-lg p-2">
          <div className="text-lg font-bold text-gray-900">
            {session.hypothesesCount}
          </div>
          <div className="text-xs text-gray-500">Hipótesis</div>
        </div>
        <div className="bio-card rounded-lg p-2">
          <div className="text-lg font-bold text-gray-900">
            {session.regionsObserved.length}
          </div>
          <div className="text-xs text-gray-500">Regiones</div>
        </div>
      </div>
    </div>
  );
}

interface QuickStatProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

function QuickStat({ label, value, icon, color }: QuickStatProps) {
  return (
    <div className="bio-card rounded-xl p-3 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

interface RegionListProps {
  title: string;
  icon: string;
  regions: string[];
  emptyText: string;
  badgeColor: string;
}

function RegionList({
  title,
  icon,
  regions,
  emptyText,
  badgeColor,
}: RegionListProps) {
  return (
    <div className="bio-card rounded-xl p-4">
      <p className="text-xs font-medium text-gray-600 mb-3 flex items-center gap-1">
        <span>{icon}</span> {title}
      </p>
      {regions.length === 0 ? (
        <p className="text-xs text-gray-400 italic">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {regions.map((region) => (
            <span
              key={region}
              className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}
            >
              {formatRegionLabel(region)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface IntensityChangeRowProps {
  change: {
    regionId: string;
    changePercent: number;
    emotionTypeA?: string;
    emotionTypeB?: string;
  };
}

function IntensityChangeRow({ change }: IntensityChangeRowProps) {
  const isImprovement = change.changePercent < 0;
  const isWorsening = change.changePercent > 0;

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">
          {formatRegionLabel(change.regionId)}
        </span>
        {change.emotionTypeA !== change.emotionTypeB && (
          <span className="text-xs text-gray-400">
            ({change.emotionTypeA} → {change.emotionTypeB})
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span
          className={`
            text-sm font-medium flex items-center gap-1
            ${isImprovement ? 'text-green-600' : ''}
            ${isWorsening ? 'text-red-600' : ''}
            ${!isImprovement && !isWorsening ? 'text-gray-600' : ''}
          `}
        >
          {isImprovement && '↓'}
          {isWorsening && '↑'}
          {!isImprovement && !isWorsening && '→'}
          <span>{Math.abs(change.changePercent)}%</span>
        </span>
      </div>
    </div>
  );
}

// Utility Functions

function formatRegionLabel(regionId: string): string {
  const labelMap: Record<string, string> = {
    head_front: 'Cabeza',
    head_back: 'Nuca',
    neck_front: 'Cuello',
    neck_back: 'Cervicales',
    chest_center: 'Pecho',
    chest_left: 'Pecho Izq.',
    chest_right: 'Pecho Der.',
    abdomen_upper: 'Abdomen Sup.',
    abdomen_lower: 'Abdomen Inf.',
    pelvis_front: 'Pelvis',
    shoulder_left: 'Hombro Izq.',
    shoulder_right: 'Hombro Der.',
    arm_left_upper: 'Brazo Izq.',
    arm_right_upper: 'Brazo Der.',
    arm_left_lower: 'Antebrazo Izq.',
    arm_right_lower: 'Antebrazo Der.',
    hand_left: 'Mano Izq.',
    hand_right: 'Mano Der.',
    leg_left_upper: 'Muslo Izq.',
    leg_right_upper: 'Muslo Der.',
    leg_left_lower: 'Pantorrilla Izq.',
    leg_right_lower: 'Pantorrilla Der.',
    foot_left: 'Pie Izq.',
    foot_right: 'Pie Der.',
    back_upper: 'Espalda Sup.',
    back_middle: 'Espalda Media',
    back_lower: 'Lumbar',
    buttocks: 'Glúteos',
  };

  return labelMap[regionId] || regionId.replace(/_/g, ' ');
}

const SessionComparison = memo(SessionComparisonComponent);
SessionComparison.displayName = 'SessionComparison';

export default SessionComparison;

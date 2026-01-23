'use client';

import { memo, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import type { EvolutionData } from './timeline-types';

// ============================================
// EVOLUTION CHARTS COMPONENT
// PROMPT #7: Timeline y Comparación de Sesiones
// ============================================

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface EvolutionChartsProps {
  data: EvolutionData;
}

/**
 * Charts showing evolution and trends across sessions
 */
function EvolutionChartsComponent({ data }: EvolutionChartsProps) {
  // Emotional Progression Line Chart Data
  const emotionalProgressionData = useMemo(
    () => ({
      labels: data.sessions.map((_, i) => `Sesión ${i + 1}`),
      datasets: [
        {
          label: 'Estado Emocional',
          data: data.sessions.map((s) => {
            switch (s.emotionalState) {
              case 'better':
                return 1;
              case 'same':
                return 0;
              case 'worse':
                return -1;
              default:
                return 0;
            }
          }),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: data.sessions.map((s) => {
            switch (s.emotionalState) {
              case 'better':
                return 'rgb(34, 197, 94)';
              case 'worse':
                return 'rgb(239, 68, 68)';
              case 'same':
                return 'rgb(234, 179, 8)';
              default:
                return 'rgb(156, 163, 175)';
            }
          }),
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    }),
    [data.sessions]
  );

  // Most Worked Regions Bar Chart Data
  const regionsData = useMemo(() => {
    const topRegions = data.trends.mostWorkedRegions.slice(0, 8);
    return {
      labels: topRegions.map((r) => formatRegionLabel(r.regionId)),
      datasets: [
        {
          label: 'Frecuencia',
          data: topRegions.map((r) => r.count),
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ],
          borderRadius: 6,
        },
      ],
    };
  }, [data.trends.mostWorkedRegions]);

  // Completion Rate Doughnut Chart Data
  const completionData = useMemo(
    () => ({
      labels: ['Completadas', 'Incompletas'],
      datasets: [
        {
          data: [
            data.trends.completionRate,
            100 - data.trends.completionRate,
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(229, 231, 235, 0.8)',
          ],
          borderWidth: 0,
        },
      ],
    }),
    [data.trends.completionRate]
  );

  // Observations per Session Line Chart Data
  const observationsData = useMemo(
    () => ({
      labels: data.sessions.map((_, i) => `S${i + 1}`),
      datasets: [
        {
          label: 'Observaciones',
          data: data.sessions.map((s) => s.observationsCount),
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Hipótesis',
          data: data.sessions.map((s) => s.hypothesesCount),
          borderColor: 'rgb(236, 72, 153)',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    }),
    [data.sessions]
  );

  if (data.sessions.length === 0) {
    return (
      <div className="bio-card-glass rounded-2xl p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm text-gray-500">
            No hay datos suficientes para mostrar gráficos
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Los gráficos aparecerán cuando haya al menos una sesión guardada
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="📊"
          label="Total Sesiones"
          value={data.sessions.length}
        />
        <StatCard
          icon="📝"
          label="Promedio Obs."
          value={data.trends.averageObservationsPerSession.toFixed(1)}
        />
        <StatCard
          icon="💡"
          label="Promedio Hip."
          value={data.trends.averageHypothesesPerSession.toFixed(1)}
        />
        <StatCard
          icon="✅"
          label="Tasa Completado"
          value={`${data.trends.completionRate.toFixed(0)}%`}
        />
      </div>

      {/* Emotional Progression */}
      <div className="bio-card-glass rounded-2xl p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📈</span> Progresión Emocional
        </h4>
        <div className="h-64">
          <Line
            data={emotionalProgressionData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const value = context.raw as number;
                      if (value === 1) return 'Mejoría';
                      if (value === 0) return 'Sin cambios';
                      if (value === -1) return 'Empeoramiento';
                      return 'No evaluado';
                    },
                  },
                },
              },
              scales: {
                y: {
                  min: -1.5,
                  max: 1.5,
                  ticks: {
                    callback: (value) => {
                      if (value === 1) return 'Mejor';
                      if (value === 0) return 'Igual';
                      if (value === -1) return 'Peor';
                      return '';
                    },
                    stepSize: 1,
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Two Column Layout for Bar and Doughnut */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Most Worked Regions */}
        <div className="bio-card-glass rounded-2xl p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📍</span> Regiones Más Trabajadas
          </h4>
          <div className="h-64">
            <Bar
              data={regionsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                  },
                  y: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bio-card-glass rounded-2xl p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>✅</span> Tasa de Completado
          </h4>
          <div className="h-64 flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut
                data={completionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '70%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.raw}%`,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Observations & Hypotheses Over Time */}
      <div className="bio-card-glass rounded-2xl p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📝</span> Observaciones e Hipótesis por Sesión
        </h4>
        <div className="h-64">
          <Line
            data={observationsData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Helper Components

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bio-card rounded-xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

// Utility Functions

function formatRegionLabel(regionId: string): string {
  // Convert region IDs like 'head_front' to 'Cabeza (frontal)'
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

const EvolutionCharts = memo(EvolutionChartsComponent);
EvolutionCharts.displayName = 'EvolutionCharts';

export default EvolutionCharts;

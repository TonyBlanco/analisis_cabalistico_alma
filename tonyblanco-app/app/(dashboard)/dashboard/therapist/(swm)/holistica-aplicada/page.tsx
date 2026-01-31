'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useActiveConsultante from '@/hooks/useActiveConsultante';
import { GenericAIAssistantPanel } from '@/components/ai';
import SoulIdentityHeader from '@/src/components/cabala/comprehensive-report/SoulIdentityHeader';
import ArcanaGrid from '@/src/components/cabala/comprehensive-report/ArcanaGrid';
import KarmicMatrix from '@/src/components/cabala/comprehensive-report/KarmicMatrix';
import VibrationTable from '@/src/components/cabala/comprehensive-report/VibrationTable';
import TreeWrapper from '@/src/components/cabala/comprehensive-report/TreeWrapper';
import LetrasDelAlma from '@/src/components/cabala/comprehensive-report/LetrasDelAlma';
import SacredGeometryLoader from '@/src/components/cabala/comprehensive-report/SacredGeometryLoader';

interface ComprehensiveReportData {
  status: string;
  report: {
    identidad?: {
      nombre?: string;
      fecha_nacimiento?: string;
    };
    numeros_principales?: any;
    inclusion_base?: any;
    vibraciones?: any;
    analisis_cabalista?: any[];
    recomendaciones?: any[];
    temas_clave?: any[];
  };
  user?: {
    username: string;
    id: number;
  };
}

export default function CabalaReportPage() {
  const router = useRouter();
  const consultante = useActiveConsultante();
  const [data, setData] = useState<ComprehensiveReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No estás autenticado. Por favor inicia sesión.');
          setLoading(false);
          return;
        }

        // Fallback: Try direct localStorage access if consultante not ready
        let patientId = consultante?.id;
        if (!patientId) {
          const storedId = localStorage.getItem('therapist_active_patient_id');
          if (storedId) {
            patientId = storedId;
            console.log('[Phoenix] Using fallback patient ID from localStorage:', patientId);
          }
        }

        if (!patientId) {
          setError('No hay un consultante seleccionado. Por favor selecciona un paciente primero.');
          setLoading(false);
          return;
        }

        console.log('[Phoenix] Fetching report for patient:', patientId);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/swm/cabala/comprehensive-report/?patient_id=${patientId}`,
          {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar el reporte');
        }

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        console.error('Error fetching report:', err);
        setError(err.message || 'Error al cargar el reporte');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();

    // Listen for patient changes
    const handlePatientChange = () => {
      console.log('[Phoenix] Patient changed, reloading report');
      setLoading(true);
      setError(null);
      fetchReport();
    };

    window.addEventListener('activePatientChanged', handlePatientChange);
    window.addEventListener('storage', handlePatientChange);

    return () => {
      window.removeEventListener('activePatientChanged', handlePatientChange);
      window.removeEventListener('storage', handlePatientChange);
    };
  }, [consultante?.id]);

  if (loading) {
    return <SacredGeometryLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-xl bg-red-900/20 border border-red-500/30 backdrop-blur-sm p-8 text-center"
        >
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Error al cargar el reporte
          </h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>
        </motion.div>
      </div>
    );
  }

  if (!data || !data.report) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <p>No hay datos disponibles para generar el reporte.</p>
        </div>
      </div>
    );
  }

  const { report, user } = data;
  const {
    identidad,
    numeros_principales,
    inclusion_base,
    vibraciones,
    analisis_cabalista,
    recomendaciones
  } = report;

  const userName = identidad?.nombre || user?.username || 'Alma Sagrada';
  const birthDate = identidad?.fecha_nacimiento;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Fixed header with back button */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <SoulIdentityHeader
          userName={userName}
          birthDate={birthDate}
        />

        {/* Arcana Cards */}
        {numeros_principales && (
          <ArcanaGrid
            esencia={numeros_principales.esencia}
            expresion={numeros_principales.expresion}
            herencia={numeros_principales.herencia}
            destino={numeros_principales.destino}
            caminoVida={numeros_principales.camino_vida}
          />
        )}

        {/* Karmic Matrix */}
        {inclusion_base && (
          <KarmicMatrix inclusion={inclusion_base} />
        )}

        {/* Tree of Life */}
        {numeros_principales && (
          <TreeWrapper numeros_principales={numeros_principales} />
        )}

        {/* Vibrations */}
        {vibraciones && (
          <VibrationTable vibraciones={vibraciones} />
        )}

        {/* Letters of the Soul */}
        <LetrasDelAlma nombre={userName} />
        
        {/* Panel de IA Holística */}
        <GenericAIAssistantPanel
          moduleType="holistica"
          moduleTitle="Holística Aplicada"
          consultanteId={consultante?.id}
          context={{
            consultante_name: userName,
            birth_date: birthDate,
            has_numeros: Boolean(numeros_principales),
            has_inclusion: Boolean(inclusion_base),
            module: 'holistica-aplicada',
          }}
          className="mx-auto max-w-4xl"
        />

        {/* Kabbalistic Analysis */}
        {analisis_cabalista && analisis_cabalista.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                🌳 Análisis del Árbol de la Vida
              </h2>
              <p className="text-purple-300">
                Interpretación espiritual de tu mapa cabalístico
              </p>
            </div>

            <div className="space-y-4">
              {analisis_cabalista.map((item: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-purple-500/30 p-6"
                >
                  <h4 className="text-xl font-bold text-purple-300 mb-3">
                    {item.aspecto}
                  </h4>
                  <p className="text-gray-300 mb-3">{item.descripcion}</p>
                  {item.consejo && (
                    <p className="text-sm text-blue-400 flex items-start gap-2">
                      <span className="text-xl">💡</span>
                      <span>{item.consejo}</span>
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {recomendaciones && recomendaciones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 backdrop-blur-sm p-8"
          >
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              💎 Recomendaciones Espirituales
            </h2>
            <div className="space-y-3">
              {recomendaciones.map((rec: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="rounded-lg bg-slate-900/50 p-4 border border-white/10"
                >
                  {typeof rec === 'object' && rec !== null ? (
                    <>
                      {rec.categoria && (
                        <p className="font-bold text-blue-300 mb-2">
                          {rec.categoria}
                        </p>
                      )}
                      {rec.sugerencia && (
                        <p className="text-gray-200">{rec.sugerencia}</p>
                      )}
                      {rec.descripcion && (
                        <p className="text-gray-300 mt-1">{rec.descripcion}</p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-start gap-3">
                      <span className="text-blue-400 text-xl flex-shrink-0">✓</span>
                      <span className="text-gray-200">{rec}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer spacer */}
        <div className="h-12" />
      </div>
    </div>
  );
}

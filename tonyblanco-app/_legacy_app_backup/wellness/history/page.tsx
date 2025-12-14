'use client';

import { useState, useEffect } from 'react';
import { 
  loadHistory, 
  getSystemTrend, 
  compareTests,
  deleteTest,
  exportHistory,
  importHistory,
  getHistoryStats,
  type WellnessTestResult 
} from '@/lib/wellness-persistence';
import { downloadWellnessPDF } from '@/lib/wellness-pdf-generator';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Trash2, 
  Upload,
  FileUp,
  Calendar,
  Clock,
  Activity 
} from 'lucide-react';
import Link from 'next/link';

export default function WellnessHistoryPage() {
  const [history, setHistory] = useState<WellnessTestResult[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = () => {
    const historyData = loadHistory();
    setHistory(historyData.tests);
    
    if (historyData.tests.length > 0) {
      const statsData = getHistoryStats();
      setStats(statsData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Seguro que quieres eliminar este test?')) {
      deleteTest(id);
      loadHistoryData();
    }
  };

  const handleExport = () => {
    const jsonData = exportHistory();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-bienestar-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        importHistory(jsonData);
        loadHistoryData();
        setShowImport(false);
        alert('Historial importado exitosamente');
      } catch (error) {
        alert('Error al importar el historial');
      }
    };
    reader.readAsText(file);
  };

  const handleSelectTest = (id: string) => {
    if (selectedTests.includes(id)) {
      setSelectedTests(selectedTests.filter(t => t !== id));
    } else if (selectedTests.length < 2) {
      setSelectedTests([...selectedTests, id]);
    }
  };

  const handleCompare = () => {
    if (selectedTests.length === 2) {
      const comparisonData = compareTests(selectedTests[0], selectedTests[1]);
      setComparison(comparisonData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Óptimo': return 'bg-green-500';
      case 'Normal': return 'bg-blue-500';
      case 'Regular': return 'bg-orange-500';
      case 'Crítico': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/wellness"
            className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Test
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-2">Historial de Tests</h1>
          <p className="text-gray-400">Seguimiento de tu bienestar a lo largo del tiempo</p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Total de Tests</h3>
              </div>
              <p className="text-3xl font-bold text-purple-400">{stats.totalTests}</p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Tiempo Promedio</h3>
              </div>
              <p className="text-3xl font-bold text-blue-400">{stats.averageCompletionTime} min</p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-bold text-white">Mejorando</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">{stats.systemsImprovedCount}</p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-6 h-6 text-orange-400" />
                <h3 className="text-lg font-bold text-white">A Mejorar</h3>
              </div>
              <p className="text-3xl font-bold text-orange-400">{stats.systemsWorsenedCount}</p>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={handleExport}
            disabled={history.length === 0}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Exportar Historial
          </button>

          <button
            onClick={() => setShowImport(!showImport)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all duration-300 flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Importar Historial
          </button>

          {selectedTests.length === 2 && (
            <button
              onClick={handleCompare}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Comparar Seleccionados
            </button>
          )}
        </div>

        {/* Import Box */}
        {showImport && (
          <div className="mb-8 bg-purple-900/30 border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Importar Historial</h3>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 text-white rounded-lg"
            />
          </div>
        )}

        {/* Comparison Results */}
        {comparison && (
          <div className="mb-8 bg-gradient-to-br from-slate-900/50 to-purple-900/30 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Comparación de Tests</h3>
            <div className="space-y-3">
              {comparison.systems.map((sys: any, idx: number) => (
                <div key={idx} className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white">{sys.system}</h4>
                    {sys.improved ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Anterior</p>
                      <p className="text-white font-bold">{sys.oldPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Actual</p>
                      <p className="text-white font-bold">{sys.newPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Cambio</p>
                      <p className={`font-bold ${sys.improved ? 'text-green-400' : 'text-red-400'}`}>
                        {sys.change > 0 ? '+' : ''}{sys.change}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg font-bold text-white">
                {comparison.overallImprovement ? (
                  <span className="text-green-400">✓ Mejora General Detectada</span>
                ) : (
                  <span className="text-orange-400">⚠ Requiere Más Atención</span>
                )}
              </p>
            </div>
            <button
              onClick={() => {
                setComparison(null);
                setSelectedTests([]);
              }}
              className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cerrar Comparación
            </button>
          </div>
        )}

        {/* Lista de Tests */}
        {history.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-purple-500/30 p-12 text-center">
            <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No hay tests en el historial</h3>
            <p className="text-gray-500 mb-6">Realiza tu primer test de bienestar para comenzar</p>
            <Link
              href="/wellness"
              className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all duration-300"
            >
              Realizar Test
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((test) => (
              <div 
                key={test.id} 
                className={`bg-slate-900/50 backdrop-blur-md rounded-xl border ${
                  selectedTests.includes(test.id) ? 'border-purple-500' : 'border-purple-500/30'
                } p-6 transition-all duration-300 ${
                  selectedTests.length < 2 ? 'cursor-pointer hover:border-purple-500/50' : ''
                }`}
                onClick={() => selectedTests.length < 2 && handleSelectTest(test.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <h3 className="text-lg font-bold text-white">
                          {new Date(test.timestamp).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(test.timestamp).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} • Completado en {test.completedIn} minutos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadWellnessPDF(test);
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                      title="Descargar PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(test.id);
                      }}
                      className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Sistemas */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {test.systemScores.map((sys, idx) => (
                    <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">{sys.system}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-white">{sys.percentage}%</p>
                        <span className={`w-3 h-3 rounded-full ${getStatusColor(sys.status)}`}></span>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTests.includes(test.id) && (
                  <div className="mt-4 text-center text-purple-400 font-bold">
                    ✓ Seleccionado para comparación
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

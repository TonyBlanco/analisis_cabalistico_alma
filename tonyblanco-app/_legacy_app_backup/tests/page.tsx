'use client';

import { useRouter } from 'next/navigation';
import { TESTS_DB } from '@/data/tests-questions';
import { 
  Heart, Brain, AlertCircle, Activity, 
  Moon, Eye, FileText, ClipboardList,
  TestTube, Pill, UtensilsCrossed, Shield,
  Zap, TrendingUp, ArrowLeft
} from 'lucide-react';

interface TestCategory {
  name: string;
  icon: React.ReactNode;
  tests: string[];
  color: string;
  iconColor: string;
}

const TEST_CATEGORIES: TestCategory[] = [
  {
    name: 'Depresión y Ansiedad',
    icon: <Heart className="h-5 w-5" />,
    color: 'from-blue-500/20 to-purple-500/20',
    iconColor: '#A8DADC',
    tests: ['phq-9', 'bdi-ii', 'gad-7', 'bai', 'stai']
  },
  {
    name: 'Diagnóstico Específico',
    icon: <Brain className="h-5 w-5" />,
    color: 'from-red-500/20 to-orange-500/20',
    iconColor: '#D4AF37',
    tests: ['ptsd', 'ptsd-pcl5', 'ocd', 'adhd', 'insomnia']
  },
  {
    name: 'Personalidad y Evaluación',
    icon: <FileText className="h-5 w-5" />,
    color: 'from-green-500/20 to-teal-500/20',
    iconColor: '#A8DADC',
    tests: ['pai', 'scl-90-r', 'scid-5-rv']
  },
  {
    name: 'Screening y Detección',
    icon: <Shield className="h-5 w-5" />,
    color: 'from-yellow-500/20 to-amber-500/20',
    iconColor: '#D4AF37',
    tests: ['substance', 'eating']
  }
];

const TEST_ICONS: Record<string, React.ReactNode> = {
  'phq-9': <Heart className="h-6 w-6" />,
  'bdi-ii': <Heart className="h-6 w-6" />,
  'gad-7': <AlertCircle className="h-6 w-6" />,
  'bai': <AlertCircle className="h-6 w-6" />,
  'stai': <Activity className="h-6 w-6" />,
  'ptsd': <Shield className="h-6 w-6" />,
  'ptsd-pcl5': <Shield className="h-6 w-6" />,
  'ocd': <Brain className="h-6 w-6" />,
  'adhd': <Zap className="h-6 w-6" />,
  'insomnia': <Moon className="h-6 w-6" />,
  'pai': <FileText className="h-6 w-6" />,
  'scl-90-r': <ClipboardList className="h-6 w-6" />,
  'scid-5-rv': <TestTube className="h-6 w-6" />,
  'substance': <Pill className="h-6 w-6" />,
  'eating': <UtensilsCrossed className="h-6 w-6" />
};

// Alternar colores para iconos
const getIconColor = (index: number): string => {
  return index % 2 === 0 ? '#D4AF37' : '#A8DADC';
};

export default function TestsCatalogPage() {
  const router = useRouter();

  const handleTestClick = (testId: string) => {
    if (testId === 'ptsd-pcl5') {
      router.push('/ptsd-pcl5');
    } else {
      router.push(`/tests/${testId}`);
    }
  };

  const allTests = Object.keys(TESTS_DB);

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-light title-font mb-2" style={{ color: '#E2E8F0' }}>
                Catálogo de <span style={{ color: '#D4AF37' }}>Tests Psicológicos</span>
              </h1>
              <p className="text-lg body-font" style={{ color: '#E2E8F0', opacity: 0.7 }}>
                Evaluaciones clínicas con análisis cabalístico del alma
              </p>
            </div>
            
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all body-font glass-card glass-card-hover"
              style={{ color: '#E2E8F0' }}
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al Inicio
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass-card rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm body-font mb-1" style={{ color: '#E2E8F0', opacity: 0.6 }}>
                    Total de Tests
                  </p>
                  <p className="text-3xl font-light title-font" style={{ color: '#E2E8F0' }}>
                    {allTests.length}
                  </p>
                </div>
                <ClipboardList className="h-10 w-10" style={{ color: '#D4AF37' }} />
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm body-font mb-1" style={{ color: '#E2E8F0', opacity: 0.6 }}>
                    Categorías
                  </p>
                  <p className="text-3xl font-light title-font" style={{ color: '#E2E8F0' }}>
                    {TEST_CATEGORIES.length}
                  </p>
                </div>
                <Brain className="h-10 w-10" style={{ color: '#A8DADC' }} />
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm body-font mb-1" style={{ color: '#E2E8F0', opacity: 0.6 }}>
                    Análisis Disponibles
                  </p>
                  <p className="text-3xl font-light title-font" style={{ color: '#E2E8F0' }}>
                    100%
                  </p>
                </div>
                <TrendingUp className="h-10 w-10" style={{ color: '#D4AF37' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tests por Categoría */}
        {TEST_CATEGORIES.map((category) => {
          const categoryTests = category.tests
            .filter(testId => TESTS_DB[testId])
            .map(testId => ({ id: testId, ...TESTS_DB[testId] }));

          if (categoryTests.length === 0) return null;

          return (
            <div key={category.name} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="p-2 rounded-lg border border-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${category.iconColor}20, ${category.iconColor}10)`,
                    color: category.iconColor
                  }}
                >
                  {category.icon}
                </div>
                <h2 className="text-2xl sm:text-3xl font-light title-font" style={{ color: '#E2E8F0' }}>
                  {category.name}
                </h2>
                <span className="text-sm body-font" style={{ color: '#E2E8F0', opacity: 0.5 }}>
                  ({categoryTests.length} tests)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTests.map((test, index) => (
                  <div
                    key={test.id}
                    className="group relative rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 border border-white/10"
                    style={{
                      background: '#111111',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    {/* Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="p-3 rounded-lg border border-white/10"
                        style={{
                          background: `linear-gradient(135deg, ${getIconColor(index)}20, ${getIconColor(index)}10)`,
                          color: getIconColor(index)
                        }}
                      >
                        {TEST_ICONS[test.id] || <FileText className="h-6 w-6" />}
                      </div>
                      <span 
                        className="text-xs body-font px-2 py-1 rounded border border-white/10"
                        style={{ 
                          background: 'rgba(10, 10, 31, 0.4)',
                          color: '#E2E8F0',
                          opacity: 0.7
                        }}
                      >
                        {test.questions.length} preguntas
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-light title-font mb-2 transition-colors" style={{ color: '#E2E8F0' }}>
                      {test.title}
                    </h3>
                    <p className="text-sm body-font mb-4 line-clamp-2" style={{ color: '#E2E8F0', opacity: 0.7 }}>
                      {test.description}
                    </p>

                    {/* Button */}
                    <button
                      onClick={() => handleTestClick(test.id)}
                      className="w-full py-3 px-4 rounded-lg font-semibold body-font transition-all duration-300 hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${getIconColor(index)} 0%, ${getIconColor(index)}CC 100%)`,
                        color: '#050505',
                        boxShadow: `0 4px 15px ${getIconColor(index)}30`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 6px 20px ${getIconColor(index)}50`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 4px 15px ${getIconColor(index)}30`;
                      }}
                    >
                      Iniciar Test
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer Info */}
        <div className="mt-12 rounded-xl p-6 border border-white/10 glass-card">
          <div className="flex items-start gap-4">
            <div 
              className="p-2 rounded-lg border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1))',
                color: '#D4AF37'
              }}
            >
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-light title-font mb-2" style={{ color: '#E2E8F0' }}>
                Sobre los Tests
              </h3>
              <p className="text-sm body-font leading-relaxed" style={{ color: '#E2E8F0', opacity: 0.7 }}>
                Todos los tests incluyen un análisis clínico estándar y un análisis cabalístico del alma. 
                Cada evaluación proporciona diagnósticos clínicos basados en baremos estandarizados, 
                junto con interpretaciones espirituales que conectan los síntomas con las Sefirot, 
                conceptos cabalísticos y ángeles remedio para la sanación.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .title-font { font-family: 'Cormorant Garamond', serif; }
        .body-font { font-family: 'Spartan', sans-serif; }
        
        .glass-card {
          background: rgba(10, 10, 31, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .glass-card-hover {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .glass-card-hover:hover {
          background: rgba(10, 10, 31, 0.6);
          border-color: rgba(212, 175, 55, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212, 175, 55, 0.1);
        }
      `}</style>
    </div>
  );
}

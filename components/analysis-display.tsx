
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen,
  Heart,
  Eye,
  Compass,
  Zap,
  Crown,
  Infinity,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalisisCompleto } from '@/lib/analysis-generator';
import { TreeOfLifeVisualization } from './tree-of-life-visualization';
import { MandalaVisualization } from './mandala-visualization';
import { VibrationChart } from './vibration-chart';

interface AnalysisDisplayProps {
  analysis: AnalisisCompleto;
  personalData: {
    nombreCompleto: string;
    fechaNacimiento: string;
    lugarNacimiento?: string;
    horaNacimiento?: string;
  };
  calculations: any;
  onBack: () => void;
}

const STEP_ICONS = [
  BookOpen, // Paso 1
  Star,     // Paso 2
  Heart,    // Paso 3
  Crown,    // Paso 4
  Eye,      // Paso 5
  Moon,     // Paso 6
  Compass,  // Paso 7
  Infinity, // Paso 8
  Zap,      // Paso 9
  Sun,      // Paso 10
  Star,     // Paso 11
  Heart,    // Paso 12
  Crown     // Paso 13
];

const STEP_TITLES = [
  "Cálculo Numerológico Cabalístico",
  "Letras Hebreas del Alma",
  "Tarot del Origen, Transformación y Destino",
  "Árbol de la Vida Personal",
  "Árbol Genealógico y 7 Leyes Universales",
  "Sanación de la Sombra",
  "Reescritura del Mapa del Alma",
  "Razones Kármicas",
  "Números de Vibración del Alma",
  "Polos y Contrapolos",
  "Ciclos Anuales 20 años",
  "Mandala de Cuentas Pendientes",
  "Sumario de Sanación"
];

export function AnalysisDisplay({ analysis, personalData, calculations, onBack }: AnalysisDisplayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showVisualization, setShowVisualization] = useState(false);

  const steps = Object.values(analysis);
  const totalSteps = steps.length;

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % totalSteps);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + totalSteps) % totalSteps);
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis,
          personalData,
          calculations
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `analisis-cabalistico-${personalData.nombreCompleto.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
    }
  };

  const renderVisualization = () => {
    switch (currentStep) {
      case 3: // Árbol de la Vida
        return <TreeOfLifeVisualization calculations={calculations} />;
      case 8: // Números de Vibración
        return <VibrationChart calculations={calculations} />;
      case 11: // Mandala
        return <MandalaVisualization calculations={calculations} />;
      default:
        return null;
    }
  };

  const IconComponent = STEP_ICONS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950">
      {/* Estrellas de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity as any,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent mb-4">
            Tu Análisis Cabalístico del Alma
          </h1>
          <p className="text-purple-200 text-lg">
            {personalData.nombreCompleto} • {new Date(personalData.fechaNacimiento).toLocaleDateString('es-ES')}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="bg-purple-900/30 rounded-full h-3 mb-4">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-purple-200 text-sm">
            <span>Paso {currentStep + 1} de {totalSteps}</span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% Completado</span>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={prevStep}
            variant="outline"
            className="bg-purple-900/30 border-purple-500/50 text-purple-200 hover:bg-purple-800/50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 px-4 py-2">
            <IconComponent className="w-4 h-4 mr-2" />
            {STEP_TITLES[currentStep]}
          </Badge>

          <Button
            onClick={nextStep}
            variant="outline"
            className="bg-purple-900/30 border-purple-500/50 text-purple-200 hover:bg-purple-800/50"
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-lg border-gold-500/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-yellow-400 flex items-center gap-3">
                      <IconComponent className="w-8 h-8" />
                      {STEP_TITLES[currentStep]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-invert prose-purple max-w-none text-purple-100"
                      dangerouslySetInnerHTML={{ 
                        __html: steps[currentStep].replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-yellow-400">$1</strong>').replace(/\*(.*?)\*/g, '<em class="text-purple-300">$1</em>')
                      }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-lg border-gold-500/30">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-400">Números Sagrados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-200">Alma:</span>
                  <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                    {calculations.numeroAlma}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Personalidad:</span>
                  <Badge variant="outline" className="border-orange-400 text-orange-400">
                    {calculations.numeroPersonalidad}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Tikkún:</span>
                  <Badge variant="outline" className="border-purple-400 text-purple-400">
                    {calculations.numeroTikkun}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Sombra:</span>
                  <Badge variant="outline" className="border-blue-400 text-blue-400">
                    {calculations.numeroSombra}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Visualization */}
            {renderVisualization() && (
              <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-lg border-gold-500/30">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-400">Visualización</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderVisualization()}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleDownloadPDF}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
              
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full bg-purple-900/30 border-purple-500/50 text-purple-200 hover:bg-purple-800/50"
              >
                Nuevo Análisis
              </Button>
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {STEP_TITLES.map((title, index) => {
              const StepIcon = STEP_ICONS[index];
              return (
                <Button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  variant={currentStep === index ? "default" : "outline"}
                  className={`p-3 h-auto flex flex-col items-center gap-2 text-xs ${
                    currentStep === index
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                      : "bg-purple-900/30 border-purple-500/50 text-purple-200 hover:bg-purple-800/50"
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                  <span className="text-center leading-tight">{title}</span>
                </Button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

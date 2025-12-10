'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, ShieldCheck, Wallet, ArrowRight, Anchor, Scale, Loader2, Sparkles, CheckCircle, RefreshCw, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateFinancialAnalysis, type FinancialAIAnalysis } from '@/lib/financial-ai-analysis';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- UTILS: Lógica de Cálculo Financiero ---

// Tabla de valores para Gematría Occidental (simplificada para el ejemplo)
const gematriaValues: Record<string, number> = {
  a:1, b:2, c:3, d:4, e:5, f:6, g:7, h:8, i:9,
  j:1, k:2, l:3, m:4, n:5, o:6, p:7, q:8, r:9,
  s:1, t:2, u:3, v:4, w:5, x:6, y:7, z:8
};

// Reduce un número a un dígito (1-9), manteniendo 11 y 22
const reduceNumber = (num: number): number => {
  if (num === 11 || num === 22) return num;
  if (num < 10) return num;
  return reduceNumber(String(num).split('').reduce((a, b) => a + parseInt(b), 0));
};

interface FinancialData {
  manifestationNumber: number; // Malchut (Consonantes)
  flowNumber: number;          // Yesod (Fecha nacimiento)
  wealthArchetype: string;
  energyBalance: {
    expansion: number;  // Chesed
    restriction: number; // Gevurah
    management: number;  // Hod
  };
  tikun: string;
}

// Algoritmo de Salud Financiera
const calculateFinancialHealth = (name: string, birthDate: string): FinancialData => {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  
  // 1. Número de Manifestación (Consonantes -> Malchut)
  // Las consonantes representan la "vasija" física donde cae el dinero.
  const consonants = cleanName.replace(/[aeiou]/g, '');
  let consSum = 0;
  for (let char of consonants) consSum += gematriaValues[char] || 0;
  const manifestationNumber = reduceNumber(consSum);

  // 2. Número de Flujo (Fecha -> Yesod)
  // El canal de conexión.
  const dateSum = birthDate.replace(/[^0-9]/g, '').split('').reduce((a, b) => a + parseInt(b), 0);
  const flowNumber = reduceNumber(dateSum);

  // 3. Balance Energético (Análisis de letras)
  // Contamos frecuencias para ver tendencias
  let expansion = 0; // Letras de valor 3, 6, 9 (Expansión)
  let restriction = 0; // Letras de valor 4, 7, 8 (Estructura)
  let management = 0; // Letras de valor 1, 2, 5 (Mente/Cambio)
  
  for (let char of cleanName) {
    const val = gematriaValues[char];
    if ([3, 6, 9].includes(val)) expansion += 1;
    else if ([4, 7, 8].includes(val)) restriction += 1;
    else management += 1;
  }
  
  // Normalizar a porcentaje
  const total = expansion + restriction + management || 1;
  const balExpansion = Math.round((expansion / total) * 100);
  const balRestriction = Math.round((restriction / total) * 100);
  const balManagement = Math.round((management / total) * 100);

  // 4. Arquetipo Financiero
  let archetype = "El Constructor";
  if (manifestationNumber === 8 || flowNumber === 8) archetype = "El Magnate (Energía 8)";
  else if (manifestationNumber === 4) archetype = "El Arquitecto (Estructura)";
  else if (manifestationNumber === 5) archetype = "El Comerciante (Fluctuante)";
  else if (manifestationNumber === 9) archetype = "El Filántropo (Dar para recibir)";
  else if (manifestationNumber === 7) archetype = "El Místico (Dinero no es prioridad)";

  // 5. Tikún (Corrección sugerida)
  let tikun = "";
  if (balExpansion > 60) tikun = "Exceso de Jésed: Gastas más de lo que ingresas. Necesitas Gevurá (presupuesto estricto).";
  else if (balRestriction > 60) tikun = "Exceso de Gevurá: Miedo a invertir. Bloqueas el flujo por tacañería o miedo.";
  else if (manifestationNumber === 7) tikun = "Necesitas 'aterrizar'. Tu energía es muy etérea para Malchut. Usa sistemas automáticos.";
  else tikun = "Equilibrio saludable. Enfócate en la estrategia (Hod) para multiplicar.";

  return {
    manifestationNumber,
    flowNumber,
    wealthArchetype: archetype,
    energyBalance: {
      expansion: balExpansion,
      restriction: balRestriction,
      management: balManagement
    },
    tikun
  };
};

interface FinancialHealthReportProps {
  clientName?: string;
  birthDate?: string;
  mapa?: any; // Mapa cabalístico completo si está disponible
}

// --- COMPONENTE VISUAL ---
export default function FinancialHealthReport({ clientName = "", birthDate = "", mapa }: FinancialHealthReportProps) {
  const [data, setData] = useState<FinancialData | null>(null);
  
  // Estados para la IA
  const [aiAnalysis, setAiAnalysis] = useState<FinancialAIAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  // Ref para la tarjeta de meditación (Tikún)
  const meditationCardRef = useRef<HTMLDivElement>(null);

  // 1. Calcular Datos Básicos
  useEffect(() => {
    if (clientName && birthDate) {
      const calculated = calculateFinancialHealth(clientName, birthDate);
      setData(calculated);
      
      // 2. Disparar Análisis de IA
      setLoadingAnalysis(true);
      generateFinancialAnalysis(clientName, birthDate, calculated)
        .then(analysis => {
            setAiAnalysis(analysis);
            setLoadingAnalysis(false);
        })
        .catch(err => {
            console.error(err);
            setLoadingAnalysis(false);
        });
    }
  }, [clientName, birthDate]);

  // Función para generar PDF de la meditación
  const generateMeditationPDF = async () => {
    if (!meditationCardRef.current || !aiAnalysis) {
      alert('No hay contenido de meditación disponible para generar el PDF.');
      return;
    }
    
    setGeneratingPDF(true);
    try {
      console.log('Iniciando generación de PDF...');
      
      // Esperar un momento para asegurar que el DOM esté listo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capturar la tarjeta de meditación como imagen
      const canvas = await html2canvas(meditationCardRef.current, {
        backgroundColor: '#581c87', // Color de fondo morado
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: meditationCardRef.current.scrollWidth,
        height: meditationCardRef.current.scrollHeight,
        windowWidth: meditationCardRef.current.scrollWidth,
        windowHeight: meditationCardRef.current.scrollHeight,
      });
      
      console.log('Canvas generado:', canvas.width, 'x', canvas.height);
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      if (!imgData || imgData === 'data:,') {
        throw new Error('No se pudo generar la imagen del canvas');
      }
      
      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Ancho A4 en mm
      const pageHeight = 297; // Alto A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // Agregar imagen al PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Si la imagen es más alta que una página, agregar páginas adicionales
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Guardar PDF
      const fileName = `Meditacion_Parnassah_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF generado exitosamente:', fileName);
      
    } catch (error: any) {
      console.error('Error generando PDF:', error);
      const errorMessage = error?.message || 'Error desconocido';
      alert(`Error al generar el PDF: ${errorMessage}. Verifica la consola para más detalles.`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (!data) return <div className="p-4 text-gray-400">Esperando datos del cliente...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* HEADER: Arquetipo */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-6 rounded-xl border border-emerald-500/30 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-emerald-500/20 rounded-full">
            <Wallet className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-100">Arquetipo Financiero: {data.wealthArchetype}</h2>
            <p className="text-emerald-200/80 text-sm">Salud de Parnassah (Sustento)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TARJETA 1: Malchut y Yesod */}
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Anchor className="w-5 h-5 text-blue-400" />
              Estructura de Manifestación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <div>
                <p className="text-sm text-gray-400">Vibración de Manifestación (Malchut)</p>
                <p className="text-xs text-gray-500">Tu capacidad de concretar dinero físico.</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-white">{data.manifestationNumber}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Vibración de Flujo (Yesod)</p>
                <p className="text-xs text-gray-500">Tu "tubería" de ingresos.</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-300">{data.flowNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TARJETA 2: Balance Energético (Sefirot) */}
        <Card className="bg-gray-900 border-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="w-5 h-5 text-yellow-400" />
              Balanza de Sefirot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Chesed */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-300">Jésed (Expansión/Ingresos)</span>
                <span>{data.energyBalance.expansion}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-blue-900">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
                  style={{ width: `${Math.max(data.energyBalance.expansion, 2)}%` }}
                />
              </div>
            </div>

            {/* Gevurah */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-300">Gevurá (Restricción/Ahorro)</span>
                <span>{data.energyBalance.restriction}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-red-900">
                <div
                  className="h-full bg-red-500 transition-all duration-300 ease-in-out"
                  style={{ width: `${Math.max(data.energyBalance.restriction, 2)}%` }}
                />
              </div>
            </div>

            {/* Hod */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-orange-300">Hod (Gestión/Administración)</span>
                <span>{data.energyBalance.management}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-orange-900">
                <div
                  className="h-full bg-orange-500 transition-all duration-300 ease-in-out"
                  style={{ width: `${Math.max(data.energyBalance.management, 2)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- SECCIÓN 2: ANÁLISIS DE INTELIGENCIA ARTIFICIAL (NUEVO) --- */}
      
      {loadingAnalysis && (
        <Card className="bg-gradient-to-br from-slate-900 to-blue-950 border-blue-500/30 text-white animate-pulse">
           <CardContent className="py-8 text-center">
             <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-400" />
             <p className="text-gray-300">El Sabio Cabalista (IA) está meditando sobre tus números...</p>
           </CardContent>
        </Card>
      )}

      {!loadingAnalysis && aiAnalysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 1. DIAGNÓSTICO PROFUNDO */}
            <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-500/30 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-indigo-300">
                        <Sparkles className="w-5 h-5" />
                        {aiAnalysis.deepDiagnosis.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-base text-gray-100 leading-relaxed font-medium">
                        <span className="font-bold text-white text-lg">El Problema: </span> 
                        {aiAnalysis.deepDiagnosis.problem}
                    </p>
                    <div className="p-4 bg-indigo-900/30 border-l-4 border-indigo-400 rounded-r-lg">
                        <p className="text-base text-indigo-100 italic leading-relaxed">
                           "{aiAnalysis.deepDiagnosis.dynamics}"
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 2. CONSEJOS PRÁCTICOS */}
            <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-400">
                        <CheckCircle className="w-5 h-5" />
                        {aiAnalysis.practicalAdvice.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {aiAnalysis.practicalAdvice.strategies.map((strategy, idx) => (
                        <div key={idx} className="bg-black/40 p-5 rounded-lg border border-amber-500/20">
                            <h4 className="font-bold text-white text-lg mb-2">{strategy.title}</h4>
                            <p className="text-base text-gray-200 mb-4 leading-relaxed">{strategy.description}</p>
                            <ul className="space-y-2">
                                {strategy.actionItems.map((item, i) => (
                                    <li key={i} className="text-sm flex items-start gap-3 text-gray-100 leading-relaxed">
                                        <ArrowRight className="w-4 h-4 mt-1 text-amber-400 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* 3. RECETA ESPIRITUAL */}
            <Card 
              ref={meditationCardRef}
              className="bg-gradient-to-r from-purple-900 to-fuchsia-900 border-purple-500/30 text-white"
            >
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-purple-200">
                            <ShieldCheck className="w-5 h-5" />
                            {aiAnalysis.spiritualPrescription.title}
                        </CardTitle>
                        <Button
                          onClick={generateMeditationPDF}
                          disabled={generatingPDF}
                          variant="outline"
                          size="sm"
                          className="border-purple-400/50 text-purple-200 hover:bg-purple-800/50"
                        >
                          {generatingPDF ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4 mr-2" />
                              Generar PDF
                            </>
                          )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-bold text-purple-200 text-base mb-3 uppercase tracking-wide">Meditación</h4>
                        <p className="text-base text-gray-100 leading-relaxed font-medium">
                            {aiAnalysis.spiritualPrescription.meditation}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-purple-200 text-base mb-3 uppercase tracking-wide">Acción Física (Malchut)</h4>
                        <p className="text-base text-gray-100 leading-relaxed mb-4 font-medium">
                            {aiAnalysis.spiritualPrescription.action}
                        </p>
                        <div className="bg-white/15 p-4 rounded-lg text-center border border-purple-400/30">
                            <p className="text-sm text-purple-200 mb-2 font-semibold uppercase tracking-wide">Afirmación</p>
                            <p className="font-serif italic text-white text-base leading-relaxed">"{aiAnalysis.spiritualPrescription.affirmation}"</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* MENSAJE FINAL */}
            <div className="text-center p-6 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-lg border border-emerald-500/30">
                <p className="text-emerald-200 font-semibold text-lg leading-relaxed">
                    {aiAnalysis.encouragement}
                </p>
            </div>
        </div>
      )}
    </div>
  );
}


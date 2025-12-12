'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, Activity, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';

interface ShekinahGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShekinahGuideModal({ open, onOpenChange }: ShekinahGuideModalProps) {
  const [activeTab, setActiveTab] = useState('concepts');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-300">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-amber-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white">
                Guía de Interpretación: Método Atlantis
              </DialogTitle>
            </div>
            <DialogClose />
          </div>
          
          {/* Declaración de Principios */}
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 border-l-4 border-amber-500 rounded-r-lg">
            <p className="text-sm text-amber-200 italic leading-relaxed">
              <strong className="text-amber-400 font-semibold">Filosofía del Método:</strong> "Este módulo no interpreta el alma: 
              construye el mapa exacto para que la conciencia pueda leerlo."
            </p>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-slate-900 border border-slate-800 mb-6">
            <TabsTrigger value="concepts">Conceptos Clave</TabsTrigger>
            <TabsTrigger value="otd">Trilogía OTD</TabsTrigger>
            <TabsTrigger value="karmas">Karmas y Bloqueos</TabsTrigger>
          </TabsList>

          <ScrollArea className="max-h-[60vh] pr-4">
            {/* Tab 1: Conceptos Clave */}
            <TabsContent value="concepts" className="space-y-6">
              {/* Introducción */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  Sobre el Método Atlantis
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm mb-3">
                  El <strong className="text-amber-400">Análisis Shejinah</strong> no es una interpretación subjetiva. 
                  Es un <strong className="text-white">sistema matemático preciso</strong> que calcula las vibraciones 
                  numéricas exactas de tu nombre y fecha de nacimiento para construir un mapa objetivo de tu diseño energético.
                </p>
                <div className="bg-slate-950/50 border-l-4 border-amber-500 pl-4 py-2 rounded-r">
                  <p className="text-xs text-amber-200 italic">
                    "Este módulo no interpreta el alma: construye el mapa exacto para que la conciencia pueda leerlo."
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-indigo-500/20 rounded-lg">
                      <Heart className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        PIN: Número del Corazón
                        <span className="text-sm font-normal text-amber-400">(Vibración Total)</span>
                      </h3>
                      <p className="text-slate-300 leading-relaxed mb-3">
                        El <strong className="text-white">PIN (Número del Corazón)</strong> es la suma de tu 
                        <strong className="text-amber-400"> Gematría del Nombre</strong> más la 
                        <strong className="text-amber-400"> Suma de Cifras de tu Fecha de Nacimiento (SCF)</strong>.
                      </p>
                      <div className="bg-slate-950/50 border-l-4 border-amber-500 pl-4 py-2 rounded-r">
                        <p className="text-sm text-slate-400 italic">
                          <strong className="text-amber-400">Fórmula:</strong> PIN = Gematría Total + SCF
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-sm text-amber-200 leading-relaxed">
                      <strong className="text-amber-400">¿Por qué no reducimos?</strong> A diferencia de la numerología 
                      tradicional, el Método Atlantis mantiene los números altos (ej: 33, 108, 144) porque cada vibración 
                      numérica tiene un significado específico. Reducir todo a un dígito perdería información valiosa sobre 
                      la energía que el alma está trabajando.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    Números Altos vs. Reducción
                  </h3>
                  <div className="space-y-3 text-slate-300">
                    <p>
                      En el <strong className="text-amber-400">Método Atlantis</strong>, trabajamos con la vibración completa 
                      del número porque:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                      <li>Cada número alto (33, 44, 55, etc.) tiene una energía específica que se pierde al reducir</li>
                      <li>Los números maestros y sus múltiplos portan información sobre el nivel de evolución del alma</li>
                      <li>La vibración completa permite identificar patrones kármicos más precisos</li>
                      <li>Facilita el cruce con otros sistemas (Tarot, Árbol de la Vida, Astrología)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Trilogía OTD */}
            <TabsContent value="otd" className="space-y-6">
              <div className="space-y-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-2xl">🏛️</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Tema de Origen (TO)
                      </h3>
                      <p className="text-slate-300 leading-relaxed mb-3">
                        El <strong className="text-amber-400">Tema de Origen</strong> representa la 
                        <strong className="text-white"> Base Estructural</strong> o los cimientos que el alma trae 
                        de vidas pasadas. Es la energía con la que naciste, tu "hardware" espiritual.
                      </p>
                      <div className="bg-slate-950/50 border-l-4 border-slate-600 pl-4 py-2 rounded-r">
                        <p className="text-sm text-slate-400">
                          <strong className="text-slate-300">Se calcula:</strong> Aplicando el algoritmo del sendero 
                          a la Gematría Total del nombre completo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <Activity className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Principio de Transformación (PT)
                      </h3>
                      <p className="text-slate-300 leading-relaxed mb-3">
                        El <strong className="text-amber-400">Principio de Transformación</strong> es el 
                        <strong className="text-white"> Estilo de Gestión de Crisis</strong> o la "salsa" con la que 
                        vives los cambios. Representa cómo procesas los desafíos y las transiciones en tu vida.
                      </p>
                      <div className="bg-slate-950/50 border-l-4 border-purple-500 pl-4 py-2 rounded-r">
                        <p className="text-sm text-slate-400">
                          <strong className="text-slate-300">Se calcula:</strong> Reduciendo la Suma de Cifras de la Fecha (SCF) 
                          a un Arcano (1-21).
                        </p>
                      </div>
                      <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-xs text-purple-200 italic">
                          Es la energía que activas cuando enfrentas crisis, cambios o momentos de transformación profunda.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-cyan-500/20 rounded-lg">
                      <Sparkles className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Tema de Destino (TD)
                      </h3>
                      <p className="text-slate-300 leading-relaxed mb-3">
                        El <strong className="text-amber-400">Tema de Destino</strong> es la 
                        <strong className="text-white"> Nueva Misión</strong> que el alma viene a manifestar en esta 
                        encarnación. Es hacia dónde te diriges, tu propósito evolutivo en esta vida.
                      </p>
                      <div className="bg-slate-950/50 border-l-4 border-cyan-500 pl-4 py-2 rounded-r">
                        <p className="text-sm text-slate-400">
                          <strong className="text-slate-300">Se calcula:</strong> Aplicando el algoritmo del sendero 
                          al PIN (Número del Corazón).
                        </p>
                      </div>
                      <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                        <p className="text-xs text-cyan-200 italic">
                          Representa la energía que estás llamada a integrar y manifestar como parte de tu evolución espiritual.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-amber-500/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-400" />
                    La Trilogía como Viaje del Alma
                  </h3>
                  <p className="text-slate-300 leading-relaxed text-sm">
                    La <strong className="text-amber-400">Trilogía OTD</strong> describe el viaje completo del alma: 
                    desde dónde vienes (Origen), cómo procesas los cambios (Transformación), y hacia dónde vas (Destino). 
                    Esta estructura te permite entender no solo quién eres, sino también cómo estás diseñado para evolucionar.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Karmas y Bloqueos */}
            <TabsContent value="karmas" className="space-y-6">
              <div className="space-y-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-red-500/20 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Cuentas Pendientes (Karmas)
                      </h3>
                      <p className="text-slate-300 leading-relaxed mb-3">
                        Los <strong className="text-amber-400">Karmas</strong> no son castigos ni deudas que debes pagar. 
                        Son <strong className="text-white">asignaturas pendientes</strong> o 
                        <strong className="text-white"> llamados a despertar</strong> que el alma trae para trabajar en esta encarnación.
                      </p>
                      <div className="bg-slate-950/50 border-l-4 border-red-500 pl-4 py-2 rounded-r mb-3">
                        <p className="text-sm text-slate-400">
                          <strong className="text-slate-300">Se identifican cuando:</strong> Un número se repite en posiciones 
                          de tensión o desafío dentro de la Trilogía OTD, o cuando aparece en ejes de tensión específicos.
                        </p>
                      </div>
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-xs text-red-200 italic">
                          <strong className="text-red-400">Perspectiva del Método Atlantis:</strong> Los karmas son oportunidades 
                          de crecimiento, no condenas. Indican áreas donde el alma necesita integrar lecciones específicas para 
                          avanzar en su evolución.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-400" />
                    Ejes de Tensión
                  </h3>
                  <p className="text-slate-300 leading-relaxed mb-3 text-sm">
                    Los <strong className="text-amber-400">Ejes de Tensión</strong> son pares de números que representan 
                    polaridades que el alma está trabajando para equilibrar. Por ejemplo, un eje "3-9" indica que hay una 
                    tensión entre la expresión creativa (3) y la sabiduría universal (9).
                  </p>
                  <div className="bg-slate-950/50 border-l-4 border-orange-500 pl-4 py-2 rounded-r">
                    <p className="text-sm text-slate-400">
                      Estos ejes no son problemas, sino <strong className="text-orange-400">áreas de integración</strong> 
                      donde el alma está aprendiendo a encontrar el equilibrio entre dos energías complementarias.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Trabajando con los Karmas
                  </h3>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>
                        <strong className="text-white">Identifica el patrón:</strong> ¿Qué número o eje se repite?
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>
                        <strong className="text-white">Consulta el Arcano correspondiente:</strong> Cada número (1-21) 
                        tiene un significado específico en el Tarot y el Árbol de la Vida.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>
                        <strong className="text-white">Integra la lección:</strong> Los karmas se resuelven cuando 
                        comprendes y vives la energía del Arcano de manera consciente.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>
                        <strong className="text-white">No es para siempre:</strong> Los karmas son temporales. 
                        Una vez integrada la lección, el patrón se disuelve.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}


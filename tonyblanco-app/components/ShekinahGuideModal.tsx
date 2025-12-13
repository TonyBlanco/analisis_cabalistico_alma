'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Heart, Lock, Activity, Sparkles } from 'lucide-react';

interface ShekinahGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOpen?: boolean; // Compatibilidad con versión anterior
  onClose?: () => void; // Compatibilidad con versión anterior
}

export default function ShekinahGuideModal({ 
  open, 
  onOpenChange, 
  isOpen, 
  onClose 
}: ShekinahGuideModalProps) {
  // Compatibilidad con ambas versiones de props
  const isOpenState = open !== undefined ? open : (isOpen !== undefined ? isOpen : false);
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else if (onClose && !newOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpenState} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-amber-400">
            <BookOpen className="w-6 h-6" /> Guía Shejinah
          </DialogTitle>
          <p className="text-slate-400 text-sm mt-1">
            Claves del Método Atlantis
          </p>
        </DialogHeader>
        
        <Tabs defaultValue="basics" className="w-full mt-4">
          <TabsList className="grid grid-cols-5 bg-slate-900 border border-slate-800">
            <TabsTrigger value="basics">Conceptos</TabsTrigger>
            <TabsTrigger value="otd">OTD</TabsTrigger>
            <TabsTrigger value="karmas">Bloqueos</TabsTrigger>
            <TabsTrigger value="times">Tiempos</TabsTrigger>
            <TabsTrigger value="shields">Escudos</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 h-[400px] pr-2">
            <ScrollArea className="h-full">
              <TabsContent value="basics" className="space-y-4 mt-4">
                <div className="p-4 border border-indigo-500/30 rounded-lg bg-indigo-900/10">
                  <h4 className="font-bold text-indigo-300 flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4" /> El PIN (Número del Corazón)
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Vibración Total. Suma exacta de <strong className="text-white">Nombre + Fecha</strong> sin reducir.
                  </p>
                  <p className="text-xs text-slate-400 mt-2 italic">
                    El método usa números altos (ej. 33, 108) para ver la "Estructura Fina" del alma.
                  </p>
                </div>
                
                <div className="p-4 border border-purple-500/30 rounded-lg bg-purple-900/10">
                  <h4 className="font-bold text-purple-300 flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" /> Vibraciones del Ser
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>
                      <strong className="text-purple-300">Espíritu:</strong> Suma normal de la fecha de nacimiento
                    </li>
                    <li>
                      <strong className="text-purple-300">Alma:</strong> Fecha convertida con tabla SOUL_IMAGE
                    </li>
                    <li>
                      <strong className="text-purple-300">Cuerpo:</strong> Fecha convertida con tabla ENERGETIC_STRUCTURE
                    </li>
                    <li>
                      <strong className="text-purple-300">Efecto Sanador:</strong> Suma de las tres vibraciones
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 border border-cyan-500/30 rounded-lg bg-cyan-900/10">
                  <h4 className="font-bold text-cyan-300 mb-2">
                    Los 10 Portales
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Estructura energética que muestra el estado de apertura o bloqueo de cada portal de conciencia.
                    Cada portal tiene un número, un nombre y un estado (Activo, Bloqueo, Potencial).
                  </p>
                </div>
                
                <div className="p-4 border border-green-500/30 rounded-lg bg-green-900/10">
                  <h4 className="font-bold text-green-300 mb-2">
                    Planos de Conciencia
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Cuatro niveles de vibración que representan diferentes dimensiones de la experiencia:
                    Espiritual, Causal, Activación y Subconsciente.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="otd" className="space-y-4 mt-4">
                <div className="p-4 border border-amber-500/30 rounded-lg bg-amber-900/10">
                  <h4 className="font-bold text-amber-400 mb-3">La Trilogía OTD</h4>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li>
                      <strong className="text-amber-400">Origen (TO):</strong> Base estructural de vidas pasadas. 
                      Se calcula aplicando el algoritmo del sendero a la Gematría del nombre completo.
                    </li>
                    <li>
                      <strong className="text-purple-400">Transformación (PT):</strong> Estilo de gestión de crisis. 
                      Se calcula reduciendo directamente la Suma de Cifras de la Fecha (SCF) a un Arcano (0-21).
                    </li>
                    <li>
                      <strong className="text-cyan-400">Destino (TD):</strong> Nueva misión a manifestar. 
                      Se calcula aplicando el algoritmo del sendero al PIN (Número del Corazón).
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 border border-orange-500/30 rounded-lg bg-orange-900/10">
                  <h4 className="font-bold text-orange-400 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Ejes y Polos
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-2">
                    Los <strong className="text-orange-300">Ejes</strong> son tensiones Yin-Yang que aparecen cuando 
                    dos números opuestos están presentes en la Trilogía OTD.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Los <strong className="text-blue-300">Polos</strong> son polaridades causales o mentales que 
                    indican áreas de integración entre energías complementarias.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="karmas" className="space-y-4 mt-4">
                <div className="p-4 border border-red-500/30 rounded-lg bg-red-900/10">
                  <h4 className="font-bold text-red-400 flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4" /> Cuentas Pendientes
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-2">
                    Las <strong className="text-red-300">Razones Kármicas</strong> no son castigos ni deudas que debes pagar. 
                    Son <strong className="text-white">asignaturas pendientes</strong> o 
                    <strong className="text-white"> llamados a despertar</strong> que el alma trae para trabajar en esta encarnación.
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Son oportunidades de crecimiento, no condenas. Indican áreas donde el alma necesita integrar 
                    lecciones específicas para avanzar en su evolución.
                  </p>
                </div>
                
                <div className="p-4 border border-yellow-500/30 rounded-lg bg-yellow-900/10">
                  <h4 className="font-bold text-yellow-400 mb-2">
                    Potenciales Arcaicos
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    También conocidos como <strong className="text-yellow-300">Tesoros Olvidados</strong>, son 
                    números que representan dones y capacidades que el alma trae pero que pueden estar dormidos 
                    o no completamente activados.
                  </p>
                </div>
                
                <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                  <h4 className="font-bold text-slate-300 mb-2">
                    Tipos de Karmas
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>
                      <strong className="text-red-400">Karmas Clásicos:</strong> 13, 14, 16, 19 (Transformación profunda)
                    </li>
                    <li>
                      <strong className="text-orange-400">Karmas Específicos:</strong> 23, 28, 29, 80 (Lecciones del Método Atlantis)
                    </li>
                    <li>
                      <strong className="text-yellow-400">Números Ausentes:</strong> 1-9 (Vacíos energéticos a llenar)
                    </li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="times" className="space-y-4 mt-4">
                <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-900/10">
                  <h4 className="font-bold text-blue-400 flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" /> Edad de Transformación (ET)
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-2">
                    La <strong className="text-blue-300">Edad de Transformación</strong> es igual a la 
                    <strong className="text-white"> Suma de Cifras de la Fecha (SCF)</strong> de nacimiento.
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Esta edad marca un momento clave en la vida donde las lecciones kármicas se intensifican 
                    y el alma está lista para integrar transformaciones profundas. Es el momento en que el 
                    diseño energético alcanza su punto de máxima activación.
                  </p>
                </div>
                
                <div className="p-4 border border-orange-500/30 rounded-lg bg-orange-900/10">
                  <h4 className="font-bold text-orange-400 flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4" /> Turbulencias (Ceros en Fecha)
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-2">
                    Las <strong className="text-orange-300">Turbulencias</strong> se detectan cuando hay 
                    <strong className="text-white"> ceros (0) en la fecha de nacimiento</strong>.
                  </p>
                  <p className="text-xs text-slate-400 italic mb-2">
                    Cada cero en la fecha activa un período de <strong className="text-orange-300">10 años de corrección concentrada</strong>. 
                    Estos son momentos donde las lecciones kármicas se intensifican y requieren atención especial.
                  </p>
                  <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded">
                    <p className="text-xs text-orange-200">
                      <strong className="text-orange-300">Ejemplo:</strong> Si tu fecha tiene 2 ceros (ej: 2000-05-15), 
                      tendrás 20 años de turbulencias. Estos períodos no son negativos, sino oportunidades 
                      aceleradas de crecimiento y corrección kármica.
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border border-purple-500/30 rounded-lg bg-purple-900/10">
                  <h4 className="font-bold text-purple-300 mb-2">
                    Vibración "Hoy"
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    La <strong className="text-purple-300">Vibración del Día</strong> combina tu vibración del 
                    espíritu con la energía del día actual. Te indica qué energía estás trabajando hoy y cómo 
                    puedes alinearte con el flujo temporal.
                  </p>
                </div>
                
                <div className="p-4 border border-indigo-500/30 rounded-lg bg-indigo-900/10">
                  <h4 className="font-bold text-indigo-300 mb-2">
                    Lema de Vida
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    El <strong className="text-indigo-300">Lema de Vida</strong> es un número que representa 
                    la frase o principio que guía tu existencia. Se calcula combinando tu Gematría con tus 
                    vibraciones fundamentales.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="shields" className="space-y-4 mt-4">
                <div className="p-4 border border-purple-500/30 rounded-lg bg-purple-900/10">
                  <h4 className="font-bold text-purple-400 flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4" /> Escudos Protectores
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-2">
                    Los <strong className="text-purple-300">Escudos Protectores</strong> son bloqueos energéticos 
                    que se forman cuando hay una tensión entre el Origen (Tarea) y el Destino (Portal) según la 
                    topología de Ejes de Tensión (Tipo 6).
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Se calculan usando los dígitos transformados de la Estructura Energética (EE) de la fecha de nacimiento.
                  </p>
                </div>
                
                <div className="p-4 border border-red-500/30 rounded-lg bg-red-900/10">
                  <h4 className="font-bold text-red-400 mb-2">
                    Regla de Exclusión (Regla de la Luz)
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-2">
                    Los portales <strong className="text-red-300">1 (Keter), 2 (Jojmá) y 10 (Maljut)</strong> 
                    <strong className="text-white"> NO pueden tener escudos</strong>.
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    "Dios no quiere obstáculos en estos canales". Estos son los portales de luz divina que 
                    siempre permanecen abiertos.
                  </p>
                </div>
                
                <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-900/10">
                  <h4 className="font-bold text-blue-400 mb-2">
                    Mapa de Flujo (Ejes de Tensión)
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li><strong className="text-blue-300">1 → 6:</strong> Espíritu → Materia</li>
                    <li><strong className="text-blue-300">2 → 7:</strong> Yang → Yin</li>
                    <li><strong className="text-blue-300">3 → 8:</strong> Dar → Recibir/Forma</li>
                    <li><strong className="text-blue-300">4 → 9:</strong> Amor → Sabiduría</li>
                    <li><strong className="text-blue-300">5 → 10:</strong> Rigor → Identidad (excluido)</li>
                    <li><strong className="text-blue-300">6 → 1:</strong> Materia → Espíritu (excluido)</li>
                    <li><strong className="text-blue-300">7 → 2:</strong> Yin → Yang (excluido)</li>
                    <li><strong className="text-blue-300">8 → 3:</strong> Forma → Dar</li>
                    <li><strong className="text-blue-300">9 → 4:</strong> Sabiduría → Amor</li>
                    <li><strong className="text-blue-300">10 → 5:</strong> Identidad → Rigor</li>
                  </ul>
                </div>
                
                <div className="p-4 border border-orange-500/30 rounded-lg bg-orange-900/10">
                  <h4 className="font-bold text-orange-400 mb-2">
                    Interpretación de Escudos
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-2">
                    Cada escudo activo muestra:
                  </p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>
                      <strong className="text-orange-300">Síntomas Físicos:</strong> Manifestaciones corporales 
                      del bloqueo energético.
                    </li>
                    <li>
                      <strong className="text-orange-300">Psicología:</strong> Patrones mentales y emocionales 
                      asociados al escudo.
                    </li>
                  </ul>
                  <p className="text-xs text-slate-400 italic mt-2">
                    Los escudos no son negativos, sino indicadores de áreas donde el alma está trabajando 
                    para integrar polaridades y encontrar equilibrio.
                  </p>
                </div>
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

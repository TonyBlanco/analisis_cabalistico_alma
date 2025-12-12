'use client';

import { Sparkles } from 'lucide-react';

interface ReprogrammingCardProps {
  code: {
    visual: Array<{ letter: string, vowelMark: string, vowelName: string, sound: string }>;
    explanation: string;
  };
  aiAnalysis: any;
}

export default function ReprogrammingCard({ code, aiAnalysis }: ReprogrammingCardProps) {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-xl overflow-hidden shadow-2xl mt-8">
      {/* Header Místico */}
      <div className="bg-indigo-900/20 p-6 border-b border-indigo-500/20">
        <h3 className="text-xl text-indigo-300 font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          {aiAnalysis?.title || "Tecnología de Reprogramación"}
        </h3>
        <p className="text-sm text-indigo-200/70 mt-2">
          {aiAnalysis?.conflict}
        </p>
      </div>

      <div className="p-8 flex flex-col items-center">
        
        {/* EL CÓDIGO SAGRADO (YHVH con Vocales) */}
        <div className="mb-8 p-6 bg-black/40 rounded-2xl border border-amber-500/20 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
          <div className="flex gap-4 md:gap-8 direction-rtl" dir="rtl">
            {code.visual.map((char, i) => (
              <div key={i} className="flex flex-col items-center group cursor-pointer">
                {/* La Letra con su Vocal (Nikkud) */}
                <div className="relative">
                  <span className="text-6xl md:text-7xl font-serif text-amber-100 group-hover:text-amber-300 transition-colors">
                    {char.letter}
                  </span>
                  {/* Posicionamiento absoluto del Nikkud (Vocal) para que quede bien */}
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 text-4xl text-amber-400 font-serif">
                    {char.vowelMark}
                  </span>
                </div>
                
                {/* Sonido y Nombre */}
                <div className="mt-4 text-center opacity-60 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs uppercase tracking-widest text-indigo-300">{char.vowelName}</p>
                  <p className="text-sm font-bold text-white">/{char.sound}/</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instrucciones */}
        <div className="grid md:grid-cols-2 gap-6 w-full text-sm">
          <div className="bg-indigo-900/10 p-4 rounded-lg border border-indigo-500/20">
            <h4 className="font-bold text-indigo-300 mb-2 uppercase text-xs">Instrucción Técnica</h4>
            <p className="text-slate-300 leading-relaxed">
              {aiAnalysis?.technique}
            </p>
          </div>
          <div className="bg-amber-900/10 p-4 rounded-lg border border-amber-500/20">
            <h4 className="font-bold text-amber-300 mb-2 uppercase text-xs">Mantra de Activación</h4>
            <p className="text-amber-100 italic font-serif text-lg text-center mt-2">
              "{aiAnalysis?.mantra}"
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs text-center text-slate-500">
          * Lee de derecha a izquierda. Visualiza estas letras brillando en tu plexo solar para disolver el aspecto negativo.
        </p>

      </div>
    </div>
  );
}






'use client';

import React from 'react';
import CabalisticAstrologyReport from '@/components/CabalisticAstrologyReport';

export default function CabalisticAstrologyPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            ⭐ Astrología Cabalística
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Descubre tu ADN Cósmico a través del Árbol de la Vida. 
            Calcula los 72 Ángeles de Dios según tu carta natal y recibe 
            un análisis profundo de tu misión espiritual.
          </p>
        </div>
        
        <CabalisticAstrologyReport />
      </div>
    </div>
  );
}





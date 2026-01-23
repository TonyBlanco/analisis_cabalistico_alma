'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { Star, Play, Lock } from 'lucide-react';
import AstrologyTarotSidebar from './AstrologyTarotSidebar';
import AstrologyTarotVisualCore from './AstrologyTarotVisualCore';
import TarotHistoryPanel from './TarotHistoryPanel';
import type { AstrologyTarotSectionId, TarotSystemId } from './types';

// SWM Tarot hooks
import { useCreateTarotInstance } from '@/lib/api/swm/tarot/hooks/useCreateTarotInstance';
import { useStartTarotSession } from '@/lib/api/swm/tarot/hooks/useStartTarotSession';
import { useSealTarotWorkspace } from '@/lib/api/swm/tarot/hooks/useSealTarotWorkspace';
import type { SpreadType, TarotSystem, WorkspaceInstanceList } from '@/lib/api/swm/tarot/types';

interface AstrologyTarotWorkspaceProps {
  patientId?: string;
  patientBirthDate?: Date;
}

// Map frontend TarotSystemId to backend TarotSystem
const systemIdToBackend: Record<TarotSystemId, TarotSystem> = {
  thoth: 'thoth',
  'golden-dawn': 'golden_dawn',
  rota: 'hermetic',
  marsella: 'rider_waite',
  'rider-waite': 'rider_waite',
  'tarot-cabalistico': 'sephiroth',
  'oracle-symbolic': 'hermetic',
  bota: 'bota',
  hermetic: 'hermetic',
  sephiroth: 'sephiroth',
};

// Map frontend section to backend spread type
const sectionToSpreadType: Partial<Record<AstrologyTarotSectionId, SpreadType>> = {
  'tarot-natal': 'natal_chart',
  'tarot-tree-spread': 'tree_of_life',
  'tarot-free-spread': 'free',
  'tarot-correspondences': 'correspondences',
};

export default function AstrologyTarotWorkspace({
  patientId,
  patientBirthDate,
}: AstrologyTarotWorkspaceProps) {
  const [activeSection, setActiveSection] =
    useState<AstrologyTarotSectionId>('tarot-natal');
  const [selectedSystem, setSelectedSystem] = useState<TarotSystemId>('thoth');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // SWM State
  const [currentInstanceId, setCurrentInstanceId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [workspaceStatus, setWorkspaceStatus] = useState<'none' | 'active' | 'sealed'>('none');
  
  // SWM Hooks
  const { createInstance, isLoading: isCreating } = useCreateTarotInstance();
  const { startSession, isLoading: isStarting } = useStartTarotSession();
  const { sealWorkspace, isLoading: isSealing } = useSealTarotWorkspace();

  // Start a new workspace
  const handleStartWorkspace = useCallback(async () => {
    if (!patientId) return;
    
    try {
      // Create instance
      const instance = await createInstance({
        subject_user_id: parseInt(patientId, 10),
        spread_type: sectionToSpreadType[activeSection] || 'free',
        tarot_system: systemIdToBackend[selectedSystem],
        has_reversed: true,
      });
      
      setCurrentInstanceId(instance.id);
      
      // Start session
      const session = await startSession(instance.id);
      setCurrentSessionId(session.id);
      setWorkspaceStatus('active');
      
      console.log('✅ Workspace iniciado:', { instance: instance.id, session: session.id });
    } catch (error) {
      console.error('❌ Error al iniciar workspace:', error);
    }
  }, [patientId, activeSection, selectedSystem, createInstance, startSession]);

  // Seal current workspace
  const handleSealWorkspace = useCallback(async () => {
    if (!currentInstanceId) return;
    
    try {
      await sealWorkspace(currentInstanceId);
      setWorkspaceStatus('sealed');
      console.log('✅ Workspace sellado:', currentInstanceId);
    } catch (error) {
      console.error('❌ Error al sellar workspace:', error);
    }
  }, [currentInstanceId, sealWorkspace]);

  // Load a previous workspace
  const handleLoadInstance = useCallback((instance: WorkspaceInstanceList) => {
    setCurrentInstanceId(instance.id);
    setWorkspaceStatus(instance.status === 'sealed' ? 'sealed' : 'active');
    console.log('📂 Workspace cargado:', instance.id);
  }, []);

  const sectionLabelMap: Record<AstrologyTarotSectionId, string> = {
    'tarot-natal': 'Carta Natal',
    'tarot-tree-spread': 'Tirada del Árbol',
    'tarot-free-spread': 'Tirada Libre',
    'tarot-correspondences': 'Correspondencias',
    'tarot-deck-view': 'Visualizar Mazo',
    'tarot-ai-draft': 'Preparar Análisis IA',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Star className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Workspace simbolico</p>
            <h1 className="text-2xl font-semibold text-gray-900">Tarot</h1>
          </div>
        </div>
        
        {/* Workspace Status Badge */}
        <div className="flex items-center gap-3">
          {workspaceStatus === 'active' && currentInstanceId && (
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Sesión activa
            </span>
          )}
          {workspaceStatus === 'sealed' && (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              <Lock className="h-3 w-3" />
              Sellado
            </span>
          )}
          
          <Link
            href="/dashboard/therapist"
            className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200"
          >
            Volver al espacio clinico
          </Link>
        </div>
      </header>

      <div className="flex">
        <AstrologyTarotSidebar
          activeSection={activeSection}
          onChange={setActiveSection}
        />
        <main className="flex-1 px-6 py-6">
          <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            Observacional. Con interpretación asistida, sin predicción clínica, sin automatización decisoria.
          </div>
          
          {/* Start Workspace Button */}
          {workspaceStatus === 'none' && patientId && (
            <div className="mb-4">
              <button
                onClick={handleStartWorkspace}
                disabled={isCreating || isStarting}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isCreating || isStarting) ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Iniciar Lectura de Tarot
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Seal Workspace Button */}
          {workspaceStatus === 'active' && currentInstanceId && (
            <div className="mb-4">
              <button
                onClick={handleSealWorkspace}
                disabled={isSealing}
                className="flex items-center gap-2 rounded-lg border border-green-600 bg-white px-4 py-2 text-sm font-medium text-green-700 shadow-sm hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSealing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                    Sellando...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Sellar Sesión
                  </>
                )}
              </button>
            </div>
          )}
          
          <div className="flex gap-6 items-start">
            <AstrologyTarotVisualCore
              activeSection={activeSection}
              patientId={patientId}
              patientBirthDate={patientBirthDate}
              selectedSystem={selectedSystem}
              onSystemChange={setSelectedSystem}
              onCardSelect={(card) => setSelectedCardId((card as { id?: string } | null)?.id ?? null)}
              instanceId={currentInstanceId}
              sessionId={currentSessionId}
              isWorkspaceActive={workspaceStatus === 'active'}
            />
            <aside className="w-72 space-y-4">
              {/* Historial de Lecturas */}
              <TarotHistoryPanel
                patientId={patientId ? parseInt(patientId, 10) : undefined}
                onLoadInstance={handleLoadInstance}
              />
              
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Panel interno</h3>
                <p className="text-xs text-gray-600">
                  Espacio reservado para notas humanas y observaciones narrativas.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Seccion activa</h3>
                <p className="text-xs text-gray-600">
                  {sectionLabelMap[activeSection]}
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import { Star, Play, Lock } from 'lucide-react';
import AstrologyTarotSidebar from './AstrologyTarotSidebar';
import AstrologyTarotVisualCore from './AstrologyTarotVisualCore';
import TarotHistoryPanel from './TarotHistoryPanel';
import type { AstrologyTarotSectionId, TarotSystemId } from './types';
import { getActivePatientId, getActivePatientName } from '@/lib/active-patient';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

// SWM Tarot hooks
import { useCreateTarotInstance } from '@/lib/api/swm/tarot/hooks/useCreateTarotInstance';
import { useStartTarotSession } from '@/lib/api/swm/tarot/hooks/useStartTarotSession';
import { useSealTarotWorkspace } from '@/lib/api/swm/tarot/hooks/useSealTarotWorkspace';
import { swmTarotApi } from '@/lib/api/swm/tarot/client';
import type { SpreadType, TarotSystem, WorkspaceInstanceList } from '@/lib/api/swm/tarot/types';
import { GuidedBlock } from '@/components/ui/guided-block';

interface AstrologyTarotWorkspaceProps {
  patientId?: string;
  patientBirthDate?: Date;
}

// Map frontend TarotSystemId to backend TarotSystem
// Backend Django model expects: 'rider-waite' | 'thoth' | 'marseille' | 'golden-dawn' | 'bota'
const systemIdToBackend: Record<TarotSystemId, TarotSystem> = {
  thoth: 'thoth',
  'golden-dawn': 'golden-dawn',
  rota: 'bota', // ROTA maps to BOTA system
  marsella: 'marseille',
  'rider-waite': 'rider-waite',
  'tarot-cabalistico': 'bota', // Kabbalistic tarot uses BOTA
  'oracle-symbolic': 'rider-waite', // Generic oracle uses Rider-Waite as base
  bota: 'bota',
  hermetic: 'golden-dawn', // Hermetic uses Golden Dawn
  sephiroth: 'bota', // Sephiroth uses BOTA
};

// Map frontend section to backend spread type
// Backend SpreadType choices: 'free', 'tree_of_life', 'cross', 'three_cards', 'horseshoe', 'sephiroth_path'
const sectionToSpreadType: Partial<Record<AstrologyTarotSectionId, SpreadType>> = {
  'tarot-natal': 'free',           // Carta natal uses free spread
  'tarot-tree-spread': 'tree_of_life',
  'tarot-free-spread': 'free',
  'tarot-correspondences': 'free', // Correspondences uses free spread
};

export default function AstrologyTarotWorkspace({
  patientId: patientIdProp,
  patientBirthDate: patientBirthDateProp,
}: AstrologyTarotWorkspaceProps) {
  const [activeSection, setActiveSection] =
    useState<AstrologyTarotSectionId>('tarot-natal');
  const [selectedSystem, setSelectedSystem] = useState<TarotSystemId>('thoth');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // Load active patient from global context
  const [patientId, setPatientId] = useState<string | undefined>(patientIdProp);
  const [patientName, setPatientName] = useState<string | undefined>(undefined);
  const [patientUserId, setPatientUserId] = useState<number | undefined>(undefined);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [patientBirthDate, setPatientBirthDate] = useState<Date | undefined>(patientBirthDateProp);
  
  useEffect(() => {
    const activeId = getActivePatientId();
    const activeName = getActivePatientName();
    
    if (activeId) {
      setPatientId(activeId.toString());
      setPatientName(activeName ?? undefined);
      
      // Fetch patient details to get user_id
      const fetchPatientUserId = async () => {
        setIsLoadingPatient(true);
        try {
          const token = getAuthToken();
          const response = await fetch(`${API_BASE_URL}/therapist/patients/${activeId}/profile/`, {
            headers: {
              'Authorization': `Token ${token}`,
            },
          });
          if (response.ok) {
            const profile = await response.json();
            console.log('👤 Patient profile loaded:', profile);
            setPatientUserId(profile.user_id || profile.user);
          }
        } catch (error) {
          console.error('Error fetching patient user_id:', error);
        } finally {
          setIsLoadingPatient(false);
        }
      };
      fetchPatientUserId();
    }
    
    // Listen for active patient changes
    const handlePatientChange = () => {
      const newId = getActivePatientId();
      const newName = getActivePatientName();
      setPatientId(newId?.toString() ?? undefined);
      setPatientName(newName ?? undefined);
      setPatientUserId(undefined);
    };
    
    window.addEventListener('activePatientChanged', handlePatientChange);
    return () => window.removeEventListener('activePatientChanged', handlePatientChange);
  }, []);
  
  // SWM State
  const [currentInstanceId, setCurrentInstanceId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [workspaceStatus, setWorkspaceStatus] = useState<'none' | 'active' | 'sealed'>('none');
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
  
  // SWM Hooks
  const { createInstance, isLoading: isCreating } = useCreateTarotInstance();
  const { startSession, isLoading: isStarting } = useStartTarotSession();
  const { sealWorkspace, isLoading: isSealing } = useSealTarotWorkspace();

  // Auto-load active workspace when patientUserId is available
  useEffect(() => {
    if (!patientUserId) return;
    
    const loadActiveWorkspace = async () => {
      setIsLoadingWorkspace(true);
      try {
        // Check for existing active workspace (created or in_progress)
        const workspaces = await swmTarotApi.listWorkspaces({
          subject_user_id: patientUserId,
        });
        
        // Find active workspace (not sealed, not reviewed)
        const activeWorkspace = workspaces.find(
          w => w.status === 'created' || w.status === 'in_progress'
        );
        
        if (activeWorkspace) {
          console.log('📂 Auto-loading active workspace:', activeWorkspace.id);
          setCurrentInstanceId(activeWorkspace.id);
          setWorkspaceStatus('active');
        } else {
          console.log('ℹ️ No active workspace found for patient');
          setCurrentInstanceId(null);
          setWorkspaceStatus('none');
        }
      } catch (error) {
        console.error('Error loading active workspace:', error);
      } finally {
        setIsLoadingWorkspace(false);
      }
    };
    
    loadActiveWorkspace();
  }, [patientUserId]);

  // Start a new workspace
  const handleStartWorkspace = useCallback(async () => {
    if (!patientId || !patientUserId) {
      console.warn('Cannot start workspace: patientId or patientUserId missing');
      return;
    }
    
    try {
      // Create instance using User ID (not Patient ID)
      console.log('🚀 Creating workspace instance with user_id:', patientUserId);
      const instance = await createInstance({
        subject_user_id: patientUserId,
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
  }, [patientId, patientUserId, activeSection, selectedSystem, createInstance, startSession]);

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
          {workspaceStatus === 'none' && !patientId && (
            <GuidedBlock
              variant="missing"
              role="therapist"
              title="Consultante no seleccionado"
              description="Selecciona un consultante para iniciar una lectura de Tarot."
              steps={[
                { label: 'Selecciona un consultante en el indicador superior' },
                { label: 'Haz clic en «Iniciar Lectura de Tarot»' },
              ]}
              actions={[{ label: 'Elegir consultante', href: '/dashboard/therapist/patients' }]}
              compact
              className="mb-4"
            />
          )}
          {workspaceStatus === 'none' && patientId && (
            <div className="mb-4">
              <button
                onClick={handleStartWorkspace}
                disabled={isCreating || isStarting || isLoadingPatient || isLoadingWorkspace || !patientUserId}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingPatient || isLoadingWorkspace ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {isLoadingWorkspace ? 'Verificando workspace...' : 'Cargando consultante...'}
                  </>
                ) : (isCreating || isStarting) ? (
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
          
          {/* Active Workspace Indicator */}
          {workspaceStatus === 'active' && currentInstanceId && (
            <div className="mb-4 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-700">Workspace activo</span>
              </div>
              <button
                onClick={handleSealWorkspace}
                disabled={isSealing}
                className="flex items-center gap-2 rounded-lg border border-amber-600 bg-white px-4 py-2 text-sm font-medium text-amber-700 shadow-sm hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSealing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
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
              patientName={patientName}
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

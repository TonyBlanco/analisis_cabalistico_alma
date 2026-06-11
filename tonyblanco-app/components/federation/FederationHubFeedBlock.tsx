'use client';

import { useEffect, useState } from 'react';
import {
  getFederationHubFeed,
  HubFeedRecord,
  HubFeedSnapshot,
  FederationApiError,
  HubCode,
} from '@lib/api/federation';
import { GuidedBlock } from '@/components/ui/guided-block';

interface FederationHubFeedBlockProps {
  hub: HubCode;
  patientId: number | null;
  title?: string;
}

function renderVisibilityBadge(visibility: string) {
  const normalized = visibility.toLowerCase();
  
  if (normalized === 'public' || normalized === 'patient') {
    return { label: 'public', className: 'bg-blue-100 text-blue-800' };
  }
  
  if (normalized === 'professional' || normalized === 'therapist') {
    return { label: 'pro', className: 'bg-purple-100 text-purple-800' };
  }
  
  if (normalized === 'both') {
    return { label: 'public + pro', className: 'bg-emerald-100 text-emerald-800' };
  }
  
  return { label: visibility, className: 'bg-gray-100 text-gray-800' };
}

export default function FederationHubFeedBlock({
  hub,
  patientId,
  title,
}: FederationHubFeedBlockProps) {
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedErrorType, setFeedErrorType] = useState<'consent' | 'no_access' | 'generic' | null>(null);
  const [feedRecords, setFeedRecords] = useState<HubFeedRecord[]>([]);
  const [feedMetadata, setFeedMetadata] = useState<HubFeedSnapshot['metadata'] | null>(null);

  const displayTitle = title || `Feed federado (${hub})`;

  const loadFeed = async () => {
    if (!patientId || Number.isNaN(patientId)) {
      setFeedError(null);
      setFeedRecords([]);
      setFeedMetadata(null);
      return;
    }

    setFeedLoading(true);
    setFeedError(null);
    setFeedErrorType(null);

    try {
      const snapshot = await getFederationHubFeed({ patientId, hub });
      setFeedRecords(snapshot.records || []);
      setFeedMetadata(snapshot.metadata || null);
    } catch (error) {
      const apiError = error as FederationApiError;
      const status = apiError.status;

      if (status === 400) {
        setFeedErrorType('generic');
        setFeedError('Parámetros inválidos.');
      } else if (status === 403) {
        const isConsentIssue = apiError.message?.toLowerCase().includes('consent');
        setFeedErrorType(isConsentIssue ? 'consent' : 'no_access');
        setFeedError(null);
      } else if (status === 401) {
        setFeedErrorType('generic');
        setFeedError('Sesión no válida. Inicia sesión para continuar.');
      } else {
        setFeedErrorType('generic');
        setFeedError('Error temporal al conectar con el servidor federado.');
      }

      setFeedRecords([]);
      setFeedMetadata(null);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [patientId, hub]);

  const handleRefresh = () => {
    if (!patientId || Number.isNaN(patientId)) {
      setFeedError('Selecciona consultante para ver el feed federado.');
      return;
    }
    loadFeed();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">{displayTitle}</h3>
          <p className="text-sm text-gray-600">
            Lectura transversal read-only. Sin escritura ni datos sensibles.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={feedLoading}
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {feedLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {!patientId && (
        <GuidedBlock
          variant="info"
          role="therapist"
          compact
          title="Selecciona un consultante"
          description="Elige un consultante activo para ver el feed federado de este módulo."
        />
      )}

      {patientId && feedLoading && (
        <p className="text-sm text-gray-600">Cargando...</p>
      )}

      {patientId && !feedLoading && feedErrorType === 'consent' && (
        <GuidedBlock
          variant="consent"
          role="both"
          title="Consentimiento federado requerido"
          description="El consultante no ha autorizado el acceso federado a sus datos. Sin este consentimiento, la síntesis holística no puede generarse."
          steps={[
            { label: 'Ir al perfil del consultante' },
            { label: 'Solicitar consentimiento de federación de datos' },
            { label: 'El consultante acepta desde su portal personal' },
            { label: 'Volver a esta vista — el feed se desbloqueará automáticamente' },
          ]}
          actions={[
            {
              label: 'Ver perfil del consultante',
              href: patientId ? `/dashboard/therapist/patients/${patientId}` : '/dashboard/therapist/patients',
            },
          ]}
        />
      )}

      {patientId && !feedLoading && feedErrorType === 'no_access' && (
        <GuidedBlock
          variant="locked"
          role="therapist"
          compact
          title="Consultante no asignado"
          description="Este consultante no está asignado a tu cuenta de terapeuta. Verifica la asignación en el panel de pacientes."
          actions={[{ label: 'Ir a Pacientes', href: '/dashboard/therapist/patients' }]}
        />
      )}

      {patientId && !feedLoading && feedErrorType === 'generic' && feedError && (
        <GuidedBlock
          variant="missing"
          role="therapist"
          compact
          title="Error al cargar feed federado"
          description={feedError}
          actions={[{ label: 'Reintentar', onClick: handleRefresh, variant: 'primary' }]}
        />
      )}

      {patientId && !feedLoading && !feedErrorType && feedRecords.length === 0 && (
        <GuidedBlock
          variant="info"
          compact
          title="Sin registros federados"
          description="No hay registros disponibles en el feed federado para este consultante en este módulo todavía."
        />
      )}

      {patientId && !feedLoading && !feedError && feedRecords.length > 0 && (
        <div className="space-y-4">
          {feedMetadata && (
            <div className="text-xs text-gray-500">
              {feedMetadata.records_count} registros · Generado {new Date(feedMetadata.generated_at).toLocaleString('es-ES')}
            </div>
          )}

          {[...feedRecords]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((record) => {
              const badge = renderVisibilityBadge(record.visibility);
              
              return (
                <div key={record.record_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {record.module_code} · {record.kind}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(record.created_at).toLocaleString('es-ES')}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-800">
                    {record.summary_pro || record.summary_public || 'Sin resumen disponible'}
                  </p>

                  {record.tags && record.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {record.tags.slice(0, 6).map((tag) => (
                        <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

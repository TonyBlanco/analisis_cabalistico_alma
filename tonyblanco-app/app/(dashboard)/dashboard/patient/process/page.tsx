 'use client';

import { useEffect, useState } from 'react';
import { getAuthToken, API_BASE_URL } from '@/lib/api';
import ArbolVivoPanel from '@/components/CabalAppliedWorkspace/ArbolVivoPanel';
import { Heart, Map, BookOpen, ChevronRight, Sparkles } from 'lucide-react';

interface UserProfile {
  id: number;
  uuid?: string;
  full_name?: string;
  legal_full_name?: string;
}

interface NarrativeDocument {
  id: string;
  type: string;
  type_display: string;
  title: string;
  content: any;
  created_at: string;
  generated_by: string;
}

const DOCUMENT_ICONS: Record<string, React.ReactNode> = {
  soul_letter: <Heart className="w-5 h-5 text-rose-500" />,
  journey_map: <Map className="w-5 h-5 text-blue-500" />,
  process_book: <BookOpen className="w-5 h-5 text-amber-500" />,
};

const DOCUMENT_COLORS: Record<string, string> = {
  soul_letter: 'from-rose-50 to-pink-50 border-rose-100',
  journey_map: 'from-blue-50 to-indigo-50 border-blue-100',
  process_book: 'from-amber-50 to-orange-50 border-amber-100',
};

export default function PatientProcessPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [documents, setDocuments] = useState<NarrativeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<NarrativeDocument | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const token = getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Cargar perfil
        const profileRes = await fetch('http://127.0.0.1:8000/api/auth/user/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (profileRes.ok) {
          const data = await profileRes.json();
          setUserProfile(data);
        }

        // Cargar documentos narrativos
        const docsRes = await fetch(`${API_BASE_URL}/narrative-documents/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (docsRes.ok) {
          const docsData = await docsRes.json();
          if (docsData.success && docsData.documents) {
            setDocuments(docsData.documents);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse flex items-center justify-center h-64">
          <div className="text-gray-400">Cargando tu progreso...</div>
        </div>
      </div>
    );
  }

  // Si hay un documento seleccionado, mostrar vista de detalle
  if (selectedDoc) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => setSelectedDoc(null)}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
        >
          ← Volver a mi proceso
        </button>
        
        <div className={`bg-gradient-to-r ${DOCUMENT_COLORS[selectedDoc.type] || 'from-gray-50 to-slate-50'} rounded-xl p-6 border`}>
          <div className="flex items-center gap-3 mb-4">
            {DOCUMENT_ICONS[selectedDoc.type]}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedDoc.title}</h1>
              <p className="text-sm text-gray-600">
                Creado el {new Date(selectedDoc.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })} por {selectedDoc.generated_by}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido del documento */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm prose prose-indigo max-w-none">
          {typeof selectedDoc.content === 'string' ? (
            <div dangerouslySetInnerHTML={{ __html: selectedDoc.content.replace(/\n/g, '<br/>') }} />
          ) : selectedDoc.content?.body ? (
            <div>
              {selectedDoc.content.opening && (
                <p className="text-lg italic text-gray-600 mb-6">{selectedDoc.content.opening}</p>
              )}
              <div className="whitespace-pre-wrap">{selectedDoc.content.body}</div>
              {selectedDoc.content.closing && (
                <p className="text-lg italic text-gray-600 mt-6">{selectedDoc.content.closing}</p>
              )}
            </div>
          ) : (
            <pre className="text-sm">{JSON.stringify(selectedDoc.content, null, 2)}</pre>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
        <h1 className="text-2xl font-bold text-emerald-900 flex items-center gap-3">
          🌳 Mi Proceso Terapéutico
        </h1>
        <p className="text-emerald-700 mt-2">
          Tu viaje de transformación interior, visualizado y documentado.
        </p>
      </div>

      {/* Documentos Narrativos */}
      {documents.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">Mis Documentos del Alma</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Documentos narrativos creados por tu terapeuta para acompañar tu proceso.
          </p>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`text-left bg-gradient-to-r ${DOCUMENT_COLORS[doc.type] || 'from-gray-50 to-slate-50'} rounded-lg p-4 border hover:shadow-md transition-shadow group`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {DOCUMENT_ICONS[doc.type]}
                    <span className="font-medium text-gray-900">{doc.type_display}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{doc.title}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(doc.created_at).toLocaleDateString('es-ES')}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Árbol Vivo Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            🌳 Mi Árbol de la Vida
          </h2>
          <p className="text-emerald-100 text-sm">
            Tu progreso visualizado como un árbol que crece contigo.
          </p>
        </div>
        <div className="p-4">
          <ArbolVivoPanel
            consultantUuid={userProfile?.uuid}
            consultantName={userProfile?.full_name || userProfile?.legal_full_name || 'Consultante'}
            readOnly={true}
            onProgressUpdate={(progress) => {
              console.log('[PatientProcess] Progress updated:', progress);
            }}
          />
        </div>
      </div>

      {/* Nota motivacional */}
      <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💫</span>
          <div>
            <h3 className="font-semibold text-amber-900">Tu viaje es único</h3>
            <p className="text-sm text-amber-700 mt-1">
              No compares tu proceso con el de otros. Cada alma germina a su propio ritmo.
              Lo importante es la constancia y la intención amorosa con la que cuidas tu crecimiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

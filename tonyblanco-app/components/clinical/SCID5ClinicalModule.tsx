'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getActivePatient } from '@/lib/active-patient';
import { API_BASE_URL, getAuthToken } from '@/lib/api';

type SectionKey =
  | 'emotional_vitality'
  | 'anxiety_calm'
  | 'meaning_reality'
  | 'impact_memory'
  | 'self_regulation'
  | 'identity_relationships';

type IntensityLevel = 'leve' | 'moderada' | 'intensa' | 'no_aplica';

interface SectionData {
  explorado: boolean;
  patrones_observados: boolean;
  intensidad_experiencial: IntensityLevel;
  notas_observacionales: string;
}

interface HolisticData {
  holistic_exploration: Record<SectionKey, SectionData>;
  additional_observations: string;
  holistic_summary: string;
}

const SECTIONS: Record<SectionKey, { title: string; description: string }> = {
  emotional_vitality: {
    title: 'Estado emocional y vitalidad',
    description: 'Explorar la cualidad general del estado emocional y la energía vital de la persona.',
  },
  anxiety_calm: {
    title: 'Ansiedad, preocupación y calma interior',
    description: 'Explorar la relación de la persona con la inquietud, la anticipación y la sensación de seguridad interna.',
  },
  meaning_reality: {
    title: 'Experiencia de realidad y significado',
    description: 'Explorar cómo la persona construye significado, interpreta su experiencia y se relaciona con su mundo interno.',
  },
  impact_memory: {
    title: 'Experiencias de impacto, memoria y estrés',
    description: 'Explorar vivencias que han dejado huella emocional o corporal.',
  },
  self_regulation: {
    title: 'Autorregulación y conducta',
    description: 'Explorar la relación de la persona con sus impulsos, decisiones y acciones.',
  },
  identity_relationships: {
    title: 'Patrones de identidad y relación',
    description: 'Explorar patrones estables de relación consigo mismo y con los demás.',
  },
};

const INITIAL_SECTION: SectionData = {
  explorado: false,
  patrones_observados: false,
  intensidad_experiencial: 'no_aplica',
  notas_observacionales: '',
};

const INITIAL_DATA: HolisticData = {
  holistic_exploration: {
    emotional_vitality: { ...INITIAL_SECTION },
    anxiety_calm: { ...INITIAL_SECTION },
    meaning_reality: { ...INITIAL_SECTION },
    impact_memory: { ...INITIAL_SECTION },
    self_regulation: { ...INITIAL_SECTION },
    identity_relationships: { ...INITIAL_SECTION },
  },
  additional_observations: '',
  holistic_summary: '',
};

export default function SCID5ClinicalModule() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<HolisticData>(INITIAL_DATA);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const patientId = searchParams?.get('patient_id');
  const activePatient = getActivePatient();

  useEffect(() => {
    if (!patientId && activePatient) {
      // Could redirect, but since client handles it, assume it's set
    }
  }, [patientId, activePatient]);

  const updateSection = (key: SectionKey, field: keyof SectionData, value: any) => {
    setData((prev) => ({
      ...prev,
      holistic_exploration: {
        ...prev.holistic_exploration,
        [key]: {
          ...prev.holistic_exploration[key],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!patientId || saving) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/analysis-records/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          kind: 'holistic_exploration',
          patient: parseInt(patientId),
          raw_input: data,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al guardar');
      }

      setSuccess(true);
      // Reset form or keep as is
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const hasIncompleteRequired = Object.values(data.holistic_exploration).some(
    (section) => section.patrones_observados && !section.notas_observacionales.trim()
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          SCID-5 — Exploración Holística Estructurada
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Herramienta de exploración holística (no diagnóstica). Uso exclusivo del terapeuta.
        </p>
        {activePatient && (
          <p className="text-xs text-gray-500">
            Paciente: {activePatient.name} (ID: {activePatient.id})
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">Registro guardado exitosamente.</p>
        </div>
      )}

      <div className="space-y-4">
        {(Object.keys(SECTIONS) as SectionKey[]).map((key) => {
          const section = SECTIONS[key];
          const sectionData = data.holistic_exploration[key];
          return (
            <details key={key} className="bg-white border border-gray-200 rounded-lg">
              <summary className="cursor-pointer p-4 font-medium text-gray-900 hover:bg-gray-50">
                {section.title}
              </summary>
              <div className="p-4 border-t border-gray-200 space-y-4">
                <p className="text-sm text-gray-600">{section.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sectionData.explorado}
                      onChange={(e) => updateSection(key, 'explorado', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">¿Se exploró esta área?</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sectionData.patrones_observados}
                      onChange={(e) => updateSection(key, 'patrones_observados', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">¿Se observaron patrones?</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intensidad experiencial
                  </label>
                  <select
                    value={sectionData.intensidad_experiencial}
                    onChange={(e) => updateSection(key, 'intensidad_experiencial', e.target.value as IntensityLevel)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="no_aplica">No aplica</option>
                    <option value="leve">Leve</option>
                    <option value="moderada">Moderada</option>
                    <option value="intensa">Intensa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas observacionales
                    {sectionData.patrones_observados && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <textarea
                    value={sectionData.notas_observacionales}
                    onChange={(e) => updateSection(key, 'notas_observacionales', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    placeholder="Registrar observaciones clínicas..."
                  />
                </div>
              </div>
            </details>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones holísticas adicionales
        </label>
        <textarea
          value={data.additional_observations}
          onChange={(e) => setData((prev) => ({ ...prev, additional_observations: e.target.value }))}
          rows={4}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          placeholder="Factores culturales, espirituales, contextuales..."
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Síntesis holística del acompañante *
        </label>
        <textarea
          value={data.holistic_summary}
          onChange={(e) => setData((prev) => ({ ...prev, holistic_summary: e.target.value }))}
          rows={6}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          placeholder="Síntesis elaborada desde una mirada holística e integradora..."
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || hasIncompleteRequired || !data.holistic_summary.trim()}
          className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar Registro'}
        </button>
      </div>
    </div>
  );
}
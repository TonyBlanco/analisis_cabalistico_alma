'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  FileText, 
  Tag, 
  Save, 
  Sparkles, 
  RefreshCw, 
  ChevronDown,
  ChevronUp,
  Bookmark,
  Calendar,
  Hash,
  BookOpen,
  Brain,
  Loader2,
  Trash2,
  Eye,
  Info,
} from 'lucide-react';
import {
  listGematriaReadings,
  listGematriaSyntheses,
  type GematriaReadingListItem,
  type GematriaSynthesis,
} from '@/lib/gematria-readings-api';
import { saveCabalaAplicadaMethodRecord } from '@/lib/cabala-aplicada-api';

// ============================================================================
// TYPES
// ============================================================================

export interface ReflectionTemplate {
  id: string;
  sefira: string;
  title: string;
  prompt: string;
  category: 'exploration' | 'integration' | 'meditation' | 'insight';
}

export interface SymbolicNote {
  id: string;
  content: string;
  tags: string[];
  sefira?: string;
  method?: string;
  cycle?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NoteTag = {
  id: string;
  label: string;
  color: 'indigo' | 'purple' | 'emerald' | 'amber' | 'rose';
  category: 'sefira' | 'method' | 'cycle' | 'theme';
};

// ============================================================================
// CONSTANTS
// ============================================================================

const SEFIROT_LIST = [
  'Keter', 'Chokmah', 'Binah', 'Chesed', 'Geburah',
  'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
] as const;

const METHOD_LIST = [
  'Pitágoras', 'Gematría', 'Notarikón', 'Temurá', 'Soul Map', 'Ciclos Tikún'
] as const;

const CYCLE_LIST = [
  'Anual', 'Lunar', 'Semanal', 'Sincronicidad'
] as const;

// P2.3: Reflection Templates by Sefira
const REFLECTION_TEMPLATES: ReflectionTemplate[] = [
  // Keter
  {
    id: 'keter-purpose',
    sefira: 'Keter',
    title: 'Propósito del Alma',
    prompt: '¿Cuál es la intención más elevada que el consultante expresa en este momento de su vida?',
    category: 'exploration'
  },
  {
    id: 'keter-unity',
    sefira: 'Keter',
    title: 'Conexión con la Unidad',
    prompt: '¿Qué experiencias le conectan con algo más grande que sí mismo?',
    category: 'meditation'
  },
  // Chokmah
  {
    id: 'chokmah-insight',
    sefira: 'Chokmah',
    title: 'Destellos de Sabiduría',
    prompt: '¿Qué intuiciones o insights han surgido espontáneamente durante la sesión?',
    category: 'insight'
  },
  {
    id: 'chokmah-creativity',
    sefira: 'Chokmah',
    title: 'Impulso Creativo',
    prompt: '¿Dónde observo chispas de creatividad no manifestada en el consultante?',
    category: 'exploration'
  },
  // Binah
  {
    id: 'binah-understanding',
    sefira: 'Binah',
    title: 'Comprensión Profunda',
    prompt: '¿Qué ha comprendido el consultante que antes no podía ver?',
    category: 'integration'
  },
  {
    id: 'binah-structure',
    sefira: 'Binah',
    title: 'Estructuras de Pensamiento',
    prompt: '¿Qué patrones de pensamiento necesitan ser revisados?',
    category: 'exploration'
  },
  // Chesed
  {
    id: 'chesed-expansion',
    sefira: 'Chesed',
    title: 'Expansión y Generosidad',
    prompt: '¿Cómo puede el consultante expandir su capacidad de dar y recibir amor?',
    category: 'meditation'
  },
  {
    id: 'chesed-abundance',
    sefira: 'Chesed',
    title: 'Conciencia de Abundancia',
    prompt: '¿Qué bloqueos impiden recibir la abundancia disponible?',
    category: 'insight'
  },
  // Geburah
  {
    id: 'geburah-boundaries',
    sefira: 'Geburah',
    title: 'Límites Saludables',
    prompt: '¿Qué límites necesita establecer o reforzar el consultante?',
    category: 'exploration'
  },
  {
    id: 'geburah-strength',
    sefira: 'Geburah',
    title: 'Fortaleza Interior',
    prompt: '¿Qué desafíos ha superado que demuestran su fortaleza?',
    category: 'insight'
  },
  // Tiferet
  {
    id: 'tiferet-balance',
    sefira: 'Tiferet',
    title: 'Punto de Equilibrio',
    prompt: '¿Dónde está el centro de armonía entre los opuestos que enfrenta?',
    category: 'integration'
  },
  {
    id: 'tiferet-beauty',
    sefira: 'Tiferet',
    title: 'Belleza del Alma',
    prompt: '¿Qué cualidades hermosas del alma se están revelando?',
    category: 'meditation'
  },
  // Netzach
  {
    id: 'netzach-persistence',
    sefira: 'Netzach',
    title: 'Victoria Gradual',
    prompt: '¿Qué pequeños avances constantes merecen ser reconocidos?',
    category: 'insight'
  },
  {
    id: 'netzach-emotion',
    sefira: 'Netzach',
    title: 'Vida Emocional',
    prompt: '¿Cómo fluyen las emociones del consultante y dónde se estancan?',
    category: 'exploration'
  },
  // Hod
  {
    id: 'hod-intellect',
    sefira: 'Hod',
    title: 'Claridad Mental',
    prompt: '¿Qué pensamientos necesitan ser ordenados o simplificados?',
    category: 'exploration'
  },
  {
    id: 'hod-gratitude',
    sefira: 'Hod',
    title: 'Práctica de Gratitud',
    prompt: '¿Por qué puede agradecer el consultante en este momento?',
    category: 'meditation'
  },
  // Yesod
  {
    id: 'yesod-foundation',
    sefira: 'Yesod',
    title: 'Fundamentos Internos',
    prompt: '¿Qué base interna necesita fortalecerse para sostener el crecimiento?',
    category: 'integration'
  },
  {
    id: 'yesod-connection',
    sefira: 'Yesod',
    title: 'Conexión Cuerpo-Mente',
    prompt: '¿Cómo se manifiesta el estado interior en el cuerpo físico?',
    category: 'insight'
  },
  // Malkuth
  {
    id: 'malkuth-action',
    sefira: 'Malkuth',
    title: 'Manifestación Concreta',
    prompt: '¿Qué acción concreta puede integrar los aprendizajes de esta sesión?',
    category: 'integration'
  },
  {
    id: 'malkuth-grounding',
    sefira: 'Malkuth',
    title: 'Arraigo en lo Cotidiano',
    prompt: '¿Cómo traducir los insights simbólicos a la vida diaria?',
    category: 'exploration'
  }
];

const TAG_PRESETS: NoteTag[] = [
  // Sefirot tags
  ...SEFIROT_LIST.map(s => ({
    id: `tag-${s.toLowerCase()}`,
    label: s,
    color: 'indigo' as const,
    category: 'sefira' as const
  })),
  // Method tags
  { id: 'tag-pitagoras', label: 'Pitágoras', color: 'purple', category: 'method' },
  { id: 'tag-gematria', label: 'Gematría', color: 'purple', category: 'method' },
  { id: 'tag-notarikon', label: 'Notarikón', color: 'purple', category: 'method' },
  { id: 'tag-temura', label: 'Temurá', color: 'purple', category: 'method' },
  // Cycle tags
  { id: 'tag-cycle-annual', label: 'Ciclo Anual', color: 'emerald', category: 'cycle' },
  { id: 'tag-cycle-lunar', label: 'Ciclo Lunar', color: 'emerald', category: 'cycle' },
  { id: 'tag-cycle-weekly', label: 'Ciclo Semanal', color: 'emerald', category: 'cycle' },
  // Theme tags
  { id: 'tag-tikun', label: 'Tikún', color: 'amber', category: 'theme' },
  { id: 'tag-integration', label: 'Integración', color: 'amber', category: 'theme' },
  { id: 'tag-meditation', label: 'Meditación', color: 'rose', category: 'theme' },
  { id: 'tag-insight', label: 'Insight', color: 'rose', category: 'theme' },
];

const CATEGORY_COLORS = {
  exploration: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  integration: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  meditation: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  insight: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

const CATEGORY_LABELS = {
  exploration: 'Exploración',
  integration: 'Integración',
  meditation: 'Meditación',
  insight: 'Insight',
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface ReflectionTemplatesProps {
  onSelectTemplate: (template: ReflectionTemplate) => void;
  activeSefira?: string;
}

export function ReflectionTemplates({ onSelectTemplate, activeSefira }: ReflectionTemplatesProps) {
  const [expandedSefira, setExpandedSefira] = useState<string | null>(activeSefira || null);
  const [filterCategory, setFilterCategory] = useState<ReflectionTemplate['category'] | 'all'>('all');

  const groupedTemplates = useMemo(() => {
    const filtered = filterCategory === 'all' 
      ? REFLECTION_TEMPLATES 
      : REFLECTION_TEMPLATES.filter(t => t.category === filterCategory);
    
    return SEFIROT_LIST.reduce((acc, sefira) => {
      acc[sefira] = filtered.filter(t => t.sefira === sefira);
      return acc;
    }, {} as Record<string, ReflectionTemplate[]>);
  }, [filterCategory]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          Plantillas de Reflexión
        </h4>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as any)}
          className="text-xs rounded-md border-gray-200 py-1 px-2"
        >
          <option value="all">Todas</option>
          <option value="exploration">Exploración</option>
          <option value="integration">Integración</option>
          <option value="meditation">Meditación</option>
          <option value="insight">Insight</option>
        </select>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {SEFIROT_LIST.map((sefira) => {
          const templates = groupedTemplates[sefira];
          if (!templates?.length) return null;
          
          const isExpanded = expandedSefira === sefira;
          const isActive = activeSefira === sefira;
          
          return (
            <div 
              key={sefira}
              className={`rounded-lg border ${isActive ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200 bg-white'}`}
            >
              <button
                type="button"
                onClick={() => setExpandedSefira(isExpanded ? null : sefira)}
                className="w-full flex items-center justify-between px-3 py-2 text-left"
              >
                <span className={`text-sm font-medium ${isActive ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {sefira}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{templates.length}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  {templates.map((template) => {
                    const colors = CATEGORY_COLORS[template.category];
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => onSelectTemplate(template)}
                        className={`w-full text-left rounded-md border ${colors.border} ${colors.bg} p-2 hover:opacity-80 transition-opacity`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${colors.text}`}>
                            {template.title}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                            {CATEGORY_LABELS[template.category]}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 line-clamp-2">
                          {template.prompt}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SymbolicNoteEditorProps {
  initialContent?: string;
  selectedTags?: string[];
  onSave: (note: Omit<SymbolicNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  promptText?: string;
}

export function SymbolicNoteEditor({ 
  initialContent = '', 
  selectedTags = [], 
  onSave,
  promptText 
}: SymbolicNoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState<string[]>(selectedTags);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    try {
      onSave({
        content: content.trim(),
        tags,
        sefira: tags.find(t => SEFIROT_LIST.includes(t as any)),
        method: tags.find(t => METHOD_LIST.some(m => t.toLowerCase().includes(m.toLowerCase()))),
        cycle: tags.find(t => CYCLE_LIST.some(c => t.toLowerCase().includes(c.toLowerCase()))),
      });
      // Don't clear - let parent decide
    } finally {
      setIsSaving(false);
    }
  }, [content, tags, onSave]);

  const toggleTag = (tagLabel: string) => {
    setTags(prev => 
      prev.includes(tagLabel) 
        ? prev.filter(t => t !== tagLabel)
        : [...prev, tagLabel]
    );
  };

  const groupedTags = useMemo(() => {
    return {
      sefira: TAG_PRESETS.filter(t => t.category === 'sefira'),
      method: TAG_PRESETS.filter(t => t.category === 'method'),
      cycle: TAG_PRESETS.filter(t => t.category === 'cycle'),
      theme: TAG_PRESETS.filter(t => t.category === 'theme'),
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Prompt from template */}
      {promptText && (
        <div className="rounded-md bg-indigo-50 border border-indigo-200 p-3">
          <p className="text-sm text-indigo-700 italic">"{promptText}"</p>
        </div>
      )}

      {/* Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas Simbólicas
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe tus reflexiones y observaciones simbólicas..."
          className="w-full h-32 rounded-md border-gray-200 text-sm resize-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Selected Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => {
            const preset = TAG_PRESETS.find(t => t.label === tag);
            const colorClass = preset?.color === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
                              preset?.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                              preset?.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                              preset?.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700';
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-2 py-0.5 rounded-full text-xs ${colorClass} hover:opacity-70`}
              >
                {tag} ×
              </button>
            );
          })}
        </div>
      )}

      {/* Tag Picker */}
      <div>
        <button
          type="button"
          onClick={() => setShowTagPicker(!showTagPicker)}
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-800"
        >
          <Tag className="h-3.5 w-3.5" />
          {showTagPicker ? 'Ocultar etiquetas' : 'Agregar etiquetas'}
        </button>
        
        {showTagPicker && (
          <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-3 space-y-3">
            {/* Sefirot */}
            <div>
              <p className="text-[10px] uppercase text-gray-500 mb-1">Sefirot</p>
              <div className="flex flex-wrap gap-1">
                {groupedTags.sefira.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.label)}
                    className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${
                      tags.includes(tag.label)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Methods */}
            <div>
              <p className="text-[10px] uppercase text-gray-500 mb-1">Métodos</p>
              <div className="flex flex-wrap gap-1">
                {groupedTags.method.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.label)}
                    className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${
                      tags.includes(tag.label)
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cycles */}
            <div>
              <p className="text-[10px] uppercase text-gray-500 mb-1">Ciclos</p>
              <div className="flex flex-wrap gap-1">
                {groupedTags.cycle.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.label)}
                    className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${
                      tags.includes(tag.label)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div>
              <p className="text-[10px] uppercase text-gray-500 mb-1">Temas</p>
              <div className="flex flex-wrap gap-1">
                {groupedTags.theme.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.label)}
                    className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${
                      tags.includes(tag.label)
                        ? `${tag.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'} text-white`
                        : `${tag.color === 'amber' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={!content.trim() || isSaving}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        <Save className="h-4 w-4" />
        {isSaving ? 'Guardando...' : 'Guardar Nota'}
      </button>
    </div>
  );
}

interface NarrativeIntegrationPanelProps {
  consultanteId: number | null;
  consultanteName: string | null;
  activeSefira?: string;
  activeMethod?: string;
  onNotesSaved?: (notes: SymbolicNote[]) => void;
}

export function NarrativeIntegrationPanel({
  consultanteId,
  consultanteName,
  activeSefira,
  activeMethod,
  onNotesSaved,
}: NarrativeIntegrationPanelProps) {
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [savedNotes, setSavedNotes] = useState<SymbolicNote[]>([]);
  const [view, setView] = useState<'editor' | 'history'>('editor');
  
  // Gematria readings state
  const [gematriaReadings, setGematriaReadings] = useState<GematriaReadingListItem[]>([]);
  const [gematriaSyntheses, setGematriaSyntheses] = useState<GematriaSynthesis[]>([]);
  const [loadingGematria, setLoadingGematria] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Load gematria readings
  useEffect(() => {
    if (!consultanteId) return;
    
    const loadGematriaData = async () => {
      setLoadingGematria(true);
      try {
        const [readingsRes, synthesisRes] = await Promise.all([
          listGematriaReadings(consultanteId).catch(() => ({ readings: [] })),
          listGematriaSyntheses(consultanteId).catch(() => ({ syntheses: [] })),
        ]);
        setGematriaReadings(readingsRes.readings || []);
        setGematriaSyntheses(synthesisRes.syntheses || []);
      } catch (err) {
        console.error('Error loading gematria data:', err);
      } finally {
        setLoadingGematria(false);
      }
    };
    
    loadGematriaData();
  }, [consultanteId]);

  const handleSelectTemplate = useCallback((template: ReflectionTemplate) => {
    setActivePrompt(template.prompt);
    setView('editor');
  }, []);

  const handleSaveNote = useCallback(async (note: Omit<SymbolicNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!consultanteId) return;
    
    setSavingNote(true);
    setSaveError(null);
    setSaveSuccess(null);
    
    const newNote: SymbolicNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    try {
      // Save to backend as AnalysisRecord
      await saveCabalaAplicadaMethodRecord(consultanteId, {
        method_id: 'narrative_note',
        method_name: 'Nota Simbólica Narrativa',
        input: {
          content: note.content,
          tags: note.tags,
          sefira: note.sefira,
          method: note.method,
          cycle: note.cycle,
          prompt: activePrompt,
          source: 'narrative_integration',
        },
        method_output: {
          type: 'symbolic_note',
          saved_at: new Date().toISOString(),
        },
      });
      
      setSavedNotes(prev => [newNote, ...prev]);
      onNotesSaved?.([newNote, ...savedNotes]);
      setActivePrompt(null);
      setSaveSuccess('Nota guardada correctamente');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving note:', err);
      setSaveError(err.message || 'Error al guardar la nota');
      // Still add to local state
      setSavedNotes(prev => [newNote, ...prev]);
    } finally {
      setSavingNote(false);
    }
  }, [consultanteId, savedNotes, onNotesSaved, activePrompt]);

  if (!consultanteId) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          Seleccione un consultante para acceder a las herramientas de integración narrativa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          ✓ {saveSuccess}
        </div>
      )}
      {saveError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          ⚠ {saveError}
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Integración Narrativa</h3>
            <p className="text-xs text-gray-500">
              Notas simbólicas para {consultanteName || 'consultante'}
            </p>
          </div>
          <div className="group relative">
            <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-help transition-colors" />
            <div className="absolute left-0 top-6 invisible group-hover:visible bg-black text-white text-xs rounded-lg py-2 px-3 w-72 shadow-lg z-10">
              <p className="font-medium mb-1">Síntesis Narrativa Humana</p>
              <p>• Notas libres del terapeuta sobre el proceso</p>
              <p>• Templates reflexivos por Sefirá</p>
              <p>• Integración de insights de múltiples sesiones</p>
              <p>• Archivo de evolución terapéutica</p>
              <div className="absolute -top-1 left-4 w-2 h-2 bg-black transform rotate-45"></div>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setView('editor')}
            className={`px-3 py-1 rounded-md text-xs font-medium ${
              view === 'editor' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setView('history')}
            className={`px-3 py-1 rounded-md text-xs font-medium ${
              view === 'history' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Historial ({savedNotes.length})
          </button>
        </div>
      </div>
      
      {/* Gematria Readings Summary */}
      {(gematriaReadings.length > 0 || gematriaSyntheses.length > 0) && (
        <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-purple-600" />
            <h4 className="text-sm font-semibold text-purple-900">Lecturas Gematricas Guardadas</h4>
            {loadingGematria && <Loader2 className="h-3 w-3 animate-spin text-purple-400" />}
          </div>
          
          {gematriaReadings.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-purple-700 mb-2">
                {gematriaReadings.length} lectura(s) individual(es):
              </p>
              <div className="flex flex-wrap gap-2">
                {gematriaReadings.slice(0, 5).map((r) => (
                  <div 
                    key={r.id}
                    className="bg-white rounded px-2 py-1 text-xs border border-purple-100"
                  >
                    <span className="font-medium text-purple-700">{r.method_display}</span>
                    <span className="text-gray-500 ml-1">
                      ({new Date(r.created_at).toLocaleDateString('es-ES')})
                    </span>
                  </div>
                ))}
                {gematriaReadings.length > 5 && (
                  <span className="text-xs text-purple-500">
                    +{gematriaReadings.length - 5} más
                  </span>
                )}
              </div>
            </div>
          )}
          
          {gematriaSyntheses.length > 0 && (
            <div>
              <p className="text-xs text-purple-700 mb-2">
                {gematriaSyntheses.length} síntesis AI generada(s):
              </p>
              <div className="space-y-2">
                {gematriaSyntheses.slice(0, 2).map((s) => (
                  <div 
                    key={s.id}
                    className="bg-white rounded p-2 text-xs border border-purple-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-purple-800">{s.title}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(s.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    {s.ai_narrative && (
                      <p className="text-gray-600 mt-1 line-clamp-2">{s.ai_narrative}</p>
                    )}
                    {s.dominant_numbers.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {s.dominant_numbers.slice(0, 4).map((d, i) => (
                          <span key={i} className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px]">
                            {d.number}×{d.count}
                          </span>
                        ))}
                      </div>
                    )}
                    {s.exported_to_holistic && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-green-600">
                        ✓ Exportado a resumen holístico
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-[10px] text-purple-500 mt-2">
            Usa estas lecturas como contexto para tus notas de integración narrativa.
          </p>
        </div>
      )}

      {view === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Templates */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <ReflectionTemplates
              onSelectTemplate={handleSelectTemplate}
              activeSefira={activeSefira}
            />
          </div>

          {/* Editor */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <SymbolicNoteEditor
              onSave={handleSaveNote}
              promptText={activePrompt || undefined}
              selectedTags={[
                ...(activeSefira ? [activeSefira] : []),
                ...(activeMethod ? [activeMethod] : []),
              ]}
            />
          </div>
        </div>
      ) : (
        /* History View */
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          {savedNotes.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No hay notas guardadas en esta sesión.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedNotes.map((note) => (
                <div key={note.id} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-[10px] text-gray-500">
                      {note.createdAt.toLocaleString('es-ES')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{note.content}</p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-[10px] bg-gray-200 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <strong>Nota:</strong> Estas reflexiones son herramientas de acompañamiento terapéutico, 
        no interpretaciones definitivas. El terapeuta mantiene soberanía total sobre la integración 
        de estos símbolos en el proceso del consultante.
      </div>
    </div>
  );
}

export default NarrativeIntegrationPanel;

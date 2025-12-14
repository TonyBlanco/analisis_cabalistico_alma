'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Hash,
  Heart,
  Book,
  Target,
  Zap,
  Globe,
  Star,
  CircleDot,
  Flame,
  Eye,
  ArrowLeft,
  Play,
  Lock,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface KabbalisticMethod {
  id: string;
  name: string;
  nameHebrew: string;
  icon: any;
  color: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'master';
  duration: string;
  description: string;
  whatItReveals: string[];
  bestFor: string[];
  calculations: string[];
  available: boolean;
  requiresCourse?: boolean; // Nuevo campo
  courseWarning?: string;   // Nuevo campo
}

const KABBALAH_METHODS: KabbalisticMethod[] = [
  {
    id: 'gematria',
    name: 'Gematría',
    nameHebrew: 'גימטריה',
    icon: Hash,
    color: 'from-amber-500 to-yellow-500',
    level: 'basic',
    duration: '5-10 min',
    description: '📚 BASADO EN: Tradición del Sefer Yetzirah y la Gematría clásica judía. Cada letra hebrea tiene un valor numérico asignado desde tiempos bíblicos (Alef=1, Bet=2... Tav=400). Este método revela el código numérico del alma calculando el valor total del nombre hebreo y sus reducciones. Fundamental en la Cábala práctica, permite descubrir conexiones ocultas entre palabras y conceptos que comparten el mismo valor numérico, revelando así la misión del alma codificada en el nombre.',
    whatItReveals: [
      'Número del alma (valor total del nombre en hebreo)',
      'Vibración energética primaria y frecuencia espiritual',
      'Patrones numerológicos ocultos y secuencias sagradas',
      'Conexión con nombres bíblicos y figuras históricas',
      'Palabras en Torah que comparten el mismo valor numérico',
    ],
    bestFor: [
      'Primera consulta con el paciente',
      'Establecer base numerológica del alma',
      'Entender misión fundamental codificada en el nombre',
      'Conectar con arquetipos bíblicos',
    ],
    calculations: ['Conversión del nombre a letras hebreas', 'Suma de valores numéricos (Gematría simple)', 'Reducción pitagórica a un dígito', 'Análisis de sub-totales significativos'],
    available: true,
  },
  {
    id: 'tree-of-life',
    name: 'Árbol de la Vida',
    nameHebrew: 'עץ חיים',
    icon: CircleDot,
    color: 'from-green-500 to-emerald-500',
    level: 'intermediate',
    duration: '15-20 min',
    description: '📚 BASADO EN: El Etz Chaim (Árbol de la Vida) del Rabí Isaac Luria (El Ari HaKadosh, siglo XVI), sistema fundamental de la Cábala Luriánica. Las 10 Sefirot representan las emanaciones divinas a través de las cuales Dios creó el universo: Keter (Corona), Chokhmah (Sabiduría), Binah (Entendimiento), Chesed (Bondad), Gevurah (Rigor), Tiferet (Belleza), Netzach (Victoria), Hod (Esplendor), Yesod (Fundamento), Malkhut (Reino). Este método mapea cómo estas energías fluyen en el individuo, identificando qué Sefirot están activas, bloqueadas o en desequilibrio. 📖 Conocimiento básico de las Sefirot es recomendado para interpretar correctamente.',
    whatItReveals: [
      'Posición predominante del alma en las 10 Sefirot',
      'Caminos (senderos) activos e inactivos entre las Sefirot',
      'Bloqueos energéticos específicos en el árbol',
      'Equilibrio entre los tres pilares (Rigor, Misericordia, Equilibrio)',
      'Conexión con Keter (Corona) - la fuente divina',
      'Flujo de energía desde arriba (espiritual) hacia abajo (material)',
    ],
    bestFor: [
      'Análisis energético profundo del alma',
      'Identificar bloqueos espirituales específicos',
      'Trabajo de sanación cabalística avanzado',
      'Entender desequilibrios entre dar y recibir',
    ],
    calculations: ['Mapeo del nombre en las Sefirot', 'Análisis de los 22 caminos del árbol', 'Equilibrio entre pilares derecho/izquierdo/central', 'Identificación de Sefirá dominante'],
    available: true,
  },
  {
    id: 'soul-number',
    name: 'Número del Alma',
    nameHebrew: 'מספר הנשמה',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    level: 'basic',
    duration: '10-15 min',
    description: '📚 BASADO EN: La tradición de las tres letras madres (Alef, Mem, Shin) del Sefer Yetzirah y el concepto cabalístico de Neshamá (alma superior). En la Cábala, el alma tiene cinco niveles: Nefesh, Ruach, Neshamá, Chayá y Yechidá. Este método calcula el número del Neshamá utilizando únicamente las vocales del nombre hebreo, ya que en hebreo las vocales representan el aliento divino (Ruach) que da vida al nombre. El número resultante revela la misión espiritual más profunda que el alma eligió antes de encarnar. Método accesible pero profundo en significado.',
    whatItReveals: [
      'Propósito divino del alma (Tafkid HaNeshamá)',
      'Misión de vida espiritual elegida pre-encarnación',
      'Dones naturales del espíritu con los que nació',
      'Karma del alma y correcciones necesarias',
      'Conexión con el nivel Neshamá del alma',
      'Vocación espiritual verdadera',
    ],
    bestFor: [
      'Búsqueda de propósito de vida y vocación',
      'Crisis existenciales y reorientación vital',
      'Redirección espiritual después de trauma',
      'Entender por qué ciertos dones vienen naturalmente',
    ],
    calculations: ['Extracción de vocales del nombre hebreo', 'Suma de valores de vocales', 'Reducción numérica', 'Análisis del Neshamá'],
    available: true,
  },
  {
    id: 'tikun',
    name: 'Tikún (Corrección del Alma)',
    nameHebrew: 'תיקון',
    icon: Target,
    color: 'from-purple-500 to-violet-500',
    level: 'advanced',
    duration: '20-25 min',
    description: '📚 BASADO EN: El concepto del Ari HaKadosh (Rabí Isaac Luria) sobre Tikun Olam y Tikun HaNefesh. En la Cábala Luriánica, después de la "ruptura de los vasos" (Shevirat HaKelim), las chispas divinas quedaron esparcidas y cada alma tiene la misión de "reparar" aspectos específicos. El Tikun personal se calcula analizando las consonantes "débiles" o ausentes en el nombre hebreo, las cuales representan energías que el alma necesita desarrollar en esta vida. Identifica patrones kármicos de encarnaciones previas y las lecciones específicas que el alma aún no ha completado. ⚠️ IMPORTANTE: El terapeuta debe tener formación en karma y reencarnación según la Cábala para interpretar correctamente. Se recomienda curso de Tikun Avanzado.',
    whatItReveals: [
      'Karma específico de vidas pasadas (Gilgulim anteriores)',
      'Lecciones pendientes que se repiten en esta vida',
      'Correcciones (Tikun) que el alma debe completar',
      'Debilidades y "letras faltantes" a desarrollar',
      'Traumas kármicos no resueltos',
      'Plan de trabajo espiritual personalizado',
    ],
    bestFor: [
      'Patrones repetitivos sin explicación (relaciones, fracasos, etc.)',
      'Bloqueos profundos sin causa lógica aparente',
      'Trabajo kármico profundo y regresiones',
      'Pacientes que sienten "ya vivieron esto antes"',
    ],
    calculations: ['Análisis de consonantes del nombre hebreo', 'Identificación de letras débiles o ausentes', 'Cálculo de la raíz del alma (Shoresh HaNeshamá)', 'Mapeo de Tikun según letras faltantes'],
    available: true,
    requiresCourse: true,
    courseWarning: 'Se recomienda curso Tikun Avanzado para interpretar correctamente traumas kármicos.'
  },
  {
    id: 'mazal',
    name: 'Mazal (Destino y Suerte)',
    nameHebrew: 'מזל',
    icon: Star,
    color: 'from-blue-500 to-cyan-500',
    level: 'intermediate',
    duration: '12-18 min',
    description: '📚 BASADO EN: El sistema de Mazalot (constelaciones) descrito en el Sefer Yetzirah y desarrollado por Abraham Abulafia. "Mazal" literalmente significa "constelación" o "influencia astral", pero en la Cábala práctica representa el destino y los ciclos de suerte personal. La Cábala enseña que "Ein Mazal L\'Israel" (Israel no tiene Mazal, está por encima de él), significando que a través del trabajo espiritual se puede trascender el destino. Este método convierte la fecha de nacimiento gregoriana al calendario hebreo, identifica el Mazal zodiacal hebreo (Mazzaroth), calcula ciclos de 7 años (Shmitá) y 19 años (ciclo lunar completo), y determina los ángeles regentes de cada período. Permite identificar cuándo la persona está en un ciclo favorable o desafiante.',
    whatItReveals: [
      'Ciclos de suerte personal según calendario hebreo',
      'Períodos favorables y desafiantes (ciclos de 7, 9, 19 años)',
      'Influencias astrales cabalísticas (Mazzaroth)',
      'Ángeles regentes del período actual de vida',
      'Mazal del mes/año hebreo actual',
      'Momentos óptimos para decisiones importantes',
    ],
    bestFor: [
      'Planificación de proyectos importantes (negocios, matrimonio, mudanzas)',
      'Entender por qué "nada sale bien" en cierto período',
      'Aprovechar ciclos favorables identificados',
      'Timing espiritual de eventos',
    ],
    calculations: ['Conversión de fecha gregoriana a hebrea', 'Mazal zodiacal hebreo (Mazzaroth)', 'Ciclos de 7 y 9 años desde nacimiento', 'Ángeles regentes del período'],
    available: true,
  },
  {
    id: '72-names',
    name: '72 Nombres de Dios',
    nameHebrew: 'ע״ב שמות',
    icon: Book,
    color: 'from-indigo-500 to-purple-500',
    level: 'intermediate',
    duration: '15-20 min',
    description: 'Conecta al individuo con los 72 nombres sagrados de Dios extraídos del Éxodo. Cada nombre es una llave energética para diferentes aspectos de la vida.',
    whatItReveals: [
      'Nombres personales de poder',
      'Ángeles guardianes específicos',
      'Herramientas espirituales para desafíos',
      'Meditaciones personalizadas',
    ],
    bestFor: [
      'Protección espiritual',
      'Meditaciones avanzadas',
      'Conexión con ángeles',
    ],
    calculations: ['Conversión de nombre a letras', 'Extracción de triadas del nombre', 'Identificación de 72 Nombres aplicables', 'Cálculo de ángeles protectores'],
    available: true,
  },
  {
    id: 'partzuf',
    name: 'Partzuf (Rostros Divinos)',
    nameHebrew: 'פרצוף',
    icon: Eye,
    color: 'from-orange-500 to-red-500',
    level: 'master',
    duration: '25-30 min',
    description: '📚 BASADO EN: Etz Chaim del Ari HaKadosh y el concepto de Partzufim (Rostros o Configuraciones). Uno de los conceptos MÁS COMPLEJOS de la Cábala Luriánica. Después de la ruptura de los vasos, la luz divina se reorganizó en cinco "rostros" o personalidades divinas: Atik Yomin (Anciano de Días), Arikh Anpin (Rostro Extenso/Paciencia), Abba (Padre/Chokhmá), Ima (Madre/Biná), y Zeir Anpin (Rostro Pequeño/Impaciencia) con su contraparte Nukva (Femenino/Malkhut). Este método mapea cómo estos arquetipos se manifiestan en la psique del individuo, revelando una estructura interna casi imposible de ver con otros métodos. 🚨 NIVEL MAESTRO EXCLUSIVO: Solo para terapeutas con certificación en Cábala Luriánica Avanzada. Requiere años de estudio. Curso obligatorio de Partzufim disponible próximamente en la plataforma.',
    whatItReveals: [
      'Configuración de los 5 Partzufim en el alma individual',
      'Arikh Anpin vs Zeir Anpin (paciencia vs impaciencia)',
      'Balance entre Abba (intelecto) e Ima (intuición)',
      'Relación entre Zeir Anpin y Nukva (masculino/femenino interno)',
      'Estructura psicológica multidimensional del ser',
      'Interacciones y conflictos entre los rostros',
    ],
    bestFor: [
      'Análisis psicológico cabalístico de máxima profundidad',
      'Trabajo terapéutico avanzado con maestros',
      'Comprensión de estructuras psíquicas complejas',
      'Solo para terapeutas altamente experimentados',
    ],
    calculations: ['Mapeo de Partzufim según nombre y fecha', 'Configuraciones complejas de Sefirot agrupadas', 'Análisis multidimensional de interacciones', 'Estructura completa del alma en capas'],
    available: false, // Próximamente - requiere curso
    requiresCourse: true,
    courseWarning: 'CURSO OBLIGATORIO: Solo para certificación en Cábala Luriánica Avanzada - Requiere años de estudio previo.'
  },
  {
    id: 'gilgul',
    name: 'Gilgul (Reencarnación)',
    nameHebrew: 'גלגול',
    icon: Zap,
    color: 'from-teal-500 to-cyan-500',
    level: 'advanced',
    duration: '20-25 min',
    description: '📚 BASADO EN: Shaar HaGilgulim (Puerta de las Reencarnaciones) del Rabí Chaim Vital, discípulo directo del Ari HaKadosh. Este texto revela el sistema completo de Gilgul Neshamot (transmigración de almas). Según la Cábala, el alma reencarna hasta completar su Tikun total, y cada vida es una oportunidad para reparar aspectos específicos. Este método analiza las "capas" del alma para identificar rastros de encarnaciones previas: almas que vienen de figuras bíblicas, Iburim (impregnaciones de almas adicionales), y Neshamot Chadashot (almas nuevas vs. recicladas). 🚨 ALTAMENTE AVANZADO: Este método requiere OBLIGATORIAMENTE que el terapeuta complete el "Curso de Gilgul y Tikun Profundo" ya que involucra interpretación de vidas pasadas, conexiones kármicas complejas y conceptos como Ibbur (impregnación) y Dybbuk (posesión). Uso inadecuado puede confundir gravemente al paciente.',
    whatItReveals: [
      'Indicios claros de vidas pasadas (Gilgulim anteriores)',
      'Patrones kármicos heredados de encarnaciones previas',
      'Almas gemelas (Bashert) y conexiones de vidas pasadas',
      'Misiones inconclusas que trascienden esta vida',
      'Si es Neshamá Chadashá (alma nueva) o reciclada',
      'Posible Ibbur (alma adicional impregnada)',
      'Origen bíblico del alma (Shoresh)',
    ],
    bestFor: [
      'Fobias intensas sin causa aparente en esta vida',
      'Talentos excepcionales inexplicables desde niño',
      'Conexiones instantáneas y profundas con personas/lugares',
      'Recuerdos o sueños recurrentes de otras épocas',
      'Sensación de "no pertenecer a este tiempo"',
    ],
    calculations: ['Análisis profundo de raíces del alma (Shoresh)', 'Ciclos de reencarnación (cada 7 y 49 años)', 'Identificación de chispas divinas heredadas', 'Mapeo de almas conectadas (Bashert, familia espiritual)'],
    available: false,
    requiresCourse: true,
    courseWarning: 'Curso obligatorio de Gilgul y Tikun Profundo para interpretar reencarnaciones y karmas complejos.'
  },
  {
    id: 'shemot',
    name: 'Shemot (Poder de los Nombres)',
    nameHebrew: 'שמות',
    icon: Flame,
    color: 'from-red-500 to-pink-500',
    level: 'intermediate',
    duration: '10-15 min',
    description: '📚 BASADO EN: La enseñanza del Zohar sobre "Shemot" (Nombres) y el concepto de que cada letra hebrea es una fuerza viva. "Shemot" significa "nombres" y es el nombre hebreo del libro de Éxodo. La Cábala enseña que el nombre de una persona no es aleatorio sino que fue "asignado" desde el Cielo según su misión. Cada letra del nombre tiene una energía específica (fuego, agua, aire) y una conexión con las Sefirot. Este método analiza letra por letra el nombre hebreo completo, identificando: letras fuertes (que aparecen varias veces), letras débiles (ausentes o únicas), combinaciones poderosas, y el "nombre de poder" oculto. También evalúa si un cambio de nombre (común en conversiones o ceremonias) beneficiaría energéticamente al individuo.',
    whatItReveals: [
      'Poder energético de cada letra del nombre',
      'Energías ocultas y dominantes en el nombre',
      'Nombre de poder personal (letras más fuertes)',
      'Modificaciones recomendadas al nombre (agregar letras)',
      'Si el nombre actual está alineado con la misión',
      'Impacto de apodos o nombres alternativos',
    ],
    bestFor: [
      'Elegir nombre hebreo para un bebé',
      'Considerar cambio de nombre personal',
      'Potenciar el nombre actual mediante uso consciente',
      'Entender por qué ciertos apodos resuenan más',
    ],
    calculations: ['Análisis letra por letra del nombre', 'Identificación de combinaciones poderosas', 'Valor energético de cada letra', 'Balance elemental (fuego/agua/aire)'],
    available: true,
  },
  {
    id: 'gates',
    name: 'Shaarei Orah (Puertas de Luz)',
    nameHebrew: 'שערי אורה',
    icon: Globe,
    color: 'from-yellow-500 to-amber-500',
    level: 'advanced',
    duration: '18-22 min',
    description: '📚 BASADO EN: El texto clásico "Shaarei Orah" (Puertas de Luz) escrito por el Rabí Yosef Gikatilla en el siglo XIII, uno de los textos fundamentales de la Cábala medieval. Este libro explica cómo cada Nombre Divino (Havayá, Elokim, Adonai, El Shadai, etc.) abre una "puerta" específica hacia diferentes niveles de conciencia y conexión con las Sefirot. El método identifica qué puertas están "abiertas" (accesibles) y cuáles están "cerradas" (bloqueadas) en el alma del individuo. También revela qué nombres divinos debe meditar la persona para abrir puertas cerradas. Combina Gematría avanzada, conocimiento de nombres divinos, y mapeo sefirótico. ⚠️ Requiere conocimiento de los nombres divinos y su pronunciación. Curso de Nombres Divinos recomendado.',
    whatItReveals: [
      'Puertas de luz abiertas y cerradas en el alma',
      'Conexión actual con nombres divinos específicos',
      'Acceso a diferentes niveles de conciencia (Nefesh, Ruach, Neshamá)',
      'Iluminación espiritual disponible en este momento',
      'Bloqueos que impiden conexión con lo divino',
      'Camino de meditación personalizado',
    ],
    bestFor: [
      'Búsqueda activa de iluminación espiritual',
      'Meditación cabalística avanzada con nombres',
      'Desarrollo espiritual acelerado',
      'Superar bloqueos en práctica espiritual',
    ],
    calculations: ['Mapeo de puertas según nombre y Sefirot', 'Nombres divinos asociados a cada puerta', 'Niveles de Neshamá accesibles', 'Secuencia de meditación personalizada'],
    available: false,
  },
  {
    id: 'complete',
    name: 'Análisis Cabalístico Completo',
    nameHebrew: 'ניתוח מלא',
    icon: Sparkles,
    color: 'from-purple-500 via-pink-500 to-amber-500',
    level: 'master',
    duration: '60-90 min',
    description: '📚 BASADO EN: Integración de TODOS los métodos cabalísticos disponibles en un solo análisis exhaustivo. Este es el análisis más completo posible, combinando Gematría, Árbol de la Vida, Número del Alma, Tikun, Mazal, 72 Nombres, Shemot y correlaciones cruzadas entre todos los sistemas. Genera un mapa completo del alma en todas sus dimensiones: numérica, sefirótica, karmica, temporal, energética y nominal. El resultado es un reporte PDF profesional extenso (40-60 páginas) con gráficos del Árbol de la Vida personalizado, tablas de Tikun, calendario de Mazal, y un plan de trabajo espiritual detallado para los próximos 12 meses. Este análisis es comparable a una "radiografía completa del alma" y es ideal para la primera consulta profunda con un nuevo paciente o para revisiones anuales completas. ⭐ RECOMENDADO para terapeutas profesionales que desean ofrecer el servicio más completo y diferenciado.',
    whatItReveals: [
      'Perfil del alma absolutamente completo y multidimensional',
      'Todos los cálculos integrados con análisis cruzado',
      'Reporte PDF profesional extenso con gráficos',
      'Plan de trabajo espiritual personalizado (12 meses)',
      'Mapeo visual del Árbol de la Vida personalizado',
      'Calendario de Mazal con fechas favorables',
      'Meditaciones y prácticas específicas recomendadas',
    ],
    bestFor: [
      'Primera consulta profunda con paciente nuevo',
      'Terapeutas profesionales que ofrecen servicios premium',
      'Trabajo espiritual completo y a largo plazo',
      'Revisión anual completa del progreso del alma',
    ],
    calculations: ['Todos los métodos combinados e integrados', 'Síntesis integrativa con correlaciones', 'Análisis cruzado entre sistemas', 'Plan personalizado basado en todos los datos'],
    available: true,
  },
];

const LEVEL_INFO = {
  basic: { label: 'Básico', color: 'bg-green-900/30 text-green-400 border-green-700' },
  intermediate: { label: 'Intermedio', color: 'bg-blue-900/30 text-blue-400 border-blue-700' },
  advanced: { label: 'Avanzado', color: 'bg-purple-900/30 text-purple-400 border-purple-700' },
  master: { label: 'Maestro', color: 'bg-amber-900/30 text-amber-400 border-amber-700' },
};

export default function KabbalahMethodsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const handleStartAnalysis = () => {
    if (!selectedMethod) return;
    
    const method = KABBALAH_METHODS.find(m => m.id === selectedMethod);
    if (method && method.available) {
      router.push(`/patients/${patientId}/kabbalah/${selectedMethod}`);
    }
  };

  const selectedMethodData = KABBALAH_METHODS.find(m => m.id === selectedMethod);
  const SelectedIcon = selectedMethodData?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-amber-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/patients/${patientId}`}>
            <Button variant="outline" className="mb-4 border-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Paciente
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Métodos de Análisis Cabalístico</h1>
              <p className="text-gray-300">Selecciona el método más apropiado para el análisis del alma</p>
            </div>
          </div>

          <Card className="bg-amber-900/20 border-amber-700/50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-amber-100 text-sm">
                  <p className="font-semibold mb-1">Para Profesionales y Terapeutas</p>
                  <p className="text-amber-200/80">
                    Estos métodos están disponibles para suscripciones Terapeuta y Premium. Cada método revela diferentes aspectos del alma y su propósito. 
                    Lee la descripción completa antes de seleccionar el análisis apropiado para tu paciente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Methods Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {KABBALAH_METHODS.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            const isExpanded = expandedMethod === method.id;
            const levelInfo = LEVEL_INFO[method.level];

            return (
              <Card
                key={method.id}
                className={`relative overflow-hidden transition-all cursor-pointer ${
                  isSelected
                    ? 'border-2 border-purple-500 bg-purple-500/10'
                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                } ${!method.available ? 'opacity-60' : ''}`}
                onClick={() => method.available && setSelectedMethod(method.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {!method.available && (
                      <Badge variant="outline" className="bg-slate-800/50 text-gray-400 border-slate-600">
                        <Lock className="w-3 h-3 mr-1" />
                        Próximamente
                      </Badge>
                    )}
                    
                    {isSelected && method.available && (
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>

                  <CardTitle className="text-white text-xl mb-1">{method.name}</CardTitle>
                  <p className="text-amber-400 text-sm mb-3">{method.nameHebrew}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className={levelInfo.color}>
                      {levelInfo.label}
                    </Badge>
                    <Badge variant="outline" className="bg-slate-800/50 text-gray-400 border-slate-600">
                      ⏱️ {method.duration}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">{method.description}</p>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedMethod(isExpanded ? null : method.id);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-700 text-blue-400 hover:bg-blue-600/20"
                  >
                    {isExpanded ? 'Ver Menos' : 'Ver Detalles Completos'}
                  </Button>

                  {isExpanded && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-slate-700">
                      <div>
                        <h4 className="text-white font-semibold mb-2 text-sm">🔮 Qué Revela:</h4>
                        <ul className="space-y-1">
                          {method.whatItReveals.map((item, idx) => (
                            <li key={idx} className="text-gray-400 text-xs">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-white font-semibold mb-2 text-sm">✨ Mejor Para:</h4>
                        <ul className="space-y-1">
                          {method.bestFor.map((item, idx) => (
                            <li key={idx} className="text-gray-400 text-xs">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-white font-semibold mb-2 text-sm">📊 Cálculos:</h4>
                        <ul className="space-y-1">
                          {method.calculations.map((item, idx) => (
                            <li key={idx} className="text-gray-400 text-xs">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Panel */}
        {selectedMethod && selectedMethodData && SelectedIcon && (
          <Card className="bg-gradient-to-r from-purple-900/50 to-amber-900/50 border-purple-700/50 sticky bottom-4">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${selectedMethodData.color} flex items-center justify-center`}>
                    <SelectedIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{selectedMethodData.name}</h3>
                    <p className="text-gray-300 text-sm">
                      {selectedMethodData.duration} • {LEVEL_INFO[selectedMethodData.level].label}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setSelectedMethod(null)}
                    variant="outline"
                    className="border-slate-700"
                  >
                    Cambiar
                  </Button>
                  
                  <Button
                    onClick={handleStartAnalysis}
                    disabled={!selectedMethodData.available}
                    className="bg-gradient-to-r from-purple-500 to-amber-500 hover:from-purple-600 hover:to-amber-600 disabled:opacity-50"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Comenzar Análisis
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

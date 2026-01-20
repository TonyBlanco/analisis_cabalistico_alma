import React, { useState } from 'react';
import { Sparkles, Flame, Droplet, Wind, Mountain, Eye, Heart, Brain, Star, Crown, Info, X, Circle } from 'lucide-react';

const HolisticKabbalisticAssessment = () => {
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showSephirotModal, setShowSephirotModal] = useState(false);

  const sephirotInfo = [
    {
      name: "Keter",
      meaning: "Corona",
      description: "La corona divina, el punto de conexión con lo infinito (Ein Sof). Representa la voluntad divina pura, la superconsciencia y el propósito más elevado del alma.",
      color: "text-white",
      position: "Superior Central"
    },
    {
      name: "Chochmah",
      meaning: "Sabiduría",
      description: "La sabiduría intuitiva, el destello de inspiración divina. Es la semilla de todas las ideas, la intuición pura y el conocimiento que viene como revelación súbita.",
      color: "text-blue-300",
      position: "Superior Derecha"
    },
    {
      name: "Binah",
      meaning: "Comprensión",
      description: "El entendimiento profundo que procesa la sabiduría. Representa el análisis, la lógica estructurada, y la capacidad de dar forma y estructura a las ideas.",
      color: "text-green-300",
      position: "Superior Izquierda"
    },
    {
      name: "Chesed",
      meaning: "Bondad/Misericordia",
      description: "El amor incondicional, la generosidad y la expansión. Representa la gracia divina, la compasión sin límites y el impulso de dar sin esperar nada a cambio.",
      color: "text-blue-400",
      position: "Media Derecha"
    },
    {
      name: "Gevurah",
      meaning: "Rigor/Fuerza",
      description: "La disciplina, los límites y el juicio. Representa la contención necesaria, la justicia, el discernimiento y la capacidad de decir 'no' cuando es necesario.",
      color: "text-red-400",
      position: "Media Izquierda"
    },
    {
      name: "Tiferet",
      meaning: "Belleza/Armonía",
      description: "El centro del árbol, el corazón que equilibra todos los extremos. Representa la compasión equilibrada, la verdad, la belleza y la síntesis armoniosa de opuestos.",
      color: "text-yellow-300",
      position: "Central"
    },
    {
      name: "Netzach",
      meaning: "Victoria/Eternidad",
      description: "La persistencia, la victoria y la resistencia emocional. Representa el impulso vital, la creatividad artística, la pasión y la capacidad de sobreponerse.",
      color: "text-green-400",
      position: "Inferior Derecha"
    },
    {
      name: "Hod",
      meaning: "Gloria/Esplendor",
      description: "El intelecto, la comunicación y el reconocimiento de patrones. Representa el pensamiento analítico, la humildad intelectual y la capacidad de articular ideas.",
      color: "text-orange-400",
      position: "Inferior Izquierda"
    },
    {
      name: "Yesod",
      meaning: "Fundamento",
      description: "El fundamento que conecta lo espiritual con lo físico. Representa el subconsciente, los sueños, la memoria ancestral y la base sobre la que se construye la realidad.",
      color: "text-purple-300",
      position: "Inferior Central"
    },
    {
      name: "Malkhut",
      meaning: "Reino",
      description: "El mundo físico manifestado, la realidad material. Representa la tierra, el cuerpo, la acción concreta y la manifestación de todas las energías superiores en forma tangible.",
      color: "text-amber-600",
      position: "Base"
    }
  ];

  const tests = {
    sha: {
      name: "Sephirotic Harmony Audit (SHA)",
      subtitle: "Evaluación de equilibrio con elixires terrenales",
      original: "AUDIT - 10 preguntas",
      sephirot: ["Netzach", "Chesed", "Gevurah"],
      element: "Agua",
      color: "bg-blue-600",
      icon: Droplet,
      questions: [
        {
          text: "¿Con qué frecuencia tu espíritu busca refugio en sustancias que alteran la consciencia (alcohol)?",
          sephira: "Netzach",
          options: ["Nunca", "Una vez al mes o menos", "2-4 veces al mes", "2-3 veces por semana", "4 o más veces por semana"]
        },
        {
          text: "Cuando consumes, ¿cuántas copas/bebidas tomas en un día típico? (¿Cuánto nublas tu Binah?)",
          sephira: "Binah",
          options: ["1-2", "3-4", "5-6", "7-9", "10 o más"]
        },
        {
          text: "¿Con qué frecuencia tomas 6 o más copas en una sola ocasión? (¿Interrumpes tu conexión con Keter?)",
          sephira: "Keter",
          options: ["Nunca", "Menos de una vez al mes", "Mensualmente", "Semanalmente", "Diariamente o casi diariamente"]
        },
        {
          text: "Durante el último año, ¿has sentido que no podías detener tu consumo una vez iniciado? (¿Gevurah sin poder?)",
          sephira: "Gevurah",
          options: ["Nunca", "Menos de una vez al mes", "Mensualmente", "Semanalmente", "Diariamente o casi diariamente"]
        },
        {
          text: "¿Has dejado de hacer lo que se esperaba de ti debido al consumo? (¿Fallas en manifestar en Malkhut?)",
          sephira: "Malkhut",
          options: ["Nunca", "Menos de una vez al mes", "Mensualmente", "Semanalmente", "Diariamente o casi diariamente"]
        },
        {
          text: "¿Has necesitado beber en la mañana para recuperarte después de haber bebido mucho? (¿Dependencia de Yesod?)",
          sephira: "Yesod",
          options: ["Nunca", "Menos de una vez al mes", "Mensualmente", "Semanalmente", "Diariamente o casi diariamente"]
        },
        {
          text: "¿Has sentido culpa o remordimiento después de beber? (¿Tiferet en conflicto?)",
          sephira: "Tiferet",
          options: ["Nunca", "Menos de una vez al mes", "Mensualmente", "Semanalmente", "Diariamente o casi diariamente"]
        },
        {
          text: "¿Has sido incapaz de recordar lo que sucedió la noche anterior debido al consumo? (¿Pérdida de Chochmah?)",
          sephira: "Chochmah",
          options: ["Nunca", "Menos de una vez al mes", "Mensualmente", "Semanalmente", "Diariamente o casi diariamente"]
        },
        {
          text: "¿Tú u otra persona han resultado heridos debido a tu consumo? (¿Daño al templo físico?)",
          sephira: "Malkhut",
          options: ["No", "Sí, pero no en el último año", "Sí, durante el último año"]
        },
        {
          text: "¿Un familiar, amigo o sanador ha expresado preocupación por tu consumo? (¿Otros ven el desequilibrio?)",
          sephira: "Chesed",
          options: ["No", "Sí, pero no en el último año", "Sí, durante el último año"]
        }
      ]
    },
    duditSpirit: {
      name: "Divine Unity Drug Introspection (DUDIT-Spirit)",
      subtitle: "Camino del alma hacia Ein Sof",
      original: "DUDIT - 11 preguntas",
      sephirot: ["Hod", "Yesod", "Malkhut"],
      element: "Fuego",
      color: "bg-red-600",
      icon: Flame,
      questions: [
        {
          text: "¿Con qué frecuencia usas sustancias diferentes al alcohol? (¿Buscas alterar tu estado natural?)",
          sephira: "Yesod",
          options: ["Nunca", "Una vez al mes o menos", "2-4 veces al mes", "2-3 veces por semana", "4 o más veces por semana"]
        },
        {
          text: "¿Usas más de un tipo de sustancia en la misma ocasión? (¿Múltiples velos sobre tu esencia?)",
          sephira: "Binah",
          options: ["Nunca", "Una vez al mes o menos", "2-4 veces al mes", "2-3 veces por semana", "4 o más veces por semana"]
        },
        {
          text: "¿Cuántas veces tomas sustancias en cantidades mayores o por períodos más largos de lo planeado? (¿Gevurah debilitada?)",
          sephira: "Gevurah",
          options: ["Nunca", "Una vez al mes o menos", "2-4 veces al mes", "2-3 veces por semana", "4 o más veces por semana"]
        },
        {
          text: "¿Has considerado reducir o detener tu uso? (¿Tu alma busca liberación?)",
          sephira: "Tiferet",
          options: ["Nunca", "Una vez al mes o menos", "2-4 veces al mes", "2-3 veces por semana", "4 o más veces por semana"]
        },
        {
          text: "¿Has intentado reducir o detener tu uso sin éxito? (¿Intentos fallidos de tikkun?)",
          sephira: "Gevurah",
          options: ["Nunca", "Una vez al mes o menos", "2-4 veces al mes", "2-3 veces por semana", "4 o más veces por semana"]
        },
        {
          text: "¿Has tenido problemas de salud, sociales, legales o económicos debido a tu uso? (¿Malkhut en caos?)",
          sephira: "Malkhut",
          options: ["Nunca", "Una vez al mes o menos", "2-4 veces al mes", "2-3 veces por semana", "4 o más veces por semana"]
        },
        {
          text: "¿Has descuidado responsabilidades debido al uso? (¿Faltas a tu propósito en Keter?)",
          sephira: "Keter",
          options: ["Nunca", "Una vez al mes o menos", "2-4 veces al mes", "2-3 veces por semana", "4 o más veces por semana"]
        },
        {
          text: "¿Has usado sustancias en situaciones físicamente peligrosas? (¿Riesgo al templo corporal?)",
          sephira: "Malkhut",
          options: ["Nunca", "Una vez al mes o menos", "2-4 veces al mes", "2-3 veces por semana", "4 o más veces por semana"]
        },
        {
          text: "¿Has notado que necesitas más cantidad para obtener el mismo efecto? (¿Hod distorsionado?)",
          sephira: "Hod",
          options: ["Nunca", "Una vez al mes o menos", "2-4 veces al mes", "2-3 veces por semana", "4 o más veces por semana"]
        },
        {
          text: "¿Has experimentado síntomas de abstinencia cuando dejas de usar? (¿Dependencia arraigada en Yesod?)",
          sephira: "Yesod",
          options: ["Nunca", "Una vez al mes o menos", "2-4 veces al mes", "2-3 veces por semana", "4 o más veces por semana"]
        },
        {
          text: "¿Continuaste usando a pesar de saber que te causa problemas? (¿Bloqueo de Ein Sof?)",
          sephira: "Keter",
          options: ["Nunca", "Una vez al mes o menos", "2-4 veces al mes", "2-3 veces por semana", "4 o más veces por semana"]
        }
      ]
    },
    asrsEssence: {
      name: "Archetypal Soul Rhythm Scale (ASRS-Essence)",
      subtitle: "Armonización de los ritmos del alma",
      original: "ASRS - 18 preguntas",
      sephirot: ["Tiferet", "Chochmah", "Binah"],
      element: "Aire",
      color: "bg-yellow-600",
      icon: Wind,
      questions: [
        {
          text: "¿Cometes errores descuidados cuando trabajas en proyectos que requieren concentración? (¿Tiferet dispersa?)",
          sephira: "Tiferet",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Tienes dificultad para mantener la atención en tareas tediosas? (¿Netzach inquieto?)",
          sephira: "Netzach",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Tienes dificultad para concentrarte en lo que te dicen, incluso en conversación directa? (¿Hod fragmentado?)",
          sephira: "Hod",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Dejas proyectos sin terminar una vez que completas las partes desafiantes? (¿Gevurah sin seguimiento?)",
          sephira: "Gevurah",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Tienes dificultad para organizar tareas que requieren varios pasos? (¿Binah desorganizada?)",
          sephira: "Binah",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Evitas o postergás tareas que requieren concentración prolongada? (¿Resistencia de Netzach?)",
          sephira: "Netzach",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Pierdes objetos necesarios para tus actividades? (¿Malkhut en desorden?)",
          sephira: "Malkhut",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Te distraes fácilmente con estímulos externos o pensamientos? (¿Yesod permeable?)",
          sephira: "Yesod",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Olvidas citas o compromisos? (¿Chochmah sin anclaje temporal?)",
          sephira: "Chochmah",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Te mueves o retuerces cuando debes estar sentado? (¿Energía de Netzach sin canalizar?)",
          sephira: "Netzach",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Te sientes impulsado por un motor interno, incapaz de relajarte? (¿Fuego de Gevurah sin balance?)",
          sephira: "Gevurah",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Hablas excesivamente en situaciones sociales? (¿Hod desbordante?)",
          sephira: "Hod",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Terminas las frases de otros antes que ellos? (¿Impaciencia de Netzach?)",
          sephira: "Netzach",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Tienes dificultad para esperar tu turno? (¿Chesed sin contención?)",
          sephira: "Chesed",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Interrumpes a otros cuando están ocupados? (¿Tiferet sin consideración?)",
          sephira: "Tiferet",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Actúas sin pensar en las consecuencias? (¿Binah ignorada?)",
          sephira: "Binah",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Buscas constantemente nuevos estímulos o actividades? (¿Keter buscando infinito?)",
          sephira: "Keter",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        },
        {
          text: "¿Tienes dificultad para completar detalles finales de proyectos? (¿Malkhut sin manifestar?)",
          sephira: "Malkhut",
          options: ["Nunca", "Raramente", "A veces", "Frecuentemente", "Muy frecuentemente"]
        }
      ]
    },
    aqKabbalah: {
      name: "Aura Quotient - Kabbalistic Alignment (AQ-Kabbalah)",
      subtitle: "Dones únicos del alma",
      original: "AQ-50 - 50 preguntas",
      sephirot: ["Binah", "Chochmah", "Daath"],
      element: "Tierra",
      color: "bg-green-600",
      icon: Mountain,
      questions: [
        {
          text: "Prefiero hacer las cosas con otros que solo en contemplación",
          sephira: "Chesed",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Mi Binah prefiere hacer las cosas de la misma manera repetidamente",
          sephira: "Binah",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Si intento imaginar algo, fácilmente puedo crear una imagen mental clara",
          sephira: "Yesod",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Mi alma frecuentemente se absorbe tanto en algo que pierdo noción de otras cosas",
          sephira: "Tiferet",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Percibo patrones y conexiones que otros no ven (como gematria en la vida cotidiana)",
          sephira: "Chochmah",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Las reuniones sociales drenan mi energía espiritual",
          sephira: "Netzach",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Mi Hod puede leer entre líneas cuando alguien habla",
          sephira: "Hod",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Cuando leo una historia, puedo visualizar fácilmente cómo se ven los personajes",
          sephira: "Yesod",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Mi alma está fascinada por fechas y números sagrados",
          sephira: "Binah",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "En situaciones sociales, mi Tiferet encuentra fácil seguir los hilos de múltiples conversaciones",
          sephira: "Tiferet",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Me resulta fácil 'leer' el aura emocional de otras personas",
          sephira: "Chesed",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Me siento atraído por acceder a Daath (conocimiento oculto) a través del estudio profundo",
          sephira: "Daath",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Prefiero ir a bibliotecas o lugares contemplativos que a fiestas",
          sephira: "Binah",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "No disfruto particularmente leer ficción, prefiero textos sagrados",
          sephira: "Chochmah",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Mi energía se siente fragmentada cuando estoy con mucha gente",
          sephira: "Yesod",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Mi alma nota detalles sutiles que otros frecuentemente pierden",
          sephira: "Hod",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Cuando mi Netzach participa en actividades, las hago por patrones que por propósitos sociales",
          sephira: "Netzach",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Me siento más conectado con Ein Sof en soledad que en comunidad",
          sephira: "Keter",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Mi blueprint del alma incluye sensibilidades únicas a energías sutiles",
          sephira: "Yesod",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        },
        {
          text: "Prefiero coleccionar información sobre mis intereses espirituales que interactuar socialmente",
          sephira: "Binah",
          options: ["Definitivamente de acuerdo", "Levemente de acuerdo", "Levemente en desacuerdo", "Definitivamente en desacuerdo"]
        }
      ]
    },
    ybocsSoul: {
      name: "Yetziratic Balance Obsessive-Compulsive Sanctuary (Y-BOCS-Soul)",
      subtitle: "Liberación de ecos kármicos",
      original: "Y-BOCS - 10 preguntas",
      sephirot: ["Gevurah", "Chesed", "Tiferet"],
      element: "Fuego",
      color: "bg-orange-600",
      icon: Eye,
      questions: [
        {
          text: "¿Cuánto tiempo ocupan tus pensamientos obsesivos cada día? (¿Yetzirah dominado?)",
          sephira: "Yetzirah",
          options: ["Nada (0 horas)", "Leve (menos de 1 hora)", "Moderado (1-3 horas)", "Severo (3-8 horas)", "Extremo (más de 8 horas)"]
        },
        {
          text: "¿Cuánto interfieren estos pensamientos con tu conexión a Keter? (¿Bloqueo espiritual?)",
          sephira: "Keter",
          options: ["Nada", "Levemente", "Moderadamente", "Severamente", "Extremadamente"]
        },
        {
          text: "¿Cuánta angustia causan estos pensamientos repetitivos? (¿Dolor en Tiferet?)",
          sephira: "Tiferet",
          options: ["Ninguna", "Leve", "Moderada", "Severa", "Extrema"]
        },
        {
          text: "¿Cuánto esfuerzo haces para resistir estos pensamientos? (¿Lucha de Gevurah?)",
          sephira: "Gevurah",
          options: ["Siempre resisto", "Mucho esfuerzo", "Esfuerzo moderado", "Poco esfuerzo", "No resisto"]
        },
        {
          text: "¿Cuánto control tienes sobre estos pensamientos obsesivos? (¿Poder sobre ecos kármicos?)",
          sephira: "Gevurah",
          options: ["Control completo", "Mucho control", "Control moderado", "Poco control", "Sin control"]
        },
        {
          text: "¿Cuánto tiempo dedicas a comportamientos compulsivos cada día? (¿Rituales que bloquean Chesed?)",
          sephira: "Chesed",
          options: ["Nada (0 horas)", "Leve (menos de 1 hora)", "Moderado (1-3 horas)", "Severo (3-8 horas)", "Extremo (más de 8 horas)"]
        },
        {
          text: "¿Cuánto interfieren estas compulsiones con tu vida diaria en Malkhut?",
          sephira: "Malkhut",
          options: ["Nada", "Levemente", "Moderadamente", "Severamente", "Extremadamente"]
        },
        {
          text: "¿Cuánta ansiedad experimentarías si te impidieran realizar tus compulsiones? (¿Dependencia de rituales?)",
          sephira: "Yesod",
          options: ["Ninguna", "Leve", "Moderada", "Severa", "Extrema"]
        },
        {
          text: "¿Cuánto esfuerzo haces para resistir las compulsiones? (¿Intento de tikkun?)",
          sephira: "Gevurah",
          options: ["Siempre resisto", "Mucho esfuerzo", "Esfuerzo moderado", "Poco esfuerzo", "No resisto"]
        },
        {
          text: "¿Cuánto control sientes sobre tus comportamientos compulsivos? (¿Liberación del alma?)",
          sephira: "Tiferet",
          options: ["Control completo", "Mucho control", "Control moderado", "Poco control", "Sin control"]
        }
      ]
    },
    pid5Eternal: {
      name: "Primal Identity Divine-5 (PID-5-Eternal)",
      subtitle: "Desvelando el verdadero ser",
      original: "PID-5 - Versión abreviada 25 preguntas",
      sephirot: ["Netzach", "Hod", "Yesod", "Tiferet", "Malkhut"],
      element: "Éter",
      color: "bg-purple-600",
      icon: Star,
      questions: [
        {
          text: "Mi Netzach me hace sentir inútil o sin valor frecuentemente (¿Victoria perdida?)",
          sephira: "Netzach",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mis emociones cambian rápidamente sin causa aparente (¿Tiferet inestable?)",
          sephira: "Tiferet",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi alma tiende a hacer cosas arriesgadas sin pensar (¿Binah ignorada?)",
          sephira: "Binah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Frecuentemente me siento vacío o sin propósito de Keter",
          sephira: "Keter",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Evito conectarme profundamente con otros seres (¿Chesed restringido?)",
          sephira: "Chesed",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi Hod critica duramente a otros en mi mente",
          sephira: "Hod",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Tengo dificultad para confiar en la bondad de otros (¿Chesed bloqueado?)",
          sephira: "Chesed",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi energía en Malkhut es extremadamente baja la mayoría del tiempo",
          sephira: "Malkhut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Necesito que otros me digan qué hacer (¿Gevurah débil?)",
          sephira: "Gevurah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi Yesod almacena intensos sentimientos de enojo",
          sephira: "Yesod",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Siento que mi verdadero ser (Atzilut) está oculto tras muchos velos",
          sephira: "Atzilut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Prefiero estar solo que manifestarme en Malkhut con otros",
          sephira: "Malkhut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi Gevurah es excesivamente perfeccionista",
          sephira: "Gevurah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Experimento episodios donde mi Tiferet se siente completamente fuera de balance",
          sephira: "Tiferet",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Tengo dificultad para completar tareas en Malkhut",
          sephira: "Malkhut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi alma lleva patrones de vidas pasadas que afectan mi presente (¿Karma en Yesod?)",
          sephira: "Yesod",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Frecuentemente malinterpreto las intenciones de otros (¿Hod distorsionado?)",
          sephira: "Hod",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Siento que no pertenezco a este plano de Malkhut",
          sephira: "Malkhut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi Netzach busca constantemente validación externa",
          sephira: "Netzach",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Experimento períodos donde mi conexión con Keter se siente totalmente cortada",
          sephira: "Keter",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Reconozco patrones transgeneracionales en mi forma de ser (¿Herencia kármica?)",
          sephira: "Yesod",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi Chesed da excesivamente esperando recibir amor a cambio",
          sephira: "Chesed",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Tengo dificultad para expresar mi verdadera esencia en el mundo físico (¿Atzilut no manifestado?)",
          sephira: "Atzilut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi Binah ve patrones negativos en todo",
          sephira: "Binah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Siento que mi personalidad actual es un velo sobre mi ser eterno (¿Necesidad de tikkun?)",
          sephira: "Atzilut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        }
      ]
    },
    eat26Spirit: {
      name: "Eternal Abundance Threshold-26 (EAT-26-Spirit)",
      subtitle: "Reverencia al templo del cuerpo",
      original: "EAT-26 - 26 preguntas",
      sephirot: ["Malkhut", "Keter", "Tiferet"],
      element: "Tierra",
      color: "bg-emerald-600",
      icon: Heart,
      questions: [
        {
          text: "Me aterroriza tener sobrepeso (¿Malkhut rechazado?)",
          sephira: "Malkhut",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Evito comer cuando tengo hambre (¿Desconexión del templo?)",
          sephira: "Yesod",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Me preocupo por la comida constantemente (¿Obsesión que bloquea Keter?)",
          sephira: "Keter",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "He tenido episodios de comer compulsivamente donde siento que no puedo parar",
          sephira: "Gevurah",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Corto mi comida en pedazos pequeños (¿Ritual sin bendición?)",
          sephira: "Binah",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Soy consciente del contenido calórico de los alimentos que como (¿Obsesión numérica?)",
          sephira: "Hod",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Evito particularmente alimentos con alto contenido de carbohidratos",
          sephira: "Gevurah",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Siento que otros prefieren que coma más (¿Chesed de otros vs mi Gevurah?)",
          sephira: "Chesed",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Vomito después de haber comido (¿Rechazo violento de Malkhut?)",
          sephira: "Malkhut",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Me siento extremadamente culpable después de comer (¿Tiferet en conflicto?)",
          sephira: "Tiferet",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Estoy preocupado por el deseo de estar más delgado (¿Imagen distorsionada?)",
          sephira: "Yesod",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Pienso en quemar calorías cuando hago ejercicio (¿Ejercicio como castigo?)",
          sephira: "Gevurah",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Otros piensan que estoy demasiado delgado (¿Percepción externa vs interna?)",
          sephira: "Hod",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Estoy preocupado por la idea de tener grasa en mi cuerpo (¿Templo imperfecto?)",
          sephira: "Malkhut",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Tomo más tiempo que otros en comer mis alimentos",
          sephira: "Binah",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Evito alimentos con azúcar",
          sephira: "Gevurah",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Como alimentos dietéticos (¿Restricción sin gratitud?)",
          sephira: "Chesed",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Siento que la comida controla mi vida (¿Malkhut dominante?)",
          sephira: "Malkhut",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Demuestro autocontrol alrededor de la comida (¿Gevurah extremo?)",
          sephira: "Gevurah",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Siento que otros me presionan para comer (¿Resistencia a Chesed?)",
          sephira: "Chesed",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Dedico demasiado tiempo y pensamiento a la comida (¿Yesod obsesivo?)",
          sephira: "Yesod",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Me siento incómodo después de comer dulces (¿Placer como pecado?)",
          sephira: "Tiferet",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Me comprometo a hacer dieta (¿Voto de restricción?)",
          sephira: "Gevurah",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Me gusta sentir mi estómago vacío (¿Vacío como pureza?)",
          sephira: "Keter",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Disfruto probar nuevas comidas ricas y bendecirlas (¿Apertura a la abundancia?)",
          sephira: "Chesed",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        },
        {
          text: "Tengo el impulso de vomitar después de las comidas (¿Rechazo del cuerpo?)",
          sephira: "Malkhut",
          options: ["Siempre", "Usualmente", "A menudo", "A veces", "Raramente", "Nunca"]
        }
      ]
    },
    mcmi4Mystic: {
      name: "Multiaxial Cosmic Matrix Inventory-4 (MCMI-4-Mystic)",
      subtitle: "Mapa del alma en los cuatro mundos",
      original: "MCMI-4 - Versión abreviada 30 preguntas",
      sephirot: ["Atzilut", "Briah", "Yetzirah", "Assiah"],
      element: "Éter Universal",
      color: "bg-indigo-600",
      icon: Crown,
      questions: [
        {
          text: "Siento que mi propósito divino (Atzilut) está claro en mi vida",
          sephira: "Atzilut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mis pensamientos en Briah crean realidades que me benefician",
          sephira: "Briah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "En Yetzirah, mis emociones fluyen de manera saludable",
          sephira: "Yetzirah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi manifestación en Assiah refleja mi luz interior",
          sephira: "Assiah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Frecuentemente me siento desconectado de mi esencia divina",
          sephira: "Atzilut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mis creencias limitantes en Briah sabotean mi crecimiento",
          sephira: "Briah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Experimento ciclos emocionales que parecen kármicos",
          sephira: "Yetzirah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Tengo dificultad para manifestar mis intenciones en el mundo físico",
          sephira: "Assiah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi alma necesita tikkun (reparación) en múltiples niveles",
          sephira: "Yetzirah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Siento que llevo contratos del alma de vidas pasadas",
          sephira: "Atzilut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mis patrones mentales se repiten a pesar de mis esfuerzos conscientes",
          sephira: "Briah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Frecuentemente me siento abrumado por emociones intensas",
          sephira: "Yetzirah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi cuerpo físico refleja desequilibrios espirituales",
          sephira: "Assiah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Reconozco patrones familiares que se repiten en mí",
          sephira: "Yetzirah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Siento que mi misión del alma está bloqueada",
          sephira: "Atzilut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mis creencias sobre mí mismo necesitan transformación profunda",
          sephira: "Briah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Experimento sanación cuando trabajo con los cuatro mundos conscientemente",
          sephira: "Atzilut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mis relaciones reflejan lecciones kármicas sin resolver",
          sephira: "Yetzirah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Tengo dificultad para anclar mi espiritualidad en acciones cotidianas",
          sephira: "Assiah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Percibo que mi alma ha elegido desafíos específicos para esta vida",
          sephira: "Atzilut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mis pensamientos autocríticos dominan mi mundo mental",
          sephira: "Briah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Siento que mis emociones están atrapadas en patrones antiguos",
          sephira: "Yetzirah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi salud física mejora cuando me alineo espiritualmente",
          sephira: "Assiah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Reconozco que necesito integrar todos los niveles de mi ser",
          sephira: "Atzilut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Practico tikkun olam (reparación del mundo) como parte de mi sanación",
          sephira: "Assiah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mis sueños revelan información sobre mis patrones inconscientes",
          sephira: "Yetzirah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Siento que estoy en un proceso de transformación alquímica",
          sephira: "Briah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Mi conexión con lo divino se fortalece cuando supero mis limitaciones",
          sephira: "Atzilut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Trabajo conscientemente para equilibrar los cuatro elementos en mi ser",
          sephira: "Assiah",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        },
        {
          text: "Reconozco que mi sanación personal contribuye a la sanación colectiva",
          sephira: "Atzilut",
          options: ["Muy falso", "Algo falso", "Algo verdadero", "Muy verdadero"]
        }
      ]
    }
  };

  const SephirotModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-yellow-300">
        <div className="sticky top-0 bg-purple-900 border-b border-yellow-300 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-300" />
            <h2 className="text-2xl font-bold text-white">Las Diez Sephirot del Árbol de la Vida</h2>
          </div>
          <button
            onClick={() => setShowSephirotModal(false)}
            className="text-white hover:text-yellow-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-purple-200 mb-6 leading-relaxed">
            Las Sephirot son las diez emanaciones divinas que forman el Árbol de la Vida en la Cábala. 
            Representan los atributos a través de los cuales lo Infinito (Ein Sof) se manifiesta y a través 
            de los cuales el alma humana puede ascender hacia lo divino. Cada Sephira es un portal de 
            consciencia y una fuerza energética que influye en tu ser.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {sephirotInfo.map((sephira, index) => (
              <div key={index} className="bg-white bg-opacity-10 rounded-lg p-5 border border-purple-500 border-opacity-30 hover:border-yellow-300 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <Circle className={`w-6 h-6 ${sephira.color} flex-shrink-0 mt-1`} />
                  <div>
                    <h3 className={`text-xl font-bold ${sephira.color}`}>{sephira.name}</h3>
                    <p className="text-purple-300 text-sm italic">"{sephira.meaning}"</p>
                    <p className="text-purple-400 text-xs mt-1">{sephira.position}</p>
                  </div>
                </div>
                <p className="text-purple-100 text-sm leading-relaxed">{sephira.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-yellow-300 bg-opacity-10 rounded-lg p-4 border border-yellow-300 border-opacity-30">
            <p className="text-yellow-200 text-sm">
              💫 <span className="font-semibold">Nota espiritual:</span> Cada test evalúa diferentes aspectos de tu ser 
              en relación con estas Sephirot. Al identificar dónde están los desequilibrios, puedes trabajar 
              conscientemente en tu tikkun (reparación espiritual) y avanzar en tu camino de evolución del alma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);
    
    if (currentQuestion < tests[selectedTest].questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateResults = () => {
    const total = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const max = tests[selectedTest].questions.length * (tests[selectedTest].questions[0].options.length - 1);
    const percentage = (total / max) * 100;
    
    let interpretation = "";
    let practices = [];
    
    if (percentage < 25) {
      interpretation = "Tu alma fluye en armonía con las Sephirot. Continúa cultivando esta conexión divina.";
      practices = [
        "Meditación diaria para mantener el equilibrio",
        "Estudio de textos sagrados cabalísticos",
        "Práctica de gratitud antes de cada comida",
        "Visualización del Árbol de la Vida"
      ];
    } else if (percentage < 50) {
      interpretation = "Hay desequilibrios leves en tu árbol de vida. Es momento de tikkun (reparación) suave.";
      practices = [
        "Visualización del Árbol de la Vida durante 15 minutos diarios",
        "Trabajo con las Sephirot afectadas mediante afirmaciones",
        "Rituales de purificación con elementos naturales (agua, incienso, tierra)",
        "Práctica de respiración consciente para equilibrar energías",
        "Escritura de diario espiritual identificando patrones"
      ];
    } else if (percentage < 75) {
      interpretation = "Tu energía muestra bloqueos significativos. Se recomienda trabajo espiritual profundo.";
      practices = [
        "Sesiones de sanación energética con guía experimentado",
        "Ayuno consciente o retiro espiritual de 3-7 días",
        "Trabajo con gematria y nombres sagrados",
        "Terapia de vidas pasadas para sanar karma",
        "Meditaciones específicas en las Sephirot bloqueadas",
        "Estudio profundo del Zohar con maestro cabalista"
      ];
    } else {
      interpretation = "Tu alma clama por transformación urgente. Es tiempo de dedicación total al camino espiritual.";
      practices = [
        "Retiro intensivo de 7-40 días en centro espiritual",
        "Trabajo diario con maestro cabalista certificado",
        "Rituales diarios de tikkun olam (reparación del mundo)",
        "Desintoxicación física, emocional y espiritual completa",
        "Estudio profundo del Zohar y Sefer Yetzirah",
        "Meditaciones de las 72 letras del nombre divino",
        "Ayuno espiritual y prácticas de purificación",
        "Trabajo de sombra profundo con terapeuta transpersonal"
      ];
    }
    
    return { percentage: percentage.toFixed(1), interpretation, practices };
  };

  const resetTest = () => {
    setSelectedTest(null);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  if (!selectedTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Sparkles className="w-16 h-16 text-yellow-300" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Sistema de Evaluación Holística Cabalística
            </h1>
            <p className="text-purple-200 text-lg mb-4">
              Instrumentos psicométricos transformados en herramientas de evolución espiritual
            </p>
            <button
              onClick={() => setShowSephirotModal(true)}
              className="inline-flex items-center gap-2 bg-yellow-300 text-purple-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-200 transition-all"
            >
              <Info className="w-5 h-5" />
              ¿Qué son las Sephirot?
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(tests).map(([key, test]) => {
              const Icon = test.icon;
              return (
                <div
                  key={key}
                  onClick={() => setSelectedTest(key)}
                  className={`${test.color} bg-opacity-20 border-2 border-opacity-50 rounded-lg p-6 cursor-pointer hover:bg-opacity-30 transition-all hover:scale-105`}
                >
                  <div className="flex items-start gap-4">
                    <Icon className="w-10 h-10 text-white flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{test.name}</h3>
                      <p className="text-purple-100 text-sm mb-2">{test.subtitle}</p>
                      <p className="text-purple-300 text-xs mb-3 italic">Basado en: {test.original}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {test.sephirot.map((s, i) => (
                          <span key={i} className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="text-purple-200 text-xs">Elemento: {test.element}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {showSephirotModal && <SephirotModal />}
      </div>
    );
  }

  if (showResults) {
    const results = calculateResults();
    const test = tests[selectedTest];
    const Icon = test.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-8 border border-white border-opacity-20">
            <div className="text-center mb-8">
              <Icon className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Resultados de {test.name}</h2>
              <div className="text-6xl font-bold text-yellow-300 mb-4">{results.percentage}%</div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-3">Interpretación Espiritual</h3>
              <p className="text-purple-100 leading-relaxed">{results.interpretation}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-3">Prácticas Recomendadas de Tikkun</h3>
              <ul className="space-y-2">
                {results.practices.map((practice, i) => (
                  <li key={i} className="text-purple-100 flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-800 bg-opacity-30 rounded-lg p-4 mb-6">
              <h4 className="text-white font-bold mb-2">Sephirot Involucradas</h4>
              <div className="flex flex-wrap gap-2">
                {test.sephirot.map((s, i) => (
                  <span key={i} className="bg-yellow-300 text-purple-900 px-3 py-1 rounded-full text-sm font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetTest}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Explorar Otro Instrumento
              </button>
              <button
                onClick={() => setShowSephirotModal(true)}
                className="bg-yellow-300 text-purple-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-200 transition-all"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        {showSephirotModal && <SephirotModal />}
      </div>
    );
  }

  const test = tests[selectedTest];
  const question = test.questions[currentQuestion];
  const Icon = test.icon;
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-200 text-sm">
              Pregunta {currentQuestion + 1} de {test.questions.length}
            </span>
            <button
              onClick={() => setShowSephirotModal(true)}
              className="text-yellow-300 hover:text-yellow-200 transition-colors text-sm flex items-center gap-1"
            >
              <Info className="w-4 h-4" />
              ¿Qué es {question.sephira}?
            </button>
          </div>
          <div className="w-full bg-purple-800 bg-opacity-30 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-8 border border-white border-opacity-20">
          <div className="flex items-center gap-3 mb-6">
            <Icon className="w-8 h-8 text-yellow-300" />
            <h2 className="text-2xl font-bold text-white">{test.name}</h2>
          </div>

          <div className="mb-6">
            <span className="inline-block bg-yellow-300 text-purple-900 px-3 py-1 rounded-full text-sm font-semibold mb-4">
              Sephira: {question.sephira}
            </span>
            <p className="text-xl text-white leading-relaxed">{question.text}</p>
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full text-left bg-purple-700 bg-opacity-30 hover:bg-opacity-50 text-white p-4 rounded-lg transition-all hover:scale-102 border border-purple-500 border-opacity-30 hover:border-yellow-300"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={resetTest}
          className="mt-4 text-purple-200 hover:text-white transition-colors text-sm"
        >
          ← Volver al inicio
        </button>
      </div>
      {showSephirotModal && <SephirotModal />}
    </div>
  );
};

export default HolisticKabbalisticAssessment;
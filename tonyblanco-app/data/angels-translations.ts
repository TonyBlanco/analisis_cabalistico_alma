/**
 * Traducciones al español y meditaciones de los 72 Ángeles
 * Sistema completo de contenido en español
 */

export interface AngelTranslation {
  name: {
    he: string;
    en: string;
    es: string;
  };
  attribute: {
    en: string;
    es: string;
  };
  description: {
    es: string;
  };
  meditation: {
    es: string;
  };
  invocation: {
    es: string;
  };
  qualities: string[];
  audioUrl?: string;
}

export const ANGELS_SPANISH: Record<string, AngelTranslation> = {
  'Vehuiah': {
    name: {
      he: 'והויה',
      en: 'Vehuiah',
      es: 'Vehuiah'
    },
    attribute: {
      en: 'God is High and Exalted above all things.',
      es: 'Dios Altísimo y Exaltado sobre todas las cosas'
    },
    description: {
      es: 'Vehuiah es el primer ángel del Shem ha-Mephorash, perteneciente al coro de los Serafines. Gobierna los primeros rayos del Este en primavera. Este genio protege a quienes nacen bajo su influencia con gran sagacidad, pasión por las ciencias y las artes, capaz de emprender las cosas más difíciles. Otorga energía de acción y protección contra el fuego. Ayuda a iluminarse con el espíritu de Dios.'
    },
    meditation: {
      es: 'Cierro mis ojos y visualizo una luz dorada descendiendo desde el cielo. Respiro profundamente tres veces. Pronuncio mentalmente: Vehuiah (Ve-hu-iah). Siento cómo la energía divina llena mi coronilla, despertando mi sabiduría interior. "Soy uno con la Luz Suprema. Mi voluntad se alinea con lo Divino. Tengo el poder de comenzar, de crear, de manifestar." Permanezco en silencio, sintiendo la presencia del ángel durante 3-5 minutos.'
    },
    invocation: {
      es: 'Vehuiah, primer nombre sagrado, te invoco en este momento de necesidad. Ilumina mi mente con tu sabiduría divina. Dame la fuerza para comenzar nuevos proyectos y la claridad para ver el camino. Protégeme del fuego de la ira y enciende en mí el fuego de la inspiración. Que tu luz guíe cada uno de mis pasos. Amén.'
    },
    qualities: ['Sabiduría', 'Iluminación', 'Voluntad divina', 'Nuevos comienzos', 'Energía creadora'],
    audioUrl: '/audio/angels/vehuiah.mp3'
  },
  'Jeliel': {
    name: {
      he: 'יליאל',
      en: 'Jeliel',
      es: 'Jeliel'
    },
    attribute: {
      en: 'Helpful God',
      es: 'Dios Bondadoso'
    },
    description: {
      es: 'Jeliel es el segundo ángel, también del orden de los Serafines. Se invoca para apaciguar sediciones y obtener victoria sobre quienes nos atacan injustamente. Domina sobre reyes y príncipes, mantiene a los súbditos en obediencia. Influye en la generación de todos los seres del reino animal. Restaura la paz entre esposos y la fidelidad conyugal. Quienes nacen bajo su influencia tienen espíritu alegre, modales agradables y galantes.'
    },
    meditation: {
      es: 'Me siento en un lugar tranquilo. Respiro en calma y repito: Jeliel (Ye-li-el). Visualizo una luz verde esmeralda rodeando mi corazón. Esta luz disuelve conflictos, calma las aguas turbulentas de las relaciones. "Soy un canal de paz. Donde hay discordia, llevo armonía. Mi presencia calma y reconcilia." Permito que la energía de Jeliel suavice las tensiones en mi vida.'
    },
    invocation: {
      es: 'Jeliel, ángel de la paz y la justicia, acudo a ti en busca de armonía. Calma las tormentas en mis relaciones. Dame la sabiduría para resolver conflictos con amor. Restaura la fidelidad donde ha sido rota. Que tu influencia traiga alegría a mi espíritu y gracia a mis acciones. Bendice mis vínculos con paz duradera. Amén.'
    },
    qualities: ['Paz', 'Armonía', 'Justicia', 'Fidelidad', 'Alegría'],
    audioUrl: '/audio/angels/jeliel.mp3'
  },
  'Sitael': {
    name: {
      he: 'סיטאל',
      en: 'Sitael',
      es: 'Sitael'
    },
    attribute: {
      en: 'God, the hope of all creatures.',
      es: 'Dios, esperanza de todas las criaturas'
    },
    description: {
      es: 'Sitael es el tercer ángel, del coro de los Serafines bajo la influencia del Sol. Se invoca contra las adversidades. Domina sobre la nobleza, magnanimidad y grandes empresas. Protege contra armas y bestias feroces. Quien nace bajo su influencia ama la verdad, cumple su palabra y es feliz ayudando a quienes necesitan sus servicios.'
    },
    meditation: {
      es: 'Respiro hondo y pronuncio: Sitael (Si-ta-el). Visualizo un sol dorado brillando en mi plexo solar. Esta luz solar disuelve la oscuridad de la desesperanza. "Soy portador de esperanza. Mi palabra es mi poder. La verdad me hace libre y mi generosidad me eleva." Siento cómo la nobleza de espíritu crece en mi interior con cada respiración.'
    },
    invocation: {
      es: 'Sitael, esperanza divina de todas las criaturas, te llamo en este momento. Protégeme de las adversidades que acechan mi camino. Dame magnanimidad ante los desafíos. Fortalece mi integridad y mi palabra. Que mi vida sea un reflejo de la nobleza del espíritu. Ayúdame a ser luz para otros en sus momentos oscuros. Amén.'
    },
    qualities: ['Esperanza', 'Nobleza', 'Verdad', 'Magnanimidad', 'Protección'],
    audioUrl: '/audio/angels/sitael.mp3'
  },
  'Caliel': {
    name: {
      he: 'כליאל',
      en: 'Caliel',
      es: 'Caliel'
    },
    attribute: {
      en: 'God ready to rescue',
      es: 'Dios pronto a socorrer.'
    },
    description: {
      es: 'Ayuda a obtener justicia y hace conocer la verdad.'
    },
    meditation: {
      es: 'Invoco el poder de la verdad absoluta. Que la justicia divina se manifieste en mi vida y disuelva cualquier falsedad o confusión.'
    },
    invocation: {
      es: 'Caliel, tráeme la claridad y la justicia.'
    },
    qualities: ['Justicia', 'Verdad', 'Claridad', 'Discernimiento', 'Rectitud'],
    audioUrl: '/audio/angels/caliel.mp3'
  },
  'Lauviah': {
    name: {
      he: 'לאויה',
      en: 'Lauviah',
      es: 'Lauviah'
    },
    attribute: {
      en: 'Admirable God',
      es: 'Dios Admirable'
    },
    description: {
      es: 'Lauviah es un ángel asociado con el sueño reparador y la revelación. Ayuda a encontrar el descanso profundo y la paz interior. Su energía facilita la conexión con los estados de sueño sanador y la revelación de verdades durante el descanso.'
    },
    meditation: {
      es: 'Me preparo para el descanso profundo. Invoco a Lauviah para que mi sueño sea reparador y sanador. Visualizo una luz suave y cálida envolviendo mi cuerpo, permitiendo que mi mente se libere de las preocupaciones del día. Confío en que el descanso me traerá claridad y renovación.'
    },
    invocation: {
      es: 'Lauviah, ángel del sueño reparador, te invoco para que mi descanso sea profundo y sanador. Permite que mi mente encuentre la paz y que mi cuerpo se renueve. Que el sueño me traiga revelaciones y claridad. Amén.'
    },
    qualities: ['Sueño reparador', 'Revelación', 'Paz interior', 'Descanso', 'Renovación'],
    audioUrl: '/audio/angels/lauviah.mp3'
  },
  'Veuliah': {
    name: {
      he: 'ווליה',
      en: 'Veuliah',
      es: 'Veuliah'
    },
    attribute: {
      en: 'Dominating King God',
      es: 'Dios Rey Dominante'
    },
    description: {
      es: 'Veuliah es un ángel asociado con la liberación del pasado y la superación de traumas. Ayuda a romper los ciclos de memoria dolorosa y a encontrar la fuerza para avanzar. Su energía facilita la sanación de heridas emocionales profundas y la liberación de patrones traumáticos.'
    },
    meditation: {
      es: 'Me abro a la liberación del pasado. Invoco a Veuliah para que me ayude a romper los ciclos de memoria dolorosa. Visualizo cómo las cadenas del trauma se desvanecen, permitiendo que la luz divina llene los espacios que antes ocupaba el dolor. Me permito avanzar hacia un futuro libre.'
    },
    invocation: {
      es: 'Veuliah, ángel de la liberación, te invoco para que me ayudes a liberarme del pasado. Rompe los ciclos de memoria traumática y permite que encuentre la fuerza para avanzar. Que la sanación divina llene mi ser y me permita vivir en el presente. Amén.'
    },
    qualities: ['Liberación', 'Sanación', 'Superación', 'Fuerza', 'Renovación'],
    audioUrl: '/audio/angels/veuliah.mp3'
  },
  'Melahel': {
    name: {
      he: 'מלהאל',
      en: 'Melahel',
      es: 'Melahel'
    },
    attribute: {
      en: 'God who delivers from evil',
      es: 'Dios que libera del mal'
    },
    description: {
      es: 'Melahel es el ángel de la curación y las plantas medicinales. Gobierna sobre las aguas curativas y la naturaleza sanadora. Su energía verde recorre el cuerpo, curando dolencias psicosomáticas y restaurando el equilibrio entre el cuerpo y el alma. Quienes invocan a Melahel encuentran alivio en la sabiduría de la naturaleza y la medicina divina.'
    },
    meditation: {
      es: 'Me envuelvo en una luz verde sanadora que fluye como agua pura. Melahel activa el poder curativo de las plantas medicinales en mi cuerpo. Cada célula se regenera, cada nervio se calma. La naturaleza divina me sana desde adentro hacia afuera, disolviendo las dolencias psicosomáticas y restaurando mi equilibrio vital.'
    },
    invocation: {
      es: 'Melahel, ángel de la curación y las plantas medicinales, invoco tu poder sanador. Que las aguas curativas fluyan por mi ser y que la sabiduría de la naturaleza restaure mi salud física y emocional. Libérame del mal y devuélveme el equilibrio divino.'
    },
    qualities: ['Curación', 'Plantas medicinales', 'Sanación', 'Aguas curativas', 'Naturaleza', 'Bienestar'],
    audioUrl: '/audio/angels/melahel.mp3'
  },
  'Mikael': {
    name: {
      he: 'מיכאל',
      en: 'Mikael',
      es: 'Mikael'
    },
    attribute: {
      en: 'Who is like God',
      es: 'Semejante a Dios'
    },
    description: {
      es: 'Mikael es el ángel del orden político e interno, y de la obediencia divina. Establece la jerarquía correcta en todos los aspectos de la vida, organizando el caos interno y externo. Su energía refleja la estructura divina, creando orden donde hay confusión y disciplina donde hay desorden. Quienes invocan a Mikael encuentran la capacidad de organizar sus pensamientos, acciones y relaciones según el orden superior.'
    },
    meditation: {
      es: 'Establezco el orden divino en mi vida. La jerarquía celestial se refleja en mi mente y en mis acciones. Mikael organiza mi caos interno, creando estructura donde había confusión. Me someto voluntariamente al orden superior, encontrando paz en la obediencia divina. Cada pensamiento encuentra su lugar, cada acción su propósito.'
    },
    invocation: {
      es: 'Mikael, ángel del orden y la obediencia divina, invoco tu poder estructurador. Organiza mi caos interno y externo, establece la jerarquía correcta en mi vida. Que la disciplina divina guíe mis pensamientos y acciones, reflejando el orden celestial en la tierra.'
    },
    qualities: ['Orden', 'Jerarquía', 'Obediencia', 'Organización', 'Disciplina', 'Estructura política e interna'],
    audioUrl: '/audio/angels/mikael.mp3'
  },
  'Nithael': {
    name: {
      he: 'נתהאל',
      en: 'Nithael',
      es: 'Nithael'
    },
    attribute: {
      en: 'King of the Heavens',
      es: 'Rey de los Cielos'
    },
    description: {
      es: 'Nithael es el ángel de la estabilidad, la legitimidad y la juventud del espíritu. Como Rey de los Cielos, establece la legitimidad divina en la vida terrenal, restaurando el equilibrio y la gracia juvenil. Su energía equilibra la personalidad, devolviendo la estabilidad perdida y la frescura del espíritu. Quienes invocan a Nithael encuentran la legitimidad en sus acciones y recuperan la estabilidad emocional y espiritual.'
    },
    meditation: {
      es: 'Me conecto con la legitimidad divina. Nithael, Rey de los Cielos, restaura mi estabilidad y mi juventud espiritual. Siento cómo el equilibrio se establece en mi personalidad, cómo la gracia divina fluye por mi ser. Recupero la frescura del espíritu, la estabilidad emocional y la legitimidad en todas mis acciones. Mi vida se alinea con el orden celestial.'
    },
    invocation: {
      es: 'Nithael, Rey de los Cielos, invoco tu poder estabilizador. Restaura mi equilibrio, devuélveme la gracia juvenil de mi espíritu y establece la legitimidad divina en mi vida. Que la estabilidad celestial se refleje en mi existencia terrenal.'
    },
    qualities: ['Estabilidad', 'Legitimidad', 'Juventud', 'Equilibrio', 'Gracia', 'Balance'],
    audioUrl: '/audio/angels/nithael.mp3'
  },
  'Haamiah': {
    name: {
      he: 'האמיה',
      en: 'Haamiah',
      es: 'Haamiah'
    },
    attribute: {
      en: 'God hope of the earth',
      es: 'Dios esperanza de la tierra'
    },
    description: {
      es: 'Haamiah es el ángel de la verdad divina, los rituales sagrados y los tesoros de la tierra. Como esperanza de la tierra, revela la verdad oculta y guía hacia los rituales personales que conectan con lo divino. Su energía disuelve la confusión estructural, revelando los tesoros espirituales y materiales que la tierra guarda. Quienes invocan a Haamiah encuentran su ritual sagrado personal y acceden a la verdad que transforma.'
    },
    meditation: {
      es: 'Me conecto con la verdad divina y los tesoros de la tierra. Haamiah revela mi ritual sagrado personal, ese acto que me conecta directamente con lo divino. La confusión estructural se disuelve, y veo claramente la verdad que estaba oculta. Los tesoros de la tierra, tanto espirituales como materiales, se revelan ante mí. La esperanza divina llena mi corazón, mostrándome el camino hacia la realización completa.'
    },
    invocation: {
      es: 'Haamiah, ángel de la verdad y los tesoros de la tierra, invoco tu poder revelador. Muéstrame mi ritual sagrado personal, disuelve la confusión estructural y revélame la verdad oculta. Que los tesoros divinos, tanto espirituales como materiales, se manifiesten en mi vida como esperanza de la tierra.'
    },
    qualities: ['Verdad', 'Ritual', 'Tesoros de la tierra', 'Revelación', 'Esperanza', 'Claridad'],
    audioUrl: '/audio/angels/haamiah.mp3'
  },
  'Harahel': {
    name: {
      he: 'הרהאל',
      en: 'Harahel',
      es: 'Harahel'
    },
    attribute: {
      en: 'God who knows all things',
      es: 'Dios que conoce todas las cosas'
    },
    description: {
      es: 'Harahel es un ángel asociado con el conocimiento, la riqueza intelectual y el orden mental. Ayuda a organizar los pensamientos, mantener el foco y materializar las ideas sin dispersión. Su energía proporciona claridad y estructura mental.'
    },
    meditation: {
      es: 'Ordeno mi mente. La luz de Harahel me da claridad, foco y la capacidad de materializar mis ideas sin dispersión.'
    },
    invocation: {
      es: 'Harahel, dame concentración y estructura.'
    },
    qualities: ['Conocimiento', 'Orden mental', 'Foco', 'Claridad', 'Estructura'],
    audioUrl: '/audio/angels/harahel.mp3'
  },
  'Eyael': {
    name: {
      he: 'אייאל',
      en: 'Eyael',
      es: 'Eyael'
    },
    attribute: {
      en: 'God delight of children',
      es: 'Dios delicia de los niños'
    },
    description: {
      es: 'Eyael es un ángel asociado con la transformación, la sublimación y la libertad verdadera. Ayuda a transformar las adicciones y los deseos destructivos en pasión por la vida y la sabiduría. Su energía permite encontrar satisfacción en lo espiritual en lugar de buscar luces externas.'
    },
    meditation: {
      es: 'Sublimo mis deseos. Transformo la adicción en pasión por la vida y la sabiduría. Encuentro mi satisfacción en lo espiritual.'
    },
    invocation: {
      es: 'Eyael, ayúdame a encontrar la libertad verdadera.'
    },
    qualities: ['Transformación', 'Sublimación', 'Libertad', 'Sabiduría', 'Sanación'],
    audioUrl: '/audio/angels/eyael.mp3'
  },
  'Mizrael': {
    name: {
      he: 'מזראל',
      en: 'Mizrael',
      es: 'Mizrael'
    },
    attribute: {
      en: 'God who comforts the oppressed',
      es: 'Dios que consuela a los oprimidos'
    },
    description: {
      es: 'Mizrael es un ángel asociado con la reparación mental, la sanación de la percepción y la aceptación del cuerpo. Ayuda a sanar la relación con la propia imagen y a aceptar la belleza divina que habita en cada ser. Su energía consuela y repara las heridas de la autoimagen.'
    },
    meditation: {
      es: 'Sano la relación con mi cuerpo y mi imagen. Acepto la belleza divina que habita en mí. Soy perfecto/a tal como fui creado/a.'
    },
    invocation: {
      es: 'Mizrael, sana mi mente y mi percepción.'
    },
    qualities: ['Reparación', 'Sanación', 'Aceptación', 'Belleza', 'Consuelo'],
    audioUrl: '/audio/angels/mizrael.mp3'
  },
  'Mitzrael': {
    name: {
      he: 'מזראל',
      en: 'Mitzrael',
      es: 'Mitzrael'
    },
    attribute: {
      en: 'God who comforts the oppressed',
      es: 'Dios que consuela a los oprimidos'
    },
    description: {
      es: 'Mitzrael es el ángel de la reparación interna. Sana las heridas de la mente y libera de la sensación de persecución o paranoia post-traumática. Su energía reconstruye las vasijas rotas del alma con oro divino (Kintsugi del alma), calma el sistema nervioso y devuelve al presente seguro.'
    },
    meditation: {
      es: 'Reconstruyo mi vasija. Sé que lo que se rompió puede ser reparado con oro divino (Kintsugi del alma). Mitzrael calma mi sistema nervioso y me devuelve al presente seguro.'
    },
    invocation: {
      es: 'Mitzrael, repara mi mente y libera mi espíritu.'
    },
    qualities: ['Reparación', 'Liberación', 'Sanación mental', 'Kintsugi del alma', 'Consuelo'],
    audioUrl: '/audio/angels/mitzrael.mp3'
  }
};

// Funciones auxiliares
export function getAngelSpanish(angelName: string): AngelTranslation | undefined {
  return ANGELS_SPANISH[angelName];
}

export function getAngelMeditation(angelName: string, language: 'es' | 'en' = 'es'): string {
  const angel = ANGELS_SPANISH[angelName];
  if (!angel) return '';
  return language === 'es' ? angel.meditation.es : '';
}

export function getAngelInvocation(angelName: string, language: 'es' | 'en' = 'es'): string {
  const angel = ANGELS_SPANISH[angelName];
  if (!angel) return '';
  return language === 'es' ? angel.invocation.es : '';
}

export function getAngelDescription(angelName: string, language: 'es' | 'en' = 'es'): string {
  const angel = ANGELS_SPANISH[angelName];
  if (!angel) return '';
  return language === 'es' ? angel.description.es : '';
}

const fs = require('fs');
const path = require('path');

// 1. REGISTRO DEL ALFABETO (Motor de Cálculo)
// Esto es lo nuevo que necesitas para tus cálculos de Gematría
const alphabetRegistry = [
  { "letter": "א", "name": "Aleph", "val_std": 1, "val_ord": 1, "val_sof": 1, "atbash": "ת", "type": "mother" },
  { "letter": "ב", "name": "Bet", "val_std": 2, "val_ord": 2, "val_sof": 2, "atbash": "ש", "type": "double" },
  { "letter": "ג", "name": "Gimel", "val_std": 3, "val_ord": 3, "val_sof": 3, "atbash": "ר", "type": "double" },
  { "letter": "ד", "name": "Dalet", "val_std": 4, "val_ord": 4, "val_sof": 4, "atbash": "ק", "type": "double" },
  { "letter": "ה", "name": "He", "val_std": 5, "val_ord": 5, "val_sof": 5, "atbash": "צ", "type": "simple" },
  { "letter": "ו", "name": "Vav", "val_std": 6, "val_ord": 6, "val_sof": 6, "atbash": "פ", "type": "simple" },
  { "letter": "ז", "name": "Zayin", "val_std": 7, "val_ord": 7, "val_sof": 7, "atbash": "ע", "type": "simple" },
  { "letter": "ח", "name": "Chet", "val_std": 8, "val_ord": 8, "val_sof": 8, "atbash": "ס", "type": "simple" },
  { "letter": "ט", "name": "Tet", "val_std": 9, "val_ord": 9, "val_sof": 9, "atbash": "נ", "type": "simple" },
  { "letter": "י", "name": "Yod", "val_std": 10, "val_ord": 10, "val_sof": 10, "atbash": "מ", "type": "simple" },
  { "letter": "כ", "name": "Kaf", "val_std": 20, "val_ord": 11, "val_sof": 500, "atbash": "ל", "type": "double" },
  { "letter": "ך", "name": "Kaf Sofit", "val_std": 20, "val_ord": 11, "val_sof": 500, "atbash": "ל", "type": "sofit" },
  { "letter": "ל", "name": "Lamed", "val_std": 30, "val_ord": 12, "val_sof": 30, "atbash": "כ", "type": "simple" },
  { "letter": "מ", "name": "Mem", "val_std": 40, "val_ord": 13, "val_sof": 600, "atbash": "י", "type": "mother" },
  { "letter": "ם", "name": "Mem Sofit", "val_std": 40, "val_ord": 13, "val_sof": 600, "atbash": "י", "type": "sofit" },
  { "letter": "נ", "name": "Nun", "val_std": 50, "val_ord": 14, "val_sof": 700, "atbash": "ט", "type": "simple" },
  { "letter": "ן", "name": "Nun Sofit", "val_std": 50, "val_ord": 14, "val_sof": 700, "atbash": "ט", "type": "sofit" },
  { "letter": "ס", "name": "Samech", "val_std": 60, "val_ord": 15, "val_sof": 60, "atbash": "ח", "type": "simple" },
  { "letter": "ע", "name": "Ayin", "val_std": 70, "val_ord": 16, "val_sof": 70, "atbash": "ז", "type": "simple" },
  { "letter": "פ", "name": "Pei", "val_std": 80, "val_ord": 17, "val_sof": 800, "atbash": "ו", "type": "double" },
  { "letter": "ף", "name": "Pei Sofit", "val_std": 80, "val_ord": 17, "val_sof": 800, "atbash": "ו", "type": "sofit" },
  { "letter": "צ", "name": "Tzadik", "val_std": 90, "val_ord": 18, "val_sof": 900, "atbash": "ה", "type": "simple" },
  { "letter": "ץ", "name": "Tzadik Sofit", "val_std": 90, "val_ord": 18, "val_sof": 900, "atbash": "ה", "type": "sofit" },
  { "letter": "ק", "name": "Qof", "val_std": 100, "val_ord": 19, "val_sof": 100, "atbash": "ד", "type": "simple" },
  { "letter": "ר", "name": "Resh", "val_std": 200, "val_ord": 20, "val_sof": 200, "atbash": "ג", "type": "double" },
  { "letter": "ש", "name": "Shin", "val_std": 300, "val_ord": 21, "val_sof": 300, "atbash": "ב", "type": "mother" },
  { "letter": "ת", "name": "Tav", "val_std": 400, "val_ord": 22, "val_sof": 400, "atbash": "א", "type": "double" }
];

// Función para limpiar vocales (Nikkud) - Vital para Temurah y Notarikón
function removeNikkud(text) {
  return text ? text.replace(/[\u0591-\u05C7]/g, "") : "";
}

// Función principal
function migrateDatabase() {
  try {
    // 1. Lee TU archivo original desde data/
    const inputPath = path.join(__dirname, '..', 'data', 'hebrew_words_database.json');
    const outputPath = path.join(__dirname, '..', 'data', 'hebrew_database_master.json');
    
    console.log('📖 Leyendo archivo original desde:', inputPath);
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const originalDb = JSON.parse(rawData);

    const totalWords = originalDb.words ? originalDb.words.length : 0;
    console.log(`✅ Leídas ${totalWords} entradas del archivo original.`);

    // 2. Transforma las palabras al nuevo formato 'Lexicon'
    const newLexicon = originalDb.words.map((entry, index) => {
      // Crear ID único si no existe
      const id = entry.id || `${entry.category.substring(0,3)}_${index + 1}`.toLowerCase();
      
      // Crear versión limpia para cálculos
      const cleanHebrew = removeNikkud(entry.hebrew);

      return {
        id: id,
        hebrew_clean: cleanHebrew,             // Para cálculos (sin vocales)
        hebrew_full: entry.hebrew,             // Para mostrar (con vocales)
        transliteration: entry.transliteration,
        category: entry.category,
        meaning_es: entry.meaning,
        gematria_std: entry.gematria,          // Mantenemos tu valor original
        related: entry.related || [],
        references: entry.references || [],
        mystical_desc: entry.mysticalMeaning || entry.mystical_desc || ""
      };
    });

    console.log(`🔄 Transformadas ${newLexicon.length} entradas al nuevo formato.`);

    // 3. Estructura Final Maestra
    const masterDb = {
      meta_config: {
        version: "3.0_Migrated",
        description: "Base de datos maestra con soporte para cálculos automáticos de Gematría, Temurah, Atbash y Notarikon",
        total_entries: newLexicon.length,
        categories: originalDb.metadata?.categories || [],
        generated_at: new Date().toISOString(),
        source: "hebrew_words_database.json"
      },
      alphabet_registry: alphabetRegistry, // Aquí inyectamos la tabla de cálculo
      lexicon: newLexicon                  // Aquí van todas las palabras transformadas
    };

    // 4. Guardar el nuevo archivo
    fs.writeFileSync(outputPath, JSON.stringify(masterDb, null, 2), 'utf8');
    
    console.log('\n🎉 ¡Éxito! Archivo creado:', outputPath);
    console.log(`📊 Estadísticas:`);
    console.log(`   - ${alphabetRegistry.length} letras en alfabeto hebreo`);
    console.log(`   - ${newLexicon.length} palabras en el léxico`);
    console.log(`   - Tamaño archivo: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    console.log('\n✨ La base de datos está lista para usar en todos los análisis cabalísticos!');

  } catch (error) {
    console.error("❌ Error durante la migración:", error.message);
    console.log("\n💡 Verifica que:");
    console.log("   1. El archivo 'data/hebrew_words_database.json' exista");
    console.log("   2. El JSON sea válido (sin errores de sintaxis)");
    console.log("   3. La carpeta 'data/' tenga permisos de escritura");
  }
}

// Ejecutar la migración
console.log('🚀 Iniciando migración de base de datos hebrea...\n');
migrateDatabase();

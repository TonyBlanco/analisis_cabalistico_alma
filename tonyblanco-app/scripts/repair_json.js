const fs = require('fs');
const path = require('path');

// Función para reparar JSON con problemas comunes
function repairJSON() {
  try {
    const inputPath = path.join(__dirname, '..', 'data', 'hebrew_words_database.json');
    
    console.log('📖 Leyendo archivo JSON...');
    let content = fs.readFileSync(inputPath, 'utf8');
    
    // Contar comillas para diagnóstico
    const singleQuotes = (content.match(/'/g) || []).length;
    const doubleQuotes = (content.match(/"/g) || []).length;
    
    console.log(`   Comillas simples: ${singleQuotes}`);
    console.log(`   Comillas dobles: ${doubleQuotes}`);
    
    // Reparaciones comunes:
    // 1. Reemplazar comillas simples por dobles en keys
    content = content.replace(/'([^']+)':/g, '"$1":');
    
    // 2. Eliminar comas finales antes de }
    content = content.replace(/,(\s*[}\]])/g, '$1');
    
    // 3. Asegurar que los arrays tengan elementos separados por comas
    content = content.replace(/\]\s+\[/g, '],[');
    
    // 4. Intentar parsear
    console.log('🔍 Validando JSON...');
    const parsed = JSON.parse(content);
    
    console.log(`✅ JSON válido! Contiene ${parsed.words ? parsed.words.length : 0} palabras`);
    
    // Guardar versión limpia
    const outputPath = path.join(__dirname, '..', 'data', 'hebrew_words_database_clean.json');
    fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2), 'utf8');
    
    console.log(`💾 Guardado en: ${outputPath}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Encontrar la línea con el error
    if (error.message.includes('position')) {
      const match = error.message.match(/position (\d+)/);
      if (match) {
        const pos = parseInt(match[1]);
        const inputPath = path.join(__dirname, '..', 'data', 'hebrew_words_database.json');
        const content = fs.readFileSync(inputPath, 'utf8');
        
        // Mostrar contexto del error
        const start = Math.max(0, pos - 100);
        const end = Math.min(content.length, pos + 100);
        const context = content.substring(start, end);
        
        console.log('\n📍 Contexto del error:');
        console.log('---');
        console.log(context);
        console.log('---\n');
        
        // Calcular línea aproximada
        const upTo = content.substring(0, pos);
        const lineNum = (upTo.match(/\n/g) || []).length + 1;
        console.log(`Línea aproximada: ${lineNum}`);
      }
    }
    
    return false;
  }
}

console.log('🔧 Iniciando reparación de JSON...\n');
const success = repairJSON();

if (!success) {
  console.log('\n💡 El archivo requiere edición manual.');
  console.log('   Revisa el contexto mostrado arriba.');
}

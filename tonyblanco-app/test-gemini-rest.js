// Prueba directa con la API REST de Gemini
const fs = require('fs');
const path = require('path');

// Leer API key
let apiKey = "";
try {
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.+)/);
  if (match) {
    apiKey = match[1].trim().replace(/^["']|["']$/g, '');
  }
} catch (err) {
  apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
}

console.log('🔍 Probando conexión directa con Gemini API REST...\n');
console.log(`API Key: ${apiKey ? apiKey.substring(0, 15) + '...' : 'NO ENCONTRADA'}\n`);

if (!apiKey) {
  console.error('❌ No se encontró la API key');
  process.exit(1);
}

// Probar con diferentes endpoints y modelos
const modelsToTest = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro-latest',
  'gemini-1.5-flash-latest'
];

async function testWithFetch(modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{
        text: "Responde solo con 'OK'"
      }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ✅ ✅ ÉXITO con ${modelName}!`);
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        console.log(`📝 Respuesta: "${text}"\n`);
      }
      return { success: true, model: modelName, data };
    } else {
      console.log(`❌ ${modelName}: ${response.status} - ${data.error?.message || JSON.stringify(data)}\n`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log(`❌ ${modelName}: Error de red - ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

// Ejecutar pruebas
(async () => {
  for (const model of modelsToTest) {
    const result = await testWithFetch(model);
    if (result.success) {
      console.log('🎉 ¡Conexión exitosa!');
      process.exit(0);
    }
    // Esperar un poco entre intentos
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.error('❌ Ningún modelo funcionó.');
  console.error('\n💡 Verifica:');
  console.error('   1. Que la API key sea válida');
  console.error('   2. Que tengas habilitada la API en Google Cloud Console');
  console.error('   3. Que no hayas excedido tu cuota');
  console.error('   4. Visita: https://aistudio.google.com/apikey\n');
  process.exit(1);
})();















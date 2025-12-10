const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config({ path: '.env.local' }); // Asegura que lee el .env.local

async function testConnection() {
  console.log("🔍 Iniciando prueba de conexión con Gemini...");

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ ERROR: No se encontró la API Key en .env.local");
    return;
  }
  
  console.log(`API Key presente: ✅ Sí (${apiKey.substring(0, 8)}...)`);

  const genAI = new GoogleGenerativeAI(apiKey);

  // ESTA ES LA LISTA CLAVE: Los modelos que vimos en TU cuenta
  const modelsToTest = [
    "gemini-2.5-flash",      // EL IMPORTANTE
    "gemini-2.5-flash-lite", 
    "gemini-2.0-flash",      // Por si acaso
    "gemini-1.5-flash"
  ];

  console.log("\n📋 Probando modelos disponibles en tu cuenta...");

  for (const modelName of modelsToTest) {
    try {
      process.stdout.write(`🔮 Probando modelo: ${modelName}... `);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Hacemos una pregunta tonta para ver si responde
      const result = await model.generateContent("Di 'Hola'");
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log("✅ ¡ÉXITO! Conectado.");
        console.log(`   Respuesta: "${text.trim()}"`);
        console.log("\n🎉 TU CONEXIÓN FUNCIONA PERFECTAMENTE.");
        return; // Terminamos en cuanto uno funcione
      }
    } catch (error) {
      if (error.message.includes("404")) {
        console.log("⚠️ No encontrado (404)");
      } else {
        console.log(`❌ Error: ${error.message.split('[')[0]}`); // Mensaje corto
      }
    }
  }

  console.log("\n❌ Ningún modelo de la lista respondió. Verifica tu API Key en Google AI Studio.");
}

testConnection();

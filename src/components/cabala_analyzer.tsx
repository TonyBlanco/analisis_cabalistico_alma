'use client';
import React, { useState } from 'react';
import { Calendar, Heart, Sparkles, Target, Zap, Users, Moon, Sun, Star } from 'lucide-react';
import {
  SEFIROT_CORRESPONDENCES,
  SEFIROT_DEFINITIONS,
  SEFIROT_MEANINGS,
  type SefiraId
} from '@/symbolic/data';

const CabalaAnalyzer = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    dia: '',
    mes: '',
    ano: ''
  });
  const [result, setResult] = useState(null);
  const sefirotDefinitionsById = Object.fromEntries(
    SEFIROT_DEFINITIONS.map((definition) => [definition.id, definition])
  );
  const sefirotMeaningsById = Object.fromEntries(
    SEFIROT_MEANINGS.map((meaning) => [meaning.id, meaning])
  );
  const sefirotCorrespondencesById = Object.fromEntries(
    SEFIROT_CORRESPONDENCES.map((correspondence) => [correspondence.id, correspondence])
  );
  const getSefirotData = (id: SefiraId) => ({
    definition: sefirotDefinitionsById[id],
    meaning: sefirotMeaningsById[id],
    correspondence: sefirotCorrespondencesById[id]
  });
  const sefirotData = {
    keter: getSefirotData('keter'),
    chokmah: getSefirotData('chokmah'),
    binah: getSefirotData('binah'),
    chesed: getSefirotData('chesed'),
    gevurah: getSefirotData('gevurah'),
    tiferet: getSefirotData('tiferet'),
    netzach: getSefirotData('netzach'),
    hod: getSefirotData('hod'),
    yesod: getSefirotData('yesod'),
    malchut: getSefirotData('malchut')
  };

  const valorLetra = (letra) => {
    const valores = {
      'A': 1, 'J': 1, 'S': 1,
      'B': 2, 'K': 2, 'T': 2,
      'C': 3, 'L': 3, 'U': 3,
      'D': 4, 'M': 4, 'V': 4,
      'E': 5, 'N': 5, 'W': 5,
      'F': 6, 'O': 6, 'X': 6,
      'G': 7, 'P': 7, 'Y': 7,
      'H': 8, 'Q': 8, 'Z': 8,
      'I': 9, 'R': 9
    };
    return valores[letra.toUpperCase()] || 0;
  };

  const reducirNumero = (num, manteneMaestros = true) => {
    if (manteneMaestros && (num === 11 || num === 22 || num === 33 || num === 44)) {
      return num;
    }
    while (num > 9 && num !== 11 && num !== 22 && num !== 33 && num !== 44) {
      num = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    }
    return num;
  };

  const calcularValorNombre = (nombre) => {
    return nombre.toUpperCase().split('').reduce((sum, letra) => {
      return sum + valorLetra(letra);
    }, 0);
  };

  const calcularCuentasPendientes = (nombre, dia, mes, ano) => {
    const numeros = {};
    const nombreCompleto = nombre.toUpperCase().replace(/\s/g, '');
    const fecha = `${dia}${mes}${ano}`;
    
    // Analizar letras del nombre
    for (let letra of nombreCompleto) {
      const valor = valorLetra(letra);
      if (valor > 0) {
        numeros[valor] = (numeros[valor] || 0) + 1;
      }
    }
    
    // Analizar dígitos de la fecha
    for (let digito of fecha) {
      const num = parseInt(digito);
      if (num > 0) {
        numeros[num] = (numeros[num] || 0) + 1;
      }
    }

    // Generar números compuestos específicos
    const compuestos = [11, 12, 13, 15, 19, 22, 23, 26, 29, 31, 33, 37, 43, 49, 61, 63, 73, 97];
    const cuentasPendientes = {};
    
    compuestos.forEach(num => {
      const apariciones = Math.floor(Math.random() * 7) + 1; // Simulación temporal
      cuentasPendientes[num] = apariciones;
    });

    return cuentasPendientes;
  };

  const calcularAnalisis = () => {
    const dia = parseInt(formData.dia);
    const mes = parseInt(formData.mes);
    const ano = parseInt(formData.ano);
    const nombre = formData.nombre;

    if (!nombre || !dia || !mes || !ano) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Cálculos principales
    const temaOrigen = reducirNumero(dia);
    const principioTransformacion = reducirNumero(mes);
    const sumaAno = ano.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    const temaDestino = reducirNumero(dia + mes + sumaAno);
    
    const valorNombre = calcularValorNombre(nombre);
    const imagenAlma = reducirNumero(valorNombre);
    
    const estructuraEnergetica = reducirNumero(dia + mes);
    const razonesKarmicas = reducirNumero(dia + mes + sumaAno + valorNombre);

    // Números de vibración
    const vibracionCuerpo = reducirNumero(dia + mes + sumaAno + 5);
    const vibracionAlma = reducirNumero(valorNombre + dia);
    const vibracionEspiritu = reducirNumero(mes + sumaAno);
    const efectoSanador = reducirNumero(vibracionCuerpo + vibracionAlma + vibracionEspiritu);
    const lemaVida = reducirNumero(dia + mes + sumaAno + valorNombre + 7);

    // Otros datos
    const numeroCorazon = valorNombre + dia + mes + sumaAno;
    const edadTransformacion = reducirNumero(dia + mes);
    const diasFuerza = [dia, dia + 9, dia + 18].filter(d => d <= 31);

    // Cuentas pendientes
    const cuentasPendientes = calcularCuentasPendientes(nombre, dia, mes, ano);

    // Secuencia principal
    const secuenciaPrincipal = [
      dia + mes,
      reducirNumero(dia + mes),
      dia + mes + sumaAno,
      reducirNumero(valorNombre),
      temaOrigen,
      principioTransformacion,
      estructuraEnergetica,
      dia + mes + sumaAno,
      reducirNumero(dia),
      razonesKarmicas,
      imagenAlma
    ];

    setResult({
      temaOrigen,
      principioTransformacion,
      temaDestino,
      estructuraEnergetica,
      imagenAlma,
      razonesKarmicas,
      vibracionCuerpo,
      vibracionAlma,
      vibracionEspiritu,
      efectoSanador,
      lemaVida,
      numeroCorazon,
      edadTransformacion,
      diasFuerza,
      cuentasPendientes,
      secuenciaPrincipal,
      turbulenciasEspirituales: edadTransformacion > 15 ? edadTransformacion - 13 : 0
    });
  };

  const getNumeroSignificado = (num) => {
    const significados = {
      1: { luminoso: 'Iniciador divino, voluntad pura, conexión con Kéter', sombra: 'Autoritarismo, soledad, desconexión de la fuente', color: '🔵', sefira: 'Keter', frase: 'YO VENZO - YO SOY UNO' },
      2: { luminoso: 'Cooperación, receptividad', sombra: 'Dependencia, pasividad', color: '🟠', sefira: 'Jokhmah', frase: 'YO SÉ - YO CONFÍO' },
      3: { luminoso: 'Creatividad, alegría', sombra: 'Dispersión, superficialidad', color: '🟢', sefira: 'Binah', frase: 'YO ENTIENDO - YO DOY' },
      4: { luminoso: 'Estructura sagrada', sombra: 'Control, rigidez mental', color: '🔴', sefira: 'Jesed', frase: 'YO AMO INCONDICIONALMENTE' },
      5: { luminoso: 'Libertad, transformación', sombra: 'Inestabilidad, evasión', color: '🟠', sefira: 'Guevurah', frase: 'YO PUEDO - YO REALIZO' },
      6: { luminoso: 'Amor incondicional', sombra: 'Sacrificio, complacencia', color: '🟠', sefira: 'Tipheret', frase: 'YO ME AMO - YO SOY' },
      7: { luminoso: 'Sabiduría interior', sombra: 'Aislamiento, frialdad', color: '🔵', sefira: 'Netsaj', frase: 'YO ME SANO - YO ME ARMONIZO' },
      8: { luminoso: 'Poder justo, manifestación', sombra: 'Dominio, represión', color: '🔴', sefira: 'Hod', frase: 'YO ME MUESTRO - YO ME DETERMINO' },
      9: { luminoso: 'Compasión, cierre de ciclos', sombra: 'Martirio, nostalgia', color: '🟢', sefira: 'Jesod', frase: 'YO ME FERTILIZO - YO PARTICIPO' },
      10: { luminoso: 'Realización completa. Movilidad espiritual', sombra: 'Miedo a actuar, bloqueo', color: '🔴', sefira: 'Malkuth', frase: 'YO EVOLUCIONO - YO ME REALIZO' },
      11: { luminoso: 'Canal de luz. Fuerza y poder espiritual', sombra: 'Crisis nerviosa, ansiedad espiritual', color: '🔵', sefira: '', frase: 'Voluntad espiritual manifestada' },
      12: { luminoso: 'Fe activa. Confianza en Dios', sombra: 'Victimismo, estancamiento', color: '🟢', sefira: '', frase: 'El Amor me lleva a Dios' },
      13: { luminoso: 'Muerte y resurrección. Cambio profundo', sombra: 'Resistencia al cambio', color: '🔴', sefira: '', frase: 'Transformación del ser' },
      14: { luminoso: 'Alquimia emocional. Servicio a la comunidad', sombra: 'Excesos, falta de límites', color: '🟠', sefira: '', frase: 'Servir con el corazón' },
      15: { luminoso: 'Maestría de sombra. Trabajo en equipo', sombra: 'Apegos, manipulación', color: '🔴', sefira: '', frase: 'Compañeros de entrenamiento' },
      16: { luminoso: 'Despertar del alma. Correcto enfoque espiritual', sombra: 'Ruptura, orgullo herido', color: '🔵', sefira: '', frase: 'Espiritualidad en la materia' },
      17: { luminoso: 'Esperanza divina. Veo a Dios en todo', sombra: 'Ilusión, autoengaño', color: '🔵', sefira: '', frase: 'Luz en lo manifestado' },
      18: { luminoso: 'Intuición profunda. Limpieza emocional', sombra: 'Confusión, miedo', color: '🔵', sefira: '', frase: 'Purificación del corazón' },
      19: { luminoso: 'Sol interior, alegría. Número Esenio', sombra: 'Orgullo, egocentrismo', color: '🟢', sefira: '', frase: 'Ayudar, Enseñar, Sanar' },
      20: { luminoso: 'Juicio superior, renacimiento', sombra: 'Negación de la historia', color: '🟢', sefira: '', frase: 'Superar las dudas' },
      21: { luminoso: 'Éxito espiritual. Sol radiante interior', sombra: 'Dispersión sin propósito', color: '🟢', sefira: '', frase: 'Buscar a Dios dentro' },
      22: { luminoso: 'Constructor del plan divino. Amor Incondicional', sombra: 'Megalomanía, desarraigo', color: '🔴', sefira: '', frase: 'Número Maestro del Amor' },
      23: { luminoso: 'Espíritu creativo elevado. Número de Isis', sombra: 'Impaciencia, inmadurez', color: '🟢', sefira: '', frase: 'Receptividad y fertilidad máxima' },
      24: { luminoso: 'Servicio amoroso. Fe en la materia', sombra: 'Desvalorización, dependencia', color: '🟠', sefira: '', frase: 'Creer en lo terrenal' },
      25: { luminoso: 'Sanación, revelación. Suerte y fortuna', sombra: 'Negación del don espiritual', color: '🔵', sefira: '', frase: 'Expresión del Alma' },
      26: { luminoso: 'Canal de redención', sombra: 'Carga heredada no asumida. Ego y dualidad', color: '🔴', sefira: '', frase: 'Trascender el ego' },
      27: { luminoso: 'Sabiduría encarnada. Alumno esotérico', sombra: 'Cierre a la guía divina', color: '🔵', sefira: '', frase: 'Aprendizaje místico' },
      28: { luminoso: 'Apertura al mundo. Autorresponsabilidad', sombra: 'Miedo a ser visto', color: '🟢', sefira: '', frase: 'Comprensión y libertad' },
      29: { luminoso: 'Poder de transformación', sombra: 'Caos emocional. Laberinto mental', color: '🔴', sefira: '', frase: 'Rigidez e inflexibilidad' },
      30: { luminoso: 'Canal de expresión', sombra: 'Vanidad, superficialidad. Improductividad', color: '🟢', sefira: '', frase: 'Atrapado en la lógica' },
      31: { luminoso: 'Liderazgo intuitivo. Dios guía mi camino', sombra: 'Dominio sin conexión', color: '🔴', sefira: '', frase: 'Fertilidad divina' },
      32: { luminoso: 'Canal emocional divino. Amor al prójimo', sombra: 'Dependencia afectiva', color: '🟠', sefira: '', frase: 'Entrega a otros' },
      33: { luminoso: 'Amor crístico, maestría. Productividad elevada', sombra: 'Sobreentrega, sacrificio', color: '🟠', sefira: '', frase: 'Enseñar a manifestar dones' },
      34: { luminoso: 'Disciplina sagrada. Materia como medio', sombra: 'Rigidez, exigencia', color: '🔴', sefira: '', frase: 'Realizarse compartiendo' },
      35: { luminoso: 'Palabra que sana', sombra: 'Comunicación distorsionada. Creencias erróneas', color: '🟢', sefira: '', frase: 'Superar lo negativo' },
      36: { luminoso: 'Portal iniciático', sombra: 'Miedo al despertar. Número de las sombras', color: '🔵', sefira: '', frase: 'Enfrentar miedos' },
      37: { luminoso: 'Arte y belleza del alma. Conciencia productiva', sombra: 'Bloqueo creativo', color: '🟢', sefira: '', frase: 'Conciencia activa' },
      38: { luminoso: 'Verdad revelada. Compromiso con el plan', sombra: 'Soberbia espiritual', color: '🔴', sefira: '', frase: 'Dar lo mejor de mí' },
      39: { luminoso: 'Alma guía. Sabiduría activa', sombra: 'Renuncia a sí mismo', color: '🔵', sefira: '', frase: 'Fertilidad productiva' },
      40: { luminoso: 'Fortaleza divina', sombra: 'Negación del cuerpo. Limitación racional', color: '🔴', sefira: '', frase: 'Superar lo mental' }
    };
    
    const info = significados[num] || { 
      luminoso: 'Número en proceso de interpretación', 
      sombra: 'Consultar con terapeuta', 
      color: '⚪', 
      sefira: '',
      frase: '' 
    };
    
    return info;
  };

  const getSefirotInfo = (num) => {
    const info = getNumeroSignificado(num);
    const baseColor = num <= 10 ? 'bg-purple-100' : 'bg-indigo-100';
    return {
      nombre: info.sefira || `Número ${num}`,
      frase: info.frase,
      color: baseColor
    };
  };

  const renderBarras = (cantidad) => {
    return '|'.repeat(Math.min(cantidad, 10));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="text-yellow-300" size={40} />
            <h1 className="text-4xl font-bold text-white">Análisis Cabalístico</h1>
            <Star className="text-yellow-300" size={40} />
          </div>
          <p className="text-purple-200 text-lg">Plan del Alma · Psicoterapia Cabalística</p>
          <p className="text-purple-300 text-sm mt-2">Instituto Shekinah · Metodología Oficial</p>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Ej: MARIA ISABEL ZAMBRANO VILLALOBOS"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Día</label>
                <input
                  type="number"
                  value={formData.dia}
                  onChange={(e) => setFormData({...formData, dia: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="20"
                  min="1"
                  max="31"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mes</label>
                <input
                  type="number"
                  value={formData.mes}
                  onChange={(e) => setFormData({...formData, mes: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="2"
                  min="1"
                  max="12"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Año</label>
                <input
                  type="number"
                  value={formData.ano}
                  onChange={(e) => setFormData({...formData, ano: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="1963"
                  min="1900"
                  max="2025"
                />
              </div>
            </div>

            {/* Árbol de la Vida - Las 10 Sefirots */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-purple-900 mb-6">🌳 El Árbol de la Vida - Las 10 Sefirots</h2>
              
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-xl mb-6 border-2 border-purple-300">
                <h3 className="font-bold text-purple-900 mb-3 text-lg">¿Qué es el Árbol de la Vida?</h3>
                <p className="text-sm text-purple-800 mb-2">
                  El <strong>Árbol de la Vida</strong> es el mapa del alma y de la creación. Representa los <strong>10 estados de conciencia</strong> 
                  (Sefirots) que conectan lo divino con lo material. Cada Sefirá corresponde a un <strong>chakra</strong>, un <strong>planeta</strong>, 
                  y un <strong>arcano del Tarot</strong>.
                </p>
                <p className="text-sm text-purple-800 font-semibold">
                  Las Sefirots están organizadas en 3 tríadas: Espíritu (1-3), Alma (4-6), y Ego (7-9), con Malkuth (10) como fundamento material.
                </p>
              </div>

              <div className="space-y-4">
                {/* KETER - 1 */}
                <details className="p-5 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-2 border-purple-400">
                  <summary className="font-bold text-purple-900 cursor-pointer text-lg flex items-center gap-2">
                    <span className="text-2xl">👑</span> 1. KETER - La Corona (Chakra Corona)
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>🌍 Planeta:</strong> {sefirotData.keter.correspondence?.attributes?.[0]}</p>
                        <p><strong>🎴 Tarot:</strong> {sefirotData.keter.correspondence?.attributes?.[1]}</p>
                        <p><strong>🔮 Chakra:</strong> {sefirotData.keter.correspondence?.body?.[0]}</p>
                        <p><strong>✨ Frase:</strong> {sefirotData.keter.meaning?.tikkun}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>💡 Luminoso:</strong> {sefirotData.keter.meaning?.light}</p>
                        <p className="mt-2"><strong>⚠️ Sombra:</strong> {sefirotData.keter.meaning?.shadow}</p>
                      </div>
                    </div>
                    <p className="text-purple-800 italic bg-purple-50 p-3 rounded">
                      &quot;{sefirotData.keter.definition?.essence}&quot;
                    </p>
                  </div>
                </details>

                {/* JOKHMAH - 2 */}
                <details className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-400">
                  <summary className="font-bold text-blue-900 cursor-pointer text-lg flex items-center gap-2">
                    <span className="text-2xl">🦉</span> 2. JOKHMAH - La Sabiduría (Chakra Frontal posterior)
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>🌍 Planeta:</strong> {sefirotData.chokmah.correspondence?.attributes?.[0]}</p>
                        <p><strong>🎴 Tarot:</strong> {sefirotData.chokmah.correspondence?.attributes?.[1]}</p>
                        <p><strong>🔮 Chakra:</strong> {sefirotData.chokmah.correspondence?.body?.[0]}</p>
                        <p><strong>✨ Frase:</strong> {sefirotData.chokmah.meaning?.tikkun}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>💡 Luminoso:</strong> {sefirotData.chokmah.meaning?.light}</p>
                        <p className="mt-2"><strong>⚠️ Sombra:</strong> {sefirotData.chokmah.meaning?.shadow}</p>
                      </div>
                    </div>
                    <p className="text-blue-800 italic bg-blue-50 p-3 rounded">
                      &quot;{sefirotData.chokmah.definition?.essence}&quot;
                    </p>
                  </div>
                </details>

                {/* BINAH - 3 */}
                <details className="p-5 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-400">
                  <summary className="font-bold text-indigo-900 cursor-pointer text-lg flex items-center gap-2">
                    <span className="text-2xl">🪞</span> 3. BINAH - El Entendimiento (Chakra Frontal anterior)
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>🌍 Planeta:</strong> {sefirotData.binah.correspondence?.attributes?.[0]}</p>
                        <p><strong>🎴 Tarot:</strong> {sefirotData.binah.correspondence?.attributes?.[1]}</p>
                        <p><strong>🔮 Chakra:</strong> {sefirotData.binah.correspondence?.body?.[0]}</p>
                        <p><strong>✨ Frase:</strong> {sefirotData.binah.meaning?.tikkun}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>💡 Luminoso:</strong> {sefirotData.binah.meaning?.light}</p>
                        <p className="mt-2"><strong>⚠️ Sombra:</strong> {sefirotData.binah.meaning?.shadow}</p>
                      </div>
                    </div>
                    <p className="text-indigo-800 italic bg-indigo-50 p-3 rounded">
                      &quot;{sefirotData.binah.definition?.essence}&quot;
                    </p>
                  </div>
                </details>

                {/* JESED - 4 */}
                <details className="p-5 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-400">
                  <summary className="font-bold text-cyan-900 cursor-pointer text-lg flex items-center gap-2">
                    <span className="text-2xl">💙</span> 4. JESED - La Misericordia (Chakra Laríngeo posterior)
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>🌍 Planeta:</strong> {sefirotData.chesed.correspondence?.attributes?.[0]}</p>
                        <p><strong>🎴 Tarot:</strong> {sefirotData.chesed.correspondence?.attributes?.[1]}</p>
                        <p><strong>🔮 Chakra:</strong> {sefirotData.chesed.correspondence?.body?.[0]}</p>
                        <p><strong>✨ Frase:</strong> {sefirotData.chesed.meaning?.tikkun}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>💡 Luminoso:</strong> {sefirotData.chesed.meaning?.light}</p>
                        <p className="mt-2"><strong>⚠️ Sombra:</strong> {sefirotData.chesed.meaning?.shadow}</p>
                      </div>
                    </div>
                    <p className="text-cyan-800 italic bg-cyan-50 p-3 rounded">
                      &quot;{sefirotData.chesed.definition?.essence}&quot;
                    </p>
                  </div>
                </details>

                {/* GUEVURAH - 5 */}
                <details className="p-5 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border-2 border-red-400">
                  <summary className="font-bold text-red-900 cursor-pointer text-lg flex items-center gap-2">
                    <span className="text-2xl">⚔️</span> 5. GUEVURAH - La Fuerza (Chakra Laríngeo anterior)
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>🌍 Planeta:</strong> {sefirotData.gevurah.correspondence?.attributes?.[0]}</p>
                        <p><strong>🎴 Tarot:</strong> {sefirotData.gevurah.correspondence?.attributes?.[1]}</p>
                        <p><strong>🔮 Chakra:</strong> {sefirotData.gevurah.correspondence?.body?.[0]}</p>
                        <p><strong>✨ Frase:</strong> {sefirotData.gevurah.meaning?.tikkun}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>💡 Luminoso:</strong> {sefirotData.gevurah.meaning?.light}</p>
                        <p className="mt-2"><strong>⚠️ Sombra:</strong> {sefirotData.gevurah.meaning?.shadow}</p>
                      </div>
                    </div>
                    <p className="text-red-800 italic bg-red-50 p-3 rounded">
                      &quot;{sefirotData.gevurah.definition?.essence}&quot;
                    </p>
                  </div>
                </details>

                {/* TIFERET - 6 */}
                <details className="p-5 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-400">
                  <summary className="font-bold text-yellow-900 cursor-pointer text-lg flex items-center gap-2">
                    <span className="text-2xl">☀️</span> 6. TIFERET - La Belleza (Chakra Corazón)
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>🌍 Planeta:</strong> {sefirotData.tiferet.correspondence?.attributes?.[0]}</p>
                        <p><strong>🎴 Tarot:</strong> {sefirotData.tiferet.correspondence?.attributes?.[1]}</p>
                        <p><strong>🔮 Chakra:</strong> {sefirotData.tiferet.correspondence?.body?.[0]}</p>
                        <p><strong>✨ Frase:</strong> {sefirotData.tiferet.meaning?.tikkun}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>💡 Luminoso:</strong> {sefirotData.tiferet.meaning?.light}</p>
                        <p className="mt-2"><strong>⚠️ Sombra:</strong> {sefirotData.tiferet.meaning?.shadow}</p>
                      </div>
                    </div>
                    <p className="text-yellow-800 italic bg-yellow-50 p-3 rounded">
                      &quot;{sefirotData.tiferet.definition?.essence}&quot;
                    </p>
                  </div>
                </details>

                {/* NETSAJ - 7 */}
                <details className="p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-400">
                  <summary className="font-bold text-green-900 cursor-pointer text-lg flex items-center gap-2">
                    <span className="text-2xl">🌹</span> 7. NETSAJ - La Victoria (Chakra Plexo Solar posterior)
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>🌍 Planeta:</strong> {sefirotData.netzach.correspondence?.attributes?.[0]}</p>
                        <p><strong>🎴 Tarot:</strong> {sefirotData.netzach.correspondence?.attributes?.[1]}</p>
                        <p><strong>🔮 Chakra:</strong> {sefirotData.netzach.correspondence?.body?.[0]}</p>
                        <p><strong>✨ Frase:</strong> {sefirotData.netzach.meaning?.tikkun}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>💡 Luminoso:</strong> {sefirotData.netzach.meaning?.light}</p>
                        <p className="mt-2"><strong>⚠️ Sombra:</strong> {sefirotData.netzach.meaning?.shadow}</p>
                      </div>
                    </div>
                    <p className="text-green-800 italic bg-green-50 p-3 rounded">
                      &quot;{sefirotData.netzach.definition?.essence}&quot;
                    </p>
                  </div>
                </details>

                {/* HOD - 8 */}
                <details className="p-5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-2 border-orange-400">
                  <summary className="font-bold text-orange-900 cursor-pointer text-lg flex items-center gap-2">
                    <span className="text-2xl">🪽</span> 8. HOD - El Esplendor (Chakra Plexo Solar anterior)
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>🌍 Planeta:</strong> {sefirotData.hod.correspondence?.attributes?.[0]}</p>
                        <p><strong>🎴 Tarot:</strong> {sefirotData.hod.correspondence?.attributes?.[1]}</p>
                        <p><strong>🔮 Chakra:</strong> {sefirotData.hod.correspondence?.body?.[0]}</p>
                        <p><strong>✨ Frase:</strong> {sefirotData.hod.meaning?.tikkun}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>💡 Luminoso:</strong> {sefirotData.hod.meaning?.light}</p>
                        <p className="mt-2"><strong>⚠️ Sombra:</strong> {sefirotData.hod.meaning?.shadow}</p>
                      </div>
                    </div>
                    <p className="text-orange-800 italic bg-orange-50 p-3 rounded">
                      &quot;{sefirotData.hod.definition?.essence}&quot;
                    </p>
                  </div>
                </details>

                {/* YESOD - 9 */}
                <details className="p-5 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl border-2 border-pink-400">
                  <summary className="font-bold text-pink-900 cursor-pointer text-lg flex items-center gap-2">
                    <span className="text-2xl">🌙</span> 9. YESOD - El Fundamento (Chakra Sacro)
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>🌍 Planeta:</strong> {sefirotData.yesod.correspondence?.attributes?.[0]}</p>
                        <p><strong>🎴 Tarot:</strong> {sefirotData.yesod.correspondence?.attributes?.[1]}</p>
                        <p><strong>🔮 Chakra:</strong> {sefirotData.yesod.correspondence?.body?.[0]}</p>
                        <p><strong>✨ Frase:</strong> {sefirotData.yesod.meaning?.tikkun}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>💡 Luminoso:</strong> {sefirotData.yesod.meaning?.light}</p>
                        <p className="mt-2"><strong>⚠️ Sombra:</strong> {sefirotData.yesod.meaning?.shadow}</p>
                      </div>
                    </div>
                    <p className="text-pink-800 italic bg-pink-50 p-3 rounded">
                      &quot;{sefirotData.yesod.definition?.essence}&quot;
                    </p>
                  </div>
                </details>

                {/* MALKUTH - 10 */}
                <details className="p-5 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border-2 border-amber-400">
                  <summary className="font-bold text-amber-900 cursor-pointer text-lg flex items-center gap-2">
                    <span className="text-2xl">🌍</span> 10. MALKUTH - El Reino (Chakra Raíz)
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>🌍 Planeta:</strong> {sefirotData.malchut.correspondence?.attributes?.[0]}</p>
                        <p><strong>🎴 Tarot:</strong> {sefirotData.malchut.correspondence?.attributes?.[1]}</p>
                        <p><strong>🔮 Chakra:</strong> {sefirotData.malchut.correspondence?.body?.[0]}</p>
                        <p><strong>✨ Frase:</strong> {sefirotData.malchut.meaning?.tikkun}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p><strong>💡 Luminoso:</strong> {sefirotData.malchut.meaning?.light}</p>
                        <p className="mt-2"><strong>⚠️ Sombra:</strong> {sefirotData.malchut.meaning?.shadow}</p>
                      </div>
                    </div>
                    <p className="text-amber-800 italic bg-amber-50 p-3 rounded">
                      &quot;{sefirotData.malchut.definition?.essence}&quot;
                    </p>
                  </div>
                </details>
              </div>

              <div className="mt-6 p-5 bg-gradient-to-r from-purple-100 via-pink-100 to-indigo-100 rounded-xl border-2 border-purple-400">
                <h3 className="font-bold text-purple-900 mb-3">🔮 Correspondencias con el Tarot</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-purple-800">
                  <div className="bg-white p-3 rounded-lg">
                    <p><strong>Ases:</strong> Keter - Potencial puro</p>
                    <p><strong>Doses:</strong> Jokhmah - Sabiduría</p>
                    <p><strong>Treses:</strong> Binah - Entendimiento</p>
                    <p><strong>Cuatros:</strong> Jesed - Misericordia</p>
                    <p><strong>Cincos:</strong> Guevurah - Rigor</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p><strong>Seises:</strong> Tiferet - Belleza</p>
                    <p><strong>Sietes:</strong> Netsaj - Victoria</p>
                    <p><strong>Ochos:</strong> Hod - Esplendor</p>
                    <p><strong>Nueves:</strong> Yesod - Fundamento</p>
                    <p><strong>Dieces:</strong> Malkuth - Reino</p>
                  </div>
                </div>
                <p className="text-sm text-purple-900 mt-3 font-semibold">
                  {result ? `Tu número de Imagen del Alma (${result.imagenAlma}) te indica en qué Sefirá/Portal 
                  se encuentra tu conciencia actualmente.` : 'Completa el formulario para descubrir tu Sefirá y Portal.'}
                </p>
              </div>
            </div>

            {/* Texto informativo cuando no hay resultado */}
            {!result && (
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl border-2 border-purple-300 text-center">
                <Star className="mx-auto mb-4 text-purple-600" size={60} />
                <h3 className="text-2xl font-bold text-purple-900 mb-3">
                  ✨ Descubre tu Plan del Alma ✨
                </h3>
                <p className="text-purple-800 text-lg">
                  Completa tu nombre y fecha de nacimiento arriba para recibir tu análisis cabalístico completo.
                  Descubrirás tus números sagrados, tus lecciones kármicas y tu camino de evolución espiritual.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={calcularAnalisis}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <Sparkles size={24} />
            Calcular Análisis del Alma
            <Sparkles size={24} />
          </button>
        </div>

        {result && (
          <div className="space-y-6">
            {/* Aspectos Principales */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-2">
                <Target size={28} />
                Aspectos Principales del Alma
              </h2>

              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-6 border-2 border-indigo-300">
                <h3 className="font-bold text-indigo-900 mb-3 text-lg">📖 ¿Qué significan estos aspectos?</h3>
                <div className="space-y-3 text-sm text-indigo-800">
                  <p><strong>Tema de Origen:</strong> Es tu punto de partida kármico. Representa el tema espiritual desde el cual comienzas tu vida, la energía con la que naciste y las lecciones de vidas anteriores que traes contigo.</p>
                  
                  <p><strong>Principio de Transformación:</strong> Es el proceso que tu alma debe transitar para evolucionar. Indica el camino de cambio y las herramientas espirituales que tienes para transformarte.</p>
                  
                  <p><strong>Tema de Destino:</strong> Es tu meta evolutiva en esta vida. Representa lo que tu alma vino a lograr, la maestría que buscas alcanzar y el propósito final de tu encarnación.</p>
                  
                  <p><strong>Estructura Energética:</strong> Define tu arquitectura espiritual básica, cómo procesas y manifiestas la energía en tu vida cotidiana.</p>
                  
                  <p><strong>Imagen del Alma:</strong> Es la esencia pura de quién eres. Refleja tu identidad espiritual profunda, más allá del ego y las máscaras sociales.</p>
                  
                  <p><strong>Razones Kármicas:</strong> Son las causas profundas que te trajeron a esta encarnación. Los aprendizajes pendientes que tu alma eligió completar en esta vida.</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className={`${getSefirotInfo(result.temaOrigen).color} p-6 rounded-xl border-2 border-purple-300`}>
                  <div className="text-sm font-semibold text-purple-700 mb-1">Tema de Origen</div>
                  <div className="text-4xl font-bold text-purple-900 mb-2">{result.temaOrigen}</div>
                  <div className="text-xs text-purple-600 font-medium mb-1">{getSefirotInfo(result.temaOrigen).nombre}</div>
                  <div className="text-xs text-purple-700 italic mb-2">{getSefirotInfo(result.temaOrigen).frase}</div>
                  <div className="text-xs bg-white/70 p-2 rounded mt-2">
                    <div className="font-semibold text-green-700">💡 Luminoso: {getNumeroSignificado(result.temaOrigen).luminoso}</div>
                    <div className="font-semibold text-red-700 mt-1">⚠️ Sombra: {getNumeroSignificado(result.temaOrigen).sombra}</div>
                  </div>
                </div>

                <div className={`${getSefirotInfo(result.principioTransformacion).color} p-6 rounded-xl border-2 border-indigo-300`}>
                  <div className="text-sm font-semibold text-indigo-700 mb-1">Principio de Transformación</div>
                  <div className="text-4xl font-bold text-indigo-900 mb-2">{result.principioTransformacion}</div>
                  <div className="text-xs text-indigo-600 font-medium mb-1">{getSefirotInfo(result.principioTransformacion).nombre}</div>
                  <div className="text-xs text-indigo-700 italic mb-2">{getSefirotInfo(result.principioTransformacion).frase}</div>
                  <div className="text-xs bg-white/70 p-2 rounded mt-2">
                    <div className="font-semibold text-green-700">💡 Luminoso: {getNumeroSignificado(result.principioTransformacion).luminoso}</div>
                    <div className="font-semibold text-red-700 mt-1">⚠️ Sombra: {getNumeroSignificado(result.principioTransformacion).sombra}</div>
                  </div>
                </div>

                <div className={`${getSefirotInfo(result.temaDestino).color} p-6 rounded-xl border-2 border-blue-300`}>
                  <div className="text-sm font-semibold text-blue-700 mb-1">Tema de Destino</div>
                  <div className="text-4xl font-bold text-blue-900 mb-2">{result.temaDestino}</div>
                  <div className="text-xs text-blue-600 font-medium mb-1">{getSefirotInfo(result.temaDestino).nombre}</div>
                  <div className="text-xs text-blue-700 italic mb-2">{getSefirotInfo(result.temaDestino).frase}</div>
                  <div className="text-xs bg-white/70 p-2 rounded mt-2">
                    <div className="font-semibold text-green-700">💡 Luminoso: {getNumeroSignificado(result.temaDestino).luminoso}</div>
                    <div className="font-semibold text-red-700 mt-1">⚠️ Sombra: {getNumeroSignificado(result.temaDestino).sombra}</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-300">
                  <div className="text-sm font-semibold text-amber-700 mb-1 flex items-center gap-2">
                    <Zap size={18} />
                    Estructura Energética
                  </div>
                  <div className="text-4xl font-bold text-amber-900">{result.estructuraEnergetica}</div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border-2 border-pink-300">
                  <div className="text-sm font-semibold text-pink-700 mb-1 flex items-center gap-2">
                    <Heart size={18} />
                    Imagen del Alma
                  </div>
                  <div className="text-4xl font-bold text-pink-900">{result.imagenAlma}</div>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl border-2 border-cyan-300">
                  <div className="text-sm font-semibold text-cyan-700 mb-1 flex items-center gap-2">
                    <Users size={18} />
                    Razones Kármicas
                  </div>
                  <div className="text-4xl font-bold text-cyan-900">{result.razonesKarmicas}</div>
                </div>
              </div>
            </div>

            {/* Números de Vibración */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-2">
                <Zap size={28} />
                Números de Vibración
              </h2>

              <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-6 rounded-xl mb-6 border-2 border-cyan-300">
                <h3 className="font-bold text-cyan-900 mb-3 text-lg">🌊 ¿Qué son las Vibraciones?</h3>
                <div className="space-y-2 text-sm text-cyan-800">
                  <p><strong>Vibración del Cuerpo:</strong> Tu frecuencia física. Indica cómo tu energía se manifiesta en tu salud, vitalidad y presencia material.</p>
                  
                  <p><strong>Vibración del Alma:</strong> Tu frecuencia emocional y sentimental. Refleja tu capacidad de amar, sentir y conectar emocionalmente.</p>
                  
                  <p><strong>Vibración del Espíritu:</strong> Tu frecuencia espiritual superior. Representa tu conexión con lo divino y tu capacidad de trascendencia.</p>
                  
                  <p><strong>Efecto Sanador:</strong> Tu potencial terapéutico. Indica tu capacidad natural para sanar (a ti mismo y a otros) y transformar energías.</p>
                  
                  <p><strong>Lema de Vida:</strong> La frase vibracional que sintetiza tu propósito. Es el mantra energético de tu existencia.</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl text-center border-2 border-red-300">
                  <div className="text-xs font-semibold text-red-700 mb-2">Vibración del Cuerpo</div>
                  <div className="text-3xl font-bold text-red-900">{result.vibracionCuerpo}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border-2 border-blue-300">
                  <div className="text-xs font-semibold text-blue-700 mb-2">Vibración del Alma</div>
                  <div className="text-3xl font-bold text-blue-900">{result.vibracionAlma}</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center border-2 border-purple-300">
                  <div className="text-xs font-semibold text-purple-700 mb-2">Vibración del Espíritu</div>
                  <div className="text-3xl font-bold text-purple-900">{result.vibracionEspiritu}</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center border-2 border-green-300">
                  <div className="text-xs font-semibold text-green-700 mb-2">Efecto Sanador</div>
                  <div className="text-3xl font-bold text-green-900">{result.efectoSanador}</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl text-center border-2 border-yellow-300">
                  <div className="text-xs font-semibold text-yellow-700 mb-2">Lema de Vida</div>
                  <div className="text-3xl font-bold text-yellow-900">{result.lemaVida}</div>
                </div>
              </div>
            </div>

            {/* Otros Datos Importantes */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-2">
                <Moon size={28} />
                Datos Importantes
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <span className="font-semibold text-purple-900">Número del Corazón:</span>
                    <span className="text-2xl font-bold text-purple-700">{result.numeroCorazon}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
                    <span className="font-semibold text-indigo-900">Edad de Transformación:</span>
                    <span className="text-2xl font-bold text-indigo-700">{result.edadTransformacion} años</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-blue-900">Turbulencias Espirituales:</span>
                    <span className="text-2xl font-bold text-blue-700">{result.turbulenciasEspirituales} años</span>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-300">
                  <div className="flex items-center gap-2 mb-4">
                    <Sun size={24} className="text-yellow-600" />
                    <h3 className="font-bold text-yellow-900">Días de Fuerza Personal</h3>
                  </div>
                  <div className="flex gap-4 justify-center">
                    {result.diasFuerza.map((dia, idx) => (
                      <div key={idx} className="bg-white px-6 py-4 rounded-lg shadow-md">
                        <div className="text-3xl font-bold text-yellow-700">{dia}</div>
                        <div className="text-xs text-yellow-600">día {idx + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cuentas Pendientes */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-purple-900 mb-6">Cuentas Pendientes (Lecciones Kármicas)</h2>
              
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl mb-6 border-2 border-purple-300">
                <h3 className="font-bold text-purple-900 mb-3 text-lg flex items-center gap-2">
                  <Heart className="text-purple-600" size={20} />
                  ¿Qué son las Cuentas Pendientes?
                </h3>
                <div className="space-y-3 text-sm text-purple-800">
                  <p className="leading-relaxed">
                    Las <strong>Cuentas Pendientes</strong> son números kármicos que representan <strong>lecciones del alma</strong> que aún no has completado en esta vida o en vidas anteriores. Cada número indica un área específica de aprendizaje y crecimiento espiritual.
                  </p>
                  <p className="leading-relaxed">
                    Las <strong>barras (||||)</strong> indican la <strong>intensidad o frecuencia</strong> con la que necesitas trabajar esa lección:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>1-3 barras (|  ||  |||)</strong>: Lección suave, ya has avanzado</li>
                    <li><strong>4-6 barras (||||  |||||  ||||||)</strong>: Lección importante, requiere atención</li>
                    <li><strong>7+ barras (|||||||+)</strong>: Lección urgente, área prioritaria de trabajo</li>
                  </ul>
                  <p className="leading-relaxed font-semibold text-purple-900">
                    Más barras = mayor prioridad de trabajo interno. Son oportunidades para tu evolución espiritual.
                  </p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">📖 Significados de los Números Kármicos:</h4>
                <div className="grid md:grid-cols-2 gap-3 text-xs text-blue-800">
                  <div className="p-2 bg-white rounded border-l-2 border-blue-400">
                    <strong>11:</strong> Intuición y liderazgo espiritual. Canal de luz, fuerza espiritual manifestada.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-green-400">
                    <strong>12:</strong> Fe activa. Confianza en Dios, el amor me lleva a la unidad.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-red-400">
                    <strong>13:</strong> Transformación profunda. Muerte y resurrección, número del cambio.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-orange-400">
                    <strong>15:</strong> Trabajo en equipo. Todos son compañeros de entrenamiento.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-blue-400">
                    <strong>19:</strong> Número Esenio. Ayudar, enseñar, sanar.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-red-400">
                    <strong>22:</strong> Maestro constructor. Número maestro del amor incondicional.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-green-400">
                    <strong>23:</strong> Número de Isis. Receptividad y fertilidad máxima.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-red-400">
                    <strong>26:</strong> Número del ego y la dualidad. Canal de redención.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-red-400">
                    <strong>29:</strong> Laberinto mental. Rigidez, tozudez, inflexibilidad mental.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-red-400">
                    <strong>31:</strong> Dios guía mi camino. Liderazgo intuitivo, fertilidad divina.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-orange-400">
                    <strong>33:</strong> Maestro sanador. Amor crístico, productividad elevada.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-green-400">
                    <strong>37:</strong> Conocimiento místico. Arte y belleza del alma, conciencia productiva.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-red-400">
                    <strong>43:</strong> Pioneros e innovadores. Disciplina y estructura espiritual.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-red-400">
                    <strong>49:</strong> Sabiduría universal. Abrir la sabiduría como base de los actos.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-blue-400">
                    <strong>61:</strong> Amor incondicional. Transformación de fuerzas sexuales en espirituales.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-green-400">
                    <strong>63:</strong> Armonía universal. Manifestar dones para amansar el ego.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-blue-400">
                    <strong>73:</strong> Intuición superior. Decisiones llenas de sabiduría.
                  </div>
                  <div className="p-2 bg-white rounded border-l-2 border-red-400">
                    <strong>97:</strong> Número Maestro absoluto. Iluminación espiritual, actuar desde el ejemplo.
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(result.cuentasPendientes).map(([num, cantidad]) => {
                  const cantidadNum = Number(cantidad) || 0;
                  const intensidad = cantidadNum <= 3 ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100' :
                                    cantidadNum <= 6 ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100' :
                                    'border-red-400 bg-gradient-to-br from-red-50 to-red-100';
                  const colorTexto = cantidadNum <= 3 ? 'text-green-900' :
                                    cantidadNum <= 6 ? 'text-yellow-900' :
                                    'text-red-900';
                  return (
                    <div key={num} className={`p-4 ${intensidad} rounded-lg border-2 transition-all hover:scale-105 cursor-pointer`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`font-bold text-lg ${colorTexto}`}>{num}</span>
                        <span className="text-xs text-gray-600 font-semibold">×{cantidadNum}</span>
                      </div>
                      <div className={`${colorTexto} font-mono text-sm break-all mb-2`}> 
                        {renderBarras(cantidadNum)}
                      </div>
                      <div className={`text-xs ${colorTexto} font-semibold`}>
                        {cantidadNum <= 3 ? '✓ Leve' : cantidadNum <= 6 ? '⚠ Importante' : '🔥 Urgente'}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-300">
                <p className="text-sm text-amber-900">
                  <strong>💡 Consejo:</strong> Los números con más barras son tus mayores desafíos y, paradójicamente, 
                  también tus mayores oportunidades de crecimiento. Trabaja en ellos con consciencia, paciencia y amor propio.
                </p>
              </div>
            </div>

            {/* Secuencia Principal */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-purple-900 mb-4">Secuencia Numérica Principal</h2>
              
              <div className="bg-gradient-to-r from-violet-100 to-purple-100 p-5 rounded-xl mb-4 border-2 border-violet-300">
                <h3 className="font-bold text-violet-900 mb-2 text-base">🔢 ¿Qué es la Secuencia Principal?</h3>
                <p className="text-sm text-violet-800">
                  Esta secuencia representa el <strong>código numérico de tu alma</strong>. Es como tu "ADN espiritual" - una serie de números que, 
                  cuando se leen juntos, revelan el mapa completo de tu viaje evolutivo. Cada número en esta secuencia 
                  corresponde a un cálculo específico de tu carta natal cabalística y juntos forman tu firma energética única.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center">
                {result.secuenciaPrincipal.map((num, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold text-xl shadow-lg">
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* Las 7 Leyes Cósmicas */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-purple-900 mb-6">Las 7 Leyes Cósmicas (El Kybalion)</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-l-4 border-purple-500">
                  <div className="font-bold text-purple-900 mb-1">1. Mentalismo</div>
                  <div className="text-sm text-purple-700 italic">"El TODO es Mente; el Universo es mental"</div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
                  <div className="font-bold text-blue-900 mb-1">2. Correspondencia</div>
                  <div className="text-sm text-blue-700 italic">"Como arriba es abajo, como abajo es arriba"</div>
                </div>

                <div className="p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-lg border-l-4 border-cyan-500">
                  <div className="font-bold text-cyan-900 mb-1">3. Vibración</div>
                  <div className="text-sm text-cyan-700 italic">"Nada está inmóvil, todo se mueve, todo vibra"</div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
                  <div className="font-bold text-green-900 mb-1">4. Polaridad</div>
                  <div className="text-sm text-green-700 italic">"Todo es doble; todo tiene dos polos"</div>
                </div>

                <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-l-4 border-yellow-500">
                  <div className="font-bold text-yellow-900 mb-1">5. Ritmo</div>
                  <div className="text-sm text-yellow-700 italic">"Todo fluye y refluye; todo tiene períodos de avance y retroceso"</div>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-l-4 border-orange-500">
                  <div className="font-bold text-orange-900 mb-1">6. Causa y Efecto</div>
                  <div className="text-sm text-orange-700 italic">"Toda causa tiene su efecto, todo efecto tiene su causa"</div>
                </div>

                <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg border-l-4 border-pink-500">
                  <div className="font-bold text-pink-900 mb-1">7. Generación</div>
                  <div className="text-sm text-pink-700 italic">"Todo tiene principios masculino y femenino"</div>
                </div>
              </div>
            </div>

            {/* Los 10 Portales Espirituales */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-purple-900 mb-6">🚪 Los 10 Portales Espirituales</h2>
              
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-6 border-2 border-indigo-300">
                <h3 className="font-bold text-indigo-900 mb-3 text-lg">¿Qué son los Portales?</h3>
                <p className="text-sm text-indigo-800 mb-2">
                  Los <strong>10 Portales</strong> representan los <strong>estados de conciencia</strong> que el alma debe atravesar en su proceso evolutivo. 
                  Cada portal está relacionado con una <strong>Sefirá del Árbol de la Vida</strong> y representa tanto un desafío (neurosis) como una 
                  oportunidad de crecimiento (estado realizado).
                </p>
                <p className="text-sm text-indigo-800 font-semibold">
                  Tu Estructura Energética (número {result.estructuraEnergetica}) y tu Imagen del Alma (número {result.imagenAlma}) 
                  te indican en qué portales tienes bloqueos que trabajar.
                </p>
              </div>

              <div className="space-y-4">
                <details className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
                  <summary className="font-bold text-purple-900 cursor-pointer text-lg">Portal 1 - Espiritualidad (Keter)</summary>
                  <div className="mt-3 space-y-2 text-sm text-purple-800">
                    <p><strong>🔴 Hilo Rojo:</strong> Mi padre no me transmite amor, protección ni sabiduría. Me siento abandonado.</p>
                    <p><strong>⚠️ Neurosis:</strong> No confío en la vida, veo todo negativo, me siento víctima, necesito controlarlo todo.</p>
                    <p><strong>💊 Antídoto:</strong> Abrirme a la vida espiritual, buscar sentido existencial, conectar con Dios.</p>
                    <p><strong>✨ Estado Realizado:</strong> Confío en la vida, sé que hay un plan perfecto para mí, vivo en fe y esperanza.</p>
                    <p><strong>🩺 Síntomas Físicos:</strong> Problemas cerebrales, migrañas, ojos, nariz, sistema nervioso.</p>
                  </div>
                </details>

                <details className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                  <summary className="font-bold text-blue-900 cursor-pointer text-lg">Portal 2 - Campo Mental (Jokhmah)</summary>
                  <div className="mt-3 space-y-2 text-sm text-blue-800">
                    <p><strong>🔴 Hilo Rojo:</strong> No me quieren incondicionalmente, me maltratan psicológicamente.</p>
                    <p><strong>⚠️ Neurosis:</strong> Rigidez mental, necesito tener razón, soy dogmático e inflexible.</p>
                    <p><strong>💊 Antídoto:</strong> Anteponer el amor a la razón, ser flexible, perdonar y adaptarme a los cambios.</p>
                    <p><strong>✨ Estado Realizado:</strong> Mente amorosa, equilibrada y pacificadora que acepta los cambios.</p>
                    <p><strong>🩺 Síntomas Físicos:</strong> No especificados en este portal.</p>
                  </div>
                </details>

                <details className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-300">
                  <summary className="font-bold text-indigo-900 cursor-pointer text-lg">Portal 3 - Campo Causal (Binah)</summary>
                  <div className="mt-3 space-y-2 text-sm text-indigo-800">
                    <p><strong>🔴 Hilo Rojo:</strong> No me dejan ser espontáneo, me transmiten visión negativa del mundo.</p>
                    <p><strong>⚠️ Neurosis:</strong> Bloqueo mental, miedo al futuro, desconectado de mi intuición y creatividad.</p>
                    <p><strong>💊 Antídoto:</strong> Escuchar mi intuición, compartir lo mejor de mí con actitud positiva.</p>
                    <p><strong>✨ Estado Realizado:</strong> Entendimiento, claridad, comparto mis dones espontáneamente.</p>
                    <p><strong>🩺 Síntomas Físicos:</strong> Migrañas, problemas de vista, oído, nariz, cerebro, sistema nervioso.</p>
                  </div>
                </details>

                <details className="p-4 bg-cyan-50 rounded-lg border-2 border-cyan-300">
                  <summary className="font-bold text-cyan-900 cursor-pointer text-lg">Portal 4 - Campo Emocional (Jesed)</summary>
                  <div className="mt-3 space-y-2 text-sm text-cyan-800">
                    <p><strong>🔴 Hilo Rojo:</strong> No me dejan expresar mis sentimientos, hay secretos en mi familia.</p>
                    <p><strong>⚠️ Neurosis:</strong> Me pongo máscaras, tengo complejos, problemas de comunicación y expresión.</p>
                    <p><strong>💊 Antídoto:</strong> Expresarme desde el corazón, mostrar mi verdadera singularidad.</p>
                    <p><strong>✨ Estado Realizado:</strong> Vivo espontáneamente lo que soy, soy extensión de mi propósito.</p>
                    <p><strong>🩺 Síntomas Físicos:</strong> Garganta, tiroides, cuello, cervicales, brazos, manos, adicciones orales.</p>
                  </div>
                </details>

                <details className="p-4 bg-teal-50 rounded-lg border-2 border-teal-300">
                  <summary className="font-bold text-teal-900 cursor-pointer text-lg">Portal 5 - Alma (Guevurah)</summary>
                  <div className="mt-3 space-y-2 text-sm text-teal-800">
                    <p><strong>🔴 Hilo Rojo:</strong> No me siento reconocido, rechazado, no me siento querido ni valorado.</p>
                    <p><strong>⚠️ Neurosis:</strong> Baja autoestima, crisis de identidad, busco aceptación externa, vivo una mentira.</p>
                    <p><strong>💊 Antídoto:</strong> Aceptarme y amarme incondicionalmente, reconocer que soy hijo de Dios.</p>
                    <p><strong>✨ Estado Realizado:</strong> Vivo feliz en mi verdad, honesto conmigo mismo, en armonía.</p>
                    <p><strong>🩺 Síntomas Físicos:</strong> Corazón, pulmones, hígado, páncreas, problemas de piel, digestivos.</p>
                  </div>
                </details>

                <details className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                  <summary className="font-bold text-green-900 cursor-pointer text-lg">Portal 6 - Ego (Tipheret)</summary>
                  <div className="mt-3 space-y-2 text-sm text-green-800">
                    <p><strong>🔴 Hilo Rojo:</strong> Vivo situaciones inadecuadas para mi edad, me siento sobrepasado.</p>
                    <p><strong>⚠️ Neurosis:</strong> Caigo en ilusiones del ego, busco éxito material, confundo Ser con tener.</p>
                    <p><strong>💊 Antídoto:</strong> Vivir conscientemente, regido por ética e impecabilidad, santifico mi ego.</p>
                    <p><strong>✨ Estado Realizado:</strong> Plenamente realizado, disfruto la vida conscientemente.</p>
                    <p><strong>🩺 Síntomas Físicos:</strong> Órganos sexuales, sistema inmunitario, problemas autoinmunes.</p>
                  </div>
                </details>

                <details className="p-4 bg-lime-50 rounded-lg border-2 border-lime-300">
                  <summary className="font-bold text-lime-900 cursor-pointer text-lg">Portal 7 - Materia (Netsaj)</summary>
                  <div className="mt-3 space-y-2 text-sm text-lime-800">
                    <p><strong>🔴 Hilo Rojo:</strong> Siento que hay algo malo en mí, me siento indigno y culpable.</p>
                    <p><strong>⚠️ Neurosis:</strong> No acepto mi humanidad ni mi sombra, me siento extraterrestre en el mundo.</p>
                    <p><strong>💊 Antídoto:</strong> Aceptar que elegí esta experiencia para evolucionar, integrarme al mundo.</p>
                    <p><strong>✨ Estado Realizado:</strong> Integrado, con pies en la tierra, en equilibrio con la materia.</p>
                    <p><strong>🩺 Síntomas Físicos:</strong> Caderas, piernas, rodillas, pies, problemas de columna, circulación.</p>
                  </div>
                </details>

                <details className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                  <summary className="font-bold text-yellow-900 cursor-pointer text-lg">Portal 8 - Campo Éterico (Hod)</summary>
                  <div className="mt-3 space-y-2 text-sm text-yellow-800">
                    <p><strong>🔴 Hilo Rojo:</strong> Mucho miedo a vivir, la vida me parece dolorosa y caótica.</p>
                    <p><strong>⚠️ Neurosis:</strong> Dominado por miedos y carencias, necesito ser alguien, sin paz interior.</p>
                    <p><strong>💊 Antídoto:</strong> Alinearme con mi propósito, sanar carencias, buscar armonía cielo-tierra.</p>
                    <p><strong>✨ Estado Realizado:</strong> En paz y armonía, emocionalmente saludable, empático y paciente.</p>
                    <p><strong>🩺 Síntomas Físicos:</strong> Lumbares, coxis, sacro, riñones.</p>
                  </div>
                </details>

                <details className="p-4 bg-orange-50 rounded-lg border-2 border-orange-300">
                  <summary className="font-bold text-orange-900 cursor-pointer text-lg">Portal 9 - Mente (Jesod)</summary>
                  <div className="mt-3 space-y-2 text-sm text-orange-800">
                    <p><strong>🔴 Hilo Rojo:</strong> No puedo confiar en el amor, me hace sentir vulnerable y herido.</p>
                    <p><strong>⚠️ Neurosis:</strong> No escucho mi corazón, perfeccionista, autoengaño, necesito control total.</p>
                    <p><strong>💊 Antídoto:</strong> Sanar mi corazón, confiar en mi sabiduría interior, seguir mi intuición.</p>
                    <p><strong>✨ Estado Realizado:</strong> Clarividencia, coherente con mi verdad interior, honesto conmigo.</p>
                    <p><strong>🩺 Síntomas Físicos:</strong> Columna vertebral, músculos paravertebrales, dolores de espalda.</p>
                  </div>
                </details>

                <details className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
                  <summary className="font-bold text-red-900 cursor-pointer text-lg">Portal 10 - Evolución (Malkuth)</summary>
                  <div className="mt-3 space-y-2 text-sm text-red-800">
                    <p><strong>🔴 Hilo Rojo:</strong> No comprenden mi potencial, me siento frustrado y desterrado de mí mismo.</p>
                    <p><strong>⚠️ Neurosis:</strong> No encuentro mi propósito, busco seguridad económica, vida rutinaria.</p>
                    <p><strong>💊 Antídoto:</strong> Entregar mi vida a mi verdadera vocación, ser co-creador del plan divino.</p>
                    <p><strong>✨ Estado Realizado:</strong> Feliz y realizado, vivo mi propósito, entusiasmado por la vida.</p>
                    <p><strong>🩺 Síntomas Físicos:</strong> Bloqueos generales a la evolución.</p>
                  </div>
                </details>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
                <p className="text-sm text-purple-900">
                  <strong>💡 Para tu Análisis:</strong> Los números de tu Estructura Energética ({result.estructuraEnergetica}) 
                  e Imagen del Alma ({result.imagenAlma}) te indican cuáles de estos portales necesitas trabajar prioritariamente. 
                  Las "Cuentas Pendientes" te muestran las lecciones específicas en cada área.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8 text-purple-200 text-sm">
          <p>© 2025 Instituto Shekinah - Psicoterapia Cabalística</p>
          <p className="mt-2">Certificado por: {formData.nombre || "Luis Antonio Blanco Fontela"}</p>
          <p>Maestro en Psicoterapia Cabalística · Experto en el Análisis del Plan del Alma</p>
        </div>
      </div>
    </div>
  );
};

export default CabalaAnalyzer;

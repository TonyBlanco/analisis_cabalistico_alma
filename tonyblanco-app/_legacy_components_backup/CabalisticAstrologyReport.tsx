'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, Moon, Sun, Activity, BookOpen, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CabalaAstrologer } from '@/lib/astrologia_cabalistica';
import { generateAstrologyAnalysis, type AstrologyAnalysis } from '@/lib/astrology-ai-analysis';
import { getPatient } from '@/lib/patient-storage';
import type { PatientInfo } from '@/types/patient';
import AngelsWheel from './AngelsWheel';
import { getAngelName } from '@/lib/angels_db';
import ReprogrammingCard from './ReprogrammingCard';

export default function CabalisticAstrologyReport() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  
  // Inputs del usuario
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '12:00',
    lat: 40.4168, // Madrid por defecto (podrías usar geolocalización)
    lng: -3.7038
  });

  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [angels, setAngels] = useState<any>(null);
  const [analysis, setAnalysis] = useState<AstrologyAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Cargar datos del paciente o del perfil del usuario
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      
      if (patientId) {
        // Cargar datos del paciente
        const patientData = getPatient(patientId);
        if (patientData) {
          setPatient(patientData);
          
          // Convertir fecha a formato YYYY-MM-DD seguro
          let birthDateFormatted = '';
          if (patientData.birthDate) {
            try {
              // Intentar parsear la fecha y convertirla a formato ISO
              const dateObj = new Date(patientData.birthDate);
              if (!isNaN(dateObj.getTime())) {
                birthDateFormatted = dateObj.toISOString().split('T')[0];
              } else {
                // Si falla, intentar parsear manualmente
                const dateStr = patientData.birthDate.toString();
                if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  birthDateFormatted = dateStr;
                } else if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                  // Formato DD/MM/YYYY
                  const [day, month, year] = dateStr.split('/');
                  birthDateFormatted = `${year}-${month}-${day}`;
                } else if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
                  // Formato DD-MM-YYYY
                  const [day, month, year] = dateStr.split('-');
                  birthDateFormatted = `${year}-${month}-${day}`;
                }
              }
            } catch (e) {
              console.error('Error parseando fecha del paciente:', e);
            }
          }
          
          setFormData(prev => ({
            ...prev,
            name: patientData.name || '',
            date: birthDateFormatted,
            // Usar datos del paciente si están disponibles, sino valores por defecto
            time: patientData.birthTime || '12:00',
            lat: patientData.birthLatitude || 40.4168, // Madrid por defecto
            lng: patientData.birthLongitude || -3.7038
          }));
        }
      } else {
        // Cargar datos del perfil del usuario
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const response = await fetch('http://127.0.0.1:8000/api/me/', {
              headers: { 'Authorization': `Token ${token}` }
            });
            if (response.ok) {
              const userData = await response.json();
              // Preferir birth_data si está disponible
              if (userData.birth_data && userData.birth_data.birth_date) {
                setFormData(prev => ({
                  ...prev,
                  name: userData.birth_data.full_name || userData.full_name || '',
                  date: userData.birth_data.birth_date || '',
                  time: userData.birth_data.birth_time || '12:00',
                  lat: userData.birth_data.birth_latitude || 40.4168,
                  lng: userData.birth_data.birth_longitude || -3.7038
                }));
              } else {
                if (userData.full_name) {
                  setFormData(prev => ({ ...prev, name: userData.full_name }));
                }
                if (userData.birth_date) {
                  setFormData(prev => ({ ...prev, date: userData.birth_date }));
                }
              }
            }
          } catch (err) {
            console.error('Error cargando perfil:', err);
          }
        }
      }
      
      setLoadingData(false);
    };

    loadData();
  }, [patientId]);

  const handleCalculate = async () => {
    setLoading(true);
    
    try {
      // 1. DIAGNÓSTICO (Mira esto en la consola F12 del navegador)
      console.log("📅 Fecha input:", formData.date); 
      console.log("⏰ Hora input:", formData.time);
      
      // 2. CONSTRUCCIÓN ROBUSTA DE LA FECHA
      // Aseguramos que la fecha esté en formato ISO (YYYY-MM-DD)
      let dateString = formData.date;
      
      // Validar formato de fecha
      if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Si viene en formato DD/MM/YYYY o MM/DD/YYYY, convertir
        const dateParts = dateString.split(/[-\/]/);
        if (dateParts.length === 3) {
          // Asumir formato YYYY-MM-DD del input type="date"
          // Si viene como DD/MM/YYYY, necesitaríamos más contexto
          console.warn('⚠️ Fecha no está en formato ISO estándar');
        }
      }
      
      // 3. CONSTRUCCIÓN ROBUSTA DE LA HORA
      // El input type="time" devuelve formato 24h (HH:mm), pero validamos por si acaso
      let hours = 12;
      let minutes = 0;
      
      if (formData.time) {
        // Si la hora incluye AM/PM, convertir a 24h
        if (formData.time.includes("PM") || formData.time.includes("AM")) {
          console.warn("⚠️ Cuidado: Usando formato AM/PM. Convirtiendo a 24h para el cálculo preciso.");
          // Extraer hora y minutos, y convertir AM/PM a 24h
          const timeMatch = formData.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (timeMatch) {
            let h = parseInt(timeMatch[1]);
            const m = parseInt(timeMatch[2]);
            const period = timeMatch[3].toUpperCase();
            
            if (period === "PM" && h !== 12) {
              h += 12;
            } else if (period === "AM" && h === 12) {
              h = 0;
            }
            hours = h;
            minutes = m;
          }
        } else {
          // Formato 24h (HH:mm)
          const timeParts = formData.time.split(":");
          if (timeParts.length >= 2) {
            hours = parseInt(timeParts[0]) || 12;
            minutes = parseInt(timeParts[1]) || 0;
          }
        }
      }
      
      // 4. CREAR FECHA DE FORMA SEGURA Y PRECISA
      // Parsear la fecha manualmente para evitar problemas de interpretación
      const [year, monthNum, dayNum] = dateString.split('-').map(Number);
      
      // Validar componentes
      if (!year || !monthNum || !dayNum || year < 1900 || year > 2100 || monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
        throw new Error('Fecha inválida. Por favor verifica el formato (debe ser YYYY-MM-DD).');
      }
      
      // Crear fecha usando UTC para evitar problemas de zona horaria
      // Nota: monthNum - 1 porque Date usa meses 0-11
      const birthDateObj = new Date(Date.UTC(year, monthNum - 1, dayNum, hours, minutes, 0, 0));
      
      // Validar que la fecha sea válida
      if (isNaN(birthDateObj.getTime())) {
        throw new Error('Fecha u hora inválida. Por favor verifica los datos ingresados.');
      }
      
      // Verificar que los componentes coincidan (evita problemas de desbordamiento)
      if (birthDateObj.getUTCFullYear() !== year || 
          birthDateObj.getUTCMonth() !== (monthNum - 1) || 
          birthDateObj.getUTCDate() !== dayNum) {
        console.warn('⚠️ La fecha fue ajustada por el sistema. Verifica los componentes.');
      }
      
      // DIAGNÓSTICO FINAL
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      const calcMonth = birthDateObj.getUTCMonth() + 1;
      const calcDay = birthDateObj.getUTCDate();
      
      console.log("📆 Fecha Calculada Final:", birthDateObj.toString());
      console.log("🔍 Fecha ISO:", birthDateObj.toISOString());
      console.log("📊 Componentes:", {
        año: birthDateObj.getUTCFullYear(),
        mes: calcMonth,
        nombreMes: monthNames[birthDateObj.getUTCMonth()],
        día: calcDay,
        hora: birthDateObj.getUTCHours(),
        minutos: birthDateObj.getUTCMinutes()
      });
      
      // Calcular signo zodiacal aproximado para verificación
      let expectedSign = '';
      if ((calcMonth === 3 && calcDay >= 21) || (calcMonth === 4 && calcDay <= 19)) expectedSign = 'Aries';
      else if ((calcMonth === 4 && calcDay >= 20) || (calcMonth === 5 && calcDay <= 20)) expectedSign = 'Tauro';
      else if ((calcMonth === 5 && calcDay >= 21) || (calcMonth === 6 && calcDay <= 20)) expectedSign = 'Géminis';
      else if ((calcMonth === 6 && calcDay >= 21) || (calcMonth === 7 && calcDay <= 22)) expectedSign = 'Cáncer';
      else if ((calcMonth === 7 && calcDay >= 23) || (calcMonth === 8 && calcDay <= 22)) expectedSign = 'Leo';
      else if ((calcMonth === 8 && calcDay >= 23) || (calcMonth === 9 && calcDay <= 22)) expectedSign = 'Virgo';
      else if ((calcMonth === 9 && calcDay >= 23) || (calcMonth === 10 && calcDay <= 22)) expectedSign = 'Libra';
      else if ((calcMonth === 10 && calcDay >= 23) || (calcMonth === 11 && calcDay <= 21)) expectedSign = 'Escorpio';
      else if ((calcMonth === 11 && calcDay >= 22) || (calcMonth === 12 && calcDay <= 21)) expectedSign = 'Sagitario';
      else if ((calcMonth === 12 && calcDay >= 22) || (calcMonth === 1 && calcDay <= 19)) expectedSign = 'Capricornio';
      else if ((calcMonth === 1 && calcDay >= 20) || (calcMonth === 2 && calcDay <= 18)) expectedSign = 'Acuario';
      else expectedSign = 'Piscis';
      
      console.log(`⭐ Signo Zodiacal Esperado (aproximado): ${expectedSign}`);
      
      // Validar que la fecha final sea válida
      if (isNaN(birthDateObj.getTime())) {
        throw new Error('Fecha u hora inválida después del procesamiento. Por favor verifica los datos.');
      }
      
      // 2. Cálculo Matemático Local
      const astrologer = new CabalaAstrologer();
      
      // Log adicional para verificar la fecha que se pasa al cálculo
      console.log("🔬 Fecha pasada a calculateRealAngels:", {
        fechaISO: birthDateObj.toISOString(),
        fechaUTC: `${birthDateObj.getUTCFullYear()}-${String(birthDateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(birthDateObj.getUTCDate()).padStart(2, '0')}`,
        horaUTC: `${String(birthDateObj.getUTCHours()).padStart(2, '0')}:${String(birthDateObj.getUTCMinutes()).padStart(2, '0')}`,
        lat: formData.lat,
        lng: formData.lng
      });
      
      // 1. Calcular Ángeles y Aspectos Planetarios
      const calculatedAngels = astrologer.calculateRealAngels(
        birthDateObj, 
        formData.lat, 
        formData.lng
      );
      
      // 2. Calcular conflictos planetarios (Tikún)
      const conflict = astrologer.calculatePlanetaryAspects(
        birthDateObj, 
        formData.lat, 
        formData.lng
      );
      
      // 3. Obtener el código visual de reprogramación
      const reprogrammingCode = astrologer.getReprogrammingCode(
        conflict.sefira1, 
        conflict.sefira2
      );
      
      // 4. Combinar todo en un objeto
      const fullAngelsData = {
        ...calculatedAngels,
        conflict,
        reprogrammingCode
      };
      
      console.log("✨ Resultado del cálculo:", fullAngelsData);
      setAngels(fullAngelsData);

      // 5. Análisis de IA (pasar el objeto completo con conflict)
      const aiResult = await generateAstrologyAnalysis(
        formData.name, 
        formData.date, 
        fullAngelsData
      );
      setAnalysis(aiResult);
    } catch (err: any) {
      console.error('❌ Error calculando:', err);
      alert(err.message || 'Error al calcular la carta astral. Verifica los datos ingresados.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 p-4 text-white bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-400" />
          <p className="text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 text-white bg-slate-950 min-h-screen">
      
      {/* FORMULARIO DE ENTRADA */}
      <Card className="bg-slate-900 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="text-indigo-400 flex items-center gap-2">
            <Star className="w-5 h-5" /> Datos de Nacimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Nombre Completo" 
            className="p-2 rounded bg-slate-800 border border-slate-700 w-full text-white placeholder-slate-400"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <div>
            <label className="block text-sm text-slate-300 mb-1">Fecha de Nacimiento *</label>
            <input 
              type="date" 
              className="p-2 rounded bg-slate-800 border border-slate-700 w-full text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => {
                const dateValue = e.target.value;
                // Asegurar formato YYYY-MM-DD
                if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  setFormData({...formData, date: dateValue});
                  // Log para diagnóstico
                  const [y, m, d] = dateValue.split('-').map(Number);
                  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                  console.log(`📅 Fecha seleccionada: ${d} de ${monthNames[m - 1]} de ${y}`);
                }
              }}
            />
            {formData.date && (
              <p className="text-xs text-slate-400 mt-1">
                {(() => {
                  const [y, m, d] = formData.date.split('-').map(Number);
                  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                  return `${d} de ${monthNames[m - 1]} de ${y}`;
                })()}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Hora de Nacimiento (Formato 24h) *</label>
            <input 
              type="time" 
              className="p-2 rounded bg-slate-800 border border-slate-700 w-full text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.time}
              step="1"
              onChange={e => {
                // Asegurar formato 24h (HH:mm) - el input type="time" ya devuelve formato 24h
                let timeValue = e.target.value;
                // Si por alguna razón viene en formato 12h, convertir a 24h
                if (timeValue.includes('PM') || timeValue.includes('AM')) {
                  const [hours, minutes] = timeValue.replace(/[APM]/gi, '').split(':');
                  let h = parseInt(hours);
                  if (timeValue.includes('PM') && h !== 12) h += 12;
                  if (timeValue.includes('AM') && h === 12) h = 0;
                  timeValue = `${h.toString().padStart(2, '0')}:${minutes || '00'}`;
                }
                setFormData({...formData, time: timeValue});
                // Log para diagnóstico
                const [h, m] = timeValue.split(':').map(Number);
                const hour12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
                const period = h >= 12 ? 'PM' : 'AM';
                console.log(`⏰ Hora seleccionada: ${timeValue} (${hour12}:${m.toString().padStart(2, '0')} ${period})`);
              }}
            />
            {formData.time && (
              <p className="text-xs text-slate-400 mt-1">
                {(() => {
                  const [h, m] = formData.time.split(':').map(Number);
                  const hour12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
                  const period = h >= 12 ? 'PM' : 'AM';
                  return `${formData.time} (${hour12}:${m.toString().padStart(2, '0')} ${period})`;
                })()}
              </p>
            )}
          </div>
          {/* Aquí podrías añadir inputs para Latitud/Longitud si quieres precisión exacta */}
          
          <button 
            onClick={handleCalculate}
            disabled={loading || !formData.date}
            className="md:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Revelar Carta del Alma"}
          </button>
        </CardContent>
      </Card>

      {/* RESULTADOS */}
      {angels && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          {/* NUEVO: LA RUEDA DE LOS ÁNGELES */}
          <Card className="bg-slate-900 border-indigo-500/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-center text-indigo-300">
                Mapa de tus 72 Nombres
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-8">
              <AngelsWheel 
                angelFisico={angels.angelFisico}
                angelMental={angels.angelMental}
                angelEmocional={angels.angelEmocional}
              />
              <p className="text-xs text-slate-400 mt-4 text-center max-w-md">
                Este diagrama muestra la posición exacta de tus ángeles en la rueda zodiacal de 360°.
                <br/>
                <span className="text-amber-400">● Sol (Físico)</span> • 
                <span className="text-pink-400"> ● Corazón (Emocional)</span> • 
                <span className="text-cyan-400"> ● Hora (Mental)</span>
              </p>
            </CardContent>
          </Card>

          {/* TARJETAS DE LOS ÁNGELES */}
          <div className="grid md:grid-cols-3 gap-4">
          {/* Ángel Físico */}
          <Card className="bg-amber-900/20 border-amber-500/30">
            <CardContent className="pt-6 text-center">
              <Sun className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-amber-200 uppercase tracking-widest mb-1">Ángel Físico</p>
              
              {/* NOMBRE EN HEBREO */}
              <h3 className="text-4xl font-bold text-white font-serif mb-1">
                {getAngelName(angels.angelFisico).hebrew}
              </h3>
              <p className="text-lg text-amber-100 font-medium">
                {getAngelName(angels.angelFisico).name}
              </p>
              
              <div className="mt-3 inline-block bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                <span className="text-xs text-amber-300 font-mono">#{angels.angelFisico}</span>
              </div>
              
              <p className="text-xs text-slate-400 mt-2">Rige tu Destino</p>
              {angels.zodiacSign && (
                <div className="mt-3 pt-3 border-t border-amber-500/20">
                  <p className="text-xs text-amber-300">Signo Solar</p>
                  <p className="text-sm font-semibold text-white">{angels.zodiacSign}</p>
                  {angels.degreeInSign && (
                    <p className="text-xs text-amber-200/70">{angels.degreeInSign}°</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ángel Emocional */}
          <Card className="bg-pink-900/20 border-pink-500/30">
            <CardContent className="pt-6 text-center">
              <Activity className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <p className="text-xs text-pink-200 uppercase tracking-widest mb-1">Ángel Emocional</p>
              
              {/* NOMBRE EN HEBREO */}
              <h3 className="text-4xl font-bold text-white font-serif mb-1">
                {getAngelName(angels.angelEmocional).hebrew}
              </h3>
              <p className="text-lg text-pink-100 font-medium">
                {getAngelName(angels.angelEmocional).name}
              </p>
              
              <div className="mt-3 inline-block bg-pink-500/20 px-3 py-1 rounded-full border border-pink-500/30">
                <span className="text-xs text-pink-300 font-mono">#{angels.angelEmocional}</span>
              </div>
              
              <p className="text-xs text-slate-400 mt-2">Rige tu Corazón</p>
            </CardContent>
          </Card>

          {/* Ángel Mental */}
          <Card className="bg-cyan-900/20 border-cyan-500/30">
            <CardContent className="pt-6 text-center">
              <Moon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs text-cyan-200 uppercase tracking-widest mb-1">Ángel Mental</p>
              
              {/* NOMBRE EN HEBREO */}
              <h3 className="text-4xl font-bold text-white font-serif mb-1">
                {getAngelName(angels.angelMental).hebrew}
              </h3>
              <p className="text-lg text-cyan-100 font-medium">
                {getAngelName(angels.angelMental).name}
              </p>
              
              <div className="mt-3 inline-block bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30">
                <span className="text-xs text-cyan-300 font-mono">#{angels.angelMental}</span>
              </div>
              
              <p className="text-xs text-slate-400 mt-2">Rige tu Intelecto</p>
            </CardContent>
          </Card>
          </div>
        </div>
      )}

      {/* ANÁLISIS DE IA */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Blueprint del Alma */}
          <Card className="bg-slate-900/50 border-indigo-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-300">{analysis.soulBlueprint.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 leading-relaxed">{analysis.soulBlueprint.essence}</p>
              <div className="bg-indigo-950/50 p-4 rounded border-l-4 border-indigo-500">
                <p className="font-bold text-indigo-200 mb-1">Tu Tikún (Misión):</p>
                <p className="text-slate-300">{analysis.soulBlueprint.mission}</p>
              </div>
            </CardContent>
          </Card>

          {/* Reprogramación - Nuevo Componente Visual */}
          {angels?.reprogrammingCode && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <ReprogrammingCard 
                code={angels.reprogrammingCode} 
                aiAnalysis={analysis.reprogramming} 
              />
            </div>
          )}

          {/* Mapa del Árbol de la Vida */}
          <Card className="bg-gradient-to-br from-slate-900 to-emerald-950 border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-emerald-300">Mapa del Árbol de la Vida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-emerald-950/50 p-4 rounded border-l-4 border-emerald-500">
                <p className="font-bold text-emerald-200 mb-2">Sefirá Principal Activa:</p>
                <p className="text-xl text-white mb-3">{analysis.treeOfLifeMap.activeSefirot}</p>
                <p className="text-slate-200 leading-relaxed">{analysis.treeOfLifeMap.advice}</p>
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FichaNumerologica } from '../../src/types';

export default function Dashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    dia: '',
    mes: '',
    anio: '',
    sistema: 'dshevastan'
  });

  const [resultado, setResultado] = useState<FichaNumerologica | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
      if (!token) {
        router.replace('/login');
      } else {
        setCheckingAuth(false);
      }
    } catch (err) {
      router.replace('/login');
    }
  }, [router]);

  const calcularCabala = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setResultado(null);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const res = await fetch('http://localhost:8000/api/calcular/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          nombre: formData.nombre,
          dia: parseInt(formData.dia),
          mes: parseInt(formData.mes),
          anio: parseInt(formData.anio),
          sistema: formData.sistema
        })
      });
      
      if (!res.ok) throw new Error("Error en el cálculo");
      
      const data = await res.json();
      setResultado(data); 
    } catch (error) {
      console.error(error);
      alert("Hubo un error al generar la ficha. Por favor, revisa que todos los datos estén correctos.");
    } finally {
      setCargando(false);
    }
  };

  if (checkingAuth) return <div className="min-h-screen flex items-center justify-center">Verificando autenticación...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center p-8">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
        ✨ Sistema Cabalístico
        </h1>
        <div className="space-x-3">
          <a href="/my-bookings" className="text-slate-200 hover:underline">Mis Reservas</a>
          <a href="/my-fichas" className="text-slate-200 hover:underline">Mis Fichas</a>
          <button onClick={() => { localStorage.removeItem('userToken'); router.replace('/'); }} className="text-slate-200 hover:underline">Logout</button>
        </div>
      </div>
      
      <form onSubmit={calcularCabala} className="bg-slate-900 p-6 rounded-xl border border-slate-800 w-full max-w-md shadow-2xl">
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-slate-400">Nombre Completo</label>
          <input 
            type="text" name="nombre" required
            placeholder="Ej: TONY BLANCO"
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:ring-2 focus:ring-amber-500 outline-none"
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label className="block text-xs mb-1 text-slate-400">Día</label>
            <input type="number" name="dia" required placeholder="DD" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-xs mb-1 text-slate-400">Mes</label>
            <input type="number" name="mes" required placeholder="MM" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-xs mb-1 text-slate-400">Año</label>
            <input type="number" name="anio" required placeholder="AAAA" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-center" onChange={handleChange} />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-slate-400">Sistema / Idioma</label>
          <select 
            name="sistema" 
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
            onChange={handleChange}
          >
            <option value="dshevastan">🇪🇸 Español (Dshevastan - con Ñ)</option>
            <option value="pitagorico">🇬🇧 Inglés/Universal (Pitagórico)</option>
            <option value="caldeo">🌙 Caldeo (Vibracional)</option>
            <option value="hebreo">🇮🇱 Hebreo Clásico</option>
          </select>
        </div>

        <button 
          type="submit" disabled={cargando}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded transition-all shadow-lg shadow-blue-900/20"
        >
          {cargando ? "✨ Interpretando..." : "🔮 Generar Ficha"}
        </button>
      </form>

      {resultado && (
        <div className="mt-8 w-full max-w-md animate-fade-in-up">
          <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-amber-500/30 relative overflow-hidden">
            
            <h2 className="text-xl font-serif text-amber-200 mb-4 border-b border-amber-500/30 pb-2">
              Identidad del Alma
            </h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-500">Nombre</span>
                <p className="text-2xl font-bold text-white">{resultado.identidad.nombre}</p>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs uppercase tracking-widest text-slate-500">Fecha</span>
                  <p className="text-lg text-slate-300 font-mono">{resultado.identidad.fecha_nacimiento}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-widest text-slate-500">Esencia</span>
                  <p className="text-3xl font-bold text-amber-400">
                    {resultado.numeros_principales.esencia.valor}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-slate-700/50">
                <div>
                  <span className="text-xs uppercase tracking-widest text-slate-500">Expresión (Cuerpo)</span>
                  <p className="text-3xl font-bold text-blue-400">
                    {resultado.numeros_principales.expresion?.valor || "-"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-widest text-slate-500">Destino</span>
                  <p className="text-3xl font-bold text-purple-400">
                    {resultado.numeros_principales.destino?.valor || "-"}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

export default function MyFichasPage() {
  const [fichas, setFichas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    if (!token) {
      setError('No estás autenticado. Por favor inicia sesión.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/fichas/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        });

        if (!res.ok) throw new Error('No se pudo obtener las fichas');

        const data = await res.json();
        setFichas(data);
      } catch (err: any) {
        setError(err.message || 'Error al obtener fichas');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="min-h-screen p-8 bg-slate-950 text-white">
      <h1 className="text-3xl font-bold mb-6">Mis Fichas</h1>
      {fichas.length === 0 ? (
        <p>No tienes fichas aún. Genera una ficha para empezar.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {fichas.map((f) => (
            <div key={f.id} className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-slate-400">Nombre</div>
                  <div className="text-lg font-bold">{f.nombre}</div>
                  <div className="text-xs text-slate-500">{new Date(f.creado_en).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Sistema</div>
                  <div className="text-sm">{f.sistema}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <a href={`/my-fichas/${f.id}`} className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded text-black font-semibold">Ver Detalle</a>
                <button onClick={() => { navigator.clipboard.writeText(`${location.origin}/my-fichas/${f.id}`); }} className="bg-slate-700 px-3 py-1 rounded">Copiar enlace</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

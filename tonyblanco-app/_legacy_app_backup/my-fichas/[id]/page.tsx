'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { Trash2, RefreshCw } from 'lucide-react';
import TreeOfLife from '../../../src/components/tree/tree_of_life_visualizer';

export default function FichaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [ficha, setFicha] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchFicha = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/api/fichas/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
      if (!res.ok) throw new Error('No se pudo obtener la ficha');
      const data = await res.json();
      setFicha(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al obtener ficha');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFicha = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    if (!token || !id) return;

    try {
      setDeleting(true);
      const res = await fetch(`http://localhost:8000/api/fichas/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (!res.ok) throw new Error('No se pudo eliminar la ficha');
      router.push('/my-fichas');
    } catch (err: any) {
      setError(err.message || 'Error al eliminar ficha');
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    fetchFicha(token);
  }, [id, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando ficha...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;
  if (!ficha) return <div className="min-h-screen flex items-center justify-center">Ficha no encontrada</div>;

  // Render structured sections
  const { identidad, numeros_principales, inclusion_base, analisis_cabalista, recomendaciones, temas_clave, estructura_energetica, vibraciones, cuentas_pendientes, dias_fuerza, secuencia_principal } = ficha;

  return (
    <div className="min-h-screen p-8 bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Ficha: {ficha.nombre}</h1>
            <div className="text-sm text-slate-400">Creada: {new Date(ficha.creado_en).toLocaleString()}</div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => fetchFicha(typeof window !== 'undefined' ? localStorage.getItem('userToken') || '' : '')} 
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
            <button onClick={() => router.back()} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded">Volver</button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>

        <section className="bg-slate-900 p-6 rounded mb-4 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Identidad</h2>
          <p><strong>Nombre:</strong> {identidad?.nombre}</p>
          <p><strong>Fecha:</strong> {identidad?.fecha_nacimiento}</p>
        </section>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-900 p-6 rounded border border-red-600 max-w-md">
              <h3 className="text-xl font-bold text-red-400 mb-4">Confirmar eliminación</h3>
              <p className="text-slate-300 mb-6">¿Estás seguro de que deseas eliminar esta ficha? Esta acción no se puede deshacer.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteFicha}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="bg-slate-900 p-6 rounded mb-4 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Números Principales</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Esencia:</strong> {numeros_principales?.esencia?.valor}</p>
              <p><strong>Expresión:</strong> {numeros_principales?.expresion?.valor || '-'}</p>
            </div>
            <div>
              <p><strong>Herencia:</strong> {numeros_principales?.herencia?.valor || '-'}</p>
              <p><strong>Destino:</strong> {numeros_principales?.destino?.valor || '-'}</p>
            </div>
          </div>
        </section>

        {/* Árbol de la Vida Visualization */}
        <section className="bg-slate-900 p-6 rounded mb-4 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Árbol de la Vida</h2>
          <div className="w-full h-full">
            <TreeOfLife initial={{
              esencia: String(numeros_principales?.esencia?.numero ?? ''),
              expresion: String(numeros_principales?.expresion?.numero ?? ''),
              herencia: String(numeros_principales?.herencia?.numero ?? ''),
              destino: String(numeros_principales?.destino?.numero ?? ''),
              caminoVida: String(numeros_principales?.camino_vida?.valor ?? '')
            }} />
          </div>
        </section>

        <section className="bg-slate-900 p-6 rounded mb-4 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Inclusión y Casas</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-slate-300 mb-2">Casas Activas:</h3>
              <div className="flex flex-wrap gap-2">
                {inclusion_base?.casas_activas?.map((casa: any) => (
                  <span key={casa} className="bg-slate-800 px-3 py-1 rounded">Casa {casa}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-300 mb-2">Casas Ausentes:</h3>
              <div className="flex flex-wrap gap-2">
                {inclusion_base?.casas_ausentes?.map((casa: any) => (
                  <span key={casa} className="bg-slate-800 px-3 py-1 rounded text-slate-400">Casa {casa}</span>
                ))}
              </div>
            </div>
          </div>
          {inclusion_base?.dominantes && (
            <div className="mt-4">
              <h3 className="font-semibold text-slate-300 mb-2">Números Dominantes:</h3>
              <div className="flex flex-wrap gap-2">
                {inclusion_base.dominantes.map((num: any) => (
                  <span key={num} className="bg-green-900 px-3 py-1 rounded text-green-300">{num}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="bg-slate-900 p-6 rounded mb-4 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Análisis Cabalista</h2>
          {analisis_cabalista?.map((item: any, index: number) => (
            <div key={index} className="mb-2">
              <div className="font-semibold">{item.aspecto}</div>
              <div className="text-slate-300">{item.interpretacion}</div>
            </div>
          ))}
        </section>

        <section className="bg-slate-900 p-6 rounded mb-4 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Recomendaciones</h2>
          {recomendaciones?.map((r: any, index: number) => (
            <div key={index} className="mb-2">
              <div className="font-semibold">{r.categoria}</div>
              <div className="text-slate-300">{r.sugerencia}</div>
            </div>
          ))}
        </section>

        <section className="bg-slate-900 p-6 rounded mb-4 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Temas Clave</h2>
          {Array.isArray(temas_clave) ? (
            <ul className="space-y-2">
              {temas_clave.map((tema: any, idx: number) => (
                <li key={idx} className="text-slate-300">• {typeof tema === 'string' ? tema : tema.nombre || JSON.stringify(tema)}</li>
              ))}
            </ul>
          ) : (
            <div className="text-slate-300">{typeof temas_clave === 'string' ? temas_clave : 'Sin información'}</div>
          )}
        </section>

        <section className="bg-slate-900 p-6 rounded mb-4 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Estructura Energética</h2>
          {estructura_energetica && typeof estructura_energetica === 'object' ? (
            <div className="space-y-2">
              {Object.entries(estructura_energetica).map(([key, value]: any) => (
                <div key={key} className="flex justify-between">
                  <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-slate-200">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-300">Sin información</div>
          )}
        </section>

        <section className="bg-slate-900 p-6 rounded mb-4 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Vibraciones</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><strong>Cuerpo:</strong> {vibraciones?.cuerpo}</div>
            <div><strong>Alma:</strong> {vibraciones?.alma}</div>
            <div><strong>Espíritu:</strong> {vibraciones?.espiritu}</div>
          </div>
        </section>

        <section className="bg-slate-900 p-6 rounded mb-4 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Cuentas Pendientes</h2>
          {Array.isArray(cuentas_pendientes) ? (
            <ul className="space-y-2">
              {cuentas_pendientes.map((cuenta: any, idx: number) => (
                <li key={idx} className="text-slate-300">• {typeof cuenta === 'string' ? cuenta : cuenta.descripcion || JSON.stringify(cuenta)}</li>
              ))}
            </ul>
          ) : (
            <div className="text-slate-300">Sin cuentas pendientes</div>
          )}
        </section>

        <section className="bg-slate-900 p-6 rounded mb-4 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Días de Fuerza</h2>
          {Array.isArray(dias_fuerza) ? (
            <div className="grid grid-cols-3 gap-2">
              {dias_fuerza.map((dia: any, idx: number) => (
                <div key={idx} className="bg-slate-800 p-2 rounded text-center">
                  {typeof dia === 'string' ? dia : dia.nombre || JSON.stringify(dia)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-300">Sin información</div>
          )}
        </section>

        <section className="bg-slate-900 p-6 rounded mb-10 border border-slate-800">
          <h2 className="text-xl font-semibold mb-2">Secuencia Principal</h2>
          <div className="grid grid-cols-1 gap-2">
            {secuencia_principal?.map((item: any, idx: number) => (
              <div key={idx} className="p-2 bg-slate-800 rounded">
                <div className="font-semibold">{item.etapa}</div>
                <div className="text-slate-300">Valor: {item.valor}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

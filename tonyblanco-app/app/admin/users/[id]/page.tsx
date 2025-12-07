'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  full_name: string;
  user_type: string;
  is_admin: boolean;
  profile?: {
    subscription_status: string;
    current_patients_count: number;
    fichas_created_this_month: number;
    profession?: string;
    phone?: string;
  };
}

export default function AdminUserDetail() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    full_name: '',
  });

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          username: data.username,
          email: data.email,
          first_name: data.first_name,
          full_name: data.full_name,
        });
      } else {
        setError('Usuario no encontrado');
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsEditing(false);
        alert('Usuario actualizado correctamente');
      } else {
        alert('Error al actualizar el usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar los cambios');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/admin" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </Link>
          <p className="text-red-400">{error || 'Usuario no encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/admin" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Volver al panel
          </Link>
          <h1 className="text-2xl font-bold">Detalles del Usuario</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          {/* Información del Usuario */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Información Personal</h2>
              {!isEditing && user.username !== 'tony' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Usuario</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Nombre</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Nombre Completo (para cálculos)</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Usuario</p>
                  <p className="text-lg font-semibold">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-lg font-semibold">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Nombre</p>
                  <p className="text-lg font-semibold">{user.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Nombre Completo</p>
                  <p className="text-lg font-semibold">{user.full_name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Información de Suscripción */}
          <div className="border-t border-gray-700 pt-6">
            <h2 className="text-xl font-bold mb-4">Información de Suscripción</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Tipo de Usuario</p>
                <p className="text-lg font-semibold">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user.user_type === 'therapist'
                      ? 'bg-green-900 text-green-200'
                      : 'bg-blue-900 text-blue-200'
                  }`}>
                    {user.user_type === 'therapist' ? 'Terapeuta' : 'Personal'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Estado de Suscripción</p>
                <p className="text-lg font-semibold">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user.profile?.subscription_status === 'active'
                      ? 'bg-green-900 text-green-200'
                      : 'bg-yellow-900 text-yellow-200'
                  }`}>
                    {user.profile?.subscription_status || 'N/A'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          {user.user_type === 'therapist' && (
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-xl font-bold mb-4">Estadísticas</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Clientes Activos</p>
                  <p className="text-3xl font-bold">{user.profile?.current_patients_count || 0}</p>
                </div>
              </div>
            </div>
          )}

          {user.user_type === 'personal' && (
            <div className="border-t border-gray-700 pt-6">
              <h2 className="text-xl font-bold mb-4">Estadísticas</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Fichas Este Mes</p>
                  <p className="text-3xl font-bold">{user.profile?.fichas_created_this_month || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Estado Admin */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={user.is_admin}
                disabled
                className="w-4 h-4"
              />
              <label className="text-sm">Administrador</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

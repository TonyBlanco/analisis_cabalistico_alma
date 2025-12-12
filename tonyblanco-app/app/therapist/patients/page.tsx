'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Calendar, Search, Plus, 
  Edit, Eye, Filter, ArrowLeft
} from 'lucide-react';
import { getAuthToken } from '@/lib/auth';
import TherapistRoute from '@/components/TherapistRoute';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  birth_date: string;
  is_active: boolean;
  created_at: string;
}

export default function PatientsListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'archived'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchQuery, filterActive, patients]);

  const loadPatients = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const apiURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
      
      const response = await fetch(`${apiURL}/therapist/patients/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar los pacientes');
      }

      const data = await response.json();
      const patientsList = data.results || data || [];
      setPatients(patientsList);
      setFilteredPatients(patientsList);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.full_name?.toLowerCase().includes(query) ||
        p.first_name?.toLowerCase().includes(query) ||
        p.last_name?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.phone?.includes(query)
      );
    }

    // Filtrar por estado
    if (filterActive === 'active') {
      filtered = filtered.filter(p => p.is_active);
    } else if (filterActive === 'archived') {
      filtered = filtered.filter(p => !p.is_active);
    }

    setFilteredPatients(filtered);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const calculateAge = (birthDate: string): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <TherapistRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando pacientes...</p>
          </div>
        </div>
      </TherapistRoute>
    );
  }

  return (
    <TherapistRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard/therapist')}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Lista de Pacientes</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Gestiona y accede a las fichas de tus pacientes
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/therapist/patients/new')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="h-5 w-5" />
                Nuevo Paciente
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, email o teléfono..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <button
                  onClick={() => setFilterActive('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterActive === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterActive('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterActive === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Activos
                </button>
                <button
                  onClick={() => setFilterActive('archived')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterActive === 'archived'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Archivados
                </button>
              </div>
            </div>
          </div>

          {/* Patients List */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800">{error}</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {patients.length === 0 ? 'No hay pacientes registrados' : 'No se encontraron pacientes'}
              </h3>
              <p className="text-gray-600 mb-6">
                {patients.length === 0 
                  ? 'Comienza creando tu primer paciente'
                  : 'Intenta ajustar los filtros de búsqueda'
                }
              </p>
              {patients.length === 0 && (
                <button
                  onClick={() => router.push('/therapist/patients/new')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Crear Primer Paciente
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => {
                const age = patient.birth_date ? calculateAge(patient.birth_date) : null;
                return (
                  <div
                    key={patient.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/therapist/patients/${patient.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {getInitials(patient.full_name || `${patient.first_name} ${patient.last_name}`)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                          </h3>
                          {age && (
                            <p className="text-sm text-gray-500">{age} años</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patient.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.is_active ? 'Activo' : 'Archivado'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      {patient.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{patient.email}</span>
                        </div>
                      )}
                      {patient.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{patient.phone}</span>
                        </div>
                      )}
                      {patient.birth_date && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {new Date(patient.birth_date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/therapist/patients/${patient.id}`);
                        }}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Ficha
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats */}
          {patients.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Mostrando {filteredPatients.length} de {patients.length} pacientes
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    Activos: <span className="font-semibold text-green-600">{patients.filter(p => p.is_active).length}</span>
                  </span>
                  <span className="text-gray-600">
                    Archivados: <span className="font-semibold text-gray-600">{patients.filter(p => !p.is_active).length}</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TherapistRoute>
  );
}


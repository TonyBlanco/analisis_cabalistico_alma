'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loadAllPatients, searchPatients, deletePatient } from '@/lib/patient-storage';
import type { PatientInfo } from '@/types/patient';
import { 
  Users, 
  UserPlus, 
  Search, 
  Calendar, 
  Activity,
  Trash2,
  Eye,
  FileText,
  MessageCircle,
  Video,
  Mail
} from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<PatientInfo[]>([]);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredPatients(searchPatients(searchQuery));
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  const loadPatients = () => {
    const allPatients = loadAllPatients();
    setPatients(allPatients);
    setFilteredPatients(allPatients);
  };

  const handleDelete = (patientId: string) => {
    if (confirm('¿Está seguro de eliminar este paciente y todo su historial?')) {
      deletePatient(patientId);
      loadPatients();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gestión de Pacientes</h1>
            <p className="text-gray-300">Sistema profesional de seguimiento terapéutico</p>
          </div>
          <Link href="/patients/new">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              <UserPlus className="w-5 h-5 mr-2" />
              Nuevo Paciente
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Pacientes</p>
                  <p className="text-3xl font-bold text-white">{patients.length}</p>
                </div>
                <Users className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Activos Este Mes</p>
                  <p className="text-3xl font-bold text-white">
                    {patients.filter(p => {
                      const lastMonth = new Date();
                      lastMonth.setMonth(lastMonth.getMonth() - 1);
                      return new Date(p.updatedAt) > lastMonth;
                    }).length}
                  </p>
                </div>
                <Activity className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Nuevos (7 días)</p>
                  <p className="text-3xl font-bold text-white">
                    {patients.filter(p => {
                      const lastWeek = new Date();
                      lastWeek.setDate(lastWeek.getDate() - 7);
                      return new Date(p.createdAt) > lastWeek;
                    }).length}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Con Perfil Cabalístico</p>
                  <p className="text-3xl font-bold text-white">
                    {patients.filter(p => p.kabbalisticProfile).length}
                  </p>
                </div>
                <FileText className="w-10 h-10 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Patients List */}
        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">
                  {searchQuery ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                </p>
                {!searchQuery && (
                  <Link href="/patients/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Agregar Primer Paciente
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((patient) => (
              <Card key={patient.id} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {patient.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">{patient.name}</h3>
                        <div className="flex gap-4 text-sm text-gray-400 mt-1">
                          {patient.email && <span>📧 {patient.email}</span>}
                          {patient.phone && <span>📱 {patient.phone}</span>}
                          {patient.birthDate && (
                            <span>🎂 {new Date(patient.birthDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {patient.kabbalisticProfile && (
                          <span className="px-3 py-1 bg-amber-900/30 text-amber-400 text-xs rounded-full border border-amber-700">
                            ✨ Perfil Cabalístico
                          </span>
                        )}
                        <span className="text-gray-500 text-xs">
                          Actualizado: {new Date(patient.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {/* WhatsApp rápido */}
                      {patient.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const cleanPhone = patient.phone!.replace(/\D/g, '');
                            window.open(`https://wa.me/${cleanPhone}`, '_blank');
                          }}
                          className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/20"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Email rápido */}
                      {patient.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `mailto:${patient.email}`}
                          className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
                          title="Email"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}

                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="outline" size="sm" className="border-blue-600 text-blue-400 hover:bg-blue-600/20">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                      
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="outline" size="sm" className="border-green-600 text-green-400 hover:bg-green-600/20">
                          <Activity className="w-4 h-4 mr-1" />
                          Test
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(patient.id)}
                        className="border-red-600 text-red-400 hover:bg-red-600/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {patient.notes && (
                    <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-gray-300 text-sm">{patient.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

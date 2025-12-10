'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { savePatient } from '@/lib/patient-storage';
import { geocodeCity } from '@/lib/geocoding-api';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function NewPatientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    birthTime: '',
    birthCity: '',
    birthCountry: '',
    birthLatitude: '',
    birthLongitude: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Por favor ingrese el nombre del paciente');
      return;
    }

    try {
      const patient = savePatient({
        ...formData,
        gender: formData.gender || undefined,
        birthTime: formData.birthTime || undefined,
        birthCity: formData.birthCity || undefined,
        birthCountry: formData.birthCountry || undefined,
        birthLatitude: formData.birthLatitude ? parseFloat(formData.birthLatitude) : undefined,
        birthLongitude: formData.birthLongitude ? parseFloat(formData.birthLongitude) : undefined,
      });
      
      alert('Paciente guardado exitosamente');
      router.push(`/patients/${patient.id}`);
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error al guardar paciente');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/patients">
            <Button variant="outline" className="mb-4 border-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Pacientes
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Nuevo Paciente</h1>
              <p className="text-gray-300">Registrar información del paciente para seguimiento</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nombre */}
              <div>
                <Label htmlFor="name" className="text-gray-300">
                  Nombre Completo <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: María González"
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>

              {/* Email y Teléfono */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="maria@ejemplo.com"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-300">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Fecha y Hora de Nacimiento */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthDate" className="text-gray-300">
                    Fecha de Nacimiento
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="birthTime" className="text-gray-300">
                    Hora de Nacimiento (Formato 24h)
                  </Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                    className="bg-slate-800/50 border-slate-700 text-white"
                    placeholder="HH:MM"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ej: 20:00 para 8:00 PM</p>
                </div>
              </div>

              {/* Lugar de Nacimiento */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthCity" className="text-gray-300">
                      Ciudad de Nacimiento
                    </Label>
                    <Input
                      id="birthCity"
                      type="text"
                      value={formData.birthCity}
                      onChange={async (e) => {
                        const city = e.target.value;
                        setFormData({ ...formData, birthCity: city });
                        
                        // Geocodificar automáticamente cuando se ingresa ciudad
                        if (city.length > 3 && !formData.birthLatitude) {
                          const geoResult = await geocodeCity(city, formData.birthCountry);
                          if (geoResult) {
                            setFormData({
                              ...formData,
                              birthCity: city,
                              birthLatitude: geoResult.latitude.toString(),
                              birthLongitude: geoResult.longitude.toString(),
                              birthCountry: geoResult.country || formData.birthCountry
                            });
                          }
                        }
                      }}
                      className="bg-slate-800/50 border-slate-700 text-white"
                      placeholder="Ej: La Habana"
                    />
                    <p className="text-xs text-gray-400 mt-1">💡 Las coordenadas se calcularán automáticamente</p>
                  </div>

                  <div>
                    <Label htmlFor="birthCountry" className="text-gray-300">
                      País de Nacimiento (Opcional)
                    </Label>
                    <Input
                      id="birthCountry"
                      type="text"
                      value={formData.birthCountry}
                      onChange={(e) => setFormData({ ...formData, birthCountry: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white"
                      placeholder="Ej: Cuba"
                    />
                    <p className="text-xs text-gray-400 mt-1">Ayuda a precisar la ciudad si hay varias con el mismo nombre</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthLatitude" className="text-gray-300">
                      Latitud (Calculada automáticamente)
                    </Label>
                    <Input
                      id="birthLatitude"
                      type="number"
                      step="0.0001"
                      value={formData.birthLatitude}
                      onChange={(e) => setFormData({ ...formData, birthLatitude: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white"
                      placeholder="Se calculará automáticamente"
                      readOnly={!!formData.birthLatitude}
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthLongitude" className="text-gray-300">
                      Longitud (Calculada automáticamente)
                    </Label>
                    <Input
                      id="birthLongitude"
                      type="number"
                      step="0.0001"
                      value={formData.birthLongitude}
                      onChange={(e) => setFormData({ ...formData, birthLongitude: e.target.value })}
                      className="bg-slate-800/50 border-slate-700 text-white"
                      placeholder="Se calculará automáticamente"
                      readOnly={!!formData.birthLongitude}
                    />
                  </div>
                </div>
              </div>

              {/* Género */}
              <div>
                <Label htmlFor="gender" className="text-gray-300">
                  Género
                </Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-md"
                >
                  <option value="">Seleccionar...</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              {/* Notas */}
              <div>
                <Label htmlFor="notes" className="text-gray-300">
                  Notas Iniciales
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Información adicional relevante sobre el paciente..."
                  rows={4}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Info sobre Perfil Cabalístico */}
          <Card className="mt-6 bg-amber-900/20 border-amber-700/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="text-amber-400 font-bold mb-2">Perfil Cabalístico</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Después de guardar el paciente, podrás agregar su perfil cabalístico del alma 
                    para realizar correlaciones con los tests de bienestar.
                  </p>
                  <p className="text-gray-400 text-xs">
                    El perfil incluye: número del alma, debilidades, fortalezas, ángel guardián, etc.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Save className="w-5 h-5 mr-2" />
              Guardar Paciente
            </Button>
            
            <Link href="/patients">
              <Button type="button" variant="outline" className="border-slate-700">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

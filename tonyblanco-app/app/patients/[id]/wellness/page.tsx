'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import WellnessAnalysis from '@/components/WellnessAnalysis';
import { getPatient, savePatientTest } from '@/lib/patient-storage';
import type { PatientInfo } from '@/types/patient';
import { ArrowLeft, Activity, User } from 'lucide-react';
import Link from 'next/link';

export default function PatientWellnessPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [therapistNotes, setTherapistNotes] = useState('');
  const [testCompleted, setTestCompleted] = useState(false);
  const [testData, setTestData] = useState<any>(null);

  useEffect(() => {
    const patientData = getPatient(patientId);
    if (!patientData) {
      alert('Paciente no encontrado');
      router.push('/patients');
      return;
    }
    setPatient(patientData);
  }, [patientId, router]);

  const handleTestComplete = (result: any) => {
    setTestData(result);
    setTestCompleted(true);
  };

  const handleSaveTest = () => {
    if (!testData) return;

    try {
      savePatientTest({
        patientId,
        testType: 'wellness',
        date: new Date().toISOString(),
        wellnessData: testData,
        therapistNotes: therapistNotes.trim() || undefined,
      });

      alert('Test guardado exitosamente en el historial del paciente');
      router.push(`/patients/${patientId}`);
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Error al guardar el test');
    }
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/patients/${patientId}`}>
            <Button variant="outline" className="mb-4 border-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Perfil
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Test de Bienestar</h1>
              <p className="text-gray-300">Paciente: {patient.name}</p>
            </div>
          </div>

          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-white font-semibold">Modo Profesional Activo</p>
                  <p className="text-gray-300 text-sm">
                    Los resultados se guardarán automáticamente en el historial del paciente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Component */}
        {!testCompleted ? (
          <WellnessAnalysis onComplete={handleTestComplete} patientMode={true} />
        ) : (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="py-8">
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-2">
                  Test Completado
                </h2>
                <p className="text-gray-300 text-center">
                  Agrega tus observaciones profesionales antes de guardar
                </p>
              </div>

              <div className="mb-6">
                <Label htmlFor="notes" className="text-gray-300 mb-2 block">
                  Notas del Terapeuta
                </Label>
                <Textarea
                  id="notes"
                  value={therapistNotes}
                  onChange={(e) => setTherapistNotes(e.target.value)}
                  placeholder="Observaciones, hallazgos, plan de tratamiento, recomendaciones adicionales..."
                  rows={6}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSaveTest}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  Guardar en Historial del Paciente
                </Button>
                
                <Button
                  onClick={() => setTestCompleted(false)}
                  variant="outline"
                  className="border-slate-700"
                >
                  Volver al Test
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

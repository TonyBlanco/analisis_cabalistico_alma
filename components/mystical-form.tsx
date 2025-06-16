
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FormData {
  nombreCompleto: string;
  fechaNacimiento: string;
  lugarNacimiento: string;
  horaNacimiento: string;
}

interface MysticalFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export function MysticalForm({ onSubmit, isLoading }: MysticalFormProps) {
  const [formData, setFormData] = useState<FormData>({
    nombreCompleto: '',
    fechaNacimiento: '',
    lugarNacimiento: '',
    horaNacimiento: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nombreCompleto && formData.fechaNacimiento) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950 flex items-center justify-center p-4">
      {/* Estrellas de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-lg border-gold-500/30 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
            >
              <Star className="w-8 h-8 text-white" />
            </motion.div>
            
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
              Análisis Cabalístico del Alma
            </CardTitle>
            
            <CardDescription className="text-purple-200 text-lg">
              Descubre los secretos numerológicos de tu alma y el propósito sagrado de tu existencia
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="nombre" className="text-purple-200 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Nombre Completo *
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre completo tal como aparece en tu documento"
                  value={formData.nombreCompleto}
                  onChange={(e) => handleChange('nombreCompleto', e.target.value)}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder-purple-300 focus:border-yellow-400 focus:ring-yellow-400/20"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="fecha" className="text-purple-200 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-yellow-400" />
                  Fecha de Nacimiento *
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                  className="bg-purple-900/30 border-purple-500/50 text-white focus:border-yellow-400 focus:ring-yellow-400/20"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="lugar" className="text-purple-200 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-yellow-400" />
                  Lugar de Nacimiento (opcional)
                </Label>
                <Input
                  id="lugar"
                  type="text"
                  placeholder="Ciudad, País"
                  value={formData.lugarNacimiento}
                  onChange={(e) => handleChange('lugarNacimiento', e.target.value)}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder-purple-300 focus:border-yellow-400 focus:ring-yellow-400/20"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="hora" className="text-purple-200 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  Hora de Nacimiento (opcional)
                </Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.horaNacimiento}
                  onChange={(e) => handleChange('horaNacimiento', e.target.value)}
                  className="bg-purple-900/30 border-purple-500/50 text-white focus:border-yellow-400 focus:ring-yellow-400/20"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4"
              >
                <Button
                  type="submit"
                  disabled={isLoading || !formData.nombreCompleto || !formData.fechaNacimiento}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <Star className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? 'Analizando tu Alma...' : 'Revelar mi Análisis Cabalístico'}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-purple-300 text-sm"
            >
              <p>Tu información es sagrada y se maneja con total confidencialidad</p>
              <p className="mt-2 text-xs">✡️ Basado en la sabiduría cabalística milenaria ✡️</p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MCMI4_SIGNAL_PUBLIC_NAME } from '@/lib/mcmi4SignalCopy';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface MCMI4ReflectionCardProps {
  onComplete?: () => void;
  onDismiss?: () => void;
}

/**
 * CTA Card for MCMI-4 Reflection in Patient Dashboard
 * 
 * Shown when patient has completed SIGNAL but hasn't started/completed Reflection.
 * Links to /dashboard/patient/swm/mcmi4-reflection which auto-creates workspace.
 */
export default function MCMI4ReflectionCard({ onDismiss }: MCMI4ReflectionCardProps) {
  return (
    <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50/50 to-purple-50/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-violet-600" />
            <div>
              <CardTitle>Reflexión personal</CardTitle>
              <CardDescription>
                Has completado {MCMI4_SIGNAL_PUBLIC_NAME}. Ahora puedes registrar tus reflexiones personales.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Este espacio te permite reflexionar sobre tus resultados de manera personal y privada.
          Tu terapeuta podrá ver tus reflexiones cuando las completes y selles.
        </p>
        
        <div className="flex items-center gap-3">
          <Link href="/dashboard/patient/swm/mcmi4-reflection">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Continuar a Reflexión
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          
          {onDismiss && (
            <Button variant="ghost" onClick={onDismiss} className="text-gray-500">
              Más tarde
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

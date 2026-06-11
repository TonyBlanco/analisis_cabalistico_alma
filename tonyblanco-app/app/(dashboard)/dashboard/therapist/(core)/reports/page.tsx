import { BarChart3 } from 'lucide-react';

export default function TherapistReportsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <BarChart3 className="w-12 h-12 text-muted-foreground opacity-40" />
      <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
      <p className="text-muted-foreground max-w-sm">
        Los reportes de sesión y métricas clínicas estarán disponibles próximamente.
      </p>
    </div>
  );
}

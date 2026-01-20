import Link from "next/link";
import { scl90Definition } from "../scl90.config";

export default function Scl90ResultPage() {
  return (
    <section className="mx-auto my-8 max-w-3xl space-y-6 px-4">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Resultados pendientes
        </p>
        <h1 className="text-3xl font-semibold">{scl90Definition.name}</h1>
        <p className="text-base text-slate-600">
          {scl90Definition.disclaimer} Este resultado estará disponible cuando el motor wellness esté habilitado.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-lg font-medium text-slate-700">
          Aún no hay resultados procesados para este test. Cuando el motor de bienestar esté listo, podrás revisar el índice general, los dominios y recomendaciones aquí mismo.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          Mientras tanto, puedes consultar tu historial de wellness en la sección principal.
        </p>
      </div>

      <Link
        href="/dashboard/patient/tests"
        className="text-sm text-slate-500 underline"
      >
        Volver al catálogo de tests
      </Link>
    </section>
  );
}

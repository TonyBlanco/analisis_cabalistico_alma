'use client';

import type { AdminWorkspaceContractV2 } from '@/lib/contracts/adminWorkspace.v2';
import { AdminProPlaceholderPanel } from './AdminProPlaceholders';

function HealthPanel(props: { contract: AdminWorkspaceContractV2 }) {
  const { contract } = props;
  return (
    <div className="rounded-md border bg-white">
      <div className="border-b px-3 py-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-700">Salud operativa</div>
        <div className="mt-0.5 text-[11px] text-gray-600">Last refresh: {contract.system.last_refresh_ms}ms</div>
      </div>
      <div className="p-3">
        <ul className="space-y-1">
          {contract.system.checks.map((c) => (
            <li key={c.key} className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-xs">
              <span className="font-medium text-gray-900">{c.label}</span>
              <span className="text-gray-700">
                {c.status === 'ok' ? 'OK' : c.status === 'degraded' ? 'Degradado' : 'Desconocido'}
              </span>
            </li>
          ))}
        </ul>
        {contract.system.checks.some((c) => c.detail) ? (
          <div className="mt-3 rounded-md border bg-gray-50 p-3 text-xs text-gray-700">
            {contract.system.checks
              .filter((c) => c.detail)
              .map((c) => (
                <div key={c.key} className="mt-1">
                  <span className="font-medium">{c.label}:</span> {c.detail}
                </div>
              ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminProDomainPanels(props: { contract: AdminWorkspaceContractV2 }) {
  const { contract } = props;

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <section id="health" className="scroll-mt-24">
        <HealthPanel contract={contract} />
      </section>

      <section id="audit" className="scroll-mt-24">
        <AdminProPlaceholderPanel
          title="Auditoría"
          description="Módulo de auditoría pendiente de conexión."
          items={['Eventos de seguridad', 'Cambios de rol', 'Accesos a endpoints admin']}
        />
      </section>

      <section id="roles" className="scroll-mt-24">
        <AdminProPlaceholderPanel
          title="Roles & Permisos"
          description="Gestión avanzada de permisos pendiente de conexión."
          items={['Matriz de roles', 'Permisos por endpoint', 'Grupos']}
        />
      </section>

      <section id="tokens" className="scroll-mt-24">
        <AdminProPlaceholderPanel
          title="Tokens/Sesiones"
          description="Gestión de tokens y sesiones pendiente de conexión."
          items={['Revocar tokens', 'Sesiones activas', 'Políticas de expiración']}
        />
      </section>

      <section id="tests" className="scroll-mt-24">
        <AdminProPlaceholderPanel
          title="Catálogo de Tests"
          description="Catálogo admin pendiente de conexión (sin endpoints nuevos)."
          items={['Listado de tests', 'Activar/desactivar', 'Accesos por rol']}
        />
      </section>

      <section id="services" className="scroll-mt-24">
        <AdminProPlaceholderPanel
          title="Servicios"
          description="Administración de servicios pendiente de conexión."
          items={['Servicios activos', 'Categorías', 'Precios']}
        />
      </section>

      <section id="bookings" className="scroll-mt-24">
        <AdminProPlaceholderPanel
          title="Reservas"
          description="Administración de reservas pendiente de conexión."
          items={['Reservas', 'Slots', 'Bloqueos']}
        />
      </section>

      <section id="courses" className="scroll-mt-24">
        <AdminProPlaceholderPanel
          title="Cursos"
          description="LMS admin pendiente de conexión."
          items={['Cursos', 'Publicación', 'Acceso por rol']}
        />
      </section>

      <section id="lessons" className="scroll-mt-24">
        <AdminProPlaceholderPanel
          title="Lecciones"
          description="LMS admin pendiente de conexión."
          items={['Lecciones', 'Orden', 'Contenido']}
        />
      </section>

      <section id="resources" className="scroll-mt-24">
        <AdminProPlaceholderPanel
          title="Recursos"
          description="LMS admin pendiente de conexión."
          items={['Recursos', 'Etiquetas', 'Visibilidad']}
        />
      </section>

      <section id="flags" className="scroll-mt-24">
        <AdminProPlaceholderPanel
          title="Flags"
          description="Feature flags pendientes de conexión."
          items={['Flags por entorno', 'Rollout', 'Kill-switch']}
        />
      </section>

      <section id="versions" className="scroll-mt-24">
        <AdminProPlaceholderPanel
          title="Versiones"
          description="Información read-only de versiones pendiente de conexión."
          items={['Frontend', 'Backend', 'Schema']}
        />
      </section>
    </div>
  );
}

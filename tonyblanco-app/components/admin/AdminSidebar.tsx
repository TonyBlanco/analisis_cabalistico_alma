'use client';

type NavKey = 'dashboard' | 'users' | 'roles' | 'catalog' | 'resources' | 'audit' | 'settings' | 'health';

type NavItem = { key: NavKey; label: string; targetId: string };

const navGroups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Administración',
    items: [
      { key: 'dashboard', label: 'Dashboard', targetId: 'admin-panel-stats' },
      { key: 'users', label: 'Usuarios', targetId: 'admin-panel-users' },
      { key: 'health', label: 'Salud operativa', targetId: 'admin-panel-health' },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { key: 'roles', label: 'Roles & Permisos', targetId: 'admin-panel-placeholders' },
      { key: 'catalog', label: 'Catálogo', targetId: 'admin-panel-placeholders' },
      { key: 'resources', label: 'Recursos', targetId: 'admin-panel-placeholders' },
      { key: 'audit', label: 'Auditoría', targetId: 'admin-panel-placeholders' },
      { key: 'settings', label: 'Configuración', targetId: 'admin-panel-placeholders' },
    ],
  },
];

export function AdminSidebar() {
  const scrollTo = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white md:block">
      <nav className="sticky top-[57px]">
        <div className="border-b px-3 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">Menú</div>
          <div className="mt-1 text-sm font-medium text-gray-900">Admin</div>
        </div>

        <div className="p-2">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-3 rounded-md border">
              <div className="border-b bg-gray-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
                {group.title}
              </div>
              <ul className="p-1">
                {group.items.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => scrollTo(item.targetId)}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}

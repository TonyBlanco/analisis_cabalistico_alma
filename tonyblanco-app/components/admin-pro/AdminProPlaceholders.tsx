'use client';

export function AdminProPlaceholderPanel(props: {
  title: string;
  description: string;
  items?: string[];
}) {
  const { title, description, items } = props;
  return (
    <div className="rounded-md border bg-white">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-700">{title}</div>
        <button
          type="button"
          disabled
          className="rounded-md border bg-white px-2 py-1 text-xs font-medium text-gray-700 opacity-60"
          title="No conectado"
        >
          Configurar
        </button>
      </div>
      <div className="space-y-2 px-3 py-3">
        <div className="rounded-md border border-dashed bg-gray-50 p-3 text-xs text-gray-700">
          <div className="font-medium">No conectado</div>
          <div className="mt-1">{description}</div>
        </div>

        {items?.length ? (
          <ul className="space-y-1 text-xs text-gray-700">
            {items.map((it) => (
              <li key={it} className="flex items-center justify-between rounded-md border bg-white px-3 py-2">
                <span>{it}</span>
                <span className="text-[11px] text-gray-500">Próximamente</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

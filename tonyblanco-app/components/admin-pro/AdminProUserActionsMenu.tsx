'use client';

import { useEffect, useRef, useState } from 'react';

export function AdminProUserActionsMenu(props: {
  onView: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  canToggleActive: boolean;
  canDelete: boolean;
  isActive: boolean;
  busy: boolean;
}) {
  const { onView, onToggleActive, onDelete, canToggleActive, canDelete, isActive, busy } = props;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const itemClass =
    'w-full px-3 py-2 text-left text-xs text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center rounded-md border bg-white px-2 py-1 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Operaciones
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-md border bg-white shadow-sm">
          <button type="button" className={itemClass} onClick={() => (setOpen(false), onView())}>
            Ver detalle
          </button>

          <button
            type="button"
            className={itemClass}
            onClick={() => (setOpen(false), onToggleActive())}
            disabled={!canToggleActive || busy}
            title={!canToggleActive ? 'No permitido' : undefined}
          >
            {isActive ? 'Desactivar' : 'Activar'}
          </button>

          <div className="my-1 h-px bg-gray-100" />

          <button
            type="button"
            className={itemClass + ' text-red-700 hover:bg-red-50'}
            onClick={() => (setOpen(false), onDelete())}
            disabled={!canDelete || busy}
            title={!canDelete ? 'No permitido' : undefined}
          >
            Eliminar usuario
          </button>
        </div>
      ) : null}
    </div>
  );
}

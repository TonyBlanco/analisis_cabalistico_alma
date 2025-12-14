'use client';

interface SessionLinkModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sessionType: string;
  sessionTitle: string;
}

/**
 * SessionLinkModal Component
 * 
 * Confirmation modal for opening external session links (Zoom, WhatsApp, Google Meet, etc.)
 */
export default function SessionLinkModal({
  open,
  onClose,
  onConfirm,
  sessionType,
  sessionTitle,
}: SessionLinkModalProps) {
  if (!open) return null;

  const getSessionTypeName = (type: string) => {
    if (type.toLowerCase().includes('zoom')) return 'Zoom';
    if (type.toLowerCase().includes('whatsapp')) return 'WhatsApp';
    if (type.toLowerCase().includes('meet')) return 'Google Meet';
    return 'Sesión externa';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Abrir {getSessionTypeName(sessionType)}
        </h2>
        
        <p className="text-sm text-gray-600 mb-4">
          Estás a punto de abrir una sesión externa:
        </p>
        
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <p className="text-sm font-medium text-gray-900">{sessionTitle}</p>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          La sesión se abrirá en una nueva ventana. Asegúrate de tener la aplicación correspondiente instalada si es necesario.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Abrir sesión
          </button>
        </div>
      </div>
    </div>
  );
}

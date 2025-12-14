'use client';

interface SCDFHelpModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export default function SCDFHelpModal({ open, onOpenChange, onClose }: SCDFHelpModalProps) {
  if (!open) return null;

  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-md p-6 max-w-lg w-full shadow">
        <h2 className="text-lg font-semibold mb-2">
          Información sobre SCDF
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Esta herramienta es una entrevista clínica orientativa de uso
          exclusivo para profesionales. No constituye un diagnóstico médico.
        </p>
        <button
          onClick={handleClose}
          className="text-sm text-blue-600 hover:underline"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

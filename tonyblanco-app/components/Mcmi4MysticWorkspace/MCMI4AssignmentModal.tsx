import { Fragment, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface MCMI4AssignmentModalProps {
    onClose: () => void;
}

export default function MCMI4AssignmentModal({ onClose }: MCMI4AssignmentModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
                <button
                    type="button"
                    className="absolute top-2 right-2 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                >
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Información de Asignación del Test MCMI‑4 Mystic
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                    <p><strong>Cuándo asignarlo:</strong> Cuando el paciente necesita una evaluación holística que incluya los cuatro mundos cabalísticos (Atzilut, Briah, Yetzirah, Assiah). El test genera 195 preguntas únicas que cubren todas las dimensiones.</p>
                    <p><strong>Cuándo NO asignarlo:</strong> Si el paciente ya está realizando otro test clínico (por ejemplo, SCDF) o si la evaluación debe centrarse exclusivamente en síntomas clínicos. En esos casos, solo los tests marcados como <code>patient_self</code> pueden asignarse.</p>
                    <p><strong>Cómo leer el índice de integración:</strong> El índice se muestra en los resultados como un porcentaje que indica cuán equilibrados están los cuatro mundos. Valores &gt; 70 % indican alta integración; &lt; 50 % sugieren trabajo en el mundo más débil.</p>
                    <p><strong>Uso del Tikkun:</strong> El motor sugiere las tres dimensiones con menor porcentaje como prioridades de tikkun. Estas aparecen en la sección de resultados bajo “Prioridades de Tikkun”.</p>
                </div>
                <div className="mt-5 text-center">
                    <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white hover:bg-blue-700 focus:outline-none"
                        onClick={onClose}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}

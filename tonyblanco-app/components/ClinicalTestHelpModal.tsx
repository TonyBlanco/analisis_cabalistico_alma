"use client";

import { clinicalTestKnowledgeRegistry } from "@/lib/clinicalTestKnowledge.registry";

type Props = {
  testCode: string | null;
  onClose: () => void;
};

export default function ClinicalTestHelpModal({ testCode, onClose }: Props) {
  if (!testCode) return null;

  const entry = clinicalTestKnowledgeRegistry[testCode];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Que es este test?</h2>
            <p className="text-xs text-gray-500">
              Capa de conocimiento clinico. Solo informativo; no ejecuta ni asigna.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Cerrar
          </button>
        </div>

        {entry ? (
          <div className="space-y-4 text-sm text-gray-800">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{entry.title}</h3>
              <p className="text-xs text-gray-500 mb-1">{entry.purpose}</p>
              <p className="text-gray-700">{entry.whatIsIt}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Como interpretar</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {entry.howToInterpret.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Que hacer despues</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {entry.whatToDoNext.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Notas clinicas</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {entry.clinicalNotes.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            {entry.resources && entry.resources.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Recursos</h3>
                <ul className="space-y-1">
                  {entry.resources.map((res, idx) => (
                    <li key={idx} className="text-gray-700">
                      {res.url ? (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {res.title}
                        </a>
                      ) : (
                        <span>{res.title}</span>
                      )}
                      {res.type && <span className="ml-2 text-xs text-gray-500">({res.type})</span>}
                      {res.note && <span className="ml-2 text-xs text-gray-500">{res.note}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {entry.disclaimers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Avisos</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {entry.disclaimers.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-700">
            Informacion pendiente para este instrumento. Solo visible para terapeutas.
          </div>
        )}

        <div className="text-xs text-gray-500">
          Capa educativa. No sustituye juicio clinico ni protocolos de seguridad.
        </div>
      </div>
    </div>
  );
}

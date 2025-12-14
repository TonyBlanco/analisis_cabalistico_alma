'use client';

import { useState } from 'react';

interface DisclaimerModalProps {
  open: boolean;
  type: 'patient_creation' | 'therapist_registration' | 'patient_first_login';
  onAccept: () => void;
  onCancel?: () => void;
  cancelable?: boolean;
}

/**
 * Disclaimer Modal Component
 * 
 * Shows mandatory disclaimers with scrollable content and acceptance checkbox.
 * Modal cannot be closed until accepted (unless cancelable=true).
 */
export default function DisclaimerModal({
  open,
  type,
  onAccept,
  onCancel,
  cancelable = false,
}: DisclaimerModalProps) {
  const [accepted, setAccepted] = useState(false);

  if (!open) return null;

  const getDisclaimerContent = () => {
    switch (type) {
      case 'patient_creation':
        return {
          title: 'Aviso Importante: Psicoterapia Cabalística',
          content: (
            <div className="space-y-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">
                Antes de crear una cuenta de paciente, es importante que comprenda lo siguiente:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">1. Naturaleza del Servicio</h3>
                  <p>
                    Esta plataforma ofrece análisis cabalístico y herramientas de psicoterapia complementarias.
                    Los servicios proporcionados son de carácter orientativo y complementario a la atención
                    psicológica o médica profesional.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">2. No es Diagnóstico Médico</h3>
                  <p>
                    <strong>Los análisis, tests y evaluaciones realizados a través de esta plataforma NO constituyen
                    un diagnóstico médico, psicológico o psiquiátrico.</strong> No deben utilizarse como sustituto
                    de la atención médica o psicológica profesional.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">3. No Sustituye la Atención Sanitaria</h3>
                  <p>
                    Esta plataforma NO es un servicio de salud. Si tiene problemas de salud mental o física,
                    debe consultar con un profesional de la salud cualificado. Los servicios de esta plataforma
                    están diseñados para ser complementarios, no sustitutivos.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">4. Participación Consciente</h3>
                  <p>
                    El paciente debe participar de manera consciente y voluntaria en todos los procesos.
                    El paciente tiene derecho a rechazar cualquier análisis o intervención que no desee realizar.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">5. Responsabilidad del Terapeuta</h3>
                  <p>
                    El terapeuta es responsable de informar adecuadamente al paciente sobre la naturaleza de los
                    servicios y obtener su consentimiento informado. El terapeuta debe asegurarse de que el paciente
                    comprende que estos servicios son complementarios y no diagnósticos.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">6. Confidencialidad</h3>
                  <p>
                    Todos los datos del paciente se manejan con estricta confidencialidad según la normativa
                    vigente de protección de datos personales.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mt-4">
                <p className="text-sm font-medium text-gray-900">
                  Al continuar, confirmo que he leído y comprendido este aviso, y que crearé la cuenta del paciente
                  con la información adecuada sobre la naturaleza de estos servicios.
                </p>
              </div>
            </div>
          ),
        };

      case 'therapist_registration':
        return {
          title: 'Aviso Legal y Responsabilidades Profesionales',
          content: (
            <div className="space-y-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">
                Antes de crear una cuenta profesional, debe leer y aceptar los siguientes términos:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">1. Responsabilidad Profesional</h3>
                  <p>
                    Como terapeuta profesional, es responsable de utilizar esta plataforma de manera ética y
                    conforme a las normas de su profesión. Debe mantener los estándares de práctica profesional
                    aplicables en su jurisdicción.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">2. Naturaleza de los Servicios</h3>
                  <p>
                    Esta plataforma proporciona herramientas de análisis cabalístico y evaluación que son
                    <strong> complementarias y orientativas</strong>. No deben utilizarse como único método de
                    evaluación o tratamiento. Los servicios NO constituyen diagnóstico médico o psicológico.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">3. Consentimiento Informado</h3>
                  <p>
                    Es su responsabilidad obtener el consentimiento informado de sus pacientes antes de utilizar
                    estas herramientas. Debe informar claramente a sus pacientes sobre la naturaleza complementaria
                    y orientativa de los servicios.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">4. No Sustituye la Atención Sanitaria</h3>
                  <p>
                    Los análisis y evaluaciones proporcionados por esta plataforma NO sustituyen la atención médica,
                    psicológica o psiquiátrica profesional. Debe asegurarse de que sus pacientes comprendan esto.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">5. Confidencialidad y Protección de Datos</h3>
                  <p>
                    Es responsable de mantener la confidencialidad de los datos de sus pacientes y cumplir con
                    todas las normativas aplicables de protección de datos personales (RGPD, etc.).
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">6. Uso Ético</h3>
                  <p>
                    Debe utilizar esta plataforma de manera ética, respetando los derechos de sus pacientes y
                    manteniendo los estándares profesionales más altos.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mt-4">
                <p className="text-sm font-medium text-gray-900">
                  Al continuar, confirmo que he leído y comprendido estos términos, y acepto cumplir con todas
                  las responsabilidades profesionales descritas.
                </p>
              </div>
            </div>
          ),
        };

      case 'patient_first_login':
        return {
          title: 'Bienvenido: Información Importante',
          content: (
            <div className="space-y-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">
                Antes de comenzar, es importante que comprenda la naturaleza de los servicios:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">1. Naturaleza Complementaria</h3>
                  <p>
                    Esta plataforma ofrece análisis cabalístico y herramientas de evaluación complementarias.
                    Los servicios son de carácter <strong>orientativo y complementario</strong> a la atención
                    psicológica o médica profesional.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">2. No es Diagnóstico</h3>
                  <p>
                    <strong>Los análisis y evaluaciones realizados NO constituyen un diagnóstico médico, psicológico
                    o psiquiátrico.</strong> No deben utilizarse como sustituto de la atención médica o psicológica
                    profesional.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">3. No Sustituye la Atención Sanitaria</h3>
                  <p>
                    Esta plataforma NO es un servicio de salud. Si tiene problemas de salud mental o física,
                    debe consultar con un profesional de la salud cualificado. Los servicios aquí son complementarios,
                    no sustitutivos.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">4. Participación Voluntaria</h3>
                  <p>
                    Su participación en todos los procesos es voluntaria. Puede rechazar cualquier análisis o
                    evaluación que no desee realizar.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">5. Confidencialidad</h3>
                  <p>
                    Sus datos se manejan con estricta confidencialidad según la normativa vigente de protección
                    de datos personales.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mt-4">
                <p className="text-sm font-medium text-gray-900">
                  Al continuar, confirmo que he leído y comprendido esta información sobre la naturaleza de los
                  servicios proporcionados por esta plataforma.
                </p>
              </div>
            </div>
          ),
        };

      default:
        return { title: 'Aviso', content: <p>Contenido no disponible</p> };
    }
  };

  const { title, content } = getDisclaimerContent();

  const handleAccept = () => {
    if (accepted) {
      setAccepted(false); // Reset for next use
      onAccept();
    }
  };

  const handleCancel = () => {
    if (cancelable && onCancel) {
      setAccepted(false);
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {content}
        </div>

        {/* Footer with Checkbox and Buttons */}
        <div className="border-t border-gray-200 p-6 flex-shrink-0">
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-400"
              />
              <span className="text-sm text-gray-700">
                He leído y acepto los términos y condiciones descritos anteriormente
              </span>
            </label>

            <div className="flex items-center gap-3 justify-end">
              {cancelable && onCancel && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleAccept}
                disabled={!accepted}
                className="px-6 py-2 text-sm font-medium text-white rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

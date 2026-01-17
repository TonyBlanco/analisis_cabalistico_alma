'use client';

import MCMI4AssignmentModal from './MCMI4AssignmentModal';
import { WorkspaceListView, CreateWorkspaceForm, QuestionnaireViewer, QuestionnaireSealButton } from '@/components/swm';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import type { Mcmi4MysticSectionId } from './types';

import {
    createAssignment,
    deleteAssignment,
    getPatientDetail,
    listAssignments
} from '@/lib/assignment-api';

import {

    CheckCircleIcon,

    XCircleIcon,

    ClipboardDocumentListIcon,

    ArrowPathIcon,

    SparklesIcon

} from '@heroicons/react/24/solid';



interface Mcmi4MysticVisualCoreProps {

    activeSection: Mcmi4MysticSectionId;

    patientId?: string;

    patientName?: string;

}



const TEST_CODE = 'mcmi4-mystic';



export default function Mcmi4MysticVisualCore({

    activeSection,

    patientId,

    patientName,

}: Mcmi4MysticVisualCoreProps) {

    const [loading, setLoading] = useState(false);

    const [assigned, setAssigned] = useState<boolean | null>(null);

    const [results, setResults] = useState<any[]>([]);

    const [error, setError] = useState<string | null>(null);

    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [assignmentId, setAssignmentId] = useState<number | null>(null);
    
    // SWM Workspace state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);



    // Check assignment status

    useEffect(() => {

        if (!patientId || activeSection !== 'questionnaire') return;



        const checkStatus = async () => {
            setLoading(true);
            try {
                const data = await listAssignments({
                    patient_id: parseInt(patientId),
                    test_type: TEST_CODE,
                });
                const latest = Array.isArray(data) && data.length > 0 ? data[0] : null;
                setAssignmentId(latest ? latest.id : null);
                setAssigned(Boolean(latest));
            } catch (err) {
                console.error('Error checking assignment status:', err);
                setAssigned(null);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();

    }, [patientId, activeSection]);



    // Fetch results

    useEffect(() => {

        if (!patientId || activeSection !== 'results') return;



        const fetchResults = async () => {
            setLoading(true);
            try {
                const data = await listAssignments({
                    patient_id: parseInt(patientId),
                    test_type: TEST_CODE,
                });
                setResults(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setError('No se pudieron cargar los resultados.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();

    }, [patientId, activeSection]);



    const handleAssign = async () => {

        // existing logic

        // after successful assignment you may want to show the modal for info



        if (!patientId) return;

        setLoading(true);

        setActionMessage(null);

        setError(null);

        try {
            const patient = await getPatientDetail(parseInt(patientId));
            const assignedToUserId =
                typeof patient?.user === 'object' ? patient?.user?.id : patient?.user;
            if (!assignedToUserId) {
                throw new Error('No se pudo resolver el usuario del paciente.');
            }
            const assignment = await createAssignment({
                patient_id: parseInt(patientId),
                assigned_to_user_id: assignedToUserId,
                test_type: TEST_CODE,
                n_questions: 195,
            });
            setActionMessage('Cuestionario asignado correctamente al paciente.');
            setAssigned(true);
            setAssignmentId(assignment.id);
        } catch (err: any) {
            setError(err.message || 'Error al asignar el cuestionario.');
        } finally {
            setLoading(false);
        }

    };



    const handleUnassign = async () => {

        if (!patientId) return;

        if (!confirm('¿Estás seguro de quitar el acceso a este test?')) return;



        if (!assignmentId) {
            setError('No hay una asignaci¢n activa para quitar.');
            return;
        }

        setLoading(true);
        setActionMessage(null);
        setError(null);

        try {
            await deleteAssignment(assignmentId);
            setActionMessage('Asignaci¢n eliminada correctamente.');
            const data = await listAssignments({
                patient_id: parseInt(patientId),
                test_type: TEST_CODE,
            });
            const latest = Array.isArray(data) && data.length > 0 ? data[0] : null;
            setAssigned(Boolean(latest));
            setAssignmentId(latest ? latest.id : null);
        } catch (err: any) {
            setError(err.message || 'Error al remover el acceso.');
        } finally {
            setLoading(false);
        }

    };

    // Render SWM Workspaces section (after all hooks)
    if (activeSection === 'workspaces') {
        if (showCreateForm) {
            return (
                <div className="max-w-4xl mx-auto">
                    <CreateWorkspaceForm
                        onSuccess={(workspaceId, sessionId) => {
                            setSelectedWorkspaceId(workspaceId);
                            setSelectedSessionId(sessionId);
                            setShowCreateForm(false);
                            // Navigate to questionnaire view
                            // TODO: Update activeSection to 'questionnaire' or handle routing
                        }}
                        onCancel={() => setShowCreateForm(false)}
                    />
                </div>
            );
        }

        return (
            <WorkspaceListView
                onOpenWorkspace={(workspaceId) => {
                    setSelectedWorkspaceId(workspaceId);
                    // TODO: Start or resume session for this workspace
                    // TODO: Navigate to questionnaire view with this workspace
                }}
                onViewResults={(workspaceId) => {
                    // TODO: Navigate to results view
                }}
                onCreateNew={() => setShowCreateForm(true)}
            />
        );
    }



    if (!patientId) {

        return (

            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-500">

                <p>Selecciona un paciente para comenzar.</p>

            </div>

        );

    }



    return (

        <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[500px]">

            <div className="mb-6 border-b border-gray-100 pb-4">

                <h3 className="text-lg font-semibold text-gray-900 capitalize flex items-center gap-2">

                    {activeSection === 'questionnaire' && <ClipboardDocumentListIcon className="h-5 w-5 text-gray-500" />}

                    {activeSection === 'results' && <CheckCircleIcon className="h-5 w-5 text-gray-500" />}

                    {activeSection.replace('-', ' ')}

                </h3>

                <p className="text-sm text-gray-500">

                    Paciente: <span className="font-medium text-gray-900">{patientName || 'ID ' + patientId}</span>

                </p>

            </div>



            {error && (

                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">

                    {error}

                </div>

            )}



            {actionMessage && (

                <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">

                    {actionMessage}

                </div>

            )}



            {activeSection === 'questionnaire' && (

                <div className="space-y-6">

                    {/* Question Bank Overview */}

                    <div className="rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 p-6 border border-purple-200">

                        <div className="flex items-start gap-4">

                            <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white">

                                <ClipboardDocumentListIcon className="h-7 w-7" />

                            </div>

                            <div className="flex-1">

                                <h4 className="text-lg font-semibold text-purple-900 mb-2">Banco de Preguntas MCMI-4-Mystic</h4>

                                <p className="text-sm text-purple-700 leading-relaxed">

                                    Sistema inteligente de 270 preguntas organizadas en 4 Mundos Cabalísticos.

                                    El algoritmo selecciona automáticamente 195 preguntas evitando repeticiones entre aplicaciones.

                                </p>



                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">

                                    <div className="bg-white/70 backdrop-blur rounded-lg p-3 border border-purple-100">

                                        <div className="text-2xl font-bold text-violet-600">70</div>

                                        <div className="text-xs text-gray-600 mt-1">Atzilut<br /><span className="text-purple-500">(Espiritual)</span></div>

                                    </div>

                                    <div className="bg-white/70 backdrop-blur rounded-lg p-3 border border-purple-100">

                                        <div className="text-2xl font-bold text-blue-600">70</div>

                                        <div className="text-xs text-gray-600 mt-1">Briah<br /><span className="text-blue-500">(Mental)</span></div>

                                    </div>

                                    <div className="bg-white/70 backdrop-blur rounded-lg p-3 border border-purple-100">

                                        <div className="text-2xl font-bold text-green-600">70</div>

                                        <div className="text-xs text-gray-600 mt-1">Yetzirah<br /><span className="text-green-500">(Emocional)</span></div>

                                    </div>

                                    <div className="bg-white/70 backdrop-blur rounded-lg p-3 border border-purple-100">

                                        <div className="text-2xl font-bold text-amber-600">60</div>

                                        <div className="text-xs text-gray-600 mt-1">Assiah<br /><span className="text-amber-500">(Físico)</span></div>

                                    </div>

                                </div>

                            </div>

                            {/* Assignment Info Modal Trigger */}

                            <button

                                onClick={() => setShowAssignmentModal(true)}

                                className="mt-4 text-sm text-blue-600 hover:underline"

                            >

                                Ver información de asignación

                            </button>

                            {showAssignmentModal && (

                                <MCMI4AssignmentModal onClose={() => setShowAssignmentModal(false)} />

                            )}

                        </div>

                    </div>










                    {/* Assignment Actions */}
                    <div className="mt-6 flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {loading ? (
                            <div className="flex items-center text-gray-500">
                                <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                                Verificando estado...
                            </div>
                        ) : assigned === null ? (
                            <p className="text-sm text-gray-500">No se pudo verificar el estado de asignación.</p>
                        ) : assigned ? (
                            <>
                                <span className="flex items-center text-sm text-green-700 font-medium">
                                    <CheckCircleIcon className="h-5 w-5 mr-1" />
                                    Asignado al paciente
                                </span>
                                <button
                                    onClick={handleUnassign}
                                    disabled={loading}
                                    className="ml-auto px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
                                >
                                    Quitar Asignación
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="flex items-center text-sm text-gray-600">
                                    <XCircleIcon className="h-5 w-5 mr-1 text-gray-400" />
                                    No asignado
                                </span>
                                <button
                                    onClick={handleAssign}
                                    disabled={loading}
                                    className="ml-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                >
                                    Asignar Cuestionario
                                </button>
                            </>
                        )}
                    </div>

                    {/* Sample Questions Preview */}
                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <SparklesIcon className="h-5 w-5 text-purple-500" />
                                Vista Previa de Preguntas de Ejemplo
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                Ejemplos representativos de cada Mundo (no son las preguntas exactas que verá el paciente)
                            </p>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="border-l-4 border-violet-500 pl-4 py-2">
                                <div className="text-xs font-semibold text-violet-600 mb-1">ATZILUT - Propósito Divino</div>
                                <p className="text-sm text-gray-700">"Siento una conexión clara con mi propósito divino en esta vida."</p>
                            </div>

                            <div className="border-l-4 border-blue-500 pl-4 py-2">
                                <div className="text-xs font-semibold text-blue-600 mb-1">BRIAH - Pensamiento</div>
                                <p className="text-sm text-gray-700">"Mis pensamientos me ayudan a comprender el sentido profundo de mis experiencias."</p>
                            </div>

                            <div className="border-l-4 border-green-500 pl-4 py-2">
                                <div className="text-xs font-semibold text-green-600 mb-1">YETZIRAH - Emociones</div>
                                <p className="text-sm text-gray-700">"Puedo regular mis emociones sin perder la conexión con lo que siento."</p>
                            </div>

                            <div className="border-l-4 border-amber-500 pl-4 py-2">
                                <div className="text-xs font-semibold text-amber-600 mb-1">ASSIAH - Acción</div>
                                <p className="text-sm text-gray-700">"Mis acciones cotidianas reflejan mis valores más profundos."</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 border-t border-gray-200 px-5 py-3">
                            <p className="text-xs text-gray-600 italic">
                                ?? Total del banco: 270 preguntas ٧ El sistema selecciona 195 por aplicación ٧ El paciente responde en formato Verdadero/Falso
                            </p>
                        </div>
                    </div>

                    {/* Technical Info (Collapsed by default) */}
                    <details className="rounded-lg border border-gray-200 bg-gray-50">
                        <summary className="px-5 py-3 cursor-pointer hover:bg-gray-100 transition-colors font-medium text-sm text-gray-700">
                            ?? Información Técnica del Algoritmo
                        </summary>
                        <div className="px-5 py-4 text-xs text-gray-600 space-y-2 border-t border-gray-200 bg-white">
                            <p><strong>Método de Selección:</strong> Rotación inteligente basada en historial del paciente</p>
                            <p><strong>Distribución:</strong> 7 items por dimensión (excepto Assiah: 8 items)</p>
                            <p><strong>Total Dimensiones:</strong> 27 únicas mapeadas a 10 Sephirot</p>
                            <p><strong>Items Invertidos:</strong> ~20% por dimensión para control de sesgo</p>
                            <p><strong>Sistema de Puntuación:</strong> Escala 0-3 con pesos por pregunta</p>
                        </div>
                    </details>

                </div>

            )}



            {activeSection === 'results' && (

                <div>

                    {loading ? (

                        <div className="flex justify-center p-8 text-gray-500">

                            <ArrowPathIcon className="h-6 w-6 animate-spin mr-2" />

                            Cargando resultados...

                        </div>

                    ) : results.length === 0 ? (

                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">

                            <ClipboardDocumentListIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />

                            <p>No hay resultados registrados para este paciente.</p>

                        </div>

                    ) : (

                        <div className="grid gap-4">

                            {results.map((result: any) => {
                                const isCompleted = result?.status === 'completed';
                                return (
                                    <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer bg-white shadow-sm">

                                        <div className="flex justify-between items-start">

                                            <div>

                                                <h4 className="font-medium text-gray-900">Resultado #{result.id}</h4>

                                                <p className="text-xs text-gray-500 mt-1">

                                                    Fecha: {new Date(result.created_at).toLocaleDateString()}

                                                </p>

                                            </div>

                                            <span className={`px-2 py-1 ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} text-xs rounded-full font-medium`}>

                                                {isCompleted ? 'Completado' : 'Pendiente'}

                                            </span>

                                        </div>

                                    </div>

                                )
                            })}

                        </div>

                    )}

                </div>

            )}



            {activeSection === 'symbolic-analysis' && (

                <div className="rounded-lg border border-dashed border-gray-200 p-12 text-center">

                    <SparklesIcon className="h-12 w-12 mx-auto text-purple-200 mb-3" />

                    <h4 className="text-lg font-medium text-gray-900">Análisis Simbólico AI</h4>

                    <p className="text-gray-500 mt-2">

                        El motor de interpretación cabalística procesará los perfiles del MCMI-4 aquí.

                    </p>

                    <p className="text-xs text-gray-400 mt-4">

                        (Requiere integración con endpoints SWM-v3)

                    </p>

                </div>

            )}

        </section>

    );

}


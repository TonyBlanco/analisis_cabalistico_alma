'use client';

import { WorkspaceListView, CreateWorkspaceForm, QuestionnaireViewer, QuestionnaireSealButton } from '@/components/swm';

import { useState, useEffect } from 'react';

import type { Mcmi4MysticSectionId } from './types';

import { SparklesIcon, DocumentTextIcon, ChartBarIcon, FolderIcon } from '@heroicons/react/24/solid';

import * as swmMcmi4Api from '@/lib/api/swm-mcmi4-api';



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

    // SWM Workspace state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [workspaceStatus, setWorkspaceStatus] = useState<swmMcmi4Api.WorkspaceStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load workspace status when workspace is selected
    useEffect(() => {
        if (!selectedWorkspaceId) return;
        
        const loadWorkspaceStatus = async () => {
            setLoading(true);
            setError(null);
            try {
                const statusData = await swmMcmi4Api.swmMcmi4Api.getWorkspaceStatus(selectedWorkspaceId);
                setWorkspaceStatus(statusData.status);
                
                // If there's an active session, store its ID
                if (statusData.active_session) {
                    setSelectedSessionId(statusData.active_session.session_id);
                }
            } catch (err: any) {
                setError(err.message || 'Error cargando estado del workspace');
            } finally {
                setLoading(false);
            }
        };

        loadWorkspaceStatus();
    }, [selectedWorkspaceId]);

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
                    // Workspace status will be loaded by useEffect
                }}
                onViewResults={(workspaceId) => {
                    setSelectedWorkspaceId(workspaceId);
                    // Navigate to results section would happen here
                    // For now, just select the workspace
                }}
                onCreateNew={() => setShowCreateForm(true)}
            />
        );
    }

    // Questionnaire section - show for workspace in_progress with active session
    if (activeSection === 'questionnaire') {
        if (!selectedWorkspaceId || !selectedSessionId) {
            return (
                <div className="flex flex-col h-64 items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50 text-blue-700 p-6 text-center">
                    <DocumentTextIcon className="h-12 w-12 mb-4 text-blue-500" />
                    <h4 className="text-lg font-semibold mb-2">Selecciona un workspace</h4>
                    <p className="text-sm">
                        Ve a la sección <strong>"Workspaces"</strong> y abre un workspace activo para ver el cuestionario.
                    </p>
                </div>
            );
        }

        if (workspaceStatus !== 'in_progress') {
            return (
                <div className="flex flex-col h-64 items-center justify-center rounded-xl border border-dashed border-yellow-200 bg-yellow-50 text-yellow-700 p-6 text-center">
                    <DocumentTextIcon className="h-12 w-12 mb-4 text-yellow-500" />
                    <h4 className="text-lg font-semibold mb-2">Workspace no disponible</h4>
                    <p className="text-sm">
                        Este workspace está en estado: <strong>{workspaceStatus}</strong><br />
                        Solo los workspaces en estado <strong>"in_progress"</strong> muestran el cuestionario.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <QuestionnaireViewer
                    workspaceId={selectedWorkspaceId}
                    sessionId={selectedSessionId}
                />
                {/* TODO: QuestionnaireSealButton needs answeredCount/totalQuestions from QuestionnaireViewer */}
                <div className="text-sm text-gray-500 text-center">
                    <p>Una vez completado el cuestionario, podrás sellarlo para ver resultados.</p>
                </div>
            </div>
        );
    }

    // Results section - show for workspace sealed or reviewed
    if (activeSection === 'results') {
        if (!selectedWorkspaceId) {
            return (
                <div className="flex flex-col h-64 items-center justify-center rounded-xl border border-dashed border-green-200 bg-green-50 text-green-700 p-6 text-center">
                    <ChartBarIcon className="h-12 w-12 mb-4 text-green-500" />
                    <h4 className="text-lg font-semibold mb-2">Selecciona un workspace</h4>
                    <p className="text-sm">
                        Ve a la sección <strong>"Workspaces"</strong> y selecciona un workspace completado para ver resultados.
                    </p>
                </div>
            );
        }

        if (workspaceStatus !== 'sealed' && workspaceStatus !== 'reviewed') {
            return (
                <div className="flex flex-col h-64 items-center justify-center rounded-xl border border-dashed border-yellow-200 bg-yellow-50 text-yellow-700 p-6 text-center">
                    <ChartBarIcon className="h-12 w-12 mb-4 text-yellow-500" />
                    <h4 className="text-lg font-semibold mb-2">Resultados no disponibles</h4>
                    <p className="text-sm">
                        Este workspace está en estado: <strong>{workspaceStatus}</strong><br />
                        Los resultados solo están disponibles cuando el workspace está <strong>"sealed"</strong> o <strong>"reviewed"</strong>.
                    </p>
                </div>
            );
        }

        return (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-green-600" />
                    Resultados MCMI-4 Místico
                </h3>
                <div className="text-sm text-gray-600">
                    <p>Los resultados detallados se cargarán desde:</p>
                    <code className="block mt-2 p-2 bg-gray-50 rounded">
                        GET /api/swm/mcmi4/results?workspace_id={selectedWorkspaceId}
                    </code>
                    <p className="mt-4 text-yellow-700">
                        TODO: Integrar componente de visualización de resultados
                    </p>
                </div>
            </div>
        );
    }

    // Only symbolic-analysis section remains (requires patientId)



    return (

        <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[500px]">

            <div className="mb-6 border-b border-gray-100 pb-4">

                <h3 className="text-lg font-semibold text-gray-900 capitalize flex items-center gap-2">

                    <SparklesIcon className="h-5 w-5 text-gray-500" />

                    {activeSection.replace('-', ' ')}

                </h3>

                <p className="text-sm text-gray-500">

                    Consultante: <span className="font-medium text-gray-900">{patientName || 'ID ' + patientId}</span>

                </p>

            </div>

            {/* Placeholder for future symbolic-analysis section */}
            <div className="space-y-6">
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 p-6 border border-purple-200">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                            <SparklesIcon className="h-7 w-7" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-purple-900 mb-2">Análisis Simbólico MCMI-4</h4>
                            <p className="text-sm text-purple-700 leading-relaxed">
                                Esta sección estará disponible próximamente para análisis simbólico cabalístico de los resultados.
                            </p>
                        </div>
                    </div>
                </div>
            </div>



            {/* symbolic-analysis section is the only one that still shows content */}
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

'use client';

// LEGACY MCMI4AssignmentModal removed - using SWM system only
import { WorkspaceListView, CreateWorkspaceForm, QuestionnaireViewer, QuestionnaireSealButton } from '@/components/swm';

import { useState } from 'react';

import type { Mcmi4MysticSectionId } from './types';

import { SparklesIcon } from '@heroicons/react/24/solid';



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

    // Legacy state removed - only using SWM system now

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

    // LEGACY SECTIONS (questionnaire/results) NO LONGER SUPPORTED
    // These sections now redirect to the 'workspaces' section
    if (activeSection === 'questionnaire' || activeSection === 'results') {
        return (
            <div className="flex flex-col h-64 items-center justify-center rounded-xl border border-dashed border-yellow-200 bg-yellow-50 text-yellow-700 p-6 text-center">
                <SparklesIcon className="h-12 w-12 mb-4 text-yellow-500" />
                <h4 className="text-lg font-semibold mb-2">Sistema actualizado</h4>
                <p className="text-sm mb-4">
                    El sistema de asignaciones legacy ha sido reemplazado por el nuevo sistema de Workspaces.
                </p>
                <p className="text-sm">
                    Por favor, usa la sección <strong>"Workspaces"</strong> para crear y gestionar evaluaciones MCMI-4.
                </p>
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

'use client';

import type { Mcmi4MysticSectionId } from './types';
import {
    DocumentTextIcon,
    ChartBarIcon,
    SparklesIcon,
    FolderIcon,
} from '@heroicons/react/24/solid';

interface Mcmi4MysticSidebarProps {
    activeSection: Mcmi4MysticSectionId;
    onChange: (section: Mcmi4MysticSectionId) => void;
}

const sections: Array<{
    id: Mcmi4MysticSectionId;
    label: string;
    description: string;
    Icon: typeof DocumentTextIcon;
}> = [
        {
            id: 'workspaces',
            label: 'Workspaces',
            description: 'Gestionar workspaces MCMI-4.',
            Icon: FolderIcon,
        },
        {
            id: 'questionnaire',
            label: 'Cuestionario',
            description: 'Vista de preguntas y respuestas.',
            Icon: DocumentTextIcon,
        },
        {
            id: 'results',
            label: 'Resultados',
            description: 'Análisis de puntajes y perfil.',
            Icon: ChartBarIcon,
        },
        {
            id: 'symbolic-analysis',
            label: 'Análisis Simbólico',
            description: 'Interpretación cabalística del perfil.',
            Icon: SparklesIcon,
        },
    ];

export default function Mcmi4MysticSidebar({
    activeSection,
    onChange,
}: Mcmi4MysticSidebarProps) {
    return (
        <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
            <div className="px-4 py-4 border-b border-gray-200">
                <p className="text-xs uppercase tracking-wide text-gray-500">Workspace SWM</p>
                <h2 className="text-lg font-semibold text-gray-900">MCMI-4 Místico</h2>
            </div>
            <div className="flex-1 px-3 py-4 space-y-4">
                <div className="space-y-2">
                    {sections.map((section) => {
                        const isActive = section.id === activeSection;
                        return (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => onChange(section.id)}
                                className={`w-full text-left rounded-md border px-3 py-2 text-sm transition-colors ${isActive
                                        ? 'border-gray-300 bg-gray-100 text-gray-900'
                                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <section.Icon className="h-4 w-4 text-gray-500" />
                                    <p className="text-sm font-medium">{section.label}</p>
                                </div>
                                <p className="text-[11px] text-gray-500">{section.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}

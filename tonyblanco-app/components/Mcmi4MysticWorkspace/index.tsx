'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { SparklesIcon, UserIcon } from '@heroicons/react/24/solid';
import Mcmi4MysticSidebar from './Mcmi4MysticSidebar';
import Mcmi4MysticVisualCore from './Mcmi4MysticVisualCore';
import type { Mcmi4MysticSectionId } from './types';
import { getActivePatient } from '@/lib/active-patient';

interface Mcmi4MysticWorkspaceProps {
    patientId?: string;
}

export default function Mcmi4MysticWorkspace({
    patientId: initialPatientId,
}: Mcmi4MysticWorkspaceProps) {
    const [activeSection, setActiveSection] = useState<Mcmi4MysticSectionId>('workspaces');
    const [patient, setPatient] = useState<{ id: number; name: string | null } | null>(null);

    useEffect(() => {
        // Priority: Prop > Global Active Patient
        if (initialPatientId) {
            // Mock for now if string passed, ideally fetch name
            setPatient({ id: parseInt(initialPatientId), name: 'Paciente Seleccionado' });
        } else {
            const active = getActivePatient();
            setPatient(active);
        }
    }, [initialPatientId]);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                        <SparklesIcon className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Workspace SWM</p>
                        <h1 className="text-2xl font-semibold text-gray-900">MCMI-4 Místico</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {patient ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100">
                            <UserIcon className="h-4 w-4" />
                            <span className="font-medium">{patient.name || `ID: ${patient.id}`}</span>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400 italic">Sin paciente activo</div>
                    )}

                    <Link
                        href="/dashboard/therapist"
                        className="text-sm font-medium text-gray-700 bg-gray-100 rounded-md px-3 py-2 hover:bg-gray-200"
                    >
                        Volver al panel principal
                    </Link>
                </div>
            </header>

            <div className="flex">
                <Mcmi4MysticSidebar
                    activeSection={activeSection}
                    onChange={setActiveSection}
                />
                <main className="flex-1 px-6 py-6">
                    <Mcmi4MysticVisualCore
                        activeSection={activeSection}
                        patientId={patient?.id?.toString()}
                        patientName={patient?.name || undefined}
                    />
                </main>
            </div>
        </div>
    );
}

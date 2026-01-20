/**
 * CreateWorkspaceButton
 * 
 * Button to create MCMI-4 Místico workspace from TestResult
 * Validates that TestResult.test_module.code === 'mcmi4-signal'
 * Creates workspace via POST /api/swm/mcmi4/create
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { swmMcmi4Api } from '@/lib/api/swm-mcmi4-api';
import { Sparkles, Loader2 } from 'lucide-react';

interface CreateWorkspaceButtonProps {
  testResultId: string | number;
  testModuleCode: string;
  subjectUserId: string | number;
  disabled?: boolean;
}

export default function CreateWorkspaceButton({
  testResultId,
  testModuleCode,
  subjectUserId,
  disabled,
}: CreateWorkspaceButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show for mcmi4-signal test
  if (testModuleCode !== 'mcmi4-signal') {
    return null;
  }

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      const workspace = await swmMcmi4Api.createWorkspace({
        subject_user_id: String(subjectUserId),
        mcmi4_source_data_id: String(testResultId),
      });

      // Navigate to workspace page
      router.push(`/dashboard/therapist/swm/mcmi4/${workspace.workspace_id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear workspace';
      setError(errorMessage);
      console.error('Error creating workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCreate}
        disabled={disabled || loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#7c3aed' }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creando...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Crear Workspace Interpretativo
          </>
        )}
      </button>
      
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}

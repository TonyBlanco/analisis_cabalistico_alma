'use client';

import SymbolicOverlayViewer from '@/components/SymbolicOverlayViewer';
import { mockOverlayData } from '@/components/SymbolicOverlayViewer/mock';

export default function SymbolicOverlayDevPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full bg-amber-100 text-amber-900 text-xs font-semibold tracking-wide px-4 py-2">
        DEV MODE – SYMBOLIC OVERLAY VIEWER
      </div>
      <div className="p-4">
        <SymbolicOverlayViewer data={mockOverlayData} />
      </div>
    </div>
  );
}

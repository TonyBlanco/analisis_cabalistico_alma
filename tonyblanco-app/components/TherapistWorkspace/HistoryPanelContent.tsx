'use client';

import ExportHistoryList from '@/components/HolisticExportHistory/ExportHistoryList';

export default function HistoryPanelContent() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-600">Exports holísticos (timeline interno del terapeuta).</p>
      <ExportHistoryList />
    </div>
  );
}

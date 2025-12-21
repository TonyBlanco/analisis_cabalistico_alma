'use client';

import type { SystemDominance } from '../types';

interface SystemDominanceProps {
  dominance: SystemDominance[];
}

export default function SystemDominanceSection({
  dominance,
}: SystemDominanceProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
      <h3 className="text-sm font-semibold text-gray-900">Dominancia de sistemas</h3>
      <p className="mt-1 text-xs text-gray-500">
        Distribucion relativa de eventos por sistema.
      </p>
      <div className="mt-3 space-y-2 text-xs text-gray-600">
        {dominance.map((entry) => (
          <div key={entry.system} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">{entry.system}</span>
              <span className="text-[11px] text-gray-500">
                {(entry.ratio * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-gray-100">
              <div
                className="h-1 rounded-full bg-gray-300"
                style={{ width: `${Math.round(entry.ratio * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-gray-500">{entry.notes}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

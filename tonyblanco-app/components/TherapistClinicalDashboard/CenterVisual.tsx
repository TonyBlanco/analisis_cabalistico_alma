import BodySoulVisualization from '@/components/BodySoulVisualization';
import type { VisualizationState } from '@/components/BodySoulVisualization/types';

interface CenterVisualProps {
  onStateChange: (state: VisualizationState) => void;
}

export default function CenterVisual({ onStateChange }: CenterVisualProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-gray-900">Body / Soul visualization</h2>
        <p className="text-xs text-gray-500">
          Calm visual core for observation. Manual layers only.
        </p>
      </div>
      <BodySoulVisualization onStateChange={onStateChange} />
    </div>
  );
}

import type { BodyViewSide, VisualizationLayerId } from './types';

interface LayerControlsProps {
  activeLayers: VisualizationLayerId[];
  side: BodyViewSide;
  onToggleLayer: (layer: VisualizationLayerId) => void;
  onSideChange: (side: BodyViewSide) => void;
}

const layerButtons: { id: VisualizationLayerId; label: string; description: string }[] = [
  { id: 'body', label: 'Body', description: 'Capa corporal' },
  { id: 'sefirot', label: 'Sefirot', description: 'Capa simbolica' },
  { id: 'integrated', label: 'Integrated', description: 'Vista integrada' },
];

export default function LayerControls({
  activeLayers,
  side,
  onToggleLayer,
  onSideChange,
}: LayerControlsProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Capas manuales</h3>
        <p className="text-xs text-gray-500">
          Activa capas de forma consciente. Ninguna capa se activa por defecto.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {layerButtons.map((layer) => {
          const isActive = activeLayers.includes(layer.id);
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onToggleLayer(layer.id)}
              aria-pressed={isActive}
              className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{layer.label}</span>
              <span className="text-xs opacity-80">{layer.description}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-600">Vista</span>
        <div className="flex gap-2">
          {(['front', 'back'] as BodyViewSide[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSideChange(item)}
              aria-pressed={side === item}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                side === item
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item === 'front' ? 'Front' : 'Back'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

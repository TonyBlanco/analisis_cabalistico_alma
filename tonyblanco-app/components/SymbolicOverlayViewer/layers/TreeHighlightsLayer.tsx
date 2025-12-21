'use client';

interface TreeHighlightsLayerProps {
  sefirot: string[];
  paths: string[];
  highlightedSefirot: string[];
  highlightedPaths: string[];
}

export default function TreeHighlightsLayer({
  sefirot,
  paths,
  highlightedSefirot,
  highlightedPaths,
}: TreeHighlightsLayerProps) {
  const hasTree = sefirot.length > 0 || paths.length > 0;

  if (!hasTree) {
    return <p className="text-xs text-gray-500">Sin sefirot o senderos registrados.</p>;
  }

  return (
    <div className="space-y-3 text-xs text-gray-600">
      <div>
        <div className="font-medium text-gray-700">Sefirot</div>
        <div className="mt-1 flex flex-wrap gap-2">
          {sefirot.map((item) => {
            const isActive = highlightedSefirot.includes(item);
            return (
              <span
                key={item}
                className={`rounded-full border px-2 py-1 ${
                  isActive
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                {item}
              </span>
            );
          })}
        </div>
      </div>
      <div>
        <div className="font-medium text-gray-700">Senderos</div>
        <div className="mt-1 flex flex-wrap gap-2">
          {paths.map((item) => {
            const isActive = highlightedPaths.includes(item);
            return (
              <span
                key={item}
                className={`rounded-full border px-2 py-1 ${
                  isActive
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                {item}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

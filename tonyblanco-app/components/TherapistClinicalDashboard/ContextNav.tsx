import type { ContextSection, ContextSectionId } from './types';

interface ContextNavProps {
  sections: ContextSection[];
  activeSection: ContextSectionId;
  onChangeSection: (id: ContextSectionId) => void;
}

export default function ContextNav({
  sections,
  activeSection,
  onChangeSection,
}: ContextNavProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Context map</h2>
        <p className="text-xs text-gray-500">
          Select a context focus. Content updates on the right panel.
        </p>
      </div>
      <div className="space-y-2">
        {sections.map((section) => {
          const isActive = section.id === activeSection;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChangeSection(section.id)}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                isActive
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{section.label}</div>
              <div className="text-xs opacity-80">{section.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

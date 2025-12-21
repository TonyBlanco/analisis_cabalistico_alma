import { TREE_PATHS, TREE_SEFIROT } from './tree.config';
import type { TreeOfLifeSVGProps, TreePathId, TreeSefirahId } from './tree.types';

const SIZE_MAP: Record<NonNullable<TreeOfLifeSVGProps['size']>, number | string> = {
  sm: 200,
  md: 320,
  lg: 480,
  responsive: '100%'
};

const DEFAULT_VIEWBOX = '0 0 100 100';

function getSizeStyle(size: TreeOfLifeSVGProps['size']) {
  const resolved = SIZE_MAP[size ?? 'md'];
  if (resolved === '100%') {
    return { width: '100%', height: '100%' };
  }

  return { width: resolved, height: resolved };
}

function isFocused(focus: TreeOfLifeSVGProps['focus'], type: 'sefirah' | 'path', id: string) {
  return focus?.type === type && focus.id === id;
}

export default function TreeOfLifeSVG({
  highlightedSefirot = [],
  highlightedPaths = [],
  focus,
  emphasis = 'soft',
  size = 'md',
  interactive = false,
  onSefirahHover,
  onPathHover,
  className
}: TreeOfLifeSVGProps) {
  const highlightedSefirotSet = new Set<TreeSefirahId>(highlightedSefirot);
  const highlightedPathsSet = new Set<TreePathId>(highlightedPaths);
  const dimOthers = Boolean(focus);

  const pathBaseOpacity = emphasis === 'strong' ? 0.9 : 0.7;
  const pathHighlightOpacity = emphasis === 'strong' ? 1 : 0.85;
  const sefirahFill = '#f1f5f9';
  const sefirahStroke = '#94a3b8';
  const highlightStroke = emphasis === 'strong' ? '#0f766e' : '#0d9488';

  return (
    <svg
      className={className}
      viewBox={DEFAULT_VIEWBOX}
      style={getSizeStyle(size)}
      role="img"
      aria-label="Tree of Life visual stub"
    >
      <g strokeLinecap="round" strokeLinejoin="round">
        {TREE_PATHS.map((path) => {
          const from = TREE_SEFIROT.find((node) => node.id === path.from);
          const to = TREE_SEFIROT.find((node) => node.id === path.to);

          if (!from || !to) {
            return null;
          }

          const focused = isFocused(focus, 'path', path.id);
          const highlighted = highlightedPathsSet.has(path.id);
          const dimmed = dimOthers && !focused;
          const stroke = focused || highlighted ? highlightStroke : '#cbd5f5';
          const opacity = dimmed
            ? 0.2
            : focused || highlighted
              ? pathHighlightOpacity
              : pathBaseOpacity;
          const strokeWidth = focused || highlighted ? 2.2 : 1.2;

          return (
            <line
              key={path.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              onMouseEnter={
                interactive && onPathHover
                  ? () => onPathHover(path.id)
                  : undefined
              }
              onMouseLeave={
                interactive && onPathHover
                  ? () => onPathHover(null)
                  : undefined
              }
              style={{ cursor: interactive ? 'pointer' : 'default' }}
            />
          );
        })}
      </g>
      <g>
        {TREE_SEFIROT.map((node) => {
          const focused = isFocused(focus, 'sefirah', node.id);
          const highlighted = highlightedSefirotSet.has(node.id);
          const dimmed = dimOthers && !focused;
          const opacity = dimmed ? 0.2 : 1;
          const stroke = focused || highlighted ? highlightStroke : sefirahStroke;
          const strokeWidth = focused || highlighted ? 2.4 : 1.4;
          const radius = focused || highlighted ? 5.2 : 4.2;

          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={sefirahFill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={opacity}
                onMouseEnter={
                  interactive && onSefirahHover
                    ? () => onSefirahHover(node.id)
                    : undefined
                }
                onMouseLeave={
                  interactive && onSefirahHover
                    ? () => onSefirahHover(null)
                    : undefined
                }
                style={{ cursor: interactive ? 'pointer' : 'default' }}
              />
              <text
                x={node.x}
                y={node.y + 11}
                textAnchor="middle"
                fontSize="3"
                fill="#475569"
                opacity={opacity}
              >
                {node.id}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

import { TREE_PATHS, TREE_SEFIROT } from './tree.config';
import type { TreeOfLifeSVGProps, TreePathId, TreeSefirahId } from './tree.types';

// SVG integration pending
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

function getConnectedSetsForSefirah(focusedId: TreeSefirahId) {
  const connectedSefirot = new Set<TreeSefirahId>();
  const connectedPaths = new Set<TreePathId>();

  TREE_PATHS.forEach((path) => {
    if (path.from === focusedId) {
      connectedSefirot.add(path.to);
      connectedPaths.add(path.id);
    }

    if (path.to === focusedId) {
      connectedSefirot.add(path.from);
      connectedPaths.add(path.id);
    }
  });

  return { connectedSefirot, connectedPaths };
}

function getConnectedSetsForPath(focusedPathId: TreePathId) {
  const connectedSefirot = new Set<TreeSefirahId>();
  const connectedPaths = new Set<TreePathId>();
  const focusedPath = TREE_PATHS.find((path) => path.id === focusedPathId);

  if (focusedPath) {
    connectedSefirot.add(focusedPath.from);
    connectedSefirot.add(focusedPath.to);
    connectedPaths.add(focusedPath.id);
  }

  return { connectedSefirot, connectedPaths };
}

export default function TreeOfLifeSVG({
  highlightedSefirot = [],
  highlightedPaths = [],
  focusedSefirah = null,
  dimUnrelated = false,
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
  const resolvedFocusedSefirah =
    focusedSefirah ?? (focus?.type === 'sefirah' ? (focus.id as TreeSefirahId) : null);
  const resolvedFocusedPath =
    focus?.type === 'path' ? (focus.id as TreePathId) : null;
  const hasFocus = Boolean(resolvedFocusedSefirah || resolvedFocusedPath);
  const dimOthers = hasFocus || dimUnrelated;

  const pathBaseOpacity = emphasis === 'strong' ? 0.9 : 0.7;
  const pathHighlightOpacity = emphasis === 'strong' ? 1 : 0.85;
  const sefirahFill = '#f1f5f9';
  const sefirahStroke = '#94a3b8';
  const highlightStroke = emphasis === 'strong' ? '#0f766e' : '#0d9488';
  const highlightFill = emphasis === 'strong' ? '#ccfbf1' : '#e0f2f1';

  const { connectedSefirot, connectedPaths } = resolvedFocusedSefirah
    ? getConnectedSetsForSefirah(resolvedFocusedSefirah)
    : resolvedFocusedPath
      ? getConnectedSetsForPath(resolvedFocusedPath)
      : { connectedSefirot: new Set<TreeSefirahId>(), connectedPaths: new Set<TreePathId>() };

  return (
    <svg
      className={className}
      viewBox={DEFAULT_VIEWBOX}
      style={getSizeStyle(size)}
      role="img"
      aria-label="Tree of Life visual stub"
    >
      <defs>
        <filter id="sefirah-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.6" floodColor="#14b8a6" floodOpacity="0.6" />
        </filter>
      </defs>
      <g strokeLinecap="round" strokeLinejoin="round">
        {TREE_PATHS.map((path) => {
          const from = TREE_SEFIROT.find((node) => node.id === path.from);
          const to = TREE_SEFIROT.find((node) => node.id === path.to);

          if (!from || !to) {
            return null;
          }

          const focused = isFocused(focus, 'path', path.id);
          const highlighted = highlightedPathsSet.has(path.id);
          const isConnected =
            connectedPaths.has(path.id) ||
            (resolvedFocusedSefirah
              ? path.from === resolvedFocusedSefirah || path.to === resolvedFocusedSefirah
              : false);
          const dimmed =
            hasFocus ? !isConnected : dimUnrelated && !highlighted;
          const stroke = highlighted || isConnected || focused ? highlightStroke : '#cbd5f5';
          const opacity = hasFocus
            ? isConnected
              ? 0.7
              : 0.2
            : dimmed
              ? 0.25
              : highlighted
                ? pathHighlightOpacity
                : pathBaseOpacity;
          const strokeWidth =
            highlighted || isConnected || focused
              ? emphasis === 'strong'
                ? 2.8
                : 2.4
              : 1.2;

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
          const isFocusedSefirah = resolvedFocusedSefirah === node.id || focused;
          const isConnected = connectedSefirot.has(node.id);
          const dimmed =
            hasFocus ? !(isFocusedSefirah || isConnected) : dimUnrelated && !highlighted;
          const opacity = hasFocus
            ? isFocusedSefirah
              ? 1
              : isConnected
                ? 0.7
                : 0.2
            : dimmed
              ? 0.3
              : 1;
          const stroke = highlighted || isFocusedSefirah ? highlightStroke : sefirahStroke;
          const strokeWidth = highlighted || isFocusedSefirah ? 2.6 : 1.4;
          const radius = highlighted || isFocusedSefirah ? 5.4 : 4.2;
          const fill = highlighted || isFocusedSefirah ? highlightFill : sefirahFill;
          const glow = highlighted || isFocusedSefirah;

          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                opacity={opacity}
                filter={glow ? 'url(#sefirah-glow)' : undefined}
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

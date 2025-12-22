import SefirotInteractive, {
  SEFIROT_CANONICAL,
  SEFIROT_PATHS,
  type SefirotNodeStyle,
  type SefirotPathStyle,
} from '../BodySoulVisualization/SefirotInteractive';
import type { TreeOfLifeSVGProps, TreePathId, TreeSefirahId } from './tree.types';

const SIZE_MAP: Record<NonNullable<TreeOfLifeSVGProps['size']>, number | string> = {
  sm: 200,
  md: 320,
  lg: 480,
  responsive: '100%',
};

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

  SEFIROT_PATHS.forEach((path) => {
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
  const focusedPath = SEFIROT_PATHS.find((path) => path.id === focusedPathId);

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
  highlightedSefirotOpacity,
  highlightedPathOpacity,
  repeatedSefirot = [],
  repeatedPaths = [],
  focusedSefirah = null,
  dimUnrelated = false,
  focus,
  emphasis = 'soft',
  size = 'md',
  interactive = false,
  onSefirahHover,
  onPathHover,
  className,
}: TreeOfLifeSVGProps) {
  const highlightedSefirotSet = new Set<TreeSefirahId>(highlightedSefirot);
  const highlightedPathsSet = new Set<TreePathId>(highlightedPaths);
  const repeatedSefirotSet = new Set<TreeSefirahId>(repeatedSefirot);
  const repeatedPathsSet = new Set<TreePathId>(repeatedPaths);
  const resolvedFocusedSefirah =
    focusedSefirah ?? (focus?.type === 'sefirah' ? (focus.id as TreeSefirahId) : null);
  const resolvedFocusedPath =
    focus?.type === 'path' ? (focus.id as TreePathId) : null;
  const hasFocus = Boolean(resolvedFocusedSefirah || resolvedFocusedPath);

  const pathBaseOpacity = emphasis === 'strong' ? 0.9 : 0.7;
  const pathHighlightOpacity = emphasis === 'strong' ? 1 : 0.85;
  const sefirahFill = '#f1f5f9';
  const sefirahStroke = '#94a3b8';
  const repetitionStroke = '#64748b';
  const repetitionOpacity = 0.45;
  const highlightStroke = emphasis === 'strong' ? '#0f766e' : '#0d9488';
  const highlightFill = emphasis === 'strong' ? '#ccfbf1' : '#e0f2f1';

  const { connectedSefirot, connectedPaths } = resolvedFocusedSefirah
    ? getConnectedSetsForSefirah(resolvedFocusedSefirah)
    : resolvedFocusedPath
      ? getConnectedSetsForPath(resolvedFocusedPath)
      : { connectedSefirot: new Set<TreeSefirahId>(), connectedPaths: new Set<TreePathId>() };

  const pathStyleOverrides: Partial<Record<TreePathId, SefirotPathStyle>> = {};
  SEFIROT_PATHS.forEach((path) => {
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
    const resolvedOpacity =
      highlighted && highlightedPathOpacity?.[path.id] !== undefined
        ? highlightedPathOpacity[path.id]!
        : opacity;
    const strokeWidth =
      highlighted || isConnected || focused
        ? emphasis === 'strong'
          ? 2.8
          : 2.4
        : 1.2;
    const hasRepetition = repeatedPathsSet.has(path.id);

    pathStyleOverrides[path.id] = {
      stroke,
      opacity: resolvedOpacity,
      strokeWidth,
      repeat: hasRepetition
        ? {
            stroke: repetitionStroke,
            strokeWidth: strokeWidth + 1.6,
            opacity: repetitionOpacity,
          }
        : undefined,
    };
  });

  const nodeStyleOverrides: Partial<Record<TreeSefirahId, SefirotNodeStyle>> = {};
  SEFIROT_CANONICAL.forEach((node) => {
    const nodeId = node.id as TreeSefirahId;
    const focused = isFocused(focus, 'sefirah', nodeId);
    const highlighted = highlightedSefirotSet.has(nodeId);
    const isFocusedSefirah = resolvedFocusedSefirah === nodeId || focused;
    const isConnected = connectedSefirot.has(nodeId);
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
    const resolvedOpacity =
      highlighted && highlightedSefirotOpacity?.[nodeId] !== undefined
        ? highlightedSefirotOpacity[nodeId]!
        : opacity;
    const stroke = highlighted || isFocusedSefirah ? highlightStroke : sefirahStroke;
    const strokeWidth = highlighted || isFocusedSefirah ? 3 : 2;
    const radius = highlighted || isFocusedSefirah ? node.r + 3 : node.r;
    const hasRepetition = repeatedSefirotSet.has(nodeId);
    const fill = highlighted || isFocusedSefirah ? highlightFill : sefirahFill;

    nodeStyleOverrides[nodeId] = {
      fill,
      stroke,
      strokeWidth,
      opacity: resolvedOpacity,
      radius,
      ring: hasRepetition
        ? {
            stroke: repetitionStroke,
            strokeWidth: 1.6,
            opacity: repetitionOpacity,
            radius: radius + 6,
          }
        : undefined,
    };
  });

  return (
    <SefirotInteractive
      className={className}
      style={getSizeStyle(size)}
      interactive={interactive}
      onHover={onSefirahHover}
      onPathHover={onPathHover}
      nodeStyleOverrides={nodeStyleOverrides}
      pathStyleOverrides={pathStyleOverrides}
      showBackground={false}
      showPillarLabels={false}
      showPillarGuides={false}
      showHebrew={false}
      showLabels={false}
      showMeaning
    />
  );
}

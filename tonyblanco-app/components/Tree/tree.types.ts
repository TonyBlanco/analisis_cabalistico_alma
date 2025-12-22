import type { SEFIROT_CANONICAL, SEFIROT_PATHS } from '../BodySoulVisualization/SefirotInteractive';

export type TreeSefirahId = (typeof SEFIROT_CANONICAL)[number]['id'];
export type TreePathId = (typeof SEFIROT_PATHS)[number]['id'];

export interface TreeFocus {
  type: 'sefirah' | 'path';
  id: TreeSefirahId | TreePathId;
}

export interface TreeOfLifeSVGProps {
  highlightedSefirot?: TreeSefirahId[];
  highlightedPaths?: TreePathId[];
  highlightedSefirotOpacity?: Partial<Record<TreeSefirahId, number>>;
  highlightedPathOpacity?: Partial<Record<TreePathId, number>>;
  repeatedSefirot?: TreeSefirahId[];
  repeatedPaths?: TreePathId[];
  focusedSefirah?: TreeSefirahId | null;
  dimUnrelated?: boolean;
  focus?: TreeFocus;
  emphasis?: 'soft' | 'strong';
  size?: 'sm' | 'md' | 'lg' | 'responsive';
  interactive?: boolean;
  onSefirahHover?: (id: TreeSefirahId | null) => void;
  onPathHover?: (id: TreePathId | null) => void;
  className?: string;
}

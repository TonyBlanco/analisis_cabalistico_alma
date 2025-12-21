import type { TREE_PATHS, TREE_SEFIROT } from './tree.config';

export type TreeSefirahId = (typeof TREE_SEFIROT)[number]['id'];
export type TreePathId = (typeof TREE_PATHS)[number]['id'];

export interface TreeFocus {
  type: 'sefirah' | 'path';
  id: string;
}

export interface TreeOfLifeSVGProps {
  highlightedSefirot?: TreeSefirahId[];
  highlightedPaths?: TreePathId[];
  focus?: TreeFocus;
  emphasis?: 'soft' | 'strong';
  size?: 'sm' | 'md' | 'lg' | 'responsive';
  interactive?: boolean;
  onSefirahHover?: (id: TreeSefirahId | null) => void;
  onPathHover?: (id: TreePathId | null) => void;
  className?: string;
}

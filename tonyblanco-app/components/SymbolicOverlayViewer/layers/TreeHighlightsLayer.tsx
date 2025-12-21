'use client';

import { TreeOfLifeSVG } from '@/components/Tree';
import type { TreePathId, TreeSefirahId } from '@/components/Tree';

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
  return (
    <TreeOfLifeSVG
      highlightedSefirot={highlightedSefirot as TreeSefirahId[]}
      highlightedPaths={highlightedPaths as TreePathId[]}
      emphasis="soft"
      size="responsive"
    />
  );
}

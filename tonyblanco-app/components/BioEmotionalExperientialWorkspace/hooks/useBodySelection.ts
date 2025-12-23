'use client';

import { useState, useCallback } from 'react';
import { anatomicalRegions } from '../data/anatomicalRegions';
import type { AnatomicalRegion } from '../data/anatomicalRegions';

export function useBodySelection() {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const selectedRegion: AnatomicalRegion | null =
    anatomicalRegions.find((r) => r.id === selectedRegionId) || null;

  const selectRegion = useCallback((regionId: string | null) => {
    setSelectedRegionId(regionId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRegionId(null);
  }, []);

  return {
    selectedRegionId,
    selectedRegion,
    selectRegion,
    clearSelection,
  };
}

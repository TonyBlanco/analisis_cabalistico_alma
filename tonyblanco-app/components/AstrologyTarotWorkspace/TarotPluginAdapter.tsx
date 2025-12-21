'use client';

import type { ComponentType } from 'react';
import { TarotLayer } from '@/components/BodySoulVisualization/plugins/tarot';
import type { DrawnCard } from '@/components/BodySoulVisualization/plugins/tarot';

interface TarotPluginAdapterProps {
  patientId?: string;
  patientName?: string;
  patientBirthDate?: Date;
  onSefirahHighlight?: (sefirahId: string | null) => void;
  onReadingComplete?: (reading: DrawnCard[]) => void;
  onCardSelect?: (card: DrawnCard) => void;
}

const TarotLayerPassthrough = TarotLayer as ComponentType<TarotPluginAdapterProps>;

export default function TarotPluginAdapter(props: TarotPluginAdapterProps) {
  return <TarotLayerPassthrough {...props} />;
}

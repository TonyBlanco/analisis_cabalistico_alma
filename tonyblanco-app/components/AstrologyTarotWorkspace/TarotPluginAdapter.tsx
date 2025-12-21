'use client';

import type { ComponentType } from 'react';
import { TarotLayer } from '@/components/BodySoulVisualization/plugins/tarot';
import type { DrawnCard } from '@/components/BodySoulVisualization/plugins/tarot';
import type { PatientContext } from '@/components/BodySoulVisualization/types';

interface TarotPluginAdapterProps {
  patientId?: PatientContext['patientId'];
  patientName?: string;
  patientBirthDate?: PatientContext['patientBirthDate'];
  onSefirahHighlight?: (sefirahId: string | null) => void;
  onReadingComplete?: (reading: DrawnCard[]) => void;
  onCardSelect?: (card: DrawnCard) => void;
}

const TarotLayerPassthrough = TarotLayer as ComponentType<TarotPluginAdapterProps>;

export default function TarotPluginAdapter(props: TarotPluginAdapterProps) {
  return <TarotLayerPassthrough {...props} />;
}

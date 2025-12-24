'use client';

import AstrologyVisualTab from './AstrologyVisualTab';

interface AstrologyVisualCoreProps {
  patientId?: number | null;
  houseSystem?: string;
}

export default function AstrologyVisualCore(props: AstrologyVisualCoreProps) {
  return <AstrologyVisualTab patientId={props.patientId?.toString()} houseSystem={props.houseSystem} />;
}

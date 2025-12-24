'use client';

import AstrologyVisualTab from './AstrologyVisualTab';

interface AstrologyVisualCoreProps {
  patientId?: number | null;
}

export default function AstrologyVisualCore(props: AstrologyVisualCoreProps) {
  return <AstrologyVisualTab patientId={props.patientId?.toString()} />;
}

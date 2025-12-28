'use client';

import AstrologyVisualTab from './AstrologyVisualTab';

interface AstrologyVisualCoreProps {
  patientId?: string | undefined;
  houseSystem?: string;
  zodiacType?: string;
}

export default function AstrologyVisualCore(props: AstrologyVisualCoreProps) {
  return (
    <AstrologyVisualTab
      patientId={props.patientId}
      houseSystem={props.houseSystem}
      zodiacType={props.zodiacType}
    />
  );
}

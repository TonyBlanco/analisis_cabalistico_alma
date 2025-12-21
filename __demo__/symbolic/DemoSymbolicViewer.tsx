'use client';

import BodySoulVisualization from '@/components/BodySoulVisualization';
import { TarotLayer } from '@/components/BodySoulVisualization/plugins/tarot';
import DemoLayout from './DemoLayout';
import { demoPatientContext } from './DemoPatientContext';

export default function DemoSymbolicViewer() {
  return (
    <DemoLayout>
      <div style={{ display: 'grid', gap: '24px' }}>
        <section style={{ border: '1px solid #e5e7eb', padding: '16px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '16px' }}>Body + Tree (DEMO)</h2>
          <BodySoulVisualization
            onStateChange={(state) => {
              if (process.env.NODE_ENV !== 'production') {
                console.log('DEMO: BodySoulVisualization state', state);
              }
            }}
          />
        </section>

        <section style={{ border: '1px solid #e5e7eb', padding: '16px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '16px' }}>Tarot Plugin (DEMO)</h2>
          <TarotLayer
            patientId={demoPatientContext.patientId}
            patientBirthDate={demoPatientContext.patientBirthDate}
          />
        </section>
      </div>
    </DemoLayout>
  );
}

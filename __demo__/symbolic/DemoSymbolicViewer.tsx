'use client';

import { useCallback, useState } from 'react';
import BodySoulVisualization from '@/components/BodySoulVisualization';
import { TarotLayer } from '@/components/BodySoulVisualization/plugins/tarot';
import type { VisualizationState } from '@/components/BodySoulVisualization/types';
import DemoLayout from './DemoLayout';
import { demoPatientContext } from './DemoPatientContext';
import SymbolicAIOrchestrator from './ai/SymbolicAIOrchestrator';

export default function DemoSymbolicViewer() {
  const [aiOutput, setAiOutput] = useState(() =>
    SymbolicAIOrchestrator({
      patientContext: demoPatientContext,
      symbolicState: {
        activeLayers: [],
        selectedSefirahId: null,
        selectedBodyRegionId: null,
        side: 'front',
        notes: [],
      },
    })
  );
  const [astrologyOutput, setAstrologyOutput] = useState(() =>
    SymbolicAIOrchestrator({
      patientContext: demoPatientContext,
      symbolicState: {
        activeLayers: [],
        selectedSefirahId: null,
        selectedBodyRegionId: null,
        side: 'front',
        notes: [],
      },
      astrologyState: {
        focus: 'sun-sign',
        notes: ['demo-sign: leo', 'demo-house: 5', 'demo-planet: mars'],
      },
    })
  );

  const handleStateChange = useCallback((state: VisualizationState) => {
    const insight = SymbolicAIOrchestrator({
      patientContext: demoPatientContext,
      symbolicState: state,
    });
    setAiOutput(insight);
    const astrologyInsight = SymbolicAIOrchestrator({
      patientContext: demoPatientContext,
      symbolicState: state,
      astrologyState: {
        focus: 'sun-sign',
        notes: ['demo-sign: leo', 'demo-house: 5', 'demo-planet: mars'],
      },
    });
    setAstrologyOutput(astrologyInsight);
    if (process.env.NODE_ENV !== 'production') {
      console.log('DEMO: BodySoulVisualization state', state);
      console.log('DEMO: Symbolic AI output', insight);
      console.log('DEMO: Astrology AI output', astrologyInsight);
    }
  }, []);

  return (
    <DemoLayout>
      <div style={{ display: 'grid', gap: '24px' }}>
        <section style={{ border: '1px solid #e5e7eb', padding: '16px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '16px' }}>Body + Tree (DEMO)</h2>
          <BodySoulVisualization onStateChange={handleStateChange} />
        </section>

        <section style={{ border: '1px solid #e5e7eb', padding: '16px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '16px' }}>Tarot Plugin (DEMO)</h2>
          <TarotLayer
            patientId={demoPatientContext.patientId}
            patientBirthDate={demoPatientContext.patientBirthDate}
          />
        </section>

        <section style={{ border: '1px dashed #9ca3af', padding: '16px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '16px' }}>AI DEMO OUTPUT</h2>
          <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700 }}>{aiOutput.label}</div>
            <div>{aiOutput.summary}</div>
            <div style={{ marginTop: '8px' }}>
              {aiOutput.signals.map((signal) => (
                <div key={signal}>- {signal}</div>
              ))}
            </div>
            <div style={{ marginTop: '8px' }}>
              Confidence: {aiOutput.confidence}
            </div>
            <div style={{ marginTop: '8px', color: '#b91c1c' }}>
              {aiOutput.disclaimer}
            </div>
          </div>
        </section>

        <section style={{ border: '1px dashed #9ca3af', padding: '16px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '16px' }}>AI DEMO OUTPUT (ASTROLOGY)</h2>
          <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700 }}>{astrologyOutput.label}</div>
            <div>{astrologyOutput.summary}</div>
            <div style={{ marginTop: '8px' }}>
              {astrologyOutput.signals.map((signal) => (
                <div key={signal}>- {signal}</div>
              ))}
            </div>
            <div style={{ marginTop: '8px' }}>
              Confidence: {astrologyOutput.confidence}
            </div>
            <div style={{ marginTop: '8px', color: '#b91c1c' }}>
              {astrologyOutput.disclaimer}
            </div>
          </div>
        </section>
      </div>
    </DemoLayout>
  );
}

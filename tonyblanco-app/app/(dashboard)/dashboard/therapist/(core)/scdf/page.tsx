import { Suspense } from 'react';
import ScdfClient from './scdf-client';

export default function ScdfMasterPage() {
  return (
    <Suspense fallback={null}>
      <ScdfClient />
    </Suspense>
  );
}

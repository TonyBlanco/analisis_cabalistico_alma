import { Suspense } from 'react';
import Scid5Client from './scid5-client';

export default function Scid5MasterPage() {
  return (
    <Suspense fallback={null}>
      <Scid5Client />
    </Suspense>
  );
}
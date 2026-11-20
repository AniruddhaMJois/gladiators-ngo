import { Suspense } from 'react';
import NgoOnboarding from '@/views/ngo/NgoOnboarding';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <NgoOnboarding />
    </Suspense>
  );
}

import { Suspense } from 'react';
import VolunteerOnboarding from '@/views/volunteer/VolunteerOnboarding';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <VolunteerOnboarding />
    </Suspense>
  );
}

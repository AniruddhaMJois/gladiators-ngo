import { Suspense } from 'react';
import CompanyOnboarding from '@/views/company/CompanyOnboarding';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <CompanyOnboarding />
    </Suspense>
  );
}

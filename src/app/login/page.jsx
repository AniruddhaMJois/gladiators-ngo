import { Suspense } from 'react';
import LoginPage from '@/views/Login';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}

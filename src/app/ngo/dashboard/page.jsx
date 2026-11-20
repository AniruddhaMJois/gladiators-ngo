'use client';

import { Suspense } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import NgoDashboard from '@/views/ngo/NgoDashboard';

export default function Page() {
  return (
    <ProtectedRoute allowedRole="ngo">
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>}>
        <NgoDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}

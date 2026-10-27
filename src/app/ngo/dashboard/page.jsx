'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import NgoDashboard from '@/views/ngo/NgoDashboard';

export default function Page() {
  return (
    <ProtectedRoute allowedRole="ngo">
      <NgoDashboard />
    </ProtectedRoute>
  );
}

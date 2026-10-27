'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import NgoProfile from '@/views/ngo/NgoProfile';

export default function Page() {
  return (
    <ProtectedRoute allowedRole="ngo">
      <NgoProfile />
    </ProtectedRoute>
  );
}

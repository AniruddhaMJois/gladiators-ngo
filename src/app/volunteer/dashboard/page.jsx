'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import VolunteerDashboard from '@/views/volunteer/VolunteerDashboard';

export default function Page() {
  return (
    <ProtectedRoute allowedRole="volunteer">
      <VolunteerDashboard />
    </ProtectedRoute>
  );
}

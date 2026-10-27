'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import VolunteerProfile from '@/views/volunteer/VolunteerProfile';

export default function Page() {
  return (
    <ProtectedRoute allowedRole="volunteer">
      <VolunteerProfile />
    </ProtectedRoute>
  );
}

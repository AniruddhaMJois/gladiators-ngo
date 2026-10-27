'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import CompanyNgoProfile from '@/views/company/CompanyNgoProfile';

export default function Page() {
  return (
    <ProtectedRoute allowedRole="company">
      <CompanyNgoProfile />
    </ProtectedRoute>
  );
}

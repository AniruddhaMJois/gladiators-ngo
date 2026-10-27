'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import CompanyProfile from '@/views/company/CompanyProfile';

export default function Page() {
  return (
    <ProtectedRoute allowedRole="company">
      <CompanyProfile />
    </ProtectedRoute>
  );
}

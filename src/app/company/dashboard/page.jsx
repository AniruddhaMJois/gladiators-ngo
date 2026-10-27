'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import CompanyDashboard from '@/views/company/CompanyDashboard';

export default function Page() {
  return (
    <ProtectedRoute allowedRole="company">
      <CompanyDashboard />
    </ProtectedRoute>
  );
}

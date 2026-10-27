'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import CharitySearch from '@/views/company/CharitySearch';

export default function Page() {
  return (
    <ProtectedRoute allowedRole="company">
      <CharitySearch />
    </ProtectedRoute>
  );
}

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/');
      } else if (allowedRole && user?.role !== allowedRole) {
        router.replace(`/${user.role}/dashboard`);
      }
    }
  }, [isAuthenticated, user, loading, allowedRole, router]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading session...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return null;
  }

  return children;
}

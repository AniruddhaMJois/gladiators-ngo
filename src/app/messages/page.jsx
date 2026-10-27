'use client';

import { Suspense } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import CollabHub from '@/components/chat/CollabHub';

export default function Page() {
  return (
    <ProtectedRoute>
      <div className="page-container animate-fade-in" style={{ padding: '2rem' }}>
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <h1 className="text-gradient">Direct Connect</h1>
          <p>Communicate directly with NGOs and manage your collaborations.</p>
        </div>
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading chats...</div>}>
          <CollabHub />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}

// client/src/app/dashboard/page.tsx
'use client';

import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export interface Disagreement {
  _id: string;
  title: string;
}

function DashboardContent() {
  const [disagreements, setDisagreements] = useState<Disagreement[]>([]);
  const [selectedDisagreement, setSelectedDisagreement] = useState<Disagreement | null>(null);

  const fetchDisagreements = async () => {
    // --- NEW: Get user info from local storage ---
    const userInfoString = localStorage.getItem('userInfo');
    if (!userInfoString) {
      // This case should be handled by ProtectedRoute, but it's good practice
      console.error('No user info found');
      return;
    }
    const userInfo = JSON.parse(userInfoString);
    const token = userInfo.token;
    // -----------------------------------------

    try {
      // --- NEW: Add the Authorization header to the request ---
      const response = await fetch('/api/disagreements', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      // ----------------------------------------------------

      if (!response.ok) {
        throw new Error('Failed to fetch disagreements');
      }
      const data = await response.json();
      setDisagreements(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDisagreements();
  }, []);

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar 
        disagreements={disagreements} 
        onDisagreementCreated={fetchDisagreements}
        selectedDisagreement={selectedDisagreement}
        onSelectDisagreement={setSelectedDisagreement}
      />
      <ChatWindow disagreement={selectedDisagreement} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
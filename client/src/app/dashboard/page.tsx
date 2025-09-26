// client/src/app/dashboard/page.tsx
"use client";

import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import { useEffect, useState } from "react";

export interface Disagreement {
  _id: string;
  title: string;
}

function DashboardContent() {
  const [disagreements, setDisagreements] = useState<Disagreement[]>([]);
  const [selectedDisagreement, setSelectedDisagreement] =
    useState<Disagreement | null>(null);

  const fetchDisagreements = async () => {
    try {
      // The browser will automatically send the cookie. No need for headers!
      const response = await fetch("/api/disagreements");

      if (!response.ok) {
        // If the cookie is invalid or expired, the server will send a 401
        // and our ProtectedRoute will redirect to login.
        throw new Error("Failed to fetch disagreements");
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
  // The <ProtectedRoute> wrapper is no longer needed.
  // The middleware.ts file handles protection for this route.
  return <DashboardContent />;
}

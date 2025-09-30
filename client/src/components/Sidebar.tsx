// client/src/components/Sidebar.tsx
'use client'; 

import { useState } from 'react'; 
import { useRouter } from 'next/navigation';
import NewDisagreementModal from './NewDisagreementModal';
import InviteUserModal from './InviteUserModal';
import { Disagreement } from '@/app/dashboard/page';

interface SidebarProps {
  disagreements: Disagreement[];
  onDisagreementCreated: () => void;
  selectedDisagreementId: string | null; // Changed from object to ID
  onSelectDisagreement: (disagreement: Disagreement) => void;
}

export default function Sidebar({ disagreements, onDisagreementCreated, selectedDisagreementId, onSelectDisagreement }: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const router = useRouter();

  const logoutHandler = async () => {
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to log out');
      }

      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="w-1/4 bg-gray-800 text-white p-4 flex flex-col h-screen">
      <div>
        <h2 className="text-xl font-bold mb-4">Your Disagreements</h2>
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            + New Disagreement
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Invite User
          </button>
        </div>
      </div>
      <ul className="flex-grow overflow-y-auto">
        {disagreements.map((disagreement) => (
          <li 
            key={disagreement._id} 
            onClick={() => onSelectDisagreement(disagreement)}
            // Compare against the ID prop now
            className={`p-2 rounded-md cursor-pointer ${
              selectedDisagreementId === disagreement._id 
                ? 'bg-gray-700' // Style for selected
                : 'hover:bg-gray-600' // Style for hover
            }`}
          >
            {disagreement.title}
          </li>
        ))}
      </ul>

      <NewDisagreementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onDisagreementCreated={onDisagreementCreated} 
      />

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        disagreementId={selectedDisagreementId}
      />

      <div className="mt-auto pt-4 border-t border-gray-600">
        <button
          onClick={logoutHandler}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
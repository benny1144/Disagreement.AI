// client/src/components/Sidebar.tsx
'use client'; 

import { useState } from 'react'; 
import NewDisagreementModal from './NewDisagreementModal';
import { Disagreement } from '@/app/dashboard/page';

interface SidebarProps {
  disagreements: Disagreement[];
  onDisagreementCreated: () => void;
  selectedDisagreement: Disagreement | null; // NEW: Receive selected state
  onSelectDisagreement: (disagreement: Disagreement) => void; // NEW: Function to change selection
}

export default function Sidebar({ disagreements, onDisagreementCreated, selectedDisagreement, onSelectDisagreement }: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-1/4 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Your Disagreements</h2>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-4"
      >
        + New Disagreement
      </button>
      <ul>
        {disagreements.map((disagreement) => (
          <li 
            key={disagreement._id} 
            // NEW: Add onClick handler to select the disagreement
            onClick={() => onSelectDisagreement(disagreement)}
            // NEW: Conditionally apply a different style for the selected item
            className={`p-2 rounded-md cursor-pointer ${
              selectedDisagreement?._id === disagreement._id 
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
    </div>
  );
}
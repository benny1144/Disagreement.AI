// client/src/components/NewDisagreementModal.tsx
'use client'; 

import { useState, FormEvent } from 'react';

interface NewDisagreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisagreementCreated: () => void;
}

export default function NewDisagreementModal({ isOpen, onClose, onDisagreementCreated }: NewDisagreementModalProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    // --- NEW: Get user info from local storage ---
    const userInfoString = localStorage.getItem('userInfo');
    if (!userInfoString) {
      console.error('No user info found');
      return;
    }
    const userInfo = JSON.parse(userInfoString);
    const token = userInfo.token;
    // -----------------------------------------

    try {
      // --- NEW: Add the Authorization header to the request ---
      const response = await fetch('/api/disagreements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      // ----------------------------------------------------

      if (!response.ok) {
        throw new Error('Failed to create disagreement');
      }
      
      onDisagreementCreated();
      onClose(); 
      setTitle(''); 

    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Start a New Disagreement</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="e.g., 'Freelance Project Payment Issue'"
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
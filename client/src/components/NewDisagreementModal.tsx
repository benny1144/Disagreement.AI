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
  const [aiMode, setAiMode] = useState('Fact-Finder');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      // The browser will automatically send the cookie. No need for headers!
      const response = await fetch('/api/disagreements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, aiMode }),
      });

      if (!response.ok) {
        throw new Error('Failed to create disagreement');
      }
      
      onDisagreementCreated();
      onClose(); 
      setTitle(''); 
      setAiMode('Fact-Finder');

    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    // The rest of your JSX for the modal form remains exactly the same
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Start a New Disagreement</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
              <input type="text" id="title" placeholder="e.g., 'Freelance Project Payment Issue'" className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label htmlFor="aiMode" className="block text-sm font-medium text-gray-300 mb-1">AI Role</label>
              <select
                id="aiMode"
                value={aiMode}
                onChange={(e) => setAiMode(e.target.value)}
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Fact-Finder</option>
                <option>Mediator</option>
                <option>Negotiator</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
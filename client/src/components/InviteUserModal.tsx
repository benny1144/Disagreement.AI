'use client';

import { useState, FormEvent } from 'react';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  disagreementId: string | null;
}

export default function InviteUserModal({ isOpen, onClose, disagreementId }: InviteUserModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!disagreementId) {
      setError('No disagreement selected. Please select a disagreement first.');
      return;
    }

    try {
      const response = await fetch(`/api/disagreements/${disagreementId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send invite.');
      }

      setEmail('');
      onClose();
    } catch (err: any) {
      console.error('Error sending invite:', err);
      setError(err.message);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Invite User</h2>
        <form onSubmit={handleInvite}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              User's Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
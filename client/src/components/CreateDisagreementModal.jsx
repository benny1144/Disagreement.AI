import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// CRITICAL FIX: Use the same robust API URL resolution as the rest of the application.
// This ensures the component works in both development and production environments.
const API_URL = import.meta.env.VITE_API_URL || '';
const DISAGREEMENTS_API_BASE = `${API_URL}/api/disagreements`;

function CreateDisagreementModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dialogRef = useRef(null); // Ref to control the native dialog element

  // Effect to programmatically control the dialog's visibility based on the isOpen prop
  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (isOpen && dialogNode && !dialogNode.open) {
      dialogNode.showModal();
    } else if (!isOpen && dialogNode && dialogNode.open) {
      dialogNode.close();
    }
  }, [isOpen]);

  // Effect to reset the form's state whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Please enter a title for your disagreement.');
      return;
    }

    let token = null;
    try {
      const stored = localStorage.getItem('user');
      if (stored) token = JSON.parse(stored)?.token;
    } catch {
      // Ignore localStorage parsing errors
    }

    if (!token) {
      setError('Authentication error. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        DISAGREEMENTS_API_BASE,
        { text: trimmedTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdDisagreement = response.data;

      // Notify the parent Dashboard component so it can update its list
      if (typeof onCreate === 'function') {
        onCreate({ created: createdDisagreement });
      }

      onClose(); // Close the modal on success

      // Navigate to the newly created disagreement page
      if (createdDisagreement?._id) {
        navigate(`/disagreement/${createdDisagreement._id}`);
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to create disagreement.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Prevent closing the modal while a submission is in progress
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <dialog ref={dialogRef} onClose={handleClose} className="bg-transparent backdrop:bg-black/50 p-0 rounded-xl w-full max-w-lg">
      <div className="bg-white rounded-xl shadow-xl">
        {/* We use a separate form element to handle submission */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Start a New Disagreement</h2>
            {/* The close button is a simple, accessible button */}
            <button
              type="button"
              onClick={handleClose}
              className="text-2xl font-light text-slate-500 hover:text-slate-800"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="disagreement-title" className="block text-slate-700 font-semibold mb-1">
                Title
              </label>
              <input
                id="disagreement-title"
                type="text"
                placeholder="e.g., Project Scope Discussion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* NOTE: The AI Role selector has been removed for now. It can be re-added here as a styled <select> when the backend API supports this feature. */}
          </div>

          {/* Inline error message provides a better UX than window.alert */}
          {error && <p className="mt-3 text-center text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500 text-lg disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export default CreateDisagreementModal;

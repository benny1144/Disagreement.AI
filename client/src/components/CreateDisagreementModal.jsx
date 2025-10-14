import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';
const DISAGREEMENTS_API_BASE = `${API_URL}/api/disagreements`;

function CreateDisagreementModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // NEW: State for the description
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dialogRef = useRef(null);

  // Effect to control the dialog's visibility
  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (isOpen && dialogNode && !dialogNode.open) {
      dialogNode.showModal();
    } else if (!isOpen && dialogNode && dialogNode.open) {
      dialogNode.close();
    }
  }, [isOpen]);

  // Effect to reset the form's state when the modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription(''); // NEW: Reset description
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim(); // NEW: Get trimmed description

    // UPDATED: Validate both fields
    if (!trimmedTitle || !trimmedDescription) {
      setError('Please provide both a title and a description.');
      return;
    }

    let token = null;
    try {
      token = JSON.parse(localStorage.getItem('user'))?.token;
    } catch {
      // Ignore errors
    }

    if (!token) {
      setError('Authentication error. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // UPDATED: Send the correct payload { title, description }
      const response = await axios.post(
        DISAGREEMENTS_API_BASE,
        { title: trimmedTitle, description: trimmedDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdDisagreement = response.data;

      if (typeof onCreate === 'function') {
        onCreate({ created: createdDisagreement });
      }

      onClose();

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
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <dialog ref={dialogRef} onClose={handleClose} className="bg-transparent backdrop:bg-black/50 p-0 rounded-xl w-full max-w-lg">
      <div className="bg-white rounded-xl shadow-xl">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Start a New Disagreement</h2>
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
            {/* Title Field */}
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
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* NEW: Description Field */}
            <div>
              <label htmlFor="disagreement-description" className="block text-slate-700 font-semibold mb-1">
                Brief Description
              </label>
              <textarea
                id="disagreement-description"
                placeholder="A 1-2 sentence, neutral summary of the issue."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="3"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

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

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// CRITICAL FIX: Use the same robust API URL resolution as the rest of the application.
// This ensures the component works in both development and production environments.
const API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = `${API_URL}/api/disagreements`;

function InviteUserModal({ isOpen, onClose, disagreementId, onSend }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const dialogRef = useRef(null);

  // Effect to programmatically control the dialog's visibility
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
      setEmail('');
      setError('');
      setSuccessMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter the user's email address.");
      return;
    }

    let token = null;
    try {
      const stored = localStorage.getItem('user');
      if (stored) token = JSON.parse(stored)?.token;
    } catch { /* Ignore localStorage errors */ }

    if (!token) {
      setError('Authentication error. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = `${API_BASE}/${disagreementId}/invite`;
      await axios.post(
        url,
        { email: trimmedEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage('Invitation sent successfully!');
      setEmail(''); // Clear the input on success

      if (typeof onSend === 'function') {
        onSend(trimmedEmail, disagreementId);
      }

      // Automatically close the modal after a short delay on success
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to send invite.';
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
    <dialog ref={dialogRef} onClose={handleClose} className="bg-transparent backdrop:bg-black/50 p-0 rounded-xl w-full max-w-md">
      <div className="bg-white rounded-xl shadow-xl">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Invite to Disagreement</h2>
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
              <label htmlFor="invite-email" className="block text-slate-700 font-semibold mb-1">
                User's Email
              </label>
              <input
                id="invite-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Inline feedback provides a much better UX than window.alert */}
          {error && <p className="mt-3 text-center text-red-600 text-sm">{error}</p>}
          {successMessage && <p className="mt-3 text-center text-green-600 text-sm">{successMessage}</p>}

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
              disabled={isSubmitting || !!successMessage}
              className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500 text-lg disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export default InviteUserModal;

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Use the robust API URL resolution for all API calls
const API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = `${API_URL}/api/disagreements`;

function InviteUserModal({ isOpen, onClose, disagreementId, publicInviteToken }) {
  const [invitees, setInvitees] = useState([{ name: '', email: '' }]);
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const dialogRef = useRef(null);

  const shareableLink = `${window.location.origin}/invite/${publicInviteToken}`;

  // Effect to control the dialog's visibility
  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (isOpen && dialogNode && !dialogNode.open) {
      dialogNode.showModal();
    } else if (!isOpen && dialogNode && dialogNode.open) {
      dialogNode.close();
    }
  }, [isOpen]);

  // Effect to reset form state when the modal opens
  useEffect(() => {
    if (isOpen) {
      setInvitees([{ name: '', email: '' }]);
      setCustomMessage('');
      setError('');
      setSuccessMessage('');
      setCopySuccess('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInviteeChange = (index, field, value) => {
    const newInvitees = [...invitees];
    newInvitees[index][field] = value;
    setInvitees(newInvitees);
  };

  const addInviteeField = () => {
    setInvitees([...invitees, { name: '', email: '' }]);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      setCopySuccess('Link copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }).catch(() => {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareableLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess('Link copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      } catch (err) {
        setCopySuccess('Failed to copy.');
      }
    });
  };
  
  const handleSubmitDirectInvites = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const validInvitees = invitees.filter(inv => inv.email.trim() !== '');
    if (validInvitees.length === 0) {
      setError("Please enter at least one email address.");
      return;
    }

    let token = null;
    try {
      token = JSON.parse(localStorage.getItem('user'))?.token;
    } catch { /* ignore */ }

    if (!token) {
      setError('Authentication error. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = `${API_BASE}/${disagreementId}/invite`;
      await axios.post(
        url,
        { invites: validInvitees, customMessage: customMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage('Invitations sent successfully!');
      setInvitees([{ name: '', email: '' }]); // Reset fields on success
      setCustomMessage('');

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to send invites.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <dialog ref={dialogRef} onClose={onClose} className="bg-transparent backdrop:bg-black/50 p-0 rounded-xl w-full max-w-lg">
      <div className="bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Invite Participants</h2>
          <button type="button" onClick={onClose} className="text-2xl font-light text-slate-500 hover:text-slate-800" aria-label="Close">&times;</button>
        </div>

        {/* Section A: Shareable Link */}
        <div className="space-y-2">
            <label className="block text-slate-700 font-semibold">Shareable Link</label>
            <p className="text-sm text-slate-500">Anyone who joins using this link will require your approval.</p>
            <div className="flex gap-2">
                <input type="text" readOnly value={shareableLink} className="flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-600 focus:outline-none"/>
                <button type="button" onClick={handleCopyLink} className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200">
                  {copySuccess ? copySuccess : 'Copy'}
                </button>
            </div>
        </div>

        <hr className="my-6"/>

        {/* Section B: Direct Email Invites */}
        <form onSubmit={handleSubmitDirectInvites} className="space-y-4">
          <div>
            <label className="block text-slate-700 font-semibold">Direct Invites</label>
            <p className="text-sm text-slate-500">Users invited directly via email will be automatically approved.</p>
          </div>

          {invitees.map((invitee, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Name (Optional)"
                value={invitee.name}
                onChange={(e) => handleInviteeChange(index, 'name', e.target.value)}
                className="w-full sm:w-1/3 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="name@example.com"
                value={invitee.email}
                onChange={(e) => handleInviteeChange(index, 'email', e.target.value)}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button type="button" onClick={addInviteeField} className="text-sm font-semibold text-blue-600 hover:text-blue-500">+ Add another invitee</button>

          <div>
              <label htmlFor="custom-message" className="block text-slate-700 font-semibold mb-1">Custom Message (Optional)</label>
              <textarea
                id="custom-message"
                placeholder="Add a personal message to your invitation..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows="3"
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>

          {error && <p className="text-center text-red-600 text-sm">{error}</p>}
          {successMessage && <p className="text-center text-green-600 text-sm">{successMessage}</p>}
          
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-lg disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting || !!successMessage} className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500 text-lg disabled:bg-blue-300 disabled:cursor-not-allowed">
              {isSubmitting ? 'Sending...' : 'Send Invites'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export default InviteUserModal;

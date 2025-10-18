import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';
const DISAGREEMENTS_API_BASE = `${API_URL}/api/disagreements`;
const AI_API_BASE = `${API_URL}/api/ai`;

function CreateDisagreementModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // NEW: State for the description
  const [aiReady, setAiReady] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const descRef = useRef(null);

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
      setAiReady(false);
      setAiLoading(false);
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setError('Please provide both a title and a description.');
      return;
    }

    // Step 1: If we haven't generated AI suggestions yet, do that first
    if (!aiReady) {
      setAiLoading(true);
      try {
        const [descRes, titleRes] = await Promise.all([
          axios.post(`${AI_API_BASE}/summarize-description`, { description: trimmedDescription }),
          axios.post(`${AI_API_BASE}/summarize-title`, { title: trimmedTitle, description: trimmedDescription }),
        ]);
        const summary = (descRes?.data?.summary || '').toString().trim();
        const nextDesc = summary || trimmedDescription;
        const newTitle = (titleRes?.data?.title || '').toString().trim();
        const nextTitle = newTitle || trimmedTitle;
        setDescription(nextDesc);
        setTitle(nextTitle);
        setAiReady(true);
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || 'Failed to generate AI suggestions. You can refine manually.';
        setError(message);
        // Allow user to refine manually with their original inputs
        setAiReady(true);
        setDescription(trimmedDescription);
        setTitle(trimmedTitle);
      } finally {
        setAiLoading(false);
      }
      return; // Stop here; user will now see Accept & Create / Refine options
    }

    // Step 2: Proceed with creating the disagreement using the (possibly refined) description
    let token = null;
    try {
      token = JSON.parse(localStorage.getItem('user'))?.token;
    } catch {}

    if (!token) {
      setError('Authentication error. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        DISAGREEMENTS_API_BASE,
        { title: trimmedTitle, description: description.trim() },
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
                placeholder="Title this disagreement"
                maxLength="40"
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
                placeholder="Describe what this disagreement is about."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="3"
                ref={descRef}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-center text-red-600 text-sm">{error}</p>}

          <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 mt-6">
            <div className="text-xs text-slate-500">
              {aiReady ? 'Review the AI-generated description. You can refine it before creating.' : 'We’ll generate a neutral, one-sentence summary from your description.'}
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting || aiLoading}
                className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-lg disabled:opacity-50"
              >
                Cancel
              </button>
              {aiReady ? (
                <>
                  <button
                    type="button"
                    onClick={() => { try { descRef.current?.focus(); } catch {} }}
                    className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-lg"
                  >
                    Refine
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500 text-lg disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating...' : 'Accept & Create'}
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-5 py-2 rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500 text-lg disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {aiLoading ? 'Generating…' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export default CreateDisagreementModal;

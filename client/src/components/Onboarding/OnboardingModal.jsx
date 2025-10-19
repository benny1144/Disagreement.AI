import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

/**
 * OnboardingModal (Tailwind refactor)
 * Spec: client/src/components/Onboarding/spec.md
 * - 3-step intro with tabs
 * - Primary CTA "Get Started" triggers backend API to mark onboarding complete
 *
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onComplete?: function (optional) called after API call succeeds
 */
function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Simple, stable emoji icons to avoid extra icon packages
  const steps = useMemo(
    () => [
      {
        key: 'state-your-case',
        emoji: '📝',
        title: '1. State Your Case',
        body:
          'Clearly explain your side of the story. Provide all the relevant facts and evidence to build your case.',
      },
      {
        key: 'ai-analyzes',
        emoji: '✨',
        title: '2. AI Analyzes',
        body:
          'Our impartial AI analyzes the conversation, identifies key points of agreement and disagreement, and may ask clarifying questions.',
      },
      {
        key: 'reach-agreement',
        emoji: '🤝',
        title: '3. Reach Agreement',
        body:
          'The AI drafts a neutral summary and a proposed resolution to help all parties find common ground and formally agree.',
      },
    ],
    []
  );

  const closeAndReset = () => {
    setTabIndex(0);
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handlePrev = () => setTabIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setTabIndex((i) => Math.min(steps.length - 1, i + 1));

  const handleGetStarted = async () => {
    // Per spec Section 5.0: close first, then call API
    closeAndReset();

    try {
      setSubmitting(true);
      // Pull token from localStorage
      const stored = localStorage.getItem('user');
      if (!stored) {
        const err = new Error('Not authenticated');
        try {
          if (typeof window !== 'undefined' && typeof window.alert === 'function') {
            window.alert(`Failed to update onboarding status. You can continue using the app.\n\n${err.message}`);
          }
        } catch (_) {}
        if (typeof onComplete === 'function') {
          onComplete({ success: false, error: err });
        }
        setSubmitting(false);
        return;
      }
      const user = JSON.parse(stored);
      const token = user?.token;
      if (!token) {
        const err = new Error('Missing auth token');
        try {
          if (typeof window !== 'undefined' && typeof window.alert === 'function') {
            window.alert(`Failed to update onboarding status. You can continue using the app.\n\n${err.message}`);
          }
        } catch (_) {}
        if (typeof onComplete === 'function') {
          onComplete({ success: false, error: err });
        }
        setSubmitting(false);
        return;
      }

      const url = 'http://localhost:3000/api/users/me/onboarding-complete';
      await axios.patch(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      // Persist locally so we do not show again
      try {
        const updated = { ...user, hasCompletedOnboarding: true };
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (_) {
        // ignore localStorage failures
      }

      if (typeof onComplete === 'function') {
        onComplete({ success: true });
      }
    } catch (err) {
      // Non-blocking error handling; the modal is already closed per spec order
      try {
        if (typeof window !== 'undefined' && typeof window.alert === 'function') {
          window.alert(
            `Failed to update onboarding status. You can continue using the app.\n\n${
              err?.response?.data?.message || err?.message || 'Unknown error'
            }`
          );
        }
      } catch (_) {}
      if (typeof onComplete === 'function') {
        onComplete({ success: false, error: err });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Close on Escape while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeAndReset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeAndReset}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 id="onboarding-title" className="text-lg font-bold text-slate-900">
            Welcome to Disagreement.AI
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Tabs header */}
          <div className="grid grid-cols-3 gap-2 mb-4" role="tablist" aria-label="Onboarding steps">
            {steps.map((s, i) => {
              const isActive = i === tabIndex;
              const label = s.title.split('.')[0];
              return (
                <button
                  key={s.key}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${s.key}`}
                  id={`tab-${s.key}`}
                  onClick={() => setTabIndex(i)}
                  className={
                    'px-3 py-2 rounded-md text-sm font-semibold transition-colors ' +
                    (isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Active panel */}
          {steps.map((s, i) => (
            <div
              key={s.key}
              role="tabpanel"
              id={`panel-${s.key}`}
              aria-labelledby={`tab-${s.key}`}
              hidden={i !== tabIndex}
              className="px-1"
            >
              {i === tabIndex && (
                <div className="flex flex-col items-center text-center gap-3 py-2">
                  <div className="text-[48px] select-none" aria-hidden>
                    {s.emoji}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                  <p className="text-slate-600">{s.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200">
          <div className="w-full flex items-center justify-between">
            <button
              type="button"
              onClick={closeAndReset}
              className="px-4 py-2 rounded-md text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <div className="flex items-center gap-2">
              {tabIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
              )}
              {tabIndex < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGetStarted}
                  disabled={submitting}
                  className={
                    'px-4 py-2 rounded-md font-semibold shadow-sm text-white ' +
                    (submitting
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500')
                  }
                >
                  {submitting ? 'Starting…' : 'Get Started'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;

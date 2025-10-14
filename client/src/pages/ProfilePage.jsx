import React, { useEffect, useState } from 'react'

export default function ProfilePage() {
  const [user, setUser] = useState({ name: '', email: '' })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const parsed = JSON.parse(raw)
        setUser({
          name: parsed?.name || '',
          email: parsed?.email || '',
        })
      }
    } catch (_) {
      // If parsing fails, treat as no user
    } finally {
      setLoaded(true)
    }
  }, [])

  const displayName = user.name || 'Unknown User'
  const displayEmail = user.email || '—'

  // Simple initials from name for placeholder avatar
  const initials = (user.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || '👤'

  return (
    <div className="bg-white px-4 md:px-6 lg:px-8 py-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Profile</h1>
          <p className="text-slate-600 mt-1">Manage your account information and preferences.</p>
        </header>

        {/* User details card */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          {!loaded ? (
            <p className="text-slate-500">Loading…</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-lg select-none">
                {initials}
              </div>
              <div>
                <div className="text-xl font-bold text-slate-800">{displayName}</div>
                <div className="text-slate-600">{displayEmail}</div>
              </div>
            </div>
          )}
        </section>

        {/* Placeholder: Profile Picture */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Profile Picture</h2>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Coming Soon</span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl text-slate-400" aria-hidden>
              👤
            </div>
            <p className="text-slate-500 text-sm max-w-prose">You’ll be able to upload a profile photo to personalize your account.</p>
          </div>
        </section>

        {/* Placeholder: Bio */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Bio</h2>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Coming Soon</span>
          </div>
          <p className="text-slate-500 text-sm mt-2">Add a short bio to introduce yourself.</p>
          <textarea
            disabled
            rows={4}
            placeholder="Tell others a bit about yourself…"
            className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-base text-slate-500 bg-slate-50 cursor-not-allowed"
            aria-disabled="true"
            title="Coming Soon"
          />
        </section>

        {/* Placeholder: Account Settings */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Account Settings</h2>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Coming Soon</span>
          </div>
          <nav className="mt-4">
            <ul className="space-y-2 text-slate-500">
              <li>
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border border-slate-200 cursor-not-allowed" aria-disabled="true" title="Coming Soon">
                  <span className="w-2 h-2 rounded-full bg-slate-300" aria-hidden></span>
                  Change Password
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border border-slate-200 cursor-not-allowed" aria-disabled="true" title="Coming Soon">
                  <span className="w-2 h-2 rounded-full bg-slate-300" aria-hidden></span>
                  Notification Preferences
                </span>
              </li>
            </ul>
          </nav>
        </section>
      </div>
    </div>
  )
}

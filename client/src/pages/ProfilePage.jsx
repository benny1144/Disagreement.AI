import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link to="/dashboard" className="text-blue-600 hover:underline text-sm">← Back to Dashboard</Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Your Profile</h1>
            <p className="text-slate-500 mt-1">Manage your account details.</p>
          </div>
          <hr/>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Name</label>
              <p className="text-slate-900 font-semibold mt-1">{user?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <p className="text-slate-900 font-semibold mt-1">{user?.email}</p>
            </div>
          </div>
          <hr/>
          <div>
            <h2 className="text-lg font-bold text-red-600">Delete Account</h2>
            <p className="text-slate-500 mt-1 text-sm">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <Button className="mt-4 bg-red-600 hover:bg-red-500 text-white">Delete My Account</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

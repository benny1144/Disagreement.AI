import React from 'react'
import { Outlet } from 'react-router-dom'
import PublicHeader from '@/components/layout/PublicHeader'
import Footer from '@/components/landing/Footer'

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <PublicHeader />
      <main className="flex-grow">{children || <Outlet />}</main>
      <Footer />
    </div>
  )
}

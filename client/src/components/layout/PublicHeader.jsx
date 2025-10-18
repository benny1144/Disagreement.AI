import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function PublicHeader() {
  const [open, setOpen] = useState(false)
  const firstLinkRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    if (open) {
      window.addEventListener("keydown", onKeyDown)
    }
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  // Move focus to first link when opening
  useEffect(() => {
    if (open && firstLinkRef.current) {
      // slight delay to ensure it is focusable in DOM
      setTimeout(() => firstLinkRef.current?.focus(), 0)
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="font-bold text-xl text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2667FF] rounded-sm">
          DIS<span style={{ color: "#2667FF" }}>AGREEMENT</span>.AI
        </a>

        {/* Desktop actions */}
        <div className="flex items-center gap-2">
          <Link to={{ pathname: '/login' }}>
            <Button variant="outline" className="rounded-full px-4 text-sm">
              Login
            </Button>
          </Link>
          <Link to={{ pathname: '/register' }}>
            <Button className="bg-[#2667FF] hover:bg-[#1f54cc] text-white rounded-full px-5">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger (hidden to ensure desktop links are always visible) */}
        <div className="hidden">
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="public-header-menu"
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-md text-foreground hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2667FF]"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down panel (hidden because hamburger is hidden) */}
      <div id="public-header-menu" className="hidden">
        <div className="px-4 py-2 flex flex-col gap-2">
          <Link ref={firstLinkRef} to={{ pathname: '/login' }} className="w-full" onClick={() => setOpen(false)}>
            <Button variant="outline" className="w-full justify-center rounded-full">
              Login
            </Button>
          </Link>
          <Link to={{ pathname: '/register' }} className="w-full" onClick={() => setOpen(false)}>
            <Button className="w-full justify-center bg-[#2667FF] hover:bg-[#1f54cc] text-white rounded-full">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

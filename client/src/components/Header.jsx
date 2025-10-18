import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to={{ pathname: '/dashboard' }} className="inline-block" aria-label="Go to dashboard">
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-blue-600">DIS</span>
            <span className="text-slate-800">AGREEMENT</span>
            <span className="text-blue-600">.AI</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

export default Header;

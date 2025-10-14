import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-block py-4" aria-label="Go to homepage">
          <span className="text-2xl font-extrabold text-slate-800">Disagreement.</span>
          <span className="text-2xl font-extrabold text-blue-600">AI</span>
        </Link>
      </div>
    </header>
  );
}

export default Header;

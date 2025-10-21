import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-center items-center text-sm text-slate-600">
        <p className="whitespace-nowrap flex items-center gap-3">
          <span>©2025 Disagreement.AI</span>
          <Link to={{ pathname: '/privacy' }} className="hover:text-slate-800">Privacy</Link>
          <Link to={{ pathname: '/terms' }} className="hover:text-slate-800">Terms</Link>
          <Link to={{ pathname: '/app/contact' }} className="hover:text-slate-800">Contact</Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer;

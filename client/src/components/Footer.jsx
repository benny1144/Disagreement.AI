import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm text-slate-500">
        <div>© 2025 Disagreement.AI, Inc.</div>
        <nav aria-label="Footer Navigation">
          <ul className="flex gap-6">
            <li>
              <Link to={{ pathname: '/privacy' }} className="hover:text-slate-800">Privacy</Link>
            </li>
            <li>
              <Link to={{ pathname: '/terms' }} className="hover:text-slate-800">Terms</Link>
            </li>
            <li>
              <Link to={{ pathname: '/app/contact' }} className="hover:text-slate-800">Contact Us</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;

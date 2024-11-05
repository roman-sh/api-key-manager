'use client';
import { useState } from 'react';

export default function UserMenu({ userEmail, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
      >
        <div className="w-12 h-12 bg-[#9575cd] hover:bg-[#7e57c2] transition-colors rounded-full flex items-center justify-center text-white">
          <svg 
            className="w-6 h-6" 
            fill="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              fillRule="evenodd" 
              d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 8a6 6 0 1112 0A6 6 0 016 8zm2 10a3 3 0 00-3 3 1 1 0 11-2 0 5 5 0 015-5h8a5 5 0 015 5 1 1 0 11-2 0 3 3 0 00-3-3H8z" 
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
          <div className="px-4 py-2 text-sm text-gray-700 border-b">
            {userEmail}
          </div>
          <div
            onClick={onLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign out
          </div>
        </div>
      )}
    </div>
  );
} 
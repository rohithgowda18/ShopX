import React from 'react';
import { useNavigate } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50 dark:bg-gray-900 safe-area-pb">
      <div className="text-8xl mb-4">🔍</div>
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs text-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold px-5 py-3 rounded-xl hover:bg-gray-300 active:scale-95 transition-all min-h-touch"
        >
          <ArrowLeft className="w-5 h-5" /> Go Back
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-green-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-green-700 active:scale-95 transition-all min-h-touch shadow-md"
        >
          <Home className="w-5 h-5" /> Go Home
        </button>
      </div>
    </div>
  );
}

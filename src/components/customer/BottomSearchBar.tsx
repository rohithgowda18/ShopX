import React from 'react';
import { Search, X, Mic, Camera } from 'lucide-react';

interface BottomSearchBarProps {
  query: string;
  onChange: (val: string) => void;
  onVoiceClick: () => void;
  onCameraClick: () => void;
}

export default function BottomSearchBar({ query, onChange, onVoiceClick, onCameraClick }: BottomSearchBarProps) {
  return (
    <div className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md pt-2 pb-4 px-4 w-full">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Search Akki, Rice, ಅಕ್ಕಿ..."
          value={query}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-4 pl-12 pr-24 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-md text-gray-900 dark:text-white h-14"
        />
        {query ? (
          <button 
            onClick={() => onChange('')}
            className="absolute right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <div className="absolute right-3 flex items-center gap-1">
            <button 
              onClick={onVoiceClick}
              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
            >
              <Mic className="w-6 h-6" />
            </button>
            <button 
              onClick={onCameraClick}
              className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-full transition-colors"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

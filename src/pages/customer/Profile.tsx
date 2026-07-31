import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Phone, Globe, LogOut, Moon, Sun, Monitor } from 'lucide-react';

export default function Profile() {
  const { userProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [voiceLang, setVoiceLang] = React.useState(localStorage.getItem('voiceLanguage') || 'kn-IN');

  const handleVoiceLangChange = (lang: string) => {
    setVoiceLang(lang);
    localStorage.setItem('voiceLanguage', lang);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Profile</h2>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center transition-colors">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <User className="w-12 h-12 text-green-600 dark:text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{userProfile?.name || 'User'}</h3>
        <p className="text-gray-500 dark:text-gray-400 capitalize">{userProfile?.role.replace('_', ' ')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-4">Theme Preferences</p>
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'light' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <Sun className="w-4 h-4" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'dark' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all ${theme === 'system' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <Monitor className="w-4 h-4" />
              <span>Auto</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Phone Number</p>
            <p className="font-medium text-gray-800 dark:text-white">{userProfile?.phone}</p>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Voice Input Language</p>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
            <button
              onClick={() => handleVoiceLangChange('kn-IN')}
              className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all ${voiceLang === 'kn-IN' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Kannada
            </button>
            <button
              onClick={() => handleVoiceLangChange('en-IN')}
              className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all ${voiceLang === 'en-IN' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              English
            </button>
            <button
              onClick={() => handleVoiceLangChange('hi-IN')}
              className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all ${voiceLang === 'hi-IN' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Hindi
            </button>
          </div>
        </div>

        <button 
          onClick={signOut}
          className="w-full p-4 flex items-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center shrink-0 mr-4">
            <LogOut className="w-5 h-5 text-red-500 dark:text-red-400" />
          </div>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

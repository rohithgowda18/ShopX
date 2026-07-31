import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Phone, Globe, LogOut, Moon, Sun, Monitor, ShieldCheck } from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui/DesignSystem';
import InstallAppButton from '../../components/ui/InstallAppButton';

export default function Profile() {
  const { userProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [voiceLang, setVoiceLang] = React.useState(localStorage.getItem('voiceLanguage') || 'kn-IN');

  const handleVoiceLangChange = (lang: string) => {
    setVoiceLang(lang);
    localStorage.setItem('voiceLanguage', lang);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto pb-24">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <User className="w-7 h-7 text-emerald-600" /> Account Profile
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Manage your personal details, language preferences, and app theme
        </p>
      </div>

      <Card className="p-6 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <User className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{userProfile?.name || 'Customer Profile'}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-3">{userProfile?.role.replace('_', ' ') || 'User'}</p>
        <Badge variant="success" className="capitalize">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Active Account
        </Badge>
      </Card>

      <Card className="divide-y divide-gray-100 dark:divide-gray-700/60 overflow-hidden">
        {/* Theme Preference */}
        <div className="p-4 md:p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-3">Theme Preferences</p>
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all min-h-touch ${theme === 'light' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'}`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all min-h-touch ${theme === 'dark' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'}`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all min-h-touch ${theme === 'system' ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'}`}
            >
              <Monitor className="w-4 h-4 text-emerald-500" />
              <span>System</span>
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-4 md:p-5 flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700/60 rounded-xl flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Phone / Contact</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{userProfile?.phone || '+91 Unspecified'}</p>
          </div>
        </div>

        {/* Voice Recognition Language */}
        <div className="p-4 md:p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700/60 rounded-xl flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Voice Recognition Language</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Controls audio parsing for AI grocery lists</p>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl">
            <button
              onClick={() => handleVoiceLangChange('kn-IN')}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-xs font-bold transition-all min-h-touch ${voiceLang === 'kn-IN' ? 'bg-white dark:bg-gray-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Kannada
            </button>
            <button
              onClick={() => handleVoiceLangChange('en-IN')}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-xs font-bold transition-all min-h-touch ${voiceLang === 'en-IN' ? 'bg-white dark:bg-gray-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              English
            </button>
            <button
              onClick={() => handleVoiceLangChange('hi-IN')}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-xs font-bold transition-all min-h-touch ${voiceLang === 'hi-IN' ? 'bg-white dark:bg-gray-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Hindi
            </button>
          </div>
        </div>

        {/* Secondary App Install Banner */}
        <div className="p-4 md:p-5">
          <InstallAppButton />
        </div>

        {/* Sign Out Button */}
        <div className="p-4 md:p-5">
          <Button onClick={signOut} variant="danger" className="w-full justify-center">
            <LogOut className="w-5 h-5 mr-2" /> Sign Out of Account
          </Button>
        </div>
      </Card>
    </div>
  );
}

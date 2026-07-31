import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Home, ListPlus, Clock, User, LogOut, Settings, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AppLayout() {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        alert('To install on iPhone/iPad: Tap Share button in Safari and select "Add to Home Screen" 📲');
      } else {
        alert('To install app: Open browser menu (⋮ or ⊕) and tap "Install app" or "Add to Home screen".');
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = userProfile?.role === 'customer' ? [
    { icon: <Home className="w-6 h-6" />, label: 'Home', path: '/customer' },
    { icon: <ListPlus className="w-6 h-6" />, label: 'Create List', path: '/customer/create-list' },
    { icon: <Clock className="w-6 h-6" />, label: 'Orders', path: '/customer/orders' },
    { icon: <User className="w-6 h-6" />, label: 'Profile', path: '/customer/profile' },
  ] : [
    { icon: <Home className="w-6 h-6" />, label: 'Dashboard', path: '/shop' },
    { icon: <Clock className="w-6 h-6" />, label: 'Orders', path: '/shop/orders' },
    { icon: <ListPlus className="w-6 h-6" />, label: 'Products', path: '/shop/products' },
    { icon: <Settings className="w-6 h-6" />, label: 'Settings', path: '/shop/settings' },
  ];

  return (
    <div className="h-[100dvh] bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row w-full max-w-7xl mx-auto shadow-2xl relative transition-colors duration-200 overflow-hidden">
      {/* Sidebar for Desktop (md+) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shrink-0">
        <div className="p-6 flex items-center space-x-3 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Kirana AI</h1>
            <p className="text-xs text-gray-500 capitalize">{userProfile?.role?.replace('_', ' ') || 'User'}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700/50 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition-all min-h-touch"
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 font-semibold transition-all min-h-touch"
              title="Install Kirana AI App"
            >
              <Download className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold">Install App</span>
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-all min-h-touch"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Header for Mobile (<md) */}
      <header className="md:hidden bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b dark:border-gray-700 z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Kirana AI</h1>
        </div>
        <div className="flex items-center space-x-1">
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 p-2 rounded-xl transition-colors min-h-touch min-w-touch flex items-center justify-center"
              title="Install App"
              aria-label="Install App"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={handleSignOut} 
            className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 min-h-touch min-w-touch flex items-center justify-center"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile (<md) */}
      <nav className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around items-center py-2 px-2 w-full z-10 shrink-0 safe-area-pb transition-colors duration-200">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center w-16 h-12 rounded-lg text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all focus:outline-none min-h-touch"
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

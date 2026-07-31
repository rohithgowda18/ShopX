import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, Info } from 'lucide-react';
import { Card, Button } from './DesignSystem';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect if app is already running as PWA (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

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
    } else if (isIOS) {
      alert('To install on iPhone/iPad: Tap the Share button in Safari and select "Add to Home Screen" 📲');
    } else {
      alert('To install on Desktop/Android: Open your browser menu (⋮ or ⊕) and tap "Install app" or "Add to Home screen".');
    }
  };

  if (isInstalled) {
    return (
      <Card className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Kirana AI Installed</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Running in native app mode</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-2 border-emerald-500/40 dark:border-emerald-500/60 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-emerald-900/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start space-x-3.5">
        <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0 text-xl">
          📱
        </div>
        <div>
          <h4 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            Install Kirana AI
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1 leading-relaxed max-w-lg">
            Install the app on your phone for faster access, offline support, and a full-screen experience.
          </p>
        </div>
      </div>
      <Button onClick={handleInstallClick} variant="primary" size="md" className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 py-3 px-5 shadow-md">
        <Download className="w-4 h-4" /> {deferredPrompt ? 'Install App' : 'How to Install'}
      </Button>
    </Card>
  );
}

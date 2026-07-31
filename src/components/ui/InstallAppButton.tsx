import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle } from 'lucide-react';
import { Card, Button } from './DesignSystem';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
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
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <Card className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Kirana AI App Installed</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Running in native app mode</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!deferredPrompt) {
    return null; // Hide button if installation isn't available or already installed
  }

  return (
    <Card className="p-4 border-2 border-emerald-500/30 dark:border-emerald-500/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <Smartphone className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">Install Kirana AI App</h4>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Install on your phone for faster 1-tap grocery access.</p>
        </div>
      </div>
      <Button onClick={handleInstallClick} variant="primary" size="sm" className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 py-2.5">
        <Download className="w-4 h-4" /> Install App
      </Button>
    </Card>
  );
}

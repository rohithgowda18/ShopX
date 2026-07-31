import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { getDeferredInstallPrompt, subscribeInstallPrompt } from '../../pwa';

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(getDeferredInstallPrompt());
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone PWA mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Subscribe to global beforeinstallprompt event state
    const unsubscribe = subscribeInstallPrompt((prompt) => {
      setDeferredPrompt(prompt);
      if (!prompt && isStandalone) {
        setIsInstalled(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || getDeferredInstallPrompt();
    if (promptEvent) {
      // Trigger native browser install prompt dialog directly
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        console.log('PWA installed');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Show fallback alert instructions if beforeinstallprompt is unsupported/not fired yet
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        alert('To install on iPhone/iPad:\n1. Tap the Share icon in Safari (bottom toolbar)\n2. Select "Add to Home Screen" 📲');
      } else {
        alert("Open the browser menu (⋮ or ⊕) and choose 'Install app' or 'Add to Home screen'.");
      }
    }
  };

  if (isInstalled) return null;

  return (
    <button
      id="installBtn"
      type="button"
      onClick={handleInstallClick}
      className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold min-h-touch active:scale-95 shadow-sm"
      title="Install Kirana AI App"
      aria-label="Install Kirana AI App"
    >
      <Download className="w-4 h-4" />
      <span>Install App</span>
    </button>
  );
}

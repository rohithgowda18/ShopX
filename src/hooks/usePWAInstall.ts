import { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // 1. Detect Standalone / Installed Mode
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      return isStandaloneMedia || isIOSStandalone;
    };

    if (checkStandalone()) {
      setIsInstalled(true);
    }

    // 2. Detect Platform
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
    setIsAndroid(/android/.test(ua));

    // 3. Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 4. Listen for appinstalled event
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

  const triggerInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.error('[PWA Hook] Install prompt failed:', err);
      } finally {
        setDeferredPrompt(null);
      }
    } else {
      if (isIOS) {
        alert('To install on iPhone/iPad:\n1. Tap the Share button in Safari\n2. Select "Add to Home Screen" 📲');
      } else {
        alert("To install Kirana AI:\n1. Open browser menu (⋮ or ⊕)\n2. Select 'Install app' or 'Add to Home screen'.");
      }
    }
  };

  return {
    canInstall: !isInstalled && (!!deferredPrompt || isIOS || true),
    isInstalled,
    isIOS,
    isAndroid,
    triggerInstall,
    hasNativePrompt: !!deferredPrompt,
  };
}

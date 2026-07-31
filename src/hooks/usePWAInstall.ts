// Global window listener for beforeinstallprompt captured before React mounts
import { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA Global] Captured beforeinstallprompt event before React mount!');
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach(fn => fn(globalDeferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA Global] App was installed successfully');
    globalDeferredPrompt = null;
    promptListeners.forEach(fn => fn(null));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
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

    // 2. Platform detection
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
    setIsAndroid(/android/.test(ua));

    // 3. Subscribe to prompt listener
    const unsubscribe = (prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
      if (!prompt && checkStandalone()) {
        setIsInstalled(true);
      }
    };

    promptListeners.add(unsubscribe);
    return () => {
      promptListeners.delete(unsubscribe);
    };
  }, []);

  const triggerInstall = async () => {
    const activePrompt = deferredPrompt || globalDeferredPrompt;
    if (activePrompt) {
      console.log('[PWA Hook] Triggering native browser install prompt dialog');
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        console.log('[PWA Hook] User install choice:', choice.outcome);
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.error('[PWA Hook] Error executing prompt():', err);
      } finally {
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
      }
    } else {
      console.warn('[PWA Hook] beforeinstallprompt event is not available in current window/browser context.');
      if (isIOS) {
        alert('To install on iPhone/iPad:\n1. Tap the Share button in Safari\n2. Select "Add to Home Screen" 📲');
      } else {
        alert("To install Namma Angadi:\n1. Open browser menu (⋮ or ⊕)\n2. Select 'Install app' or 'Add to Home screen'.");
      }
    }
  };

  return {
    canInstall: !isInstalled && (!!deferredPrompt || !!globalDeferredPrompt || isIOS),
    isInstalled,
    isIOS,
    isAndroid,
    triggerInstall,
    hasNativePrompt: !!(deferredPrompt || globalDeferredPrompt),
  };
}

import React, { useState, useEffect } from 'react';
import { Download, X, ShieldCheck } from 'lucide-react';
import { Button } from './DesignSystem';
import { getDeferredInstallPrompt, subscribeInstallPrompt } from '../../pwa';

export default function InstallAppModalTrigger() {
  const [deferredPrompt, setDeferredPrompt] = useState(getDeferredInstallPrompt());
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check standalone mode (already installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    const unsubscribe = subscribeInstallPrompt((prompt) => {
      setDeferredPrompt(prompt);
      if (!prompt && isStandalone) {
        setIsInstalled(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInstallConfirm = async () => {
    const promptEvent = deferredPrompt || getDeferredInstallPrompt();
    if (promptEvent) {
      setShowModal(false);
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.error('[PWA Component] Error executing native install prompt:', err);
      } finally {
        setDeferredPrompt(null);
      }
    } else {
      setShowModal(false);
      
      // Check if Chrome has native install capability or triggered Chrome menu
      if ('serviceWorker' in navigator && (window as any).BeforeInstallPromptEvent) {
        alert('Chrome is preparing the app installation. Please wait a few seconds, or open Chrome menu (⋮) and tap "Install app"!');
      } else if (isIOS) {
        alert('To install on iPhone/iPad:\n1. Tap Share icon in Safari (bottom toolbar)\n2. Scroll down & select "Add to Home Screen" 📲');
      } else {
        alert('To install Kirana AI:\n1. Open your browser menu (⋮ or ⊕ at top right)\n2. Tap "Install app" or "Add to Home screen".');
      }
    }
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Header Button / Trigger */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold min-h-touch"
        title="Install Kirana AI App"
        aria-label="Install Kirana AI App"
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-5 transition-colors">
            
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg font-bold text-2xl">
                K
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Install Kirana AI?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 leading-relaxed">
                Add Kirana AI to your home screen for instant 1-tap grocery list creation, offline support, and full-screen speed.
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Instant Home Screen Access
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Fast Offline List Storage
              </div>
            </div>

            <div className="flex space-x-3 pt-1">
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1 text-gray-700 dark:text-gray-300 py-3"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleInstallConfirm}
                variant="primary"
                className="flex-1 py-3 shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

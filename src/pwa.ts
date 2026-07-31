// Global PWA Install Prompt listener initialized before React renders
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA Global] beforeinstallprompt fired early before React mount!');
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
  listeners.forEach(cb => cb(deferredPrompt));
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA Global] appinstalled fired');
  deferredPrompt = null;
  listeners.forEach(cb => cb(null));
});

export function getDeferredInstallPrompt() {
  return deferredPrompt;
}

export function subscribeInstallPrompt(cb: (prompt: BeforeInstallPromptEvent | null) => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

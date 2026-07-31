import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';
import App from './App.tsx';
import './index.css';

// Register Service Worker with clean update notifications
const updateSW = registerSW({
  onNeedRefresh() {
    toast('New update available!', {
      description: 'Click reload to update Kirana AI to the latest version.',
      action: {
        label: 'Reload App',
        onClick: () => updateSW(true),
      },
      duration: Infinity,
    });
  },
  onOfflineReady() {
    console.log('[PWA] Kirana AI is ready for offline use.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

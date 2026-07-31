import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './pwa';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA auto updates and offline capability
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('[PWA] New content available, refresh needed');
  },
  onOfflineReady() {
    console.log('[PWA] App is ready to work offline');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

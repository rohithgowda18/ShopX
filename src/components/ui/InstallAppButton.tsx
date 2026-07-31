import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function InstallAppButton() {
  const { isInstalled, triggerInstall } = usePWAInstall();
  const [loading, setLoading] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    setLoading(true);
    try {
      await triggerInstall();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold min-h-touch active:scale-95 shadow-sm disabled:opacity-50"
      title="Install Kirana AI App"
      aria-label="Install Kirana AI App"
    >
      <Download className={`w-4 h-4 ${loading ? 'animate-bounce' : ''}`} />
      <span>{loading ? 'Installing...' : 'Install App'}</span>
    </button>
  );
}

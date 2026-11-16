import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Hide if already running as an installed standalone app
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone || sessionStorage.getItem('pwa_banner_dismissed')) {
      setDismissed(true);
      return;
    }

    // Detect iOS Safari
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    if (isIos) {
      setShowIosGuide(true);
    }

    // Capture Chrome / Android / Edge install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (dismissed || (!deferredPrompt && !showIosGuide)) return null;

  return (
    <div className="bg-indigo-950 text-white px-4 py-3 rounded-2xl border border-indigo-700/60 shadow-lg flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center space-x-3">
        <img src="/icon.svg" alt="Edusparkls" className="w-9 h-9 rounded-xl shrink-0" />
        <div>
          <p className="text-xs font-black text-amber-300">Install Edusparkls App</p>
          {deferredPrompt ? (
            <p className="text-[11px] text-indigo-200">
              Add to your home screen for full-screen quizzes & reading tracking.
            </p>
          ) : (
            <p className="text-[11px] text-indigo-200 flex items-center flex-wrap gap-1">
              Tap <Share className="w-3.5 h-3.5 inline text-amber-300" /> <strong>Share</strong> then <strong>"Add to Home Screen"</strong>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs transition flex items-center space-x-1 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="p-1.5 text-indigo-300 hover:text-white rounded-lg transition"
          aria-label="Dismiss install banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
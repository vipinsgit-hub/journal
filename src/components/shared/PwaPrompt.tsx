import React, { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare, WifiOff, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Online / Offline Listener
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Android / Windows / Chrome PWA install prompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user previously dismissed prompt
      const hasDismissed = localStorage.getItem('pipledger_pwa_dismissed');
      if (!hasDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. App Installed Listener
    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 4000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Detect iOS / iPadOS Safari
  const isIos = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }, []);

  const isStandalone = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIos && !isStandalone) {
        setShowIosModal(true);
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('PWA install error:', err);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pipledger_pwa_dismissed', 'true');
  };

  return (
    <>
      {/* 1. Offline Indicator Banner */}
      {isOffline && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 px-4 py-2 text-xs flex items-center justify-center gap-2 font-medium z-50 animate-fadeIn">
          <WifiOff size={14} className="text-amber-400 shrink-0" />
          <span>You are currently offline. PipLedger is running in secure read-only mode.</span>
        </div>
      )}

      {/* 2. Installation Success Toast */}
      {installedSuccess && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#20C997] text-black px-4 py-2.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-fadeIn">
          <Check size={16} />
          <span>PipLedger App installed successfully!</span>
        </div>
      )}

      {/* 3. Android / Desktop PWA Install Prompt Banner */}
      {showInstallBanner && !isStandalone && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-[#12151A] border border-[#272C35] p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-slideUp">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 font-bold">
              <Download size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[#F4F5F7] truncate">Install PipLedger App</h4>
              <p className="text-[11px] text-[#969EAB] truncate">Fast access & desktop / mobile icon</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-[#969EAB] hover:text-white rounded-lg transition-colors"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 4. iOS Safari Add to Home Screen Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#12151A] border border-[#272C35] rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#272C35] pb-3">
              <h3 className="text-sm font-bold text-[#F4F5F7]">Install PipLedger on iPhone / iPad</h3>
              <button onClick={() => setShowIosModal(false)} className="text-[#969EAB] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#969EAB]">
              <p className="text-[#F4F5F7]">To install PipLedger as a standalone app on your home screen:</p>
              
              <div className="flex items-center gap-3 p-3 bg-[#0D0F12] border border-[#272C35] rounded-xl">
                <div className="p-2 rounded-lg bg-white/10 text-white shrink-0">
                  <Share2 size={18} />
                </div>
                <div>
                  <span className="font-semibold text-[#F4F5F7] block">1. Tap the Share button</span>
                  <span className="text-[11px]">Located in your Safari browser navigation bar</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#0D0F12] border border-[#272C35] rounded-xl">
                <div className="p-2 rounded-lg bg-white/10 text-white shrink-0">
                  <PlusSquare size={18} />
                </div>
                <div>
                  <span className="font-semibold text-[#F4F5F7] block">2. Tap "Add to Home Screen"</span>
                  <span className="text-[11px]">Scroll down the menu list and tap Add</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="w-full py-2.5 bg-white hover:bg-neutral-200 text-black font-bold text-xs rounded-xl transition-colors shadow"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

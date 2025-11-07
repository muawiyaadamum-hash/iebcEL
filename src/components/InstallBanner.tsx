import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const InstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed or banner was dismissed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    const wasDismissed = localStorage.getItem('installBannerDismissed');
    
    if (isInstalled || wasDismissed) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show banner on mobile devices even without the prompt
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && !isInstalled && !wasDismissed) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-accent p-4 shadow-lg animate-in slide-in-from-bottom">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Download className="h-5 w-5 text-primary-foreground flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary-foreground">
              Install MTech Academy
            </p>
            <p className="text-xs text-primary-foreground/90">
              Access courses offline, faster loading
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {deferredPrompt ? (
            <Button 
              onClick={handleInstall}
              variant="secondary"
              size="sm"
              className="text-xs"
            >
              Install
            </Button>
          ) : (
            <Link to="/install">
              <Button 
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                Learn More
              </Button>
            </Link>
          )}
          <button
            onClick={handleDismiss}
            className="text-primary-foreground hover:text-primary-foreground/80 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;

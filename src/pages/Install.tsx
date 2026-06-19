import { useState, useEffect } from "react";
import { Download, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      toast({
        title: "App Installed!",
        description: "Centre de Formation IEBC has been installed successfully.",
      });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Installation Not Available",
        description: "Please use your browser's menu to install this app, or visit on a mobile device.",
        variant: "destructive",
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast({
        title: "Installing...",
        description: "Centre de Formation IEBC is being installed to your device.",
      });
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Install Centre de Formation IEBC
              </h1>
              <p className="text-lg text-muted-foreground">
                Get instant access to your courses, even offline
              </p>
            </div>

            {isInstalled ? (
              <Card className="mb-8 border-primary">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle>App Already Installed</CardTitle>
                      <CardDescription>
                        You're all set! Open the app from your home screen.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ) : (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Install on Your Device</CardTitle>
                  <CardDescription>
                    Install Centre de Formation IEBC for a better experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleInstallClick}
                    className="w-full mb-6"
                    size="lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Install App Now
                  </Button>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Works Offline</p>
                        <p className="text-sm text-muted-foreground">
                          Access your courses even without internet connection
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Fast & Reliable</p>
                        <p className="text-sm text-muted-foreground">
                          Instant loading and smooth performance
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Home Screen Access</p>
                        <p className="text-sm text-muted-foreground">
                          Launch directly from your home screen like a native app
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">On iPhone</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Tap the Share button in Safari</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" in the top right corner</li>
                    <li>The app icon will appear on your home screen</li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">On Android</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Tap the menu button (three dots) in Chrome</li>
                    <li>Select "Add to Home screen" or "Install app"</li>
                    <li>Tap "Add" or "Install"</li>
                    <li>The app will be added to your home screen</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Install;

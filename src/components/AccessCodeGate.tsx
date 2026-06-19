import { useState } from "react";
import { useAccessCode } from "@/contexts/AccessCodeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Lock, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WHATSAPP_NUMBER } from "@/components/WhatsAppButton";

const getAccessCodeRequestMessage = () => {
  return `Hello Centre de Formation IEBC!

I would like to request an access code for the learning platform.

Please provide me with an access code to continue my registration. Thank you!`;
};

const AccessCodeGate = ({ children }: { children: React.ReactNode }) => {
  const { hasAccess, validateCode } = useAccessCode();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (hasAccess) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const isValid = validateCode(code);
      setIsSubmitting(false);

      if (!isValid) {
        toast({
          title: t("common.error"),
          description: t("access.invalid"),
          variant: "destructive"
        });
      }
    }, 500);
  };

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(getAccessCodeRequestMessage())}`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Centre de Formation IEBC
          </h1>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <KeyRound className="h-5 w-5" />
              {t("access.title")}
            </CardTitle>
            <CardDescription>
              {t("access.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder={t("access.placeholder")}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-lg tracking-widest uppercase"
                maxLength={20}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!code.trim() || isSubmitting}
              >
                {isSubmitting ? t("common.loading") : t("access.submit")}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t("access.noCode")}
                </span>
              </div>
            </div>

            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button 
                variant="outline" 
                className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                {t("access.requestCode")}
              </Button>
            </a>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Contact admin for access codes
        </p>
      </div>
    </div>
  );
};

export default AccessCodeGate;

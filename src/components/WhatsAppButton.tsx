import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { REGISTRATION_FEE_XAF, REGISTRATION_FEE_EUR, formatEur } from "@/lib/lms";

export const WHATSAPP_NUMBER = "221706584859";
export const WHATSAPP_DISPLAY = "+221 70 658 48 59";
export const SUPPORT_EMAIL = "support@iebccm.online";

export const getSupportMailto = (subject = "Support IEBC", body = "Bonjour équipe IEBC,\n\nJe souhaite obtenir de l'aide concernant :\n\n") =>
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
export const DEFAULT_WHATSAPP_MESSAGE = "Bonjour Centre de Formation IEBC ! Je souhaite obtenir plus d'informations sur vos cursus et la procédure d'inscription.";

export const getRegistrationMessage = (name: string, email: string, phone: string, courseName?: string) => {
  const courseInfo = courseName ? `\n- Cursus : ${courseName}` : '';
  return `Bonjour Centre de Formation IEBC !

Je souhaite finaliser mon inscription à la plateforme.

*Mes informations :*
- Nom : ${name}
- Email : ${email}
- Téléphone : ${phone}${courseInfo}

Frais d'inscription : ${REGISTRATION_FEE_XAF.toLocaleString("fr-FR")} XAF (~ ${formatEur(REGISTRATION_FEE_EUR)})

Merci de me communiquer la procédure de paiement.`;
};

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export const getWhatsAppLink = (message: string = DEFAULT_WHATSAPP_MESSAGE) => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const WhatsAppButton = ({ 
  message = DEFAULT_WHATSAPP_MESSAGE, 
  className = "",
  variant = "outline",
  size = "default",
  children
}: WhatsAppButtonProps) => {
  const whatsappLink = getWhatsAppLink(message);

  return (
    <a 
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-block", className)}
    >
      <Button 
        variant={variant}
        size={size}
        className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        {children || "Chat on WhatsApp"}
      </Button>
    </a>
  );
};

export default WhatsAppButton;

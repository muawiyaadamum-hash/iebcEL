import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const WHATSAPP_NUMBER = "237693122020";
export const SUPPORT_EMAIL = "support@iebccm.online";

export const getSupportMailto = (subject = "Support IEBC", body = "Bonjour équipe IEBC,\n\nJe souhaite obtenir de l'aide concernant :\n\n") =>
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
export const DEFAULT_WHATSAPP_MESSAGE = "Hello Centre de Formation IEBC! I'm interested in your courses and would like to learn more about enrollment options. Please assist me.";

export const getRegistrationMessage = (name: string, email: string, phone: string, courseName?: string) => {
  const courseInfo = courseName ? `\n- Course Interest: ${courseName}` : '';
  return `Hello Centre de Formation IEBC!

I would like to register for your learning platform.

*My Details:*
- Name: ${name}
- Email: ${email}
- Phone: ${phone}${courseInfo}

Registration Fee: 10,000 XAF

Please provide me with the payment details and registration instructions. Thank you!`;
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

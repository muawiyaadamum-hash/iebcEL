import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "237678881039";
const DEFAULT_MESSAGE = "Hello MTech Academy! I'm interested in your courses and would like to learn more about enrollment options. Please assist me.";

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  variant?: "floating" | "inline";
}

const WhatsAppButton = ({ 
  message = DEFAULT_MESSAGE, 
  className = "",
  variant = "floating" 
}: WhatsAppButtonProps) => {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  if (variant === "inline") {
    return (
      <a 
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <Button 
          variant="outline"
          className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          WhatsApp Us
        </Button>
      </a>
    );
  }

  return (
    <a 
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 left-6 z-40 ${className}`}
    >
      <Button 
        className="h-14 w-14 rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </a>
  );
};

export default WhatsAppButton;

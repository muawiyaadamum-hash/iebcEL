import { MessageCircle } from "lucide-react";
import { getWhatsAppLink } from "@/components/WhatsAppButton";

const FloatingWhatsApp = () => {
  const message =
    "Bonjour Centre de Formation IEBC ! J'ai besoin d'assistance concernant la plateforme.";
  return (
    <a
      href={getWhatsAppLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter le support WhatsApp IEBC"
      className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/40 transition-transform hover:scale-110 hover:bg-green-600 md:bottom-6"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-30" />
    </a>
  );
};

export default FloatingWhatsApp;

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
      className="fixed bottom-24 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 transition-transform hover:scale-110 hover:bg-[#1EBE5D]"
    >
      {/* Official WhatsApp glyph */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.11 17.29c-.29-.14-1.71-.84-1.98-.94-.27-.1-.46-.14-.66.14-.19.29-.75.94-.92 1.13-.17.19-.34.22-.63.07-.29-.14-1.22-.45-2.32-1.43-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.44.13-.58.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.66-1.59-.9-2.18-.24-.57-.48-.49-.66-.5l-.56-.01c-.19 0-.5.07-.77.36-.26.29-1 .98-1 2.39s1.03 2.77 1.17 2.96c.14.19 2.03 3.1 4.92 4.35.69.3 1.22.48 1.64.61.69.22 1.31.19 1.81.12.55-.08 1.71-.7 1.95-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34zM16 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.27.6 4.4 1.65 6.24L3.2 28.8l6.72-1.62A12.75 12.75 0 0 0 16 28.8c7.07 0 12.8-5.73 12.8-12.8S23.07 3.2 16 3.2zm0 23.36c-1.98 0-3.83-.55-5.42-1.5l-.39-.23-3.99.96 1.02-3.89-.25-.4A10.55 10.55 0 1 1 26.56 16 10.57 10.57 0 0 1 16 26.56z" />
      </svg>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-25" />
    </a>
  );
};

export default FloatingWhatsApp;

import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-md border border-border/60 p-0.5">
      <button
        type="button"
        onClick={() => setLanguage("fr")}
        aria-label="Français"
        title="Français"
        className={`px-2 py-1 rounded text-base leading-none transition-colors ${
          language === "fr" ? "bg-muted" : "hover:bg-muted/50 opacity-60"
        }`}
      >
        🇫🇷
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-label="English"
        title="English"
        className={`px-2 py-1 rounded text-base leading-none transition-colors ${
          language === "en" ? "bg-muted" : "hover:bg-muted/50 opacity-60"
        }`}
      >
        🇬🇧
      </button>
    </div>
  );
};

export default LanguageSwitcher;

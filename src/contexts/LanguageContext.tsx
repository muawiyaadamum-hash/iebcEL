import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "fr";

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
  };
}

export const translations: Translations = {
  // Navigation
  "nav.home": { en: "Home", fr: "Accueil" },
  "nav.courses": { en: "Courses", fr: "Cours" },
  "nav.about": { en: "About", fr: "À propos" },
  "nav.events": { en: "Events", fr: "Événements" },
  "nav.register": { en: "Register", fr: "S'inscrire" },
  "nav.login": { en: "Login", fr: "Connexion" },
  "nav.dashboard": { en: "Dashboard", fr: "Tableau de bord" },
  "nav.admin": { en: "Admin", fr: "Admin" },
  "nav.logout": { en: "Logout", fr: "Déconnexion" },
  
  // Hero
  "hero.title": { en: "Learn Skills for the Technology Era", fr: "Apprenez les compétences de l'ère technologique" },
  "hero.subtitle": { en: "Professional online courses in Technology, Business, HR, and Logistics. Pay once, learn forever.", fr: "Cours en ligne professionnels en technologie, business, RH et logistique. Payez une fois, apprenez pour toujours." },
  "hero.cta": { en: "Start Learning", fr: "Commencer à apprendre" },
  "hero.browse": { en: "Browse Courses", fr: "Parcourir les cours" },
  
  // Index Page
  "index.featured": { en: "Featured Courses", fr: "Cours en vedette" },
  "index.featuredDesc": { en: "Start your learning journey with our most popular courses", fr: "Commencez votre parcours d'apprentissage avec nos cours les plus populaires" },
  "index.viewAll": { en: "View All Courses", fr: "Voir tous les cours" },
  "index.whyChoose": { en: "Why Choose MTech Academy?", fr: "Pourquoi choisir MTech Academy?" },
  "index.whyChooseDesc": { en: "We provide quality education with flexible learning options", fr: "Nous offrons une éducation de qualité avec des options d'apprentissage flexibles" },
  "index.pace": { en: "Learn at Your Pace", fr: "Apprenez à votre rythme" },
  "index.paceDesc": { en: "Access course materials anytime, anywhere. Study at your own speed with lifetime access.", fr: "Accédez aux cours à tout moment, n'importe où. Étudiez à votre rythme avec un accès à vie." },
  "index.registration": { en: "One-Time Registration", fr: "Inscription unique" },
  "index.registrationDesc": { en: "registration fee for lifetime access to all courses. No hidden costs.", fr: "frais d'inscription pour un accès à vie à tous les cours. Pas de frais cachés." },
  "index.support": { en: "24/7 Support", fr: "Support 24/7" },
  "index.supportDesc": { en: "Get help anytime with our AI chatbot or connect with our team on WhatsApp.", fr: "Obtenez de l'aide à tout moment avec notre chatbot IA ou contactez notre équipe sur WhatsApp." },
  "index.ready": { en: "Ready to Start Learning?", fr: "Prêt à commencer à apprendre?" },
  "index.readyDesc": { en: "Join MTech Academy today and unlock your potential with our comprehensive online courses.", fr: "Rejoignez MTech Academy aujourd'hui et libérez votre potentiel avec nos cours en ligne complets." },
  "index.registerNow": { en: "Register Now", fr: "S'inscrire maintenant" },
  
  // Courses
  "courses.title": { en: "Our Courses", fr: "Nos cours" },
  "courses.search": { en: "Search courses...", fr: "Rechercher des cours..." },
  "courses.all": { en: "All", fr: "Tous" },
  "courses.technology": { en: "Technology", fr: "Technologie" },
  "courses.business": { en: "Business", fr: "Business" },
  "courses.hr": { en: "HR", fr: "RH" },
  "courses.logistics": { en: "Logistics", fr: "Logistique" },
  "courses.level": { en: "Level", fr: "Niveau" },
  "courses.allLevels": { en: "All Levels", fr: "Tous les niveaux" },
  "courses.beginner": { en: "Beginner", fr: "Débutant" },
  "courses.intermediate": { en: "Intermediate", fr: "Intermédiaire" },
  "courses.advanced": { en: "Advanced", fr: "Avancé" },
  "courses.featured": { en: "Featured Courses", fr: "Cours en vedette" },
  "courses.allCourses": { en: "All Courses", fr: "Tous les cours" },
  "courses.noCourses": { en: "No courses found matching your criteria.", fr: "Aucun cours trouvé correspondant à vos critères." },
  "courses.free": { en: "FREE", fr: "GRATUIT" },
  "courses.modules": { en: "modules", fr: "modules" },
  "courses.viewDetails": { en: "View Details", fr: "Voir les détails" },
  
  // Auth
  "auth.welcome": { en: "Welcome to MTech Academy", fr: "Bienvenue à MTech Academy" },
  "auth.accessDashboard": { en: "Access your student dashboard", fr: "Accédez à votre tableau de bord étudiant" },
  "auth.login": { en: "Login", fr: "Connexion" },
  "auth.signup": { en: "Sign Up", fr: "S'inscrire" },
  "auth.email": { en: "Email", fr: "Email" },
  "auth.password": { en: "Password", fr: "Mot de passe" },
  "auth.confirmPassword": { en: "Confirm Password", fr: "Confirmer le mot de passe" },
  "auth.fullName": { en: "Full Name", fr: "Nom complet" },
  "auth.phone": { en: "Phone Number", fr: "Numéro de téléphone" },
  "auth.loggingIn": { en: "Logging in...", fr: "Connexion en cours..." },
  "auth.creatingAccount": { en: "Creating Account...", fr: "Création du compte..." },
  "auth.createAccount": { en: "Create Account", fr: "Créer un compte" },
  
  // Access Code
  "access.title": { en: "Access Code Required", fr: "Code d'accès requis" },
  "access.description": { en: "Enter your access code to continue. If you don't have one, request it from our admin.", fr: "Entrez votre code d'accès pour continuer. Si vous n'en avez pas, demandez-le à notre administrateur." },
  "access.placeholder": { en: "Enter access code", fr: "Entrez le code d'accès" },
  "access.submit": { en: "Submit", fr: "Soumettre" },
  "access.noCode": { en: "Don't have an access code?", fr: "Vous n'avez pas de code d'accès?" },
  "access.requestCode": { en: "Request Access Code", fr: "Demander un code d'accès" },
  "access.invalid": { en: "Invalid access code. Please try again or request a new one.", fr: "Code d'accès invalide. Veuillez réessayer ou en demander un nouveau." },
  
  // Footer
  "footer.description": { en: "Empowering learners with quality online education in Cameroon and beyond.", fr: "Donnons aux apprenants une éducation en ligne de qualité au Cameroun et au-delà." },
  "footer.quickLinks": { en: "Quick Links", fr: "Liens rapides" },
  "footer.contact": { en: "Contact", fr: "Contact" },
  "footer.address": { en: "Bamenda, Cameroon", fr: "Bamenda, Cameroun" },
  "footer.rights": { en: "All rights reserved.", fr: "Tous droits réservés." },
  
  // Common
  "common.loading": { en: "Loading...", fr: "Chargement..." },
  "common.error": { en: "Error", fr: "Erreur" },
  "common.success": { en: "Success", fr: "Succès" },
  "common.cancel": { en: "Cancel", fr: "Annuler" },
  "common.save": { en: "Save", fr: "Enregistrer" },
  "common.delete": { en: "Delete", fr: "Supprimer" },
  "common.edit": { en: "Edit", fr: "Modifier" },
  "common.whatsapp": { en: "Chat on WhatsApp", fr: "Discuter sur WhatsApp" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  detectAndSetLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Cameroon regions that predominantly speak French
const FRENCH_REGIONS = [
  "Centre", "Littoral", "West", "South", "East", 
  "Adamaoua", "North", "Far North"
];

// English-speaking regions
const ENGLISH_REGIONS = ["Northwest", "Southwest"];

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("mtech_language");
    return (stored as Language) || "en";
  });

  const detectAndSetLanguage = async () => {
    try {
      // First try browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("fr")) {
        setLanguage("fr");
        localStorage.setItem("mtech_language", "fr");
        return;
      }

      // Try to detect location using IP geolocation (free service)
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      
      if (data.country_code === "CM") {
        // In Cameroon - check region
        const region = data.region;
        if (ENGLISH_REGIONS.some(r => region?.includes(r))) {
          setLanguage("en");
        } else {
          // Default to French for other Cameroon regions
          setLanguage("fr");
        }
      } else if (data.country_code === "FR" || data.country_code === "BE" || 
                 data.country_code === "CH" || data.country_code === "CA") {
        // French-speaking countries
        setLanguage("fr");
      } else {
        // Default to English
        setLanguage("en");
      }
      
      localStorage.setItem("mtech_language", language);
    } catch (error) {
      console.log("Could not detect location, using browser language");
      const browserLang = navigator.language.toLowerCase();
      const detectedLang = browserLang.startsWith("fr") ? "fr" : "en";
      setLanguage(detectedLang);
      localStorage.setItem("mtech_language", detectedLang);
    }
  };

  useEffect(() => {
    // Only auto-detect if no language is stored
    if (!localStorage.getItem("mtech_language")) {
      detectAndSetLanguage();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mtech_language", language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, detectAndSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

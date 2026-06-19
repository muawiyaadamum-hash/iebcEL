import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AccessCodeContextType {
  hasAccess: boolean;
  validateCode: (code: string) => boolean;
  clearAccess: () => void;
}

const AccessCodeContext = createContext<AccessCodeContextType | undefined>(undefined);

// Valid access codes - in production, these would be validated server-side
const VALID_ACCESS_CODES = [
  "IEBC2025",
  "IEBC25",
  "CEMAC25",
  "LEARN2025",
  "WELCOME25"
];

export const useAccessCode = () => {
  const context = useContext(AccessCodeContext);
  if (!context) {
    throw new Error("useAccessCode must be used within an AccessCodeProvider");
  }
  return context;
};

export const AccessCodeProvider = ({ children }: { children: ReactNode }) => {
  const [hasAccess, setHasAccess] = useState<boolean>(() => {
    return localStorage.getItem("mtech_access_granted") === "true";
  });

  const validateCode = (code: string): boolean => {
    const isValid = VALID_ACCESS_CODES.includes(code.toUpperCase().trim());
    if (isValid) {
      setHasAccess(true);
      localStorage.setItem("mtech_access_granted", "true");
    }
    return isValid;
  };

  const clearAccess = () => {
    setHasAccess(false);
    localStorage.removeItem("mtech_access_granted");
  };

  return (
    <AccessCodeContext.Provider value={{ hasAccess, validateCode, clearAccess }}>
      {children}
    </AccessCodeContext.Provider>
  );
};

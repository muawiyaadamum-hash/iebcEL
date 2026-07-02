import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Options {
  active: boolean;
  maxViolations?: number;
  onForceSubmit: () => void;
}

/**
 * Anti-cheat guard for exam sessions:
 * - Requests fullscreen and re-prompts on exit
 * - Blocks copy / paste / cut / context menu / text selection / drag
 * - Blocks common devtools & tab-switch shortcuts (Ctrl/Cmd+C/V/U/S/P, F12, Ctrl+Shift+I/J/C)
 * - Counts tab-hide / blur / fullscreen-exit as violations, auto-submits at threshold
 * - Warns on refresh/close (beforeunload)
 */
export function useAntiCheat({ active, maxViolations = 3, onForceSubmit }: Options) {
  const [violations, setViolations] = useState(0);
  const submittedRef = useRef(false);

  const bump = (reason: string) => {
    if (!active || submittedRef.current) return;
    setViolations((v) => {
      const n = v + 1;
      if (n >= maxViolations) {
        submittedRef.current = true;
        toast.error(`Examen soumis automatiquement : ${reason} (${n}/${maxViolations})`);
        onForceSubmit();
      } else {
        toast.warning(`Avertissement anti-triche : ${reason} (${n}/${maxViolations})`);
      }
      return n;
    });
  };

  useEffect(() => {
    if (!active) return;

    // Enter fullscreen
    const enterFs = async () => {
      try { await document.documentElement.requestFullscreen(); } catch { /* ignore */ }
    };
    enterFs();

    const onVisibility = () => { if (document.hidden) bump("changement d'onglet"); };
    const onBlur = () => bump("perte de focus");
    const onFsChange = () => { if (!document.fullscreenElement) bump("sortie plein écran"); };
    const block = (e: Event) => { e.preventDefault(); return false; };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const cmd = e.ctrlKey || e.metaKey;
      if (
        k === "f12" ||
        (cmd && ["c", "v", "x", "u", "s", "p", "a"].includes(k)) ||
        (cmd && e.shiftKey && ["i", "j", "c"].includes(k))
      ) { e.preventDefault(); toast.info("Action désactivée pendant l'examen"); }
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "L'examen est en cours. Quitter entraînera la soumission.";
      return e.returnValue;
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("paste", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("selectstart", block);
    document.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onBeforeUnload);

    const prevSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("selectstart", block);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.body.style.userSelect = prevSelect;
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return { violations, maxViolations };
}

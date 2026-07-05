import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, Loader2, Maximize2 } from "lucide-react";
import iebcLogo from "@/assets/iebc-logo.jpg.asset.json";

interface LessonPdfViewerProps {
  url: string;
  title: string;
  subtitle?: string;
  filename?: string;
}

/**
 * Professional PDF lesson viewer.
 * - Branded header with IEBC logo
 * - Uses <object>/<iframe> on desktop
 * - Falls back to a clean "Open PDF" card on iOS/Android where inline PDF is unreliable
 * - Always offers Download & Open-in-new-tab controls
 */
const LessonPdfViewer = ({ url, title, subtitle, filename }: LessonPdfViewerProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(ua));
  }, []);

  const openNewTab = () => window.open(url, "_blank", "noopener,noreferrer");
  const download = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `${title}.pdf`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Branded header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <img src={iebcLogo.url} alt="IEBC" className="h-9 w-9 rounded-full object-contain bg-white ring-1 ring-border" />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary/80">Livret de cours · IEBC</div>
          <div className="text-sm font-semibold truncate text-foreground">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
        </div>
        <div className="hidden sm:flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={openNewTab} title="Plein écran"><Maximize2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={download} title="Télécharger"><Download className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Viewer body */}
      <div className="relative bg-muted/30">
        {isMobile ? (
          <div className="flex flex-col items-center justify-center gap-4 py-10 px-6 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Pour une lecture confortable sur mobile, ouvrez le livret dans votre lecteur PDF.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button onClick={openNewTab} className="gap-2">
                <ExternalLink className="h-4 w-4" /> Ouvrir le PDF
              </Button>
              <Button variant="outline" onClick={download} className="gap-2">
                <Download className="h-4 w-4" /> Télécharger
              </Button>
            </div>
          </div>
        ) : (
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/40 z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <object
              data={`${url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
              type="application/pdf"
              className="w-full h-[78vh] bg-white"
              onLoad={() => setLoaded(true)}
            >
              <iframe
                src={url}
                title={title}
                className="w-full h-[78vh] border-0 bg-white"
                onLoad={() => setLoaded(true)}
              />
            </object>
          </>
        )}
      </div>

      {/* Footer mobile actions */}
      <div className="sm:hidden flex items-center justify-between gap-2 px-4 py-3 border-t bg-muted/40">
        <span className="text-xs text-muted-foreground">© IEBC — Centre de Formation</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={openNewTab}><ExternalLink className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={download}><Download className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default LessonPdfViewer;

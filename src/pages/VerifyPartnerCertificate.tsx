import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Award, CheckCircle2, XCircle, Clock, AlertTriangle, Download } from "lucide-react";
import { generateCertificatePdf } from "@/lib/certificate";
import QRCode from "qrcode";

const VerifyPartnerCertificate = () => {
  const { code } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [program, setProgram] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase.rpc("verify_partner_certificate", { _code: code as string });
      const c = Array.isArray(rows) ? rows[0] : rows;
      setCert(c);
      if (c) {
        const { data: p } = await supabase.from("partner_programs").select("*").eq("id", c.program_id).maybeSingle();
        setProgram(p);
        try {
          const url = await QRCode.toDataURL(window.location.href, { margin: 1, width: 260 });
          setQrDataUrl(url);
        } catch {}
      }
      setLoading(false);
    })();
  }, [code]);

  const downloadPdf = async () => {
    if (!cert || !program) return;
    const doc = await generateCertificatePdf({
      code: cert.code,
      studentName: cert.student_name,
      cursusTitle: `${program.name} — ${program.partner_name}`,
      score: cert.score || 0, total: cert.total || 0,
      issuedAt: cert.issued_at || new Date().toISOString(),
      verifyUrl: window.location.href,
      template: {
        header_title: program.header_title,
        institution_name: program.partner_name,
        institution_subtitle: program.name,
        signatory_name: program.signatory_name,
        signatory_title: program.signatory_title,
        footer_text: program.footer_text,
        primary_color: program.primary_color,
        background_image_url: program.template_bg_url,
      },
    });
    doc.save(`certificat-${cert.code}.pdf`);
  };

  const statusInfo = (s: string) => {
    switch (s) {
      case "issued": return { icon: <CheckCircle2 className="h-16 w-16 text-emerald-600" />, label: "Certificat authentique", color: "text-emerald-600", desc: "Ce certificat a été officiellement délivré." };
      case "revoked": return { icon: <XCircle className="h-16 w-16 text-destructive" />, label: "Certificat révoqué", color: "text-destructive", desc: "Ce certificat a été révoqué et n'est plus valide." };
      case "expired": return { icon: <AlertTriangle className="h-16 w-16 text-amber-600" />, label: "Certificat expiré", color: "text-amber-600", desc: "Ce certificat a expiré." };
      case "pending": return { icon: <Clock className="h-16 w-16 text-muted-foreground" />, label: "En préparation", color: "text-muted-foreground", desc: "Ce certificat est en cours de validation." };
      default: return { icon: <AlertTriangle className="h-16 w-16" />, label: s, color: "", desc: "" };
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : !cert || !program ? (
          <Card><CardContent className="py-16 text-center">
            <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">Certificat introuvable</h1>
            <p className="text-muted-foreground">Le code <code className="font-mono">{code}</code> ne correspond à aucun certificat officiel.</p>
          </CardContent></Card>
        ) : (
          <Card style={{ borderTopColor: program.primary_color, borderTopWidth: 4 }}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">{statusInfo(cert.status).icon}</div>
              <CardTitle className={`text-2xl ${statusInfo(cert.status).color}`}>{statusInfo(cert.status).label}</CardTitle>
              <CardDescription>{statusInfo(cert.status).desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-6 space-y-3 bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Award className="h-4 w-4" /> Certificat conjoint</div>
                <div>
                  <div className="text-sm text-muted-foreground">Délivré à</div>
                  <div className="text-2xl font-bold">{cert.student_name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Programme</div>
                  <div className="text-lg font-semibold" style={{ color: program.primary_color }}>{program.name}</div>
                  <div className="text-sm">en partenariat avec <strong>{program.partner_name}</strong></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div><div className="text-xs text-muted-foreground">Code</div><div className="font-mono text-sm">{cert.code}</div></div>
                  <div><div className="text-xs text-muted-foreground">Émis le</div><div className="text-sm">{cert.issued_at ? new Date(cert.issued_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—"}</div></div>
                  {cert.expires_at && <div><div className="text-xs text-muted-foreground">Expire le</div><div className="text-sm">{new Date(cert.expires_at).toLocaleDateString("fr-FR")}</div></div>}
                  {cert.revoked_at && <div><div className="text-xs text-muted-foreground">Révoqué le</div><div className="text-sm">{new Date(cert.revoked_at).toLocaleDateString("fr-FR")}</div></div>}
                </div>
              </div>

              {qrDataUrl && (
                <div className="flex items-center gap-4 p-4 rounded-lg border">
                  <img src={qrDataUrl} alt="QR de vérification" className="h-24 w-24" />
                  <div className="flex-1 text-sm">
                    <div className="font-medium mb-1">QR de vérification</div>
                    <div className="text-muted-foreground text-xs break-all">{window.location.href}</div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 justify-center">
                {cert.status === "issued" && <Button onClick={downloadPdf}><Download className="h-4 w-4 mr-2" />Télécharger le certificat PDF</Button>}
                <Button variant="outline" asChild><Link to={`/partners/${program.slug}`}>Voir tous les laureats du programme</Link></Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VerifyPartnerCertificate;

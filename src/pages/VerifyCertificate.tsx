import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface CertInfo {
  code: string;
  student_name: string;
  cursus_title: string;
  score: number;
  total: number;
  issued_at: string;
}

const VerifyCertificate = () => {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<CertInfo | null>(null);

  useEffect(() => {
    if (!code) return;
    (async () => {
      const { data } = await supabase.rpc("verify_certificate", { _code: code });
      setCert((data?.[0] as CertInfo) || null);
      setLoading(false);
    })();
  }, [code]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-2xl flex-1">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-primary" /> Vérification de certificat
        </h1>
        <p className="text-muted-foreground mb-8">Code : <span className="font-mono">{code}</span></p>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : cert ? (
          <Card className="border-green-300">
            <CardHeader className="bg-green-50 dark:bg-green-950/30">
              <CardTitle className="flex items-center gap-3 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-7 w-7" /> Certificat authentique
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3 text-sm">
              <div><span className="text-muted-foreground">Apprenant :</span> <b>{cert.student_name}</b></div>
              <div><span className="text-muted-foreground">Cursus :</span> <b>{cert.cursus_title}</b></div>
              <div><span className="text-muted-foreground">Score :</span> <b>{cert.score} / {cert.total}</b> ({Math.round((cert.score / cert.total) * 100)}%)</div>
              <div><span className="text-muted-foreground">Délivré le :</span> {new Date(cert.issued_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</div>
              <div className="pt-3 border-t text-xs text-muted-foreground">
                Ce certificat a été émis par le Centre de Formation IEBC et est vérifié automatiquement par notre système.
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-red-300">
            <CardHeader className="bg-red-50 dark:bg-red-950/30">
              <CardTitle className="flex items-center gap-3 text-red-700 dark:text-red-400">
                <XCircle className="h-7 w-7" /> Certificat introuvable
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Aucun certificat ne correspond à ce code. Vérifiez la référence ou contactez l'administration.
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VerifyCertificate;

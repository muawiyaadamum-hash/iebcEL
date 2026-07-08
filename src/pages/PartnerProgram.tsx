import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Award, Search, ExternalLink } from "lucide-react";

const statusBadge = (s: string) => {
  const map: any = {
    issued: <Badge className="bg-emerald-600 hover:bg-emerald-600">Émis</Badge>,
    pending: <Badge variant="secondary">En préparation</Badge>,
    revoked: <Badge variant="destructive">Révoqué</Badge>,
    expired: <Badge className="bg-amber-600 hover:bg-amber-600">Expiré</Badge>,
  };
  return map[s] || <Badge variant="outline">{s}</Badge>;
};

const PartnerProgram = () => {
  const { slug } = useParams();
  const [program, setProgram] = useState<any>(null);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("partner_programs").select("*").eq("slug", slug).maybeSingle();
      setProgram(p);
      if (p) {
        const { data: c } = await supabase.from("partner_certificates").select("*").eq("program_id", p.id).in("status", ["issued","expired","revoked"]).order("student_name");
        setCerts(c || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  const filtered = certs.filter((c) => !q || c.student_name.toLowerCase().includes(q.toLowerCase()) || c.code.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : !program ? (
          <Card><CardContent className="py-16 text-center"><h1 className="text-2xl font-bold mb-2">Programme introuvable</h1><p className="text-muted-foreground">Ce programme conjoint n'existe pas ou n'est plus actif.</p></CardContent></Card>
        ) : (
          <>
            {program.hero_image_url && (
              <div className="mb-6 rounded-lg overflow-hidden border relative" style={{ borderColor: program.primary_color }}>
                <img src={program.hero_image_url} alt={program.name} className="w-full h-48 sm:h-64 object-cover" />
              </div>
            )}
            <Card className="mb-6" style={{ borderTopColor: program.primary_color, borderTopWidth: 4 }}>
              <CardHeader>
                <div className="flex items-center gap-3 flex-wrap">
                  {program.partner_logo_url ? (
                    <img src={program.partner_logo_url} alt={program.partner_name} className="h-12 w-12 object-contain rounded border p-1" />
                  ) : (
                    <Award className="h-8 w-8" style={{ color: program.primary_color }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-2xl">{program.name}</CardTitle>
                    <CardDescription>
                      Programme conjoint avec{" "}
                      {program.partner_url ? (
                        <a href={program.partner_url} target="_blank" rel="noreferrer" className="underline font-semibold">{program.partner_name}</a>
                      ) : (
                        <strong>{program.partner_name}</strong>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {program.description && <p className="text-muted-foreground whitespace-pre-line">{program.description}</p>}
                {(program.duration || program.location || program.start_date || program.end_date) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    {program.duration && <div className="p-3 rounded border bg-muted/30"><div className="text-xs text-muted-foreground">Durée</div><div className="font-medium">{program.duration}</div></div>}
                    {program.location && <div className="p-3 rounded border bg-muted/30"><div className="text-xs text-muted-foreground">Lieu</div><div className="font-medium">{program.location}</div></div>}
                    {program.start_date && <div className="p-3 rounded border bg-muted/30"><div className="text-xs text-muted-foreground">Début</div><div className="font-medium">{new Date(program.start_date).toLocaleDateString("fr-FR")}</div></div>}
                    {program.end_date && <div className="p-3 rounded border bg-muted/30"><div className="text-xs text-muted-foreground">Fin</div><div className="font-medium">{new Date(program.end_date).toLocaleDateString("fr-FR")}</div></div>}
                  </div>
                )}
                {program.long_description && (
                  <div className="prose prose-sm max-w-none whitespace-pre-line text-foreground/90 border-t pt-4">{program.long_description}</div>
                )}
                {Array.isArray(program.highlights) && program.highlights.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Points forts</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {program.highlights.map((h: string, i: number) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>Laureats certifiés</CardTitle>
                  <CardDescription>{filtered.length} certificat(s) délivré(s)</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8" placeholder="Rechercher nom ou code..." value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Code</TableHead><TableHead>Statut</TableHead><TableHead>Émis le</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filtered.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.student_name}</TableCell>
                          <TableCell className="font-mono text-xs">{c.code}</TableCell>
                          <TableCell>{statusBadge(c.status)}</TableCell>
                          <TableCell className="text-sm">{c.issued_at ? new Date(c.issued_at).toLocaleDateString("fr-FR") : "—"}</TableCell>
                          <TableCell className="text-right"><Link className="text-primary text-sm inline-flex items-center gap-1" to={`/verify-partner/${c.code}`}>Détail <ExternalLink className="h-3 w-3" /></Link></TableCell>
                        </TableRow>
                      ))}
                      {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun laureat correspondant.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PartnerProgram;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, GraduationCap, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";

interface Row {
  id: string;
  user_id: string;
  cursus_id: string;
  status: string;
  score: number | null;
  total: number | null;
  passed: boolean | null;
  created_at: string;
  submitted_at: string | null;
  cursus?: { title: string; slug: string } | null;
  profile?: { full_name: string; email: string } | null;
}

const AdminExams = () => {
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<Row[]>([]);
  const [bankStats, setBankStats] = useState<{ title: string; slug: string; count: number }[]>([]);

  const load = async () => {
    setLoading(true);
    const [{ data: att }, { data: profs }, { data: cursusRows }, { data: bank }] = await Promise.all([
      supabase.from("exam_attempts").select("*, cursus:cursus(title,slug)").order("created_at", { ascending: false }).limit(200),
      supabase.from("profiles").select("user_id,full_name,email"),
      supabase.from("cursus").select("id,title,slug").order("title"),
      supabase.from("exam_question_bank").select("cursus_id").eq("published", true),
    ]);
    const pmap = new Map((profs || []).map((p: any) => [p.user_id, p]));
    setAttempts(((att || []) as any[]).map((r) => ({ ...r, profile: pmap.get(r.user_id) || null })));
    const counts = new Map<string, number>();
    (bank || []).forEach((b: any) => counts.set(b.cursus_id, (counts.get(b.cursus_id) || 0) + 1));
    setBankStats(((cursusRows || []) as any[]).map((c) => ({ title: c.title, slug: c.slug, count: counts.get(c.id) || 0 })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const passed = attempts.filter((a) => a.passed).length;
  const failed = attempts.filter((a) => a.status === "submitted" && !a.passed).length;
  const inProgress = attempts.filter((a) => a.status === "in_progress").length;

  if (loading) return <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4" />Tentatives</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{attempts.length}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-green-600"><CheckCircle2 className="h-4 w-4" />Réussies</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{passed}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-red-600"><XCircle className="h-4 w-4" />Échouées</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{failed}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4" />En cours</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{inProgress}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Banque de questions par cursus</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Cursus</TableHead><TableHead className="text-right">Questions publiées</TableHead><TableHead className="text-right">Statut</TableHead></TableRow></TableHeader>
            <TableBody>
              {bankStats.map((s) => (
                <TableRow key={s.slug}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell className="text-right">{s.count}</TableCell>
                  <TableCell className="text-right">
                    {s.count >= 50
                      ? <Badge className="bg-green-600">Prêt (≥50)</Badge>
                      : s.count > 0
                      ? <Badge variant="secondary">Insuffisant ({s.count}/50)</Badge>
                      : <Badge variant="outline">Vide</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Dernières tentatives</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Apprenant</TableHead><TableHead>Cursus</TableHead><TableHead>Score</TableHead><TableHead>Statut</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {attempts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-medium">{a.profile?.full_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{a.profile?.email}</div>
                  </TableCell>
                  <TableCell>{a.cursus?.title || "—"}</TableCell>
                  <TableCell>{a.score ?? "—"} / {a.total ?? "—"}</TableCell>
                  <TableCell>
                    {a.status === "in_progress" && <Badge variant="secondary">En cours</Badge>}
                    {a.status === "submitted" && a.passed && <Badge className="bg-green-600">Réussi</Badge>}
                    {a.status === "submitted" && !a.passed && <Badge variant="destructive">Échoué</Badge>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("fr-FR")}</TableCell>
                </TableRow>
              ))}
              {attempts.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Aucune tentative pour le moment.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExams;

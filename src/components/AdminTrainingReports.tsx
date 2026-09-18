import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Loader2, CheckCircle2, XCircle, RotateCcw, Search } from "lucide-react";
import { REPORT_STATUS_LABEL, reportStatusVariant } from "@/components/TrainingReportPanel";

const AdminTrainingReports = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [comments, setComments] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("training_reports")
      .select("*, cursus:cursus(title, slug)")
      .order("submitted_at", { ascending: false });
    const list = (data || []) as any[];
    const ids = [...new Set(list.map((r) => r.user_id))];
    let profiles: Record<string, any> = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      (profs || []).forEach((p: any) => { profiles[p.id] = p; });
    }
    setRows(list.map((r) => ({ ...r, profile: profiles[r.user_id] })));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const setStatus = async (row: any, status: string) => {
    setBusy(row.id);
    const { error } = await (supabase as any).from("training_reports").update({
      status,
      teacher_comment: comments[row.id] ?? row.teacher_comment ?? null,
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", row.id);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    toast.success(`Rapport marqué « ${REPORT_STATUS_LABEL[status]} »`);
    void load();
  };

  const open = async (row: any) => {
    if (!row.file_path) return;
    const { data } = await supabase.storage.from("training-reports").createSignedUrl(row.file_path, 600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
    else toast.error("Fichier indisponible");
  };

  const filtered = rows.filter((r) => {
    const okStatus = statusFilter === "all" || r.status === statusFilter;
    const hay = `${r.profile?.full_name || ""} ${r.profile?.email || ""} ${r.cursus?.title || ""} ${r.title || ""}`.toLowerCase();
    return okStatus && (!q || hay.includes(q.toLowerCase()));
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rapports de formation</CardTitle>
        <CardDescription>Consultez, commentez, demandez une correction, validez ou rejetez. La validation débloque le certificat.</CardDescription>
        <div className="flex gap-2 flex-wrap pt-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input className="pl-9" placeholder="Rechercher un apprenant ou un cursus…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {["submitted", "under_review", "revision_requested", "validated", "rejected"].map((s) => (
                <SelectItem key={s} value={s}>{REPORT_STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Aucun rapport pour le moment.</p>
        ) : filtered.map((r) => (
          <div key={r.id} className="p-4 rounded-lg border space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold">{r.profile?.full_name || r.profile?.email || "Apprenant"}</p>
                <p className="text-sm text-muted-foreground">{r.cursus?.title} · {r.title || "Rapport"} · v{r.version}</p>
                <p className="text-xs text-muted-foreground">Déposé le {new Date(r.submitted_at).toLocaleString("fr-FR")}</p>
              </div>
              <Badge variant="outline" className={reportStatusVariant(r.status)}>{REPORT_STATUS_LABEL[r.status]}</Badge>
            </div>
            {r.student_note && <p className="text-sm bg-muted/40 rounded p-2">{r.student_note}</p>}
            <Textarea
              rows={2}
              placeholder="Observations pour l'apprenant…"
              value={comments[r.id] ?? r.teacher_comment ?? ""}
              onChange={(e) => setComments((c) => ({ ...c, [r.id]: e.target.value }))}
            />
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => open(r)} disabled={!r.file_path}>
                <Download className="h-4 w-4 mr-1" />Ouvrir le rapport
              </Button>
              <Button size="sm" variant="secondary" disabled={busy === r.id} onClick={() => setStatus(r, "under_review")}>En évaluation</Button>
              <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => setStatus(r, "revision_requested")}>
                <RotateCcw className="h-4 w-4 mr-1" />Demander correction
              </Button>
              <Button size="sm" disabled={busy === r.id} onClick={() => setStatus(r, "validated")} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="h-4 w-4 mr-1" />Valider
              </Button>
              <Button size="sm" variant="destructive" disabled={busy === r.id} onClick={() => setStatus(r, "rejected")}>
                <XCircle className="h-4 w-4 mr-1" />Rejeter
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AdminTrainingReports;

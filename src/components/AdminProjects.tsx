import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Download, CheckCircle2, XCircle, Clock } from "lucide-react";
import { logAudit } from "@/lib/audit";

const AdminProjects = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "graded" | "rejected">("pending");
  const [editing, setEditing] = useState<any>(null);
  const [grade, setGrade] = useState(80);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("project_submissions")
      .select("*, cursus:cursus(title,slug), profile:profiles!project_submissions_user_id_fkey(full_name,email)")
      .order("submitted_at", { ascending: false });
    // profiles link isn't guaranteed; fetch separately
    const rows0 = data || [];
    const uids = Array.from(new Set(rows0.map((r: any) => r.user_id)));
    const { data: profs } = uids.length
      ? await supabase.from("profiles").select("user_id,full_name,email").in("user_id", uids)
      : { data: [] as any[] };
    const pmap = new Map((profs || []).map((p: any) => [p.user_id, p]));
    setRows(rows0.map((r: any) => ({ ...r, profile: pmap.get(r.user_id) })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const download = async (path: string, name: string) => {
    const { data, error } = await supabase.storage.from("student-projects").createSignedUrl(path, 300);
    if (error) return toast.error(error.message);
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = name;
    a.target = "_blank";
    a.click();
  };

  const openReview = (row: any) => {
    setEditing(row);
    setGrade(row.grade ?? 80);
    setFeedback(row.admin_feedback ?? "");
  };

  const save = async (status: "graded" | "rejected") => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.from("project_submissions").update({
      status,
      grade: status === "graded" ? Math.max(0, Math.min(100, grade)) : null,
      admin_feedback: feedback || null,
      reviewed_at: new Date().toISOString(),
    }).eq("id", editing.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    logAudit({ action: status === "graded" ? "update" : "delete", entity_type: "project", entity_id: editing.id, entity_label: `${editing.profile?.full_name} - ${editing.cursus?.title}`, metadata: { status, grade } });
    toast.success(status === "graded" ? "Projet noté" : "Projet refusé");
    setEditing(null);
    load();
  };

  const visible = rows.filter((r) => filter === "all" || r.status === filter);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Projets étudiants</CardTitle>
          <CardDescription>Corrigez les projets de fin de formation (40% de la note finale)</CardDescription>
        </div>
        <div className="flex gap-2">
          {(["pending", "graded", "rejected", "all"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
              {f === "pending" ? "En attente" : f === "graded" ? "Notés" : f === "rejected" ? "Refusés" : "Tous"}
              <Badge variant="secondary" className="ml-2">{rows.filter((r) => f === "all" || r.status === f).length}</Badge>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Cursus</TableHead>
                  <TableHead>Fichier</TableHead>
                  <TableHead>Soumis</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">
                      <div className="font-medium">{r.profile?.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.profile?.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">{r.cursus?.title || r.course_id}</TableCell>
                    <TableCell className="text-sm">
                      <button className="text-primary underline hover:opacity-70" onClick={() => download(r.file_path, r.file_name)}>
                        <Download className="h-3 w-3 inline mr-1" />{r.file_name}
                      </button>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.submitted_at).toLocaleString("fr-FR")}</TableCell>
                    <TableCell>
                      {r.status === "graded" ? <Badge className="bg-green-500/10 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Noté</Badge>
                        : r.status === "rejected" ? <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Refusé</Badge>
                        : <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />En attente</Badge>}
                    </TableCell>
                    <TableCell className="font-semibold">{r.grade != null ? `${r.grade}/100` : "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openReview(r)}>Corriger</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucun projet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Correction du projet</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="text-sm">
                <p><b>{editing.profile?.full_name}</b> · {editing.cursus?.title}</p>
                <button className="text-primary underline text-xs" onClick={() => download(editing.file_path, editing.file_name)}>
                  <Download className="h-3 w-3 inline mr-1" />Télécharger {editing.file_name}
                </button>
                {editing.notes && <p className="text-xs italic mt-2 p-2 bg-muted rounded">Note étudiant : {editing.notes}</p>}
              </div>
              <div>
                <Label>Note sur 100</Label>
                <Input type="number" min={0} max={100} value={grade} onChange={(e) => setGrade(+e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Poids 40% dans la note finale. Seuil de validation : 60.</p>
              </div>
              <div>
                <Label>Commentaire au candidat</Label>
                <Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Points forts, axes d'amélioration, recommandations..." />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => save("rejected")} disabled={saving}>Refuser</Button>
            <Button onClick={() => save("graded")} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Valider la note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminProjects;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FileCheck2, Loader2, Upload, Download } from "lucide-react";

export type ReportStatus = "not_submitted" | "submitted" | "under_review" | "revision_requested" | "validated" | "rejected";

export const REPORT_STATUS_LABEL: Record<string, string> = {
  not_submitted: "Non soumis",
  submitted: "Soumis",
  under_review: "En cours d'évaluation",
  revision_requested: "À corriger",
  validated: "Validé",
  rejected: "Rejeté",
};

export const reportStatusVariant = (s: string) =>
  s === "validated" ? "bg-green-500/10 text-green-700 border-green-500/30"
    : s === "rejected" ? "bg-destructive/10 text-destructive border-destructive/30"
    : s === "revision_requested" ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
    : "bg-muted text-muted-foreground border-border";

interface Props {
  cursusId: string;
  cursusTitle?: string;
  onStatusChange?: (status: string) => void;
}

const TrainingReportPanel = ({ cursusId, cursusTitle, onStatusChange }: Props) => {
  const { user } = useAuth();
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("training_reports").select("*")
      .eq("user_id", user.id).eq("cursus_id", cursusId).maybeSingle();
    setReport(data || null);
    setTitle(data?.title || "");
    setNote(data?.student_note || "");
    setLoading(false);
    onStatusChange?.(data?.status || "not_submitted");
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [user, cursusId]);

  const locked = report && ["validated", "under_review", "rejected"].includes(report.status);

  const submit = async () => {
    if (!user) return;
    if (!file && !report?.file_path) { toast.error("Sélectionnez un fichier PDF ou Word."); return; }
    setUploading(true);
    try {
      let filePath = report?.file_path as string | undefined;
      let fileName = report?.file_name as string | undefined;
      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
        if (!["pdf", "doc", "docx"].includes(ext)) throw new Error("Format accepté : PDF, DOC, DOCX");
        if (file.size > 25 * 1024 * 1024) throw new Error("Fichier trop volumineux (max 25 Mo)");
        const path = `${user.id}/${cursusId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("training-reports").upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        filePath = path;
        fileName = file.name;
      }
      const payload: any = {
        user_id: user.id, cursus_id: cursusId,
        title: title || `Rapport — ${cursusTitle || ""}`.trim(),
        student_note: note, file_path: filePath, file_name: fileName,
        status: "submitted", submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: report ? (report.version || 1) + (file ? 1 : 0) : 1,
      };
      const { error } = await (supabase as any).from("training_reports").upsert(payload, { onConflict: "user_id,cursus_id" });
      if (error) throw error;
      toast.success("Rapport envoyé à l'enseignant.");
      setFile(null);
      await load();
    } catch (e: any) {
      toast.error(e.message || "Envoi impossible");
    } finally {
      setUploading(false);
    }
  };

  const downloadMine = async () => {
    if (!report?.file_path) return;
    const { data } = await supabase.storage.from("training-reports").createSignedUrl(report.file_path, 600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  };

  if (loading) return <Card><CardContent className="p-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></CardContent></Card>;

  const status = report?.status || "not_submitted";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2"><FileCheck2 className="h-5 w-5 text-primary" />Rapport de formation</CardTitle>
            <CardDescription>
              Déposez votre rapport de formation ou de recherche. Le certificat est délivré après validation par l'enseignant.
            </CardDescription>
          </div>
          <Badge variant="outline" className={reportStatusVariant(status)}>{REPORT_STATUS_LABEL[status]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {report?.teacher_comment && (
          <div className="p-3 rounded border bg-muted/40 text-sm">
            <span className="font-medium">Observations de l'enseignant : </span>{report.teacher_comment}
          </div>
        )}
        {report?.file_path && (
          <div className="flex items-center justify-between gap-2 text-sm p-3 rounded border">
            <span className="truncate">{report.file_name || "Rapport déposé"} · version {report.version}</span>
            <Button size="sm" variant="outline" onClick={downloadMine}><Download className="h-4 w-4 mr-1" />Ouvrir</Button>
          </div>
        )}

        {status === "validated" ? (
          <p className="text-sm text-green-700">Rapport validé le {report?.reviewed_at ? new Date(report.reviewed_at).toLocaleDateString("fr-FR") : "—"}. Votre certificat peut être délivré.</p>
        ) : locked && status !== "revision_requested" ? (
          <p className="text-sm text-muted-foreground">
            {status === "rejected" ? "Rapport rejeté. Contactez votre enseignant." : "Rapport en cours d'évaluation — modification impossible."}
          </p>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="rep-title">Titre du rapport</Label>
              <Input id="rep-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Mémoire de fin de formation" />
            </div>
            <div>
              <Label htmlFor="rep-note">Commentaire (optionnel)</Label>
              <Textarea id="rep-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            </div>
            <div>
              <Label htmlFor="rep-file">Fichier PDF / Word (max 25 Mo)</Label>
              <Input id="rep-file" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <Button onClick={submit} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {report ? "Envoyer une nouvelle version" : "Déposer le rapport"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainingReportPanel;

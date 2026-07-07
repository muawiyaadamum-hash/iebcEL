import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, FileCheck2, Clock, XCircle, CheckCircle2, FileText } from "lucide-react";

interface Props {
  cursusId: string;
  cursusTitle: string;
  cursusSlug: string;
  userId: string;
}

const ProjectSubmissionCard = ({ cursusId, cursusTitle, cursusSlug, userId }: Props) => {
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = async () => {
    const { data } = await supabase
      .from("project_submissions")
      .select("*")
      .eq("user_id", userId)
      .eq("cursus_id", cursusId)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSubmission(data);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [cursusId, userId]);

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Sélectionnez un fichier");
    if (file.size > 50 * 1024 * 1024) return toast.error("Fichier trop volumineux (max 50 Mo)");

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/${cursusId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("student-projects").upload(path, file);
    if (upErr) { setUploading(false); return toast.error(upErr.message); }

    const { error: insErr } = await supabase.from("project_submissions").insert({
      user_id: userId,
      cursus_id: cursusId,
      course_id: cursusSlug,
      file_path: path,
      file_name: file.name,
      file_size: file.size,
      notes: notes || null,
      status: "pending",
    });
    setUploading(false);
    if (insErr) return toast.error(insErr.message);
    toast.success("Projet soumis. Notation sous 48-72h.");
    setNotes("");
    if (fileRef.current) fileRef.current.value = "";
    reload();
  };

  if (loading) return <Card><CardContent className="py-6"><Loader2 className="h-5 w-5 animate-spin" /></CardContent></Card>;

  const status = submission?.status;
  const badge =
    status === "graded" ? <Badge className="bg-green-500/10 text-green-700 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Noté</Badge>
    : status === "rejected" ? <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Refusé</Badge>
    : status === "pending" ? <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />En correction</Badge>
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4" />{cursusTitle}</CardTitle>
            <CardDescription>Projet de fin de formation (40% de la note finale)</CardDescription>
          </div>
          {badge}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {submission && (
          <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
            <div className="flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-primary" /><span className="font-medium">{submission.file_name}</span></div>
            <p className="text-xs text-muted-foreground">Soumis le {new Date(submission.submitted_at).toLocaleString("fr-FR")}</p>
            {submission.notes && <p className="text-xs italic">« {submission.notes} »</p>}
            {status === "graded" && (
              <div className="mt-2 pt-2 border-t space-y-1">
                <p className="font-semibold">Note : {submission.grade}/100</p>
                {submission.admin_feedback && <p className="text-xs">Retour du correcteur : {submission.admin_feedback}</p>}
              </div>
            )}
            {status === "rejected" && submission.admin_feedback && (
              <p className="text-xs text-red-700 mt-2">Motif : {submission.admin_feedback}</p>
            )}
          </div>
        )}

        {(!submission || status === "rejected") && (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`file-${cursusId}`}>Fichier du projet (PDF, DOCX, ZIP — max 50 Mo)</Label>
              <input
                ref={fileRef}
                id={`file-${cursusId}`}
                type="file"
                accept=".pdf,.doc,.docx,.zip,.rar,.pptx,.xlsx"
                className="block w-full text-sm mt-1 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            <div>
              <Label htmlFor={`notes-${cursusId}`}>Notes pour le correcteur (optionnel)</Label>
              <Textarea id={`notes-${cursusId}`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button onClick={upload} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              Soumettre le projet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectSubmissionCard;

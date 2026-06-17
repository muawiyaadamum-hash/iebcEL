import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Upload, FileText, CheckCircle2, Clock, XCircle } from "lucide-react";

const MAX_SIZE = 20 * 1024 * 1024;
const ALLOWED = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

interface Submission {
  id: string;
  file_name: string;
  status: string;
  submitted_at: string;
  admin_feedback: string | null;
  grade: number | null;
  notes: string | null;
}

const ProjectUpload = ({ courseId }: { courseId: string }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("project_submissions")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .order("submitted_at", { ascending: false });
    setSubmissions((data || []) as Submission[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user, courseId]);

  const handleUpload = async () => {
    if (!user || !file) return;
    if (!ALLOWED.includes(file.type)) {
      toast.error("Format non autorisé. PDF ou DOCX uniquement.");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Fichier trop volumineux (max 20 Mo).");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${courseId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("student-projects")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (upErr) {
      toast.error("Échec du téléversement : " + upErr.message);
      setUploading(false);
      return;
    }

    const { error: dbErr } = await supabase.from("project_submissions").insert({
      user_id: user.id,
      course_id: courseId,
      file_path: path,
      file_name: file.name,
      file_size: file.size,
      notes: notes || null,
    });

    if (dbErr) {
      toast.error("Erreur d'enregistrement : " + dbErr.message);
      setUploading(false);
      return;
    }

    toast.success("Projet soumis avec succès");
    setFile(null);
    setNotes("");
    await load();
    setUploading(false);
  };

  const statusBadge = (s: string) => {
    if (s === "approved") return <Badge className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Approuvé</Badge>;
    if (s === "rejected") return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeté</Badge>;
    return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Téléverser votre projet</CardTitle>
          <CardDescription>PDF ou DOCX uniquement — maximum 20 Mo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file">Fichier du projet</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
          </div>
          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Soumettre le projet
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mes soumissions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : submissions.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">Aucune soumission pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {submissions.map(s => (
                <div key={s.id} className="border rounded-lg p-3 flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-medium truncate">{s.file_name}</p>
                      {statusBadge(s.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.submitted_at).toLocaleString()}
                    </p>
                    {s.grade !== null && (
                      <p className="text-sm mt-1">Note : <strong>{s.grade}/100</strong></p>
                    )}
                    {s.admin_feedback && (
                      <p className="text-sm mt-1 italic">Feedback : {s.admin_feedback}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectUpload;

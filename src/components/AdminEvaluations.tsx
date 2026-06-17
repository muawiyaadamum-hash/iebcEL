import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Download, FileText } from "lucide-react";

interface Attempt {
  id: string;
  user_id: string;
  course_id: string;
  score: number;
  total: number;
  passed: boolean;
  created_at: string;
}

interface Submission {
  id: string;
  user_id: string;
  course_id: string;
  file_path: string;
  file_name: string;
  notes: string | null;
  status: string;
  admin_feedback: string | null;
  grade: number | null;
  submitted_at: string;
}

export const AdminQuizAttempts = () => {
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("quiz_attempts")
        .select("*")
        .order("created_at", { ascending: false });
      setAttempts((data || []) as any);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tentatives QCM</CardTitle>
        <CardDescription>Scores des étudiants par cours</CardDescription>
      </CardHeader>
      <CardContent>
        {attempts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucune tentative.</p>
        ) : (
          <div className="space-y-2">
            {attempts.map(a => (
              <div key={a.id} className="border rounded-lg p-3 flex items-center justify-between gap-2">
                <div className="text-sm">
                  <p className="font-medium">{a.course_id}</p>
                  <p className="text-muted-foreground text-xs">
                    User: {a.user_id.slice(0, 8)}… · {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{a.score}/100</Badge>
                  {a.passed ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Réussi</Badge>
                  ) : (
                    <Badge variant="destructive">Échec</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const AdminProjectSubmissions = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Submission[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { feedback: string; grade: string; status: string }>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("project_submissions")
      .select("*")
      .order("submitted_at", { ascending: false });
    setItems((data || []) as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const download = async (path: string, name: string) => {
    const { data, error } = await supabase.storage
      .from("student-projects")
      .createSignedUrl(path, 300);
    if (error || !data) {
      toast.error("Lien indisponible");
      return;
    }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = name;
    a.target = "_blank";
    a.click();
  };

  const save = async (s: Submission) => {
    const d = drafts[s.id] || { feedback: s.admin_feedback || "", grade: s.grade?.toString() || "", status: s.status };
    const grade = d.grade ? parseInt(d.grade) : null;
    if (grade !== null && (isNaN(grade) || grade < 0 || grade > 100)) {
      toast.error("Note entre 0 et 100");
      return;
    }
    const { error } = await supabase
      .from("project_submissions")
      .update({
        admin_feedback: d.feedback || null,
        grade,
        status: d.status,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", s.id);
    if (error) {
      toast.error("Échec de la mise à jour");
      return;
    }
    toast.success("Évaluation enregistrée");
    load();
  };

  if (loading) return <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projets soumis</CardTitle>
        <CardDescription>Évaluez et notez les projets étudiants</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucun projet soumis.</p>
        ) : (
          items.map(s => {
            const d = drafts[s.id] || { feedback: s.admin_feedback || "", grade: s.grade?.toString() || "", status: s.status };
            const setD = (patch: Partial<typeof d>) =>
              setDrafts(prev => ({ ...prev, [s.id]: { ...d, ...patch } }));
            return (
              <div key={s.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">{s.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.course_id} · {new Date(s.submitted_at).toLocaleString()}
                      </p>
                      {s.notes && <p className="text-sm italic mt-1">{s.notes}</p>}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => download(s.file_path, s.file_name)}>
                    <Download className="h-4 w-4 mr-1" /> Télécharger
                  </Button>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label>Statut</Label>
                    <Select value={d.status} onValueChange={(v) => setD({ status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="approved">Approuvé</SelectItem>
                        <SelectItem value="rejected">Rejeté</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Note /100</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={d.grade}
                      onChange={(e) => setD({ grade: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Feedback</Label>
                  <Textarea
                    value={d.feedback}
                    onChange={(e) => setD({ feedback: e.target.value })}
                    rows={2}
                  />
                </div>
                <Button size="sm" onClick={() => save(s)}>Enregistrer</Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

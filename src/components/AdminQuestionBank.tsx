import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Upload, Pencil } from "lucide-react";
import { toast } from "sonner";
import { fetchCursusList, type Cursus } from "@/lib/lms";

interface QBankItem {
  id: string;
  cursus_id: string;
  question: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string | null;
  topic: string | null;
  difficulty: string;
  published: boolean;
}

const emptyItem: Partial<QBankItem> = {
  question: "", option_a: "", option_b: "", option_c: "", option_d: "",
  correct_option: "A", explanation: "", topic: "", difficulty: "medium", published: true,
};

const AdminQuestionBank = () => {
  const [cursusList, setCursusList] = useState<Cursus[]>([]);
  const [cursusId, setCursusId] = useState<string>("");
  const [items, setItems] = useState<QBankItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<QBankItem> | null>(null);
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => { fetchCursusList().then(setCursusList); }, []);

  useEffect(() => {
    if (!cursusId) { setItems([]); return; }
    setLoading(true);
    supabase
      .from("exam_question_bank")
      .select("*")
      .eq("cursus_id", cursusId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setItems((data as QBankItem[]) || []);
        setLoading(false);
      });
  }, [cursusId]);

  const save = async () => {
    if (!editing || !cursusId) return;
    const payload = {
      cursus_id: cursusId,
      question: editing.question?.trim() || "",
      option_a: editing.option_a?.trim() || "",
      option_b: editing.option_b?.trim() || "",
      option_c: editing.option_c?.trim() || "",
      option_d: editing.option_d?.trim() || "",
      correct_option: editing.correct_option || "A",
      explanation: editing.explanation || null,
      topic: editing.topic || null,
      difficulty: editing.difficulty || "medium",
      published: editing.published ?? true,
    };
    if (!payload.question || !payload.option_a || !payload.option_b || !payload.option_c || !payload.option_d) {
      toast.error("Question et 4 options requises."); return;
    }
    const res = editing.id
      ? await supabase.from("exam_question_bank").update(payload).eq("id", editing.id)
      : await supabase.from("exam_question_bank").insert(payload);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Question enregistrée");
    setOpen(false); setEditing(null);
    // refresh
    const { data } = await supabase.from("exam_question_bank").select("*").eq("cursus_id", cursusId).order("created_at", { ascending: false });
    setItems((data as QBankItem[]) || []);
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette question ?")) return;
    const { error } = await supabase.from("exam_question_bank").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  const handleCsvImport = async (file: File) => {
    if (!cursusId) { toast.error("Sélectionnez d'abord un cursus."); return; }
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const header = lines.shift()?.split(",").map((h) => h.trim().toLowerCase()) || [];
      const required = ["question", "option_a", "option_b", "option_c", "option_d", "correct_option"];
      for (const k of required) if (!header.includes(k)) throw new Error(`Colonne manquante: ${k}`);
      const parsed = lines.map((line) => {
        // naive CSV split (no quoted commas) — instruct admins to use simple CSV
        const cols = line.split(",");
        const row: any = { cursus_id: cursusId, published: true, difficulty: "medium" };
        header.forEach((h, i) => { row[h] = (cols[i] ?? "").trim(); });
        row.correct_option = String(row.correct_option).toUpperCase();
        return row;
      });
      // batch insert in chunks of 100
      for (let i = 0; i < parsed.length; i += 100) {
        const chunk = parsed.slice(i, i + 100);
        const { error } = await supabase.from("exam_question_bank").insert(chunk);
        if (error) throw error;
      }
      toast.success(`${parsed.length} questions importées`);
      const { data } = await supabase.from("exam_question_bank").select("*").eq("cursus_id", cursusId).order("created_at", { ascending: false });
      setItems((data as QBankItem[]) || []);
    } catch (e: any) {
      toast.error(e.message || "Échec de l'import");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banque de questions QCM</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <Label>Cursus</Label>
            <Select value={cursusId} onValueChange={setCursusId}>
              <SelectTrigger><SelectValue placeholder="Sélectionner un cursus" /></SelectTrigger>
              <SelectContent className="bg-popover">
                {cursusList.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button disabled={!cursusId} onClick={() => { setEditing({ ...emptyItem }); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Ajouter
          </Button>
          <label className="inline-flex">
            <input
              type="file" accept=".csv" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleCsvImport(e.target.files[0])}
              disabled={!cursusId || importing}
            />
            <Button variant="outline" disabled={!cursusId || importing} asChild>
              <span>{importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}Importer CSV</span>
            </Button>
          </label>
        </div>

        <p className="text-xs text-muted-foreground">
          Format CSV : <code>question,option_a,option_b,option_c,option_d,correct_option,explanation,topic</code> (sans virgule dans les champs).
        </p>

        {cursusId && (
          <div className="text-sm">
            <b>{items.length}</b> question(s) dans la banque {items.length >= 500 ? "✓ (objectif atteint)" : `— objectif 500`}.
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {items.map((it, i) => (
              <div key={it.id} className="border rounded p-3 flex items-start justify-between gap-3">
                <div className="flex-1 text-sm">
                  <div className="font-medium">Q{i + 1}. {it.question}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Réponse correcte : <b>{it.correct_option}</b>
                    {it.topic && <> · Thème : {it.topic}</>}
                    {!it.published && <> · <span className="text-yellow-600">non publiée</span></>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(it); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {items.length === 0 && cursusId && (
              <p className="text-center text-muted-foreground py-6">Aucune question. Ajoutez-en ou importez un CSV.</p>
            )}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing?.id ? "Modifier" : "Nouvelle"} question</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-3">
                <div><Label>Question</Label>
                  <Textarea value={editing.question || ""} onChange={(e) => setEditing({ ...editing, question: e.target.value })} rows={3} />
                </div>
                {(["a", "b", "c", "d"] as const).map((k) => (
                  <div key={k}>
                    <Label>Option {k.toUpperCase()}</Label>
                    <Input value={(editing as any)[`option_${k}`] || ""} onChange={(e) => setEditing({ ...editing, [`option_${k}`]: e.target.value })} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Réponse correcte</Label>
                    <Select value={editing.correct_option || "A"} onValueChange={(v) => setEditing({ ...editing, correct_option: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        {["A", "B", "C", "D"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Difficulté</Label>
                    <Select value={editing.difficulty || "medium"} onValueChange={(v) => setEditing({ ...editing, difficulty: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        {["easy", "medium", "hard"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Thème (optionnel)</Label>
                  <Input value={editing.topic || ""} onChange={(e) => setEditing({ ...editing, topic: e.target.value })} />
                </div>
                <div><Label>Explication (optionnel)</Label>
                  <Textarea value={editing.explanation || ""} onChange={(e) => setEditing({ ...editing, explanation: e.target.value })} rows={2} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                  <Button onClick={save}>Enregistrer</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminQuestionBank;

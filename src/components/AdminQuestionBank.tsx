import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Upload, Pencil, Sparkles, FileDown } from "lucide-react";
import { toast } from "sonner";
import { fetchCursusList, fetchModules, type Cursus } from "@/lib/lms";
import { Badge } from "@/components/ui/badge";
import { exportBankCsv, exportBankJson, exportBankPdf, exportBankDocx } from "@/lib/questionBankExport";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type QType = "qcm" | "true_false" | "multi";

interface QBankItem {
  id: string;
  cursus_id: string;
  question: string;
  question_type: QType;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  correct_options: string[];
  explanation: string | null;
  topic: string | null;
  difficulty: string;
  published: boolean;
}

const emptyItem: Partial<QBankItem> = {
  question: "", question_type: "qcm",
  option_a: "", option_b: "", option_c: "", option_d: "",
  correct_option: "A", correct_options: ["A"],
  explanation: "", topic: "", difficulty: "medium", published: true,
};

const typeLabel = (t?: QType) => t === "true_false" ? "Vrai/Faux" : t === "multi" ? "Multi-réponses" : "QCM";

const AdminQuestionBank = () => {
  const [cursusList, setCursusList] = useState<Cursus[]>([]);
  const [cursusId, setCursusId] = useState<string>("");
  const [items, setItems] = useState<QBankItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<QBankItem> | null>(null);
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [aiImporting, setAiImporting] = useState(false);
  const [aiPreview, setAiPreview] = useState<any[] | null>(null);

  const [moduleTopics, setModuleTopics] = useState<string[]>([]);

  useEffect(() => { fetchCursusList().then(setCursusList); }, []);

  useEffect(() => {
    if (!cursusId) { setItems([]); setModuleTopics([]); return; }
    fetchModules(cursusId).then((mods) => setModuleTopics(mods.map((m) => m.title)));
    setLoading(true);
    supabase
      .from("exam_question_bank")
      .select("*")
      .eq("cursus_id", cursusId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setItems(((data as any) || []) as QBankItem[]);
        setLoading(false);
      });
  }, [cursusId]);

  const save = async () => {
    if (!editing || !cursusId) return;
    const correct = (editing.correct_option || "A") as "A"|"B"|"C"|"D";
    const correct_options = editing.question_type === "multi" && editing.correct_options?.length
      ? editing.correct_options : [correct];
    const payload: any = {
      cursus_id: cursusId,
      question: editing.question?.trim() || "",
      question_type: editing.question_type || "qcm",
      option_a: editing.option_a?.trim() || "",
      option_b: editing.option_b?.trim() || "",
      option_c: editing.option_c?.trim() || "",
      option_d: editing.option_d?.trim() || "",
      correct_option: correct,
      correct_options,
      explanation: editing.explanation || null,
      topic: editing.topic || null,
      difficulty: editing.difficulty || "medium",
      published: editing.published ?? true,
    };
    const isTF = payload.question_type === "true_false";
    if (!payload.question || !payload.option_a || !payload.option_b || (!isTF && (!payload.option_c || !payload.option_d))) {
      toast.error(isTF ? "Question et 2 options (Vrai/Faux) requises." : "Question et 4 options requises."); return;
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

  const handleAiImport = async (file: File) => {
    if (!cursusId) { toast.error("Sélectionnez d'abord un cursus."); return; }
    setAiImporting(true);
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      const ext = file.name.split(".").pop()?.toLowerCase();
      const isJson = ext === "json" || file.type === "application/json";
      const body: any = isJson
        ? { format: "json", raw_text: await file.text(), topics: moduleTopics }
        : { filename: file.name, mime: file.type || (ext === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"), base64, topics: moduleTopics };

      const { data, error } = await supabase.functions.invoke("import-questions", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const questions = data?.questions || [];
      if (questions.length === 0) throw new Error("Aucune question extraite du document.");
      setAiPreview(questions);
      toast.success(`${questions.length} questions extraites — vérifiez puis validez.`);
    } catch (e: any) {
      toast.error(e.message || "Échec de l'import IA");
    } finally {
      setAiImporting(false);
    }
  };

  const confirmAiImport = async () => {
    if (!aiPreview || !cursusId) return;
    const payload = aiPreview.map((q) => ({
      cursus_id: cursusId,
      question: q.question,
      question_type: q.question_type || "qcm",
      option_a: q.option_a, option_b: q.option_b,
      option_c: q.option_c || "—", option_d: q.option_d || "—",
      correct_option: q.correct_option || "A",
      correct_options: Array.isArray(q.correct_options) && q.correct_options.length ? q.correct_options : [q.correct_option || "A"],
      explanation: q.explanation || null,
      topic: q.topic || null,
      difficulty: q.difficulty || "medium",
      published: true,
    }));
    for (let i = 0; i < payload.length; i += 100) {
      const { error } = await supabase.from("exam_question_bank").insert(payload.slice(i, i + 100));
      if (error) { toast.error(error.message); return; }
    }
    toast.success(`${payload.length} questions ajoutées à la banque`);
    setAiPreview(null);
    const { data } = await supabase.from("exam_question_bank").select("*").eq("cursus_id", cursusId).order("created_at", { ascending: false });
    setItems(((data as any) || []) as QBankItem[]);
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
          <label className="inline-flex">
            <input
              type="file" accept=".pdf,.docx,.json,.txt,.md" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleAiImport(e.target.files[0])}
              disabled={!cursusId || aiImporting}
            />
            <Button variant="secondary" disabled={!cursusId || aiImporting} asChild>
              <span>{aiImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}Import IA (PDF/DOCX/JSON)</span>
            </Button>
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!cursusId || items.length === 0}>
                <FileDown className="h-4 w-4 mr-2" />Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover">
              {(() => {
                const title = cursusList.find(c => c.id === cursusId)?.title || "Banque IEBC";
                return <>
                  <DropdownMenuItem onClick={() => exportBankCsv(items)}>Export CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportBankJson(items)}>Export JSON</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportBankPdf(items, title)}>Export PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportBankDocx(items, title)}>Export DOCX</DropdownMenuItem>
                </>;
              })()}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-xs text-muted-foreground">
          CSV : <code>question,option_a,option_b,option_c,option_d,correct_option,explanation,topic</code>.{" "}
          IA : téléversez un PDF, DOCX ou JSON — l'IA extrait automatiquement les questions et les réponses.
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
                  <div className="font-medium flex items-center gap-2 flex-wrap">
                    <span>Q{i + 1}. {it.question}</span>
                    <Badge variant="secondary" className="text-[10px]">{typeLabel(it.question_type)}</Badge>
                    {it.topic && <Badge variant="outline" className="text-[10px]">{it.topic}</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Réponse(s) : <b>{(it.correct_options?.length ? it.correct_options : [it.correct_option]).join(", ")}</b>
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
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Type</Label>
                    <Select value={editing.question_type || "qcm"} onValueChange={(v) => {
                      const tf = v === "true_false";
                      setEditing({
                        ...editing, question_type: v as QType,
                        option_a: tf ? "Vrai" : (editing.option_a || ""),
                        option_b: tf ? "Faux" : (editing.option_b || ""),
                        option_c: tf ? "—" : (editing.option_c || ""),
                        option_d: tf ? "—" : (editing.option_d || ""),
                      });
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="qcm">QCM (une réponse)</SelectItem>
                        <SelectItem value="true_false">Vrai / Faux</SelectItem>
                        <SelectItem value="multi">Réponses multiples</SelectItem>
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
                {(["a", "b", "c", "d"] as const).map((k) => {
                  const isTF = editing.question_type === "true_false";
                  if (isTF && (k === "c" || k === "d")) return null;
                  return (
                    <div key={k}>
                      <Label>Option {k.toUpperCase()}</Label>
                      <Input value={(editing as any)[`option_${k}`] || ""} onChange={(e) => setEditing({ ...editing, [`option_${k}`]: e.target.value })} />
                    </div>
                  );
                })}
                {editing.question_type === "multi" ? (
                  <div><Label>Bonnes réponses (cocher)</Label>
                    <div className="flex gap-3 mt-2">
                      {(["A","B","C","D"] as const).map(x => {
                        const arr = editing.correct_options || [];
                        const checked = arr.includes(x);
                        return (
                          <label key={x} className="flex items-center gap-1 text-sm">
                            <input type="checkbox" checked={checked} onChange={(e) => {
                              const next = e.target.checked ? [...arr, x] : arr.filter(o => o !== x);
                              setEditing({ ...editing, correct_options: next, correct_option: (next[0] as any) || "A" });
                            }} />{x}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div><Label>Réponse correcte</Label>
                    <Select value={editing.correct_option || "A"} onValueChange={(v) => setEditing({ ...editing, correct_option: v as any, correct_options: [v] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        {(editing.question_type === "true_false" ? ["A","B"] : ["A","B","C","D"]).map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div><Label>Thème (module)</Label>
                  {moduleTopics.length > 0 ? (
                    <Select value={editing.topic || ""} onValueChange={(v) => setEditing({ ...editing, topic: v })}>
                      <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        {moduleTopics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={editing.topic || ""} onChange={(e) => setEditing({ ...editing, topic: e.target.value })} />
                  )}
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

        <Dialog open={!!aiPreview} onOpenChange={(v) => !v && setAiPreview(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Aperçu de l'extraction IA — {aiPreview?.length || 0} questions</DialogTitle></DialogHeader>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {aiPreview?.map((q, i) => {
                const correct: string[] = Array.isArray(q.correct_options) && q.correct_options.length ? q.correct_options : [q.correct_option];
                const isTF = q.question_type === "true_false";
                return (
                  <div key={i} className="border rounded p-2 text-sm">
                    <div className="font-medium flex items-center gap-2 flex-wrap">
                      <span>Q{i + 1}. {q.question}</span>
                      <Badge variant="secondary" className="text-[10px]">{typeLabel(q.question_type)}</Badge>
                      {q.topic && <Badge variant="outline" className="text-[10px]">{q.topic}</Badge>}
                    </div>
                    <ul className="text-xs mt-1 space-y-0.5">
                      {(isTF ? ["A","B"] : ["A","B","C","D"] as const).map((k) => (
                        <li key={k} className={correct.includes(k) ? "text-green-700 font-semibold" : ""}>
                          {k}. {q[`option_${k.toLowerCase()}`]}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && <p className="text-[11px] text-muted-foreground mt-1 italic">{q.explanation}</p>}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAiPreview(null)}>Annuler</Button>
              <Button onClick={confirmAiImport}>Tout ajouter à la banque</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminQuestionBank;

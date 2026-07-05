import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Pencil, FileText, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { fetchCursusList, fetchModules, type Cursus, type CursusModule } from "@/lib/lms";

interface Resource {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  file_type: string | null;
  external_url: string | null;
  display_order: number;
  published: boolean;
}

const AdminModuleResources = () => {
  const [cursusList, setCursusList] = useState<Cursus[]>([]);
  const [cursusId, setCursusId] = useState<string>("");
  const [modules, setModules] = useState<CursusModule[]>([]);
  const [moduleId, setModuleId] = useState<string>("");
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Resource> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ url: string; type: string; title: string } | null>(null);

  const openPreview = async (r: Resource) => {
    if (!r.file_path) { if (r.external_url) window.open(r.external_url, "_blank"); return; }
    const { data } = await supabase.storage.from("course-content").createSignedUrl(r.file_path, 3600);
    if (data?.signedUrl) setPreview({ url: data.signedUrl, type: (r.file_type || "").toLowerCase(), title: r.title });
  };

  useEffect(() => { fetchCursusList().then(setCursusList); }, []);
  useEffect(() => {
    if (!cursusId) { setModules([]); setModuleId(""); return; }
    fetchModules(cursusId).then((m) => { setModules(m); setModuleId(""); });
  }, [cursusId]);

  const load = async () => {
    if (!moduleId) { setItems([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("module_resources" as any)
      .select("*")
      .eq("module_id", moduleId)
      .order("display_order");
    if (error) toast.error(error.message);
    setItems(((data as any) || []) as Resource[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [moduleId]);

  const openNew = () => {
    setEditing({ title: "", description: "", display_order: items.length, published: true, external_url: "" });
    setFile(null); setOpen(true);
  };
  const openEdit = (r: Resource) => { setEditing(r); setFile(null); setOpen(true); };

  const save = async () => {
    if (!editing || !moduleId) return;
    if (!editing.title?.trim()) { toast.error("Titre requis"); return; }
    setSaving(true);
    try {
      let file_path = editing.file_path || null;
      let file_type = editing.file_type || null;
      if (file) {
        const path = `resources/${moduleId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("course-content").upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        file_path = path;
        file_type = file.name.split(".").pop()?.toLowerCase() || file.type;
      }
      const payload: any = {
        module_id: moduleId,
        title: editing.title.trim(),
        description: editing.description || null,
        file_path, file_type,
        external_url: editing.external_url || null,
        display_order: editing.display_order ?? items.length,
        published: editing.published ?? true,
      };
      const res = editing.id
        ? await (supabase.from("module_resources" as any).update(payload).eq("id", editing.id))
        : await (supabase.from("module_resources" as any).insert(payload));
      if (res.error) throw res.error;
      toast.success("Ressource enregistrée");
      setOpen(false); setEditing(null); setFile(null);
      load();
    } catch (e: any) {
      toast.error(e.message || "Échec");
    } finally { setSaving(false); }
  };

  const remove = async (r: Resource) => {
    if (!confirm("Supprimer cette ressource ?")) return;
    if (r.file_path) await supabase.storage.from("course-content").remove([r.file_path]);
    const { error } = await supabase.from("module_resources" as any).delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    load();
  };

  const downloadUrl = async (path: string) => {
    const { data } = await supabase.storage.from("course-content").createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Ressources de cours (PDF, DOCX…)</CardTitle>
        <CardDescription>Publiez les supports de cours par module. Visibles uniquement par les apprenants inscrits validés.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>Cursus</Label>
            <Select value={cursusId} onValueChange={setCursusId}>
              <SelectTrigger><SelectValue placeholder="Sélectionner un cursus" /></SelectTrigger>
              <SelectContent className="bg-popover">
                {cursusList.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Module</Label>
            <Select value={moduleId} onValueChange={setModuleId} disabled={!cursusId}>
              <SelectTrigger><SelectValue placeholder={cursusId ? "Sélectionner un module" : "Choisir un cursus d'abord"} /></SelectTrigger>
              <SelectContent className="bg-popover">
                {modules.map(m => <SelectItem key={m.id} value={m.id}>{m.display_order + 1}. {m.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {moduleId && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{items.length} ressource(s)</p>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Ajouter une ressource</Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {items.map(r => (
              <div key={r.id} className="border rounded p-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {r.title}
                    {r.file_type && <Badge variant="secondary" className="uppercase text-xs">{r.file_type}</Badge>}
                    {!r.published && <Badge variant="outline">non publié</Badge>}
                  </div>
                  {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                  {r.external_url && <a href={r.external_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">{r.external_url}</a>}
                </div>
                <div className="flex gap-1">
                  {(r.file_path || r.external_url) && <Button size="icon" variant="ghost" title="Aperçu" onClick={() => openPreview(r)}><Eye className="h-4 w-4" /></Button>}
                  {r.file_path && <Button size="icon" variant="ghost" onClick={() => downloadUrl(r.file_path!)}><Download className="h-4 w-4" /></Button>}
                  <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {moduleId && items.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Aucune ressource pour ce module.</p>
            )}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>{editing?.id ? "Modifier" : "Nouvelle"} ressource</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-3">
                <div><Label>Titre</Label>
                  <Input value={editing.title || ""} onChange={e => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div><Label>Description</Label>
                  <Textarea rows={2} value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
                </div>
                <div><Label>Fichier (PDF, DOCX, PPTX…)</Label>
                  <Input type="file" accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.md,.zip"
                    onChange={e => setFile(e.target.files?.[0] || null)} />
                  {editing.file_path && !file && <p className="text-xs text-muted-foreground mt-1">Fichier actuel conservé.</p>}
                </div>
                <div><Label>Lien externe (optionnel)</Label>
                  <Input value={editing.external_url || ""} placeholder="https://..."
                    onChange={e => setEditing({ ...editing, external_url: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Ordre</Label>
                    <Input type="number" value={editing.display_order ?? 0}
                      onChange={e => setEditing({ ...editing, display_order: +e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch checked={editing.published ?? true} onCheckedChange={v => setEditing({ ...editing, published: v })} />
                    <Label>Publié</Label>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
          <DialogContent className="max-w-5xl">
            <DialogHeader><DialogTitle>{preview?.title}</DialogTitle></DialogHeader>
            {preview && (() => {
              const t = preview.type;
              if (["png","jpg","jpeg","gif","webp","svg"].includes(t)) {
                return <img src={preview.url} alt={preview.title} className="max-h-[75vh] w-full object-contain" />;
              }
              if (t === "pdf") {
                return <iframe src={preview.url} title={preview.title} className="w-full h-[75vh] border rounded" />;
              }
              if (["docx","doc","pptx","ppt","xlsx","xls"].includes(t)) {
                const office = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(preview.url)}`;
                return <iframe src={office} title={preview.title} className="w-full h-[75vh] border rounded" />;
              }
              if (["txt","md","csv","json"].includes(t)) {
                return <iframe src={preview.url} title={preview.title} className="w-full h-[75vh] border rounded bg-white" />;
              }
              return <div className="text-sm text-muted-foreground py-6 text-center">
                Aperçu non disponible pour ce type de fichier. <a href={preview.url} target="_blank" rel="noreferrer" className="text-primary underline">Télécharger</a>
              </div>;
            })()}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminModuleResources;

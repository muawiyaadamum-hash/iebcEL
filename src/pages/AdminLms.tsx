import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Loader2, Plus, Trash2, Pencil, Shield, CheckCircle2, XCircle, ArrowLeft, BookOpen, Layers, FileText, HelpCircle, Video } from "lucide-react";
import { fetchPoles, fetchCursusList, fetchModules, fetchLessons, type Pole, type Cursus, type CursusModule, type Lesson } from "@/lib/lms";
import AdminQuestionBank from "@/components/AdminQuestionBank";
import AdminLiveSessions from "@/components/AdminLiveSessions";

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const AdminLms = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState("poles");

  // Data
  const [poles, setPoles] = useState<Pole[]>([]);
  const [cursus, setCursus] = useState<Cursus[]>([]);
  const [modulesByCursus, setModulesByCursus] = useState<Record<string, CursusModule[]>>({});
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [enrollments, setEnrollments] = useState<any[]>([]);

  // selection for nested editing
  const [selectedCursusId, setSelectedCursusId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const isStaff = (roles || []).some((r: any) => r.role === "admin" || r.role === "responsable_pedagogique");
      setAllowed(isStaff);
      if (isStaff) await reloadAll();
    })();
  }, [user, authLoading]);

  const reloadAll = async () => {
    const [p, c, { data: e }, { data: profs }] = await Promise.all([
      supabase.from("poles").select("*").order("display_order").then(r => (r.data || []) as Pole[]),
      supabase.from("cursus").select("*, pole:poles(*)").order("display_order").then(r => (r.data || []) as any[]),
      supabase.from("course_enrollments").select("*, cursus:cursus(title,slug)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id,full_name,email,phone"),
    ]);
    const profMap = new Map((profs || []).map((pr: any) => [pr.user_id, pr]));
    const enriched = (e || []).map((row: any) => ({ ...row, profile: profMap.get(row.user_id) || null }));
    setPoles(p); setCursus(c); setEnrollments(enriched);
  };

  const loadModulesFor = async (cursusId: string) => {
    const mods = await fetchModules(cursusId);
    setModulesByCursus(prev => ({ ...prev, [cursusId]: mods }));
    return mods;
  };
  const loadLessonsFor = async (moduleId: string) => {
    const ls = await fetchLessons(moduleId);
    setLessonsByModule(prev => ({ ...prev, [moduleId]: ls }));
    return ls;
  };

  if (authLoading || allowed === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) { navigate("/auth"); return null; }
  if (!allowed) return (
    <div className="min-h-screen bg-background"><Navbar />
      <section className="py-20 text-center"><div className="container mx-auto px-4">
        <Shield className="h-16 w-16 mx-auto text-destructive mb-6" />
        <h1 className="text-3xl font-bold mb-4">Accès refusé</h1>
        <p className="text-muted-foreground mb-6">Réservé à l'admin et au responsable pédagogique.</p>
        <Button onClick={() => navigate("/dashboard")}>Retour</Button>
      </div></section><Footer /></div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="h-7 w-7 text-primary" />Administration pédagogique</h1>
              <p className="text-muted-foreground">Gérez pôles, cursus, modules, leçons et inscriptions</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/admin")}><ArrowLeft className="h-4 w-4 mr-2" />Admin général</Button>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="poles"><Layers className="h-4 w-4 mr-1" />Pôles ({poles.length})</TabsTrigger>
              <TabsTrigger value="cursus"><BookOpen className="h-4 w-4 mr-1" />Cursus ({cursus.length})</TabsTrigger>
              <TabsTrigger value="modules"><FileText className="h-4 w-4 mr-1" />Modules & leçons</TabsTrigger>
              <TabsTrigger value="qcm"><HelpCircle className="h-4 w-4 mr-1" />Banque QCM</TabsTrigger>
              <TabsTrigger value="visio"><Video className="h-4 w-4 mr-1" />Cours vidéo / visio</TabsTrigger>
              <TabsTrigger value="enrollments">Inscriptions ({enrollments.filter(e => e.status === "pending").length} en attente)</TabsTrigger>
            </TabsList>

            <TabsContent value="poles">
              <PolesPanel poles={poles} onChange={reloadAll} />
            </TabsContent>
            <TabsContent value="cursus">
              <CursusPanel cursus={cursus} poles={poles} onChange={reloadAll} />
            </TabsContent>
            <TabsContent value="modules">
              <ModulesLessonsPanel
                cursus={cursus}
                selectedCursusId={selectedCursusId}
                setSelectedCursusId={(id) => { setSelectedCursusId(id); setSelectedModuleId(null); if (id) loadModulesFor(id); }}
                modulesByCursus={modulesByCursus}
                lessonsByModule={lessonsByModule}
                selectedModuleId={selectedModuleId}
                setSelectedModuleId={(id) => { setSelectedModuleId(id); if (id) loadLessonsFor(id); }}
                reloadModules={loadModulesFor}
                reloadLessons={loadLessonsFor}
              />
            </TabsContent>
            <TabsContent value="qcm">
              <AdminQuestionBank />
            </TabsContent>
            <TabsContent value="visio">
              <AdminLiveSessions />
            </TabsContent>
            <TabsContent value="enrollments">
              <EnrollmentsPanel enrollments={enrollments} onChange={reloadAll} adminId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
};

/* ---------- Pôles ---------- */
function PolesPanel({ poles, onChange }: { poles: Pole[]; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pole | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", description: "", display_order: 0, published: true });

  const openNew = () => { setEditing(null); setForm({ title: "", slug: "", description: "", display_order: poles.length, published: true }); setOpen(true); };
  const openEdit = (p: Pole) => { setEditing(p); setForm({ title: p.title, slug: p.slug, description: p.description || "", display_order: p.display_order, published: p.published }); setOpen(true); };

  const save = async () => {
    const payload = { ...form, slug: form.slug || slugify(form.title) };
    const { error } = editing
      ? await supabase.from("poles").update(payload).eq("id", editing.id)
      : await supabase.from("poles").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Pôle enregistré"); setOpen(false); onChange();
  };
  const remove = async (id: string) => {
    if (!confirm("Supprimer ce pôle et tous ses cursus ?")) return;
    const { error } = await supabase.from("poles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Pôle supprimé"); onChange();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>Pôles de formation</CardTitle><CardDescription>Les grandes catégories du catalogue</CardDescription></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nouveau pôle</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifier le pôle" : "Nouveau pôle"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titre</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Ordre</Label><Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: +e.target.value })} /></div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={form.published} onCheckedChange={v => setForm({ ...form, published: v })} /><Label>Publié</Label></div>
              </div>
            </div>
            <DialogFooter><Button onClick={save}>Enregistrer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Ordre</TableHead><TableHead>Titre</TableHead><TableHead>Slug</TableHead><TableHead>Statut</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {poles.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.display_order}</TableCell>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-muted-foreground">{p.slug}</TableCell>
                  <TableCell>{p.published ? <Badge>Publié</Badge> : <Badge variant="secondary">Masqué</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- Cursus ---------- */
function CursusPanel({ cursus, poles, onChange }: { cursus: Cursus[]; poles: Pole[]; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cursus | null>(null);
  const blank = () => ({ pole_id: poles[0]?.id || "", title: "", slug: "", description: "", objectives: "", level: "Débutant", duration_hours: 0, duration_label: "", price_xaf: 0, registration_fee_xaf: 10000, modality: "en_ligne", certification: true, featured: false, published: true, display_order: 0 });
  const [form, setForm] = useState<any>(blank());

  const openNew = () => { setEditing(null); setForm({ ...blank(), display_order: cursus.length }); setOpen(true); };
  const openEdit = (c: Cursus) => { setEditing(c); setForm({ ...c, description: c.description || "", objectives: c.objectives || "", duration_label: c.duration_label || "" }); setOpen(true); };

  const save = async () => {
    const payload: any = { ...form, slug: form.slug || slugify(form.title) };
    delete payload.pole; delete payload.id; delete payload.created_at; delete payload.updated_at;
    const { error } = editing
      ? await supabase.from("cursus").update(payload).eq("id", editing.id)
      : await supabase.from("cursus").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Cursus enregistré"); setOpen(false); onChange();
  };
  const remove = async (id: string) => {
    if (!confirm("Supprimer ce cursus ?")) return;
    const { error } = await supabase.from("cursus").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Supprimé"); onChange();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>Cursus</CardTitle><CardDescription>Programmes de formation rattachés à un pôle</CardDescription></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nouveau cursus</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Modifier le cursus" : "Nouveau cursus"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Pôle</Label>
                <Select value={form.pole_id} onValueChange={v => setForm({ ...form, pole_id: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{poles.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Titre</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} /></div>
                <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
              </div>
              <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Objectifs</Label><Textarea rows={3} value={form.objectives} onChange={e => setForm({ ...form, objectives: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Niveau</Label>
                  <Select value={form.level} onValueChange={v => setForm({ ...form, level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Débutant">Débutant</SelectItem><SelectItem value="Intermédiaire">Intermédiaire</SelectItem><SelectItem value="Avancé">Avancé</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Durée (h)</Label><Input type="number" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: +e.target.value })} /></div>
                <div><Label>Libellé durée</Label><Input value={form.duration_label} onChange={e => setForm({ ...form, duration_label: e.target.value })} placeholder="ex: 6 mois / 120 h" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Tarif (XAF)</Label><Input type="number" value={form.price_xaf} onChange={e => setForm({ ...form, price_xaf: +e.target.value })} /></div>
                <div><Label>Frais inscription (XAF)</Label><Input type="number" value={form.registration_fee_xaf} onChange={e => setForm({ ...form, registration_fee_xaf: +e.target.value })} /></div>
                <div><Label>Modalité</Label>
                  <Select value={form.modality} onValueChange={v => setForm({ ...form, modality: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="en_ligne">En ligne</SelectItem><SelectItem value="presentiel">Présentiel</SelectItem><SelectItem value="hybride">Hybride</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 items-center">
                <div className="flex items-center gap-2"><Switch checked={form.certification} onCheckedChange={v => setForm({ ...form, certification: v })} /><Label>Certifiant</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={v => setForm({ ...form, featured: v })} /><Label>Phare</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={v => setForm({ ...form, published: v })} /><Label>Publié</Label></div>
                <div><Label>Ordre</Label><Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: +e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter><Button onClick={save}>Enregistrer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Titre</TableHead><TableHead>Pôle</TableHead><TableHead>Durée</TableHead><TableHead>Tarif</TableHead><TableHead>Statut</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {cursus.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}{c.featured && <Badge className="ml-2" variant="secondary">Phare</Badge>}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.pole?.title}</TableCell>
                  <TableCell>{c.duration_label || `${c.duration_hours} h`}</TableCell>
                  <TableCell>{c.price_xaf.toLocaleString("fr-FR")} XAF</TableCell>
                  <TableCell>{c.published ? <Badge>Publié</Badge> : <Badge variant="secondary">Masqué</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- Modules & Lessons ---------- */
function ModulesLessonsPanel(props: {
  cursus: Cursus[];
  selectedCursusId: string | null;
  setSelectedCursusId: (id: string | null) => void;
  modulesByCursus: Record<string, CursusModule[]>;
  selectedModuleId: string | null;
  setSelectedModuleId: (id: string | null) => void;
  lessonsByModule: Record<string, Lesson[]>;
  reloadModules: (id: string) => Promise<CursusModule[]>;
  reloadLessons: (id: string) => Promise<Lesson[]>;
}) {
  const { cursus, selectedCursusId, setSelectedCursusId, modulesByCursus, selectedModuleId, setSelectedModuleId, lessonsByModule, reloadModules, reloadLessons } = props;
  const modules = selectedCursusId ? modulesByCursus[selectedCursusId] || [] : [];
  const lessons = selectedModuleId ? lessonsByModule[selectedModuleId] || [] : [];

  // Module dialog
  const [modOpen, setModOpen] = useState(false);
  const [modEdit, setModEdit] = useState<CursusModule | null>(null);
  const [modForm, setModForm] = useState<any>({ title: "", description: "", duration_hours: 0, display_order: 0, required: true, locked: false, published: true });

  const newModule = () => { setModEdit(null); setModForm({ title: "", description: "", duration_hours: 0, display_order: modules.length, required: true, locked: false, published: true }); setModOpen(true); };
  const editModule = (m: CursusModule) => { setModEdit(m); setModForm({ ...m, description: m.description || "" }); setModOpen(true); };
  const saveModule = async () => {
    if (!selectedCursusId) return;
    const payload = { ...modForm, cursus_id: selectedCursusId };
    delete (payload as any).id; delete (payload as any).created_at; delete (payload as any).updated_at;
    const { error } = modEdit ? await supabase.from("cursus_modules").update(payload).eq("id", modEdit.id) : await supabase.from("cursus_modules").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Module enregistré"); setModOpen(false); reloadModules(selectedCursusId);
  };
  const delModule = async (id: string) => {
    if (!confirm("Supprimer ce module ?")) return;
    const { error } = await supabase.from("cursus_modules").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (selectedCursusId) reloadModules(selectedCursusId);
  };

  // Lesson dialog
  const [lesOpen, setLesOpen] = useState(false);
  const [lesEdit, setLesEdit] = useState<Lesson | null>(null);
  const [lesForm, setLesForm] = useState<any>({ title: "", lesson_type: "text", content: "", external_url: "", display_order: 0, required: true, published: true });
  const [file, setFile] = useState<File | null>(null);

  const newLesson = () => { setLesEdit(null); setLesForm({ title: "", lesson_type: "text", content: "", external_url: "", display_order: lessons.length, required: true, published: true }); setFile(null); setLesOpen(true); };
  const editLesson = (l: Lesson) => { setLesEdit(l); setLesForm({ ...l, content: l.content || "", external_url: l.external_url || "" }); setFile(null); setLesOpen(true); };
  const saveLesson = async () => {
    if (!selectedModuleId) return;
    let file_path = lesEdit?.file_path || null;
    if (file) {
      const path = `${selectedCursusId}/${selectedModuleId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("course-content").upload(path, file, { upsert: true });
      if (upErr) return toast.error(upErr.message);
      file_path = path;
    }
    const payload: any = { ...lesForm, module_id: selectedModuleId, file_path };
    delete payload.id; delete payload.created_at; delete payload.updated_at;
    const { error } = lesEdit ? await supabase.from("lessons").update(payload).eq("id", lesEdit.id) : await supabase.from("lessons").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Leçon enregistrée"); setLesOpen(false); reloadLessons(selectedModuleId);
  };
  const delLesson = async (id: string) => {
    if (!confirm("Supprimer cette leçon ?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (selectedModuleId) reloadLessons(selectedModuleId);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* Cursus picker */}
      <Card>
        <CardHeader><CardTitle className="text-base">1. Choisir un cursus</CardTitle></CardHeader>
        <CardContent className="space-y-1 max-h-[60vh] overflow-y-auto">
          {cursus.map(c => (
            <button key={c.id} onClick={() => setSelectedCursusId(c.id)}
              className={`w-full text-left p-2 rounded ${selectedCursusId === c.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
              <p className="text-sm font-medium">{c.title}</p>
              <p className={`text-xs ${selectedCursusId === c.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{c.pole?.title}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Modules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">2. Modules</CardTitle>
          {selectedCursusId && <Button size="sm" onClick={newModule}><Plus className="h-4 w-4" /></Button>}
        </CardHeader>
        <CardContent className="space-y-1 max-h-[60vh] overflow-y-auto">
          {!selectedCursusId && <p className="text-sm text-muted-foreground">Sélectionnez un cursus.</p>}
          {modules.map(m => (
            <div key={m.id} className={`p-2 rounded flex items-start justify-between gap-2 ${selectedModuleId === m.id ? "bg-primary/10" : "hover:bg-muted"}`}>
              <button className="text-left flex-1" onClick={() => setSelectedModuleId(m.id)}>
                <p className="text-sm font-medium">{m.display_order + 1}. {m.title}</p>
                <p className="text-xs text-muted-foreground">{m.duration_hours} h {m.locked && "• verrouillé"}</p>
              </button>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => editModule(m)}><Pencil className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" onClick={() => delModule(m.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
          {selectedCursusId && modules.length === 0 && <p className="text-sm text-muted-foreground">Aucun module — créez-en un.</p>}
        </CardContent>
      </Card>

      {/* Lessons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">3. Leçons</CardTitle>
          {selectedModuleId && <Button size="sm" onClick={newLesson}><Plus className="h-4 w-4" /></Button>}
        </CardHeader>
        <CardContent className="space-y-1 max-h-[60vh] overflow-y-auto">
          {!selectedModuleId && <p className="text-sm text-muted-foreground">Sélectionnez un module.</p>}
          {lessons.map(l => (
            <div key={l.id} className="p-2 rounded flex items-start justify-between gap-2 hover:bg-muted">
              <div className="flex-1">
                <p className="text-sm font-medium">{l.display_order + 1}. {l.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{l.lesson_type}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => editLesson(l)}><Pencil className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" onClick={() => delLesson(l.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Module Dialog */}
      <Dialog open={modOpen} onOpenChange={setModOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{modEdit ? "Modifier" : "Nouveau"} module</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Titre</Label><Input value={modForm.title} onChange={e => setModForm({ ...modForm, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea rows={2} value={modForm.description} onChange={e => setModForm({ ...modForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Durée (h)</Label><Input type="number" value={modForm.duration_hours} onChange={e => setModForm({ ...modForm, duration_hours: +e.target.value })} /></div>
              <div><Label>Ordre</Label><Input type="number" value={modForm.display_order} onChange={e => setModForm({ ...modForm, display_order: +e.target.value })} /></div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><Switch checked={modForm.required} onCheckedChange={v => setModForm({ ...modForm, required: v })} /><Label>Obligatoire</Label></div>
              <div className="flex items-center gap-2"><Switch checked={modForm.locked} onCheckedChange={v => setModForm({ ...modForm, locked: v })} /><Label>Verrouillé</Label></div>
              <div className="flex items-center gap-2"><Switch checked={modForm.published} onCheckedChange={v => setModForm({ ...modForm, published: v })} /><Label>Publié</Label></div>
            </div>
          </div>
          <DialogFooter><Button onClick={saveModule}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lesOpen} onOpenChange={setLesOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{lesEdit ? "Modifier" : "Nouvelle"} leçon</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Titre</Label><Input value={lesForm.title} onChange={e => setLesForm({ ...lesForm, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label>
                <Select value={lesForm.lesson_type} onValueChange={v => setLesForm({ ...lesForm, lesson_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texte</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="video">Vidéo</SelectItem>
                    <SelectItem value="link">Lien externe</SelectItem>
                    <SelectItem value="live">Session live</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Ordre</Label><Input type="number" value={lesForm.display_order} onChange={e => setLesForm({ ...lesForm, display_order: +e.target.value })} /></div>
            </div>
            {(lesForm.lesson_type === "text" || lesForm.lesson_type === "live") && (
              <div><Label>Contenu</Label><Textarea rows={5} value={lesForm.content} onChange={e => setLesForm({ ...lesForm, content: e.target.value })} /></div>
            )}
            {(lesForm.lesson_type === "pdf" || lesForm.lesson_type === "video") && (
              <div><Label>Fichier (PDF/vidéo)</Label><Input type="file" accept={lesForm.lesson_type === "pdf" ? ".pdf" : "video/*"} onChange={e => setFile(e.target.files?.[0] || null)} />
                {lesEdit?.file_path && !file && <p className="text-xs text-muted-foreground mt-1">Fichier actuel conservé.</p>}
              </div>
            )}
            {(lesForm.lesson_type === "link" || lesForm.lesson_type === "video" || lesForm.lesson_type === "live") && (
              <div><Label>URL externe</Label><Input value={lesForm.external_url} onChange={e => setLesForm({ ...lesForm, external_url: e.target.value })} placeholder="https://..." /></div>
            )}
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><Switch checked={lesForm.required} onCheckedChange={v => setLesForm({ ...lesForm, required: v })} /><Label>Obligatoire</Label></div>
              <div className="flex items-center gap-2"><Switch checked={lesForm.published} onCheckedChange={v => setLesForm({ ...lesForm, published: v })} /><Label>Publié</Label></div>
            </div>
          </div>
          <DialogFooter><Button onClick={saveLesson}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- Enrollments validation ---------- */
function EnrollmentsPanel({ enrollments, onChange, adminId }: { enrollments: any[]; onChange: () => void; adminId: string }) {
  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("course_enrollments").update({
      status, validated_by: adminId, validated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "validated" ? "Inscription validée" : "Statut mis à jour");
    onChange();
  };

  return (
    <Card>
      <CardHeader><CardTitle>Inscriptions aux cursus</CardTitle><CardDescription>Validez les paiements après réception via WhatsApp</CardDescription></CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Apprenant</TableHead><TableHead>Cursus</TableHead><TableHead>Statut</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {enrollments.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs">{new Date(e.created_at).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell><div className="text-sm font-medium">{e.profile?.full_name || "—"}</div><div className="text-xs text-muted-foreground">{e.profile?.email} · {e.profile?.phone}</div></TableCell>
                  <TableCell className="text-sm">{e.cursus?.title}</TableCell>
                  <TableCell>
                    {e.status === "validated" ? <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Validée</Badge>
                      : e.status === "pending" ? <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">En attente</Badge>
                      : e.status === "rejected" ? <Badge variant="destructive">Refusée</Badge>
                      : <Badge variant="secondary">Annulée</Badge>}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {e.status !== "validated" && <Button size="sm" onClick={() => update(e.id, "validated")}><CheckCircle2 className="h-4 w-4 mr-1" />Valider</Button>}
                    {e.status === "pending" && <Button size="sm" variant="outline" onClick={() => update(e.id, "rejected")}><XCircle className="h-4 w-4 mr-1" />Refuser</Button>}
                  </TableCell>
                </TableRow>
              ))}
              {enrollments.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucune inscription pour l'instant.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminLms;

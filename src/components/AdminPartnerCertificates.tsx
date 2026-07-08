import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Sparkles, Upload, Users, Eye, ExternalLink, QrCode, FileText, LayoutTemplate } from "lucide-react";
import { generateCertificatePdf, generateCertificateCode, CertificateLayout } from "@/lib/certificate";
import CertificateLayoutEditor from "@/components/CertificateLayoutEditor";
import { logAudit } from "@/lib/audit";

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const blankProgram = () => ({
  slug: "",
  name: "",
  partner_name: "",
  partner_url: "",
  partner_logo_url: null as string | null,
  description: "",
  long_description: "",
  duration: "",
  location: "",
  start_date: "",
  end_date: "",
  highlights: [] as string[],
  hero_image_url: null as string | null,
  template_bg_url: null as string | null,
  template_prompt: "",
  template_version: 1,
  template_source: "none" as "none" | "upload" | "ai" | "ai-from-model",
  template_updated_at: null as string | null,
  primary_color: "#0F4C81",
  signatory_name: "Direction Pédagogique",
  signatory_title: "Directeur Pédagogique",
  header_title: "CERTIFICAT CONJOINT",
  footer_text: "Certificat conjoint vérifiable en ligne via QR code.",
  display_order: 0,
  active: true,
  layout: null as CertificateLayout | null,
});

const blankCert = () => ({
  code: "",
  student_name: "",
  student_email: "",
  status: "issued",
  score: 0,
  total: 0,
  notes: "",
  issued_at: "",
  expires_at: "",
});

const readAsCompressedDataUrl = (file: File, maxW = 1600, quality = 0.85): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const toDateInput = (v: any) => (v ? String(v).slice(0, 10) : "");
const toDateTimeInput = (v: any) => (v ? new Date(v).toISOString().slice(0, 16) : "");

const AdminPartnerCertificates = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(blankProgram());
  const [aiLoading, setAiLoading] = useState(false);

  const [studentsFor, setStudentsFor] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState("");

  const [certDlgOpen, setCertDlgOpen] = useState(false);
  const [certEditing, setCertEditing] = useState<any>(null);
  const [certForm, setCertForm] = useState<any>(blankCert());

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("partner_programs").select("*").order("display_order").order("created_at", { ascending: false });
    setPrograms(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(blankProgram()); setDlgOpen(true); };
  const openEdit = (r: any) => {
    setEditing(r);
    setForm({
      ...blankProgram(),
      ...r,
      highlights: Array.isArray(r.highlights) ? r.highlights : [],
      start_date: toDateInput(r.start_date),
      end_date: toDateInput(r.end_date),
    });
    setDlgOpen(true);
  };

  const generateWithAi = async (fromModel = false) => {
    if (!fromModel && !form.template_prompt?.trim()) return toast.error("Décrivez le visuel souhaité");
    if (fromModel && !form.template_bg_url) return toast.error("Uploadez d'abord un modèle");
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-partner-template", {
        body: {
          prompt: form.template_prompt || "clean, faithful re-interpretation of the uploaded model",
          partnerName: form.partner_name,
          programName: form.name,
          sourceImageUrl: fromModel ? form.template_bg_url : undefined,
        },
      });
      if (error) throw error;
      if (data?.image) {
        setForm((f: any) => ({
          ...f,
          template_bg_url: data.image,
          template_source: fromModel ? "ai-from-model" : "ai",
        }));
        toast.success(fromModel ? "Modèle IA généré depuis votre upload" : "Modèle généré par l'IA");
      } else {
        toast.error(data?.error || "Aucune image générée");
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur IA");
    } finally {
      setAiLoading(false);
    }
  };

  const save = async () => {
    if (!form.name?.trim()) return toast.error("Nom du programme requis");
    if (!form.partner_name?.trim()) return toast.error("Nom du partenaire requis");
    const slug = form.slug?.trim() || slugify(form.name);
    const templateChanged = !editing || editing.template_bg_url !== form.template_bg_url;
    const nextVersion = templateChanged ? (Number(editing?.template_version) || 0) + 1 : (editing?.template_version || 1);
    const payload: any = {
      ...form,
      slug,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      highlights: (form.highlights || []).filter((h: string) => h?.trim()),
      template_version: nextVersion,
      template_source: templateChanged
        ? (form.template_bg_url ? (form.template_source && form.template_source !== "none" ? form.template_source : "upload") : "none")
        : form.template_source,
      template_updated_at: templateChanged ? new Date().toISOString() : form.template_updated_at,
    };
    delete payload.id; delete payload.created_at; delete payload.updated_at;
    const { data, error } = editing
      ? await supabase.from("partner_programs").update(payload).eq("id", editing.id).select().single()
      : await supabase.from("partner_programs").insert(payload).select().single();
    if (error) return toast.error(error.message);
    logAudit({ action: editing ? "update" : "create", entity_type: "partner_program", entity_id: data?.id, entity_label: payload.name });
    toast.success(templateChanged ? `Programme enregistré (modèle v${nextVersion})` : "Programme enregistré");
    setDlgOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce programme et tous ses certificats ?")) return;
    const { error } = await supabase.from("partner_programs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    logAudit({ action: "delete", entity_type: "partner_program", entity_id: id });
    toast.success("Supprimé"); load();
  };

  const openStudents = async (program: any) => {
    setStudentsFor(program);
    const { data } = await supabase.from("partner_certificates").select("*").eq("program_id", program.id).order("created_at", { ascending: false });
    setStudents(data || []);
  };

  const reloadStudents = async () => {
    if (!studentsFor) return;
    const { data } = await supabase.from("partner_certificates").select("*").eq("program_id", studentsFor.id).order("created_at", { ascending: false });
    setStudents(data || []);
  };

  const importCsv = async () => {
    if (!csvText.trim()) return toast.error("Contenu CSV vide");
    const lines = csvText.trim().split(/\r?\n/);
    const rows = lines.map((l) => l.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, "")));
    const firstIsHeader = rows[0]?.some((c) => /name|nom|email/i.test(c));
    const data = firstIsHeader ? rows.slice(1) : rows;
    const inserts = data.filter((r) => r[0]).map((r) => ({
      program_id: studentsFor.id,
      code: generateCertificateCode(),
      student_name: r[0],
      student_email: r[1] || null,
      status: ((r[2] || "issued").toLowerCase() as any),
      issued_at: (r[2] || "issued").toLowerCase() === "issued" ? new Date().toISOString() : null,
    }));
    if (!inserts.length) return toast.error("Aucune ligne valide");
    for (const i of inserts) {
      if (!["pending", "issued", "revoked", "expired"].includes(i.status)) i.status = "issued";
    }
    const { error } = await supabase.from("partner_certificates").insert(inserts);
    if (error) return toast.error(error.message);
    logAudit({ action: "create", entity_type: "partner_certificates", entity_id: studentsFor.id, entity_label: `Import ${inserts.length} laureats` });
    toast.success(`${inserts.length} certificat(s) importé(s)`);
    setCsvOpen(false); setCsvText(""); reloadStudents();
  };

  const openNewCert = () => {
    setCertEditing(null);
    setCertForm({ ...blankCert(), code: generateCertificateCode(), issued_at: toDateTimeInput(new Date()) });
    setCertDlgOpen(true);
  };
  const openEditCert = (c: any) => {
    setCertEditing(c);
    setCertForm({
      code: c.code,
      student_name: c.student_name,
      student_email: c.student_email || "",
      status: c.status,
      score: c.score || 0,
      total: c.total || 0,
      notes: c.notes || "",
      issued_at: toDateTimeInput(c.issued_at),
      expires_at: toDateTimeInput(c.expires_at),
    });
    setCertDlgOpen(true);
  };

  const saveCert = async () => {
    if (!certForm.student_name?.trim()) return toast.error("Nom requis");
    if (!certForm.code?.trim()) return toast.error("Code requis");
    const payload: any = {
      program_id: studentsFor.id,
      code: certForm.code.trim(),
      student_name: certForm.student_name.trim(),
      student_email: certForm.student_email?.trim() || null,
      status: certForm.status,
      score: Number(certForm.score) || 0,
      total: Number(certForm.total) || 0,
      notes: certForm.notes?.trim() || null,
      issued_at: certForm.issued_at ? new Date(certForm.issued_at).toISOString() : null,
      expires_at: certForm.expires_at ? new Date(certForm.expires_at).toISOString() : null,
    };
    if (certForm.status === "revoked" && certEditing && !certEditing.revoked_at) {
      payload.revoked_at = new Date().toISOString();
    }
    const { error } = certEditing
      ? await supabase.from("partner_certificates").update(payload).eq("id", certEditing.id)
      : await supabase.from("partner_certificates").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(certEditing ? "Certificat mis à jour" : "Certificat créé");
    setCertDlgOpen(false); reloadStudents();
  };

  const setStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === "issued") patch.issued_at = new Date().toISOString();
    if (status === "revoked") patch.revoked_at = new Date().toISOString();
    const { error } = await supabase.from("partner_certificates").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    reloadStudents();
  };

  const removeCert = async (id: string) => {
    if (!confirm("Supprimer ce certificat ?")) return;
    await supabase.from("partner_certificates").delete().eq("id", id);
    reloadStudents();
  };

  const downloadPdf = async (cert: any) => {
    const verifyUrl = `${window.location.origin}/verify-partner/${cert.code}`;
    const doc = await generateCertificatePdf({
      code: cert.code,
      studentName: cert.student_name,
      cursusTitle: `${studentsFor.name} — ${studentsFor.partner_name}`,
      score: cert.score || 0, total: cert.total || 0,
      issuedAt: cert.issued_at || new Date().toISOString(),
      verifyUrl,
      template: {
        header_title: studentsFor.header_title,
        institution_name: studentsFor.partner_name,
        institution_subtitle: studentsFor.name,
        signatory_name: studentsFor.signatory_name,
        signatory_title: studentsFor.signatory_title,
        footer_text: studentsFor.footer_text,
        primary_color: studentsFor.primary_color,
        background_image_url: studentsFor.template_bg_url,
        layout: studentsFor.layout,
      },
    });
    doc.save(`certificat-${cert.code}.pdf`);
  };

  const previewTemplate = async () => {
    const code = generateCertificateCode();
    const doc = await generateCertificatePdf({
      code,
      studentName: "Jean Dupont",
      cursusTitle: `${form.name || "Programme conjoint"} — ${form.partner_name || "Partenaire"}`,
      score: 0, total: 0,
      issuedAt: new Date().toISOString(),
      verifyUrl: `${window.location.origin}/verify-partner/${code}`,
      template: {
        header_title: form.header_title,
        institution_name: form.partner_name,
        institution_subtitle: form.name,
        signatory_name: form.signatory_name,
        signatory_title: form.signatory_title,
        footer_text: form.footer_text,
        primary_color: form.primary_color,
        background_image_url: form.template_bg_url,
        layout: form.layout,
      },
    });
    window.open(doc.output("bloburl"), "_blank");
  };

  const uploadImage = async (file: File, field: "hero_image_url" | "template_bg_url" | "partner_logo_url") => {
    if (file.size > 8 * 1024 * 1024) return toast.error("Max 8 Mo");
    try {
      const url = await readAsCompressedDataUrl(file, field === "partner_logo_url" ? 400 : 1600);
      setForm((f: any) => ({ ...f, [field]: url, ...(field === "template_bg_url" ? { template_source: "upload" } : {}) }));
      toast.success("Image chargée");
    } catch { toast.error("Erreur lecture image"); }
  };

  const statusBadge = (s: string) => {
    const map: any = {
      issued: <Badge className="bg-emerald-600 hover:bg-emerald-600">Émis</Badge>,
      pending: <Badge variant="secondary">En préparation</Badge>,
      revoked: <Badge variant="destructive">Révoqué</Badge>,
      expired: <Badge className="bg-amber-600 hover:bg-amber-600">Expiré</Badge>,
    };
    return map[s] || <Badge variant="outline">{s}</Badge>;
  };

  if (studentsFor) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <Button variant="ghost" size="sm" onClick={() => setStudentsFor(null)} className="mb-2">← Retour aux programmes</Button>
            <CardTitle>{studentsFor.name}</CardTitle>
            <CardDescription>{studentsFor.partner_name} — Page publique : <a className="underline text-primary" target="_blank" href={`/partners/${studentsFor.slug}`}>/partners/{studentsFor.slug}</a></CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={openNewCert}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
            <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
              <DialogTrigger asChild><Button><Upload className="h-4 w-4 mr-1" />Import CSV</Button></DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Import CSV des laureats</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">Format : <code>nom, email, statut</code> — un laureat par ligne. Statut : issued / pending / revoked / expired (défaut: issued).</p>
                <Textarea rows={10} value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="Jean Dupont, jean@ex.com, issued&#10;Marie Curie, marie@ex.com, issued" />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCsvOpen(false)}>Annuler</Button>
                  <Button onClick={importCsv}>Importer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Email</TableHead><TableHead>Code</TableHead><TableHead>Note</TableHead><TableHead>Statut</TableHead><TableHead>Émis le</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {students.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.student_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.student_email || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{c.code}</TableCell>
                    <TableCell className="text-sm">{c.total ? `${c.score}/${c.total}` : "—"}</TableCell>
                    <TableCell>
                      <Select value={c.status} onValueChange={(v) => setStatus(c.id, v)}>
                        <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En préparation</SelectItem>
                          <SelectItem value="issued">Émis</SelectItem>
                          <SelectItem value="revoked">Révoqué</SelectItem>
                          <SelectItem value="expired">Expiré</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm">{c.issued_at ? new Date(c.issued_at).toLocaleDateString("fr-FR") : "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openEditCert(c)} title="Modifier"><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => downloadPdf(c)} title="Télécharger le PDF"><QrCode className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" asChild title="Voir la page publique">
                        <a href={`/verify-partner/${c.code}`} target="_blank"><ExternalLink className="h-4 w-4" /></a>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeCert(c.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucun laureat pour l'instant.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <Dialog open={certDlgOpen} onOpenChange={setCertDlgOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{certEditing ? "Modifier le certificat" : "Nouveau certificat"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Nom du lauréat *</Label><Input value={certForm.student_name} onChange={(e) => setCertForm({ ...certForm, student_name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={certForm.student_email} onChange={(e) => setCertForm({ ...certForm, student_email: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Code du certificat *</Label>
                  <div className="flex gap-2">
                    <Input className="font-mono" value={certForm.code} onChange={(e) => setCertForm({ ...certForm, code: e.target.value })} />
                    <Button type="button" variant="outline" size="sm" onClick={() => setCertForm({ ...certForm, code: generateCertificateCode() })}>Régen.</Button>
                  </div>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select value={certForm.status} onValueChange={(v) => setCertForm({ ...certForm, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En préparation</SelectItem>
                      <SelectItem value="issued">Émis</SelectItem>
                      <SelectItem value="revoked">Révoqué</SelectItem>
                      <SelectItem value="expired">Expiré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Score</Label><Input type="number" value={certForm.score} onChange={(e) => setCertForm({ ...certForm, score: e.target.value })} /></div>
                <div><Label>Total</Label><Input type="number" value={certForm.total} onChange={(e) => setCertForm({ ...certForm, total: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Émis le</Label><Input type="datetime-local" value={certForm.issued_at} onChange={(e) => setCertForm({ ...certForm, issued_at: e.target.value })} /></div>
                <div><Label>Expire le</Label><Input type="datetime-local" value={certForm.expires_at} onChange={(e) => setCertForm({ ...certForm, expires_at: e.target.value })} /></div>
              </div>
              <div><Label>Notes internes</Label><Textarea rows={2} value={certForm.notes} onChange={(e) => setCertForm({ ...certForm, notes: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCertDlgOpen(false)}>Annuler</Button>
              <Button onClick={saveCert}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Certificats conjoints (partenaires)</CardTitle>
          <CardDescription>Mini CMS pour gérer les programmes conjoints, leurs pages publiques, les modèles de certificats et les laureats.</CardDescription>
        </div>
        <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nouveau programme</Button></DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Modifier le programme" : "Nouveau programme conjoint"}</DialogTitle></DialogHeader>
            <Tabs defaultValue="general">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="cms"><FileText className="h-4 w-4 mr-1" />Contenu CMS</TabsTrigger>
                <TabsTrigger value="template">Modèle certificat</TabsTrigger>
                <TabsTrigger value="settings">Réglages</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Nom du programme *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} /></div>
                  <div><Label>Slug URL</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Nom du partenaire *</Label><Input value={form.partner_name} onChange={(e) => setForm({ ...form, partner_name: e.target.value })} /></div>
                  <div><Label>Site du partenaire (URL)</Label><Input placeholder="https://" value={form.partner_url || ""} onChange={(e) => setForm({ ...form, partner_url: e.target.value })} /></div>
                </div>
                <div><Label>Description courte (sous-titre)</Label><Textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div>
                  <Label>Logo du partenaire</Label>
                  <div className="flex items-center gap-3">
                    <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "partner_logo_url")} />
                    {form.partner_logo_url && <img src={form.partner_logo_url} className="h-10 border rounded" alt="logo" />}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cms" className="space-y-3 pt-3">
                <div>
                  <Label>Image de couverture (hero)</Label>
                  <div className="flex items-center gap-3">
                    <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "hero_image_url")} />
                    {form.hero_image_url && (
                      <>
                        <img src={form.hero_image_url} className="h-14 rounded border object-cover" alt="hero" />
                        <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, hero_image_url: null })}>Retirer</Button>
                      </>
                    )}
                  </div>
                </div>
                <div><Label>Description longue (markdown / texte)</Label><Textarea rows={6} value={form.long_description || ""} onChange={(e) => setForm({ ...form, long_description: e.target.value })} placeholder="Présentez le programme, ses objectifs, son public cible..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Durée</Label><Input placeholder="Ex: 6 mois" value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
                  <div><Label>Lieu / Mode</Label><Input placeholder="Ex: Yaoundé + en ligne" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date de début</Label><Input type="date" value={form.start_date || ""} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                  <div><Label>Date de fin</Label><Input type="date" value={form.end_date || ""} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Points forts (un par ligne)</Label>
                  <Textarea rows={4} value={(form.highlights || []).join("\n")} onChange={(e) => setForm({ ...form, highlights: e.target.value.split("\n") })} placeholder="Double diplôme&#10;Mentorat individuel&#10;Projet capstone" />
                </div>
              </TabsContent>

              <TabsContent value="template" className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Titre du certificat</Label><Input value={form.header_title} onChange={(e) => setForm({ ...form, header_title: e.target.value })} /></div>
                  <div><Label>Couleur principale</Label><Input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Signataire</Label><Input value={form.signatory_name} onChange={(e) => setForm({ ...form, signatory_name: e.target.value })} /></div>
                  <div><Label>Titre signataire</Label><Input value={form.signatory_title} onChange={(e) => setForm({ ...form, signatory_title: e.target.value })} /></div>
                </div>
                <div><Label>Pied de page</Label><Textarea rows={2} value={form.footer_text || ""} onChange={(e) => setForm({ ...form, footer_text: e.target.value })} /></div>

                <div className="rounded-md border p-3 space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Label className="text-base">Fond du certificat</Label>
                    {form.template_bg_url && (
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline">v{form.template_version || 1}</Badge>
                        <Badge variant="secondary">
                          {form.template_source === "upload" && "Téléversé"}
                          {form.template_source === "ai" && "IA"}
                          {form.template_source === "ai-from-model" && "IA depuis modèle"}
                          {(!form.template_source || form.template_source === "none") && "—"}
                        </Badge>
                        {form.template_updated_at && (
                          <span className="text-muted-foreground">{new Date(form.template_updated_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Chaque nouveau téléversement ou régénération IA remplace l'ancien layout et incrémente la version. L'IA peut aussi partir d'un modèle admin téléversé.</p>
                  <div className="space-y-2">
                    <Label className="text-sm">Option 1 — Téléverser un modèle professionnel</Label>
                    <Input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "template_bg_url")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Option 2 — Générer avec l'IA</Label>
                    <Textarea rows={3} placeholder="Ex: bordure dorée baroque, fond ivoire..." value={form.template_prompt || ""} onChange={(e) => setForm({ ...form, template_prompt: e.target.value })} />
                    <div className="flex gap-2 flex-wrap">
                      <Button type="button" variant="outline" size="sm" onClick={() => generateWithAi(false)} disabled={aiLoading}>
                        {aiLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}Générer (nouveau)
                      </Button>
                      {form.template_bg_url && (
                        <Button type="button" variant="outline" size="sm" onClick={() => generateWithAi(true)} disabled={aiLoading}>
                          {aiLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}Générer depuis le modèle téléversé
                        </Button>
                      )}
                    </div>
                  </div>
                  {form.template_bg_url && (
                    <div className="flex items-center gap-3 pt-2 border-t">
                      <img src={form.template_bg_url} alt="Aperçu" className="h-24 rounded border object-cover" />
                      <div className="space-x-2">
                        <Button size="sm" variant="outline" onClick={previewTemplate}><Eye className="h-4 w-4 mr-1" />Aperçu PDF</Button>
                        <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, template_bg_url: null, template_source: "none" })}>Retirer</Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>


              <TabsContent value="settings" className="space-y-3 pt-3">
                <div><Label>Ordre d'affichage</Label><Input type="number" value={form.display_order || 0} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
                <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Actif (visible publiquement)</Label></div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDlgOpen(false)}>Annuler</Button>
              <Button onClick={save}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Programme</TableHead><TableHead>Partenaire</TableHead><TableHead>Statut</TableHead><TableHead>Page publique</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {programs.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.partner_name}</TableCell>
                    <TableCell>{p.active ? <Badge>Actif</Badge> : <Badge variant="secondary">Inactif</Badge>}</TableCell>
                    <TableCell><a className="text-primary underline text-sm" href={`/partners/${p.slug}`} target="_blank">/partners/{p.slug}</a></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openStudents(p)}><Users className="h-4 w-4 mr-1" />Laureats</Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {programs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun programme conjoint. Créez-en un pour commencer.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPartnerCertificates;

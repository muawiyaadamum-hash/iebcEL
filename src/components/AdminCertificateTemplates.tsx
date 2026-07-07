import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, Star, Loader2 } from "lucide-react";
import { generateCertificatePdf, generateCertificateCode } from "@/lib/certificate";
import { logAudit } from "@/lib/audit";

const blank = () => ({
  name: "",
  header_title: "CERTIFICAT DE RÉUSSITE",
  institution_name: "Centre de Formation IEBC",
  institution_subtitle: "Institut d'Excellence pour le Business et les Compétences",
  signatory_name: "Direction Pédagogique",
  signatory_title: "Directeur Pédagogique",
  footer_text: "Ce certificat est vérifiable en ligne via son code unique et son QR code.",
  primary_color: "#0F4C81",
  background_image_url: null as string | null,
  active: true,
  is_default: false,
});

const readAsCompressedDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Landscape A4 ~ 1754x1240 @150dpi — cap width to 1600px
        const maxW = 1600;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AdminCertificateTemplates = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(blank());

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("certificate_templates").select("*").order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(blank()); setOpen(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ ...r }); setOpen(true); };

  const save = async () => {
    if (!form.name?.trim()) return toast.error("Nom requis");
    if (form.is_default) {
      // unset previous defaults
      await supabase.from("certificate_templates").update({ is_default: false }).eq("is_default", true);
    }
    const payload = { ...form };
    delete payload.id; delete payload.created_at; delete payload.updated_at;
    const { data, error } = editing
      ? await supabase.from("certificate_templates").update(payload).eq("id", editing.id).select().single()
      : await supabase.from("certificate_templates").insert(payload).select().single();
    if (error) return toast.error(error.message);
    logAudit({ action: editing ? "update" : "create", entity_type: "certificate_template", entity_id: data?.id, entity_label: payload.name });
    toast.success("Modèle enregistré");
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce modèle ?")) return;
    const { error } = await supabase.from("certificate_templates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    logAudit({ action: "delete", entity_type: "certificate_template", entity_id: id });
    toast.success("Supprimé"); load();
  };

  const preview = async (tpl: any) => {
    const code = generateCertificateCode();
    const doc = await generateCertificatePdf({
      code,
      studentName: "Jean Dupont",
      cursusTitle: "Exemple — Cursus démo",
      score: 45, total: 50,
      qcmScore: 45, qcmTotal: 50, projectGrade: 85, combinedPercent: 88,
      issuedAt: new Date().toISOString(),
      verifyUrl: `${window.location.origin}/verify/${code}`,
      template: tpl,
    });
    window.open(doc.output("bloburl"), "_blank");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Modèles de certificat</CardTitle>
          <CardDescription>Configurez signataires, couleurs et libellés officiels</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nouveau modèle</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Modifier le modèle" : "Nouveau modèle"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nom (interne)</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Titre du certificat</Label><Input value={form.header_title} onChange={(e) => setForm({ ...form, header_title: e.target.value })} /></div>
                <div><Label>Couleur principale</Label><Input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} /></div>
              </div>
              <div><Label>Nom de l'institution</Label><Input value={form.institution_name} onChange={(e) => setForm({ ...form, institution_name: e.target.value })} /></div>
              <div><Label>Sous-titre institution</Label><Input value={form.institution_subtitle} onChange={(e) => setForm({ ...form, institution_subtitle: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Signataire (nom affiché)</Label><Input value={form.signatory_name} onChange={(e) => setForm({ ...form, signatory_name: e.target.value })} /></div>
                <div><Label>Titre du signataire</Label><Input value={form.signatory_title} onChange={(e) => setForm({ ...form, signatory_title: e.target.value })} /></div>
              </div>
              <div><Label>Mention légale / pied de page</Label><Textarea rows={2} value={form.footer_text} onChange={(e) => setForm({ ...form, footer_text: e.target.value })} /></div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Actif</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.is_default} onCheckedChange={(v) => setForm({ ...form, is_default: v })} /><Label>Modèle par défaut</Label></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => preview(form)}><Eye className="h-4 w-4 mr-1" />Aperçu</Button>
              <Button onClick={save}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Signataire</TableHead><TableHead>Couleur</TableHead><TableHead>Statut</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {r.is_default && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                      {r.name}
                    </TableCell>
                    <TableCell className="text-sm">{r.signatory_name}<div className="text-xs text-muted-foreground">{r.signatory_title}</div></TableCell>
                    <TableCell><div className="h-6 w-6 rounded border" style={{ backgroundColor: r.primary_color }} /></TableCell>
                    <TableCell>{r.active ? <Badge>Actif</Badge> : <Badge variant="secondary">Inactif</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => preview(r)}><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun modèle.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCertificateTemplates;

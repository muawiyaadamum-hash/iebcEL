import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Video, Copy, ExternalLink } from "lucide-react";
import { fetchCursusList, type Cursus } from "@/lib/lms";

interface LiveSession {
  id: string;
  cursus_id: string;
  title: string;
  description: string | null;
  provider: "platform" | "external";
  room_name: string | null;
  external_url: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  published: boolean;
}

const blank = (): Partial<LiveSession> => ({
  title: "", description: "", provider: "platform", external_url: "",
  scheduled_at: new Date(Date.now() + 3600_000).toISOString().slice(0, 16),
  duration_minutes: 60, status: "scheduled", published: true,
});

const AdminLiveSessions = () => {
  const [cursusList, setCursusList] = useState<Cursus[]>([]);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<LiveSession> | null>(null);
  const [cursusId, setCursusId] = useState<string>("");

  const reload = async () => {
    const { data } = await supabase.from("live_sessions").select("*").order("scheduled_at", { ascending: false });
    setSessions((data as LiveSession[]) || []);
  };

  useEffect(() => { fetchCursusList().then(setCursusList); reload(); }, []);

  const save = async () => {
    if (!editing || !editing.title || !editing.cursus_id) return toast.error("Titre et cursus requis.");
    const payload: any = {
      cursus_id: editing.cursus_id,
      title: editing.title,
      description: editing.description || null,
      provider: editing.provider || "platform",
      room_name: null,
      external_url: editing.provider === "external" ? editing.external_url || null : null,
      scheduled_at: new Date(editing.scheduled_at as any).toISOString(),
      duration_minutes: editing.duration_minutes || 60,
      status: editing.status || "scheduled",
      published: editing.published ?? true,
    };
    const res = editing.id
      ? await supabase.from("live_sessions").update(payload).eq("id", editing.id)
      : await supabase.from("live_sessions").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Session enregistrée");
    setOpen(false); setEditing(null); reload();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette session ?")) return;
    const { error } = await supabase.from("live_sessions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  };

  const copyLink = (s: LiveSession) => {
    const url = `${window.location.origin}/live/${s.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié");
  };

  const filtered = cursusId ? sessions.filter((s) => s.cursus_id === cursusId) : sessions;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" />Cours en visio (diffusion intégrée)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <Label>Filtrer par cursus</Label>
            <Select value={cursusId || "__all"} onValueChange={(v) => setCursusId(v === "__all" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Tous les cursus" /></SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="__all">Tous</SelectItem>
                {cursusList.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => { setEditing({ ...blank(), cursus_id: cursusId || cursusList[0]?.id }); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Planifier une session
          </Button>
        </div>

        <div className="space-y-2">
          {filtered.map((s) => {
            const cursus = cursusList.find((c) => c.id === s.cursus_id);
            const scheduled = new Date(s.scheduled_at);
            return (
              <div key={s.id} className="border rounded p-3 flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-medium flex items-center gap-2">
                    {s.title}
                    <Badge variant={s.status === "live" ? "default" : "secondary"}>{s.status}</Badge>
                    <Badge variant="outline">{s.provider}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {cursus?.title} · {scheduled.toLocaleString("fr-FR")} · {s.duration_minutes} min
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => copyLink(s)}><Copy className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/live/${s.id}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing({ ...s, scheduled_at: new Date(s.scheduled_at).toISOString().slice(0, 16) }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Aucune session planifiée.</p>}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing?.id ? "Modifier" : "Nouvelle"} session</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-3">
                <div><Label>Cursus</Label>
                  <Select value={editing.cursus_id || ""} onValueChange={(v) => setEditing({ ...editing, cursus_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {cursusList.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Titre</Label><Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea rows={2} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date et heure</Label><Input type="datetime-local" value={editing.scheduled_at as any || ""} onChange={(e) => setEditing({ ...editing, scheduled_at: e.target.value as any })} /></div>
                  <div><Label>Durée (min)</Label><Input type="number" value={editing.duration_minutes || 60} onChange={(e) => setEditing({ ...editing, duration_minutes: +e.target.value })} /></div>
                </div>
                <div><Label>Fournisseur</Label>
                  <Select value={editing.provider || "jitsi"} onValueChange={(v: any) => setEditing({ ...editing, provider: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="jitsi">Jitsi Meet (intégré, gratuit)</SelectItem>
                      <SelectItem value="external">Lien externe (Zoom / Meet / Teams)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editing.provider === "jitsi" ? (
                  <div><Label>Nom de la salle (optionnel)</Label>
                    <Input value={editing.room_name || ""} onChange={(e) => setEditing({ ...editing, room_name: e.target.value })} placeholder="auto-généré si vide" />
                  </div>
                ) : (
                  <div><Label>URL de la réunion</Label>
                    <Input value={editing.external_url || ""} onChange={(e) => setEditing({ ...editing, external_url: e.target.value })} placeholder="https://zoom.us/j/..." />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Statut</Label>
                    <Select value={editing.status || "scheduled"} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="scheduled">Planifiée</SelectItem>
                        <SelectItem value="live">En direct</SelectItem>
                        <SelectItem value="ended">Terminée</SelectItem>
                        <SelectItem value="cancelled">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch checked={editing.published ?? true} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
                    <Label>Publiée</Label>
                  </div>
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

export default AdminLiveSessions;

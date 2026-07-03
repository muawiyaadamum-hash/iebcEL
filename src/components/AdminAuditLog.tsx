import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ScrollText } from "lucide-react";

type Entry = {
  id: string; created_at: string; actor_email: string | null;
  action: string; entity_type: string; entity_id: string | null;
  entity_label: string | null; metadata: any;
};

const actionColor: Record<string, string> = {
  create: "bg-green-500/10 text-green-700 border-green-500/20",
  update: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  delete: "bg-red-500/10 text-red-700 border-red-500/20",
  publish: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  unpublish: "bg-slate-500/10 text-slate-700 border-slate-500/20",
  validate: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  reject: "bg-red-500/10 text-red-700 border-red-500/20",
  upload: "bg-purple-500/10 text-purple-700 border-purple-500/20",
};

export default function AdminAuditLog() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [action, setAction] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("audit_log")
        .select("*").order("created_at", { ascending: false }).limit(500);
      setRows((data || []) as Entry[]);
      setLoading(false);
    })();
  }, []);

  const entityTypes = Array.from(new Set(rows.map(r => r.entity_type))).sort();
  const filtered = rows.filter(r =>
    (action === "all" || r.action === action) &&
    (type === "all" || r.entity_type === type) &&
    (q === "" || [r.actor_email, r.entity_label, r.entity_type, r.action].some(v => v?.toLowerCase().includes(q.toLowerCase())))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5 text-primary" />Journal d'audit</CardTitle>
        <CardDescription>500 dernières actions administratives (créations, modifications, validations…)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-2 mb-4">
          <Input placeholder="Rechercher email, entité…" value={q} onChange={e => setQ(e.target.value)} className="md:col-span-2" />
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes actions</SelectItem>
              {["create","update","delete","publish","unpublish","validate","reject","upload"].map(a =>
                <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue placeholder="Entité" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              {entityTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Quand</TableHead><TableHead>Qui</TableHead><TableHead>Action</TableHead>
                <TableHead>Type</TableHead><TableHead>Entité</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleString("fr-FR")}</TableCell>
                    <TableCell className="text-sm">{r.actor_email || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className={actionColor[r.action] || ""}>{r.action}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.entity_type}</TableCell>
                    <TableCell className="text-sm">{r.entity_label || <span className="text-muted-foreground">{r.entity_id?.slice(0, 8)}…</span>}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Aucune entrée.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, ShieldPlus, ShieldMinus, Users } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

type Role = "admin" | "student" | "formateur" | "responsable_pedagogique" | "comptable";
const ALL_ROLES: Role[] = ["admin", "responsable_pedagogique", "formateur", "comptable", "student"];

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  responsable_pedagogique: "Resp. pédagogique",
  formateur: "Enseignant",
  comptable: "Comptable",
  student: "Étudiant",
};

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-red-500/10 text-red-700 border-red-500/20",
  responsable_pedagogique: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  formateur: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  comptable: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  student: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
};

type Row = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at?: string;
  roles: Role[];
};

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Role | "all">("all");

  const load = async () => {
    setLoading(true);
    const [{ data: profs }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("user_id,full_name,email,phone,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    const rolesMap = new Map<string, Role[]>();
    (roles || []).forEach((r: any) => {
      const arr = rolesMap.get(r.user_id) || [];
      arr.push(r.role as Role);
      rolesMap.set(r.user_id, arr);
    });
    const merged: Row[] = (profs || []).map((p: any) => ({
      ...p,
      roles: rolesMap.get(p.user_id) || [],
    }));
    setRows(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(r => {
      if (filter !== "all" && !r.roles.includes(filter)) return false;
      if (!term) return true;
      return (r.full_name || "").toLowerCase().includes(term)
        || (r.email || "").toLowerCase().includes(term)
        || (r.phone || "").toLowerCase().includes(term);
    });
  }, [rows, q, filter]);

  const addRole = async (user_id: string, role: Role, label: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id, role });
    if (error) return toast.error(error.message);
    logAudit({ action: "grant_role", entity_type: "user", entity_id: user_id, entity_label: label, metadata: { role } });
    toast.success(`Rôle ${ROLE_LABELS[role]} accordé`);
    load();
  };

  const removeRole = async (user_id: string, role: Role, label: string) => {
    if (!confirm(`Retirer le rôle ${ROLE_LABELS[role]} ?`)) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
    if (error) return toast.error(error.message);
    logAudit({ action: "revoke_role", entity_type: "user", entity_id: user_id, entity_label: label, metadata: { role } });
    toast.success("Rôle retiré");
    load();
  };

  const counts = useMemo(() => {
    const c: Record<Role | "total", number> = { total: rows.length, admin: 0, student: 0, formateur: 0, responsable_pedagogique: 0, comptable: 0 };
    rows.forEach(r => r.roles.forEach(role => { c[role]++; }));
    return c;
  }, [rows]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Gestion des utilisateurs</CardTitle>
            <CardDescription>Total : <b>{counts.total}</b> · Étudiants : {counts.student} · Enseignants : {counts.formateur} · Admin : {counts.admin} · Resp. péd. : {counts.responsable_pedagogique} · Comptable : {counts.comptable}</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher…" value={q} onChange={e => setQ(e.target.value)} className="pl-8 w-56" />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {ALL_ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rôles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => {
                  const label = r.full_name || r.email || r.user_id;
                  const availableRoles = ALL_ROLES.filter(role => !r.roles.includes(role));
                  return (
                    <TableRow key={r.user_id}>
                      <TableCell>
                        <div className="font-medium text-sm">{r.full_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{r.created_at ? new Date(r.created_at).toLocaleDateString("fr-FR") : ""}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">{r.email || "—"}</div>
                        <div className="text-xs text-muted-foreground">{r.phone || ""}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {r.roles.length === 0 && <span className="text-xs text-muted-foreground">Aucun</span>}
                          {r.roles.map(role => (
                            <Badge key={role} variant="outline" className={`${ROLE_COLORS[role]} cursor-pointer group`} onClick={() => removeRole(r.user_id, role, label)}>
                              {ROLE_LABELS[role]}
                              <ShieldMinus className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100" />
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {availableRoles.length > 0 && (
                          <Select onValueChange={(v) => addRole(r.user_id, v as Role, label)}>
                            <SelectTrigger className="w-40 h-8 text-xs ml-auto">
                              <ShieldPlus className="h-3 w-3 mr-1" />
                              <SelectValue placeholder="Attribuer rôle" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles.map(role => <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Aucun utilisateur trouvé.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-3">Astuce : cliquez sur un badge de rôle pour le retirer.</p>
      </CardContent>
    </Card>
  );
};

export default AdminUsers;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, BookOpen, Award, TrendingUp, Wallet, Activity, Loader2 } from "lucide-react";
import { REGISTRATION_FEE_XAF, formatXaf } from "@/lib/lms";

type Kpi = {
  students: number;
  teachers: number;
  admins: number;
  totalEnrollments: number;
  pendingEnrollments: number;
  validatedEnrollments: number;
  cursusCount: number;
  polesCount: number;
  examsAttempts: number;
  examsPassed: number;
  successRate: number;
  estimatedRevenue: number;
  certificates: number;
};

const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [progressByCursus, setProgressByCursus] = useState<Array<{ title: string; students: number; passed: number }>>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [
        { count: students },
        { count: teachers },
        { count: admins },
        { data: enrollments },
        { count: cursusCount },
        { count: polesCount },
        { data: attempts },
        { count: certificates },
        { data: activity },
        { data: cursusList },
      ] = await Promise.all([
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "formateur"),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin"),
        supabase.from("course_enrollments").select("id,status,cursus_id"),
        supabase.from("cursus").select("*", { count: "exact", head: true }),
        supabase.from("poles").select("*", { count: "exact", head: true }),
        supabase.from("exam_attempts").select("id,cursus_id,passed,status"),
        supabase.from("certificates").select("*", { count: "exact", head: true }),
        supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("cursus").select("id,title"),
      ]);

      const enr = enrollments || [];
      const validated = enr.filter((e: any) => e.status === "validated").length;
      const pending = enr.filter((e: any) => e.status === "pending").length;
      const att = attempts || [];
      const submitted = att.filter((a: any) => a.status === "submitted");
      const passed = submitted.filter((a: any) => a.passed).length;
      const successRate = submitted.length ? Math.round((passed / submitted.length) * 100) : 0;

      // Per-cursus stats
      const cursusMap = new Map((cursusList || []).map((c: any) => [c.id, { title: c.title, students: 0, passed: 0 }]));
      enr.forEach((e: any) => {
        if (e.status === "validated" && cursusMap.has(e.cursus_id)) cursusMap.get(e.cursus_id)!.students++;
      });
      att.forEach((a: any) => {
        if (a.passed && cursusMap.has(a.cursus_id)) cursusMap.get(a.cursus_id)!.passed++;
      });
      const perCursus = Array.from(cursusMap.values())
        .filter(c => c.students > 0 || c.passed > 0)
        .sort((a, b) => b.students - a.students)
        .slice(0, 8);

      setKpi({
        students: students || 0,
        teachers: teachers || 0,
        admins: admins || 0,
        totalEnrollments: enr.length,
        pendingEnrollments: pending,
        validatedEnrollments: validated,
        cursusCount: cursusCount || 0,
        polesCount: polesCount || 0,
        examsAttempts: submitted.length,
        examsPassed: passed,
        successRate,
        estimatedRevenue: validated * REGISTRATION_FEE_XAF,
        certificates: certificates || 0,
      });
      setProgressByCursus(perCursus);
      setRecent(activity || []);
      setLoading(false);
    })();
  }, []);

  if (loading || !kpi) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const cards = [
    { label: "Étudiants", value: kpi.students, icon: Users, color: "text-blue-600 bg-blue-500/10" },
    { label: "Enseignants", value: kpi.teachers, icon: GraduationCap, color: "text-purple-600 bg-purple-500/10" },
    { label: "Cursus", value: kpi.cursusCount, icon: BookOpen, color: "text-emerald-600 bg-emerald-500/10", sub: `${kpi.polesCount} pôles` },
    { label: "Inscriptions validées", value: kpi.validatedEnrollments, icon: Award, color: "text-amber-600 bg-amber-500/10", sub: `${kpi.pendingEnrollments} en attente` },
    { label: "Taux de réussite", value: `${kpi.successRate}%`, icon: TrendingUp, color: "text-green-600 bg-green-500/10", sub: `${kpi.examsPassed}/${kpi.examsAttempts} examens` },
    { label: "Revenus estimés", value: formatXaf(kpi.estimatedRevenue), icon: Wallet, color: "text-primary bg-primary/10", sub: `${kpi.validatedEnrollments} × ${REGISTRATION_FEE_XAF.toLocaleString("fr-FR")} XAF` },
  ];

  return (
    <div className="space-y-6">
      {/* KPI grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg mb-3 ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold leading-tight">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
              {c.sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{c.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Progress by cursus */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progression par cursus</CardTitle>
            <CardDescription>Étudiants inscrits vs. réussites</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {progressByCursus.length === 0 && <p className="text-sm text-muted-foreground">Pas encore de données.</p>}
            {progressByCursus.map((c) => {
              const pct = c.students ? Math.round((c.passed / c.students) * 100) : 0;
              return (
                <div key={c.title}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium truncate">{c.title}</span>
                    <span className="text-muted-foreground text-xs">{c.passed}/{c.students} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" />Activité récente</CardTitle>
            <CardDescription>10 dernières actions admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[340px] overflow-y-auto">
            {recent.length === 0 && <p className="text-sm text-muted-foreground">Aucune activité.</p>}
            {recent.map((a) => (
              <div key={a.id} className="flex items-start gap-2 text-sm border-b last:border-0 pb-2 last:pb-0">
                <Badge variant="outline" className="capitalize text-xs shrink-0">{a.action}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate"><span className="font-medium">{a.entity_type}</span> · {a.entity_label || "—"}</p>
                  <p className="text-xs text-muted-foreground">{a.actor_email || "?"} · {new Date(a.created_at).toLocaleString("fr-FR")}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen, Award, Clock, GraduationCap, User, LogOut, ChevronRight, Hourglass, CheckCircle2, XCircle, Shield } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { fetchMyEnrollments, formatXaf } from "@/lib/lms";

const Dashboard = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: prof }, enrs, { data: rolesData }] = await Promise.all([
        supabase.from("profiles").select("full_name,email,phone,avatar_url").eq("user_id", user.id).maybeSingle(),
        fetchMyEnrollments(user.id),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      setProfile(prof);
      setEnrollments(enrs);
      setRoles((rolesData || []).map((r: any) => r.role));
      setLoadingData(false);
    })();
  }, [user]);

  if (loading || loadingData) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const validated = enrollments.filter(e => e.status === "validated");
  const pending = enrollments.filter(e => e.status === "pending");
  const isStaff = roles.some(r => ["admin", "responsable_pedagogique", "formateur", "comptable"].includes(r));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Bienvenue, {profile?.full_name?.split(" ")[0] || "apprenant"} !</h1>
              <p className="text-muted-foreground">Espace apprenant — Centre de Formation IEBC</p>
            </div>
            <div className="flex gap-2">
              {isStaff && <Button variant="outline" size="sm" onClick={() => navigate("/admin")}><Shield className="h-4 w-4 mr-2" />Espace staff</Button>}
              <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/"); }}><LogOut className="h-4 w-4 mr-2" />Déconnexion</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card><CardContent className="pt-6 flex items-center gap-4"><div className="p-3 rounded-full bg-primary/10"><BookOpen className="h-6 w-6 text-primary" /></div><div><p className="text-2xl font-bold">{enrollments.length}</p><p className="text-sm text-muted-foreground">Inscriptions</p></div></CardContent></Card>
            <Card><CardContent className="pt-6 flex items-center gap-4"><div className="p-3 rounded-full bg-green-500/10"><CheckCircle2 className="h-6 w-6 text-green-600" /></div><div><p className="text-2xl font-bold">{validated.length}</p><p className="text-sm text-muted-foreground">Validées</p></div></CardContent></Card>
            <Card><CardContent className="pt-6 flex items-center gap-4"><div className="p-3 rounded-full bg-yellow-500/10"><Hourglass className="h-6 w-6 text-yellow-600" /></div><div><p className="text-2xl font-bold">{pending.length}</p><p className="text-sm text-muted-foreground">En attente</p></div></CardContent></Card>
            <Card><CardContent className="pt-6 flex items-center gap-4"><div className="p-3 rounded-full bg-accent/10"><Award className="h-6 w-6 text-accent" /></div><div><p className="text-2xl font-bold">0</p><p className="text-sm text-muted-foreground">Certificats</p></div></CardContent></Card>
          </div>

          <Tabs defaultValue="cursus" className="space-y-6">
            <TabsList>
              <TabsTrigger value="cursus">Mes cursus</TabsTrigger>
              <TabsTrigger value="profile">Profil</TabsTrigger>
            </TabsList>

            <TabsContent value="cursus">
              {enrollments.length === 0 ? (
                <Card><CardContent className="py-12 text-center">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun cursus pour l'instant</h3>
                  <p className="text-muted-foreground mb-4">Explorez notre catalogue et inscrivez-vous à un cursus.</p>
                  <Button asChild><Link to="/courses">Voir les cursus</Link></Button>
                </CardContent></Card>
              ) : (
                <div className="grid gap-4">
                  {enrollments.map((e) => {
                    const c = e.cursus;
                    const statusBadge = e.status === "validated" ? <Badge className="bg-green-500/10 text-green-700 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Validée</Badge>
                      : e.status === "pending" ? <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20"><Hourglass className="h-3 w-3 mr-1" />En attente</Badge>
                      : e.status === "rejected" ? <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Refusée</Badge>
                      : <Badge variant="secondary">Annulée</Badge>;
                    return (
                      <Card key={e.id}>
                        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {c?.pole && <Badge variant="outline" className="text-xs">{c.pole.title}</Badge>}
                              {statusBadge}
                            </div>
                            <h3 className="font-semibold text-lg">{c?.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{c?.duration_label || `${c?.duration_hours} h`}</span>
                              <span>Tarif : {formatXaf(c?.price_xaf || 0)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild><Link to={`/courses/${c?.slug}`}>Détails</Link></Button>
                            {e.status === "validated" && (
                              <Button size="sm" asChild><Link to={`/learn/${c?.slug}`}>Continuer<ChevronRight className="h-4 w-4 ml-1" /></Link></Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Mes informations</CardTitle><CardDescription>Détails de votre compte apprenant</CardDescription></CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div><label className="text-sm font-medium text-muted-foreground">Nom complet</label><p className="text-lg">{profile?.full_name || "Non renseigné"}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Email</label><p className="text-lg">{profile?.email || user?.email}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Téléphone</label><p className="text-lg">{profile?.phone || "Non renseigné"}</p></div>
                    <div><label className="text-sm font-medium text-muted-foreground">Rôles</label><p className="text-lg">{roles.join(", ") || "apprenant"}</p></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Dashboard;

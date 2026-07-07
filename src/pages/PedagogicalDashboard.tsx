import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import {
  Loader2, Shield, ArrowLeft, BookOpen, Layers, FileText, HelpCircle, Video,
  FolderUp, GraduationCap, FileCheck2, Award,
} from "lucide-react";
import {
  fetchModules, fetchLessons,
  type Pole, type Cursus, type CursusModule, type Lesson,
} from "@/lib/lms";
import AdminQuestionBank from "@/components/AdminQuestionBank";
import AdminLiveSessions from "@/components/AdminLiveSessions";
import AdminModuleResources from "@/components/AdminModuleResources";
import AdminExams from "@/components/AdminExams";
import AdminProjects from "@/components/AdminProjects";
import AdminCertificateTemplates from "@/components/AdminCertificateTemplates";
import { PolesPanel, CursusPanel, ModulesLessonsPanel } from "@/pages/AdminLms";

const PedagogicalDashboard = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState("cursus");

  const [poles, setPoles] = useState<Pole[]>([]);
  const [cursus, setCursus] = useState<Cursus[]>([]);
  const [modulesByCursus, setModulesByCursus] = useState<Record<string, CursusModule[]>>({});
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [selectedCursusId, setSelectedCursusId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const list = (roles || []).map((r: any) => r.role);
      const pedag = list.some((r) =>
        r === "admin" || r === "responsable_pedagogique" || r === "formateur",
      );
      setIsAdmin(list.includes("admin"));
      setAllowed(pedag);
      if (pedag) await reloadAll();
    })();
  }, [user, authLoading]);

  const reloadAll = async () => {
    const [p, c] = await Promise.all([
      supabase.from("poles").select("*").order("display_order").then((r) => (r.data || []) as Pole[]),
      supabase.from("cursus").select("*, pole:poles(*)").order("display_order").then((r) => (r.data || []) as any[]),
    ]);
    setPoles(p);
    setCursus(c);
  };

  const loadModulesFor = async (cursusId: string) => {
    const mods = await fetchModules(cursusId);
    setModulesByCursus((prev) => ({ ...prev, [cursusId]: mods }));
    return mods;
  };
  const loadLessonsFor = async (moduleId: string) => {
    const ls = await fetchLessons(moduleId);
    setLessonsByModule((prev) => ({ ...prev, [moduleId]: ls }));
    return ls;
  };

  if (authLoading || allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) { navigate("/auth"); return null; }
  if (!allowed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <Shield className="h-16 w-16 mx-auto text-destructive mb-6" />
            <h1 className="text-3xl font-bold mb-4">Accès refusé</h1>
            <p className="text-muted-foreground mb-6">
              Espace réservé aux responsables pédagogiques, formateurs et administrateurs.
            </p>
            <Button onClick={() => navigate("/dashboard")}>Retour</Button>
          </div>
        </section>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <GraduationCap className="h-7 w-7 text-primary" />Espace Pédagogique
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestion des cursus, modules, ressources, évaluations et certifications
              </p>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <Button variant="secondary" onClick={() => navigate("/admin")}>
                  <Shield className="h-4 w-4 mr-2" />Super Admin
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />Retour
              </Button>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab} orientation="vertical" className="md:grid md:grid-cols-[240px_1fr] md:gap-6 space-y-4 md:space-y-0">
            <aside className="md:sticky md:top-4 md:self-start">
              <div className="rounded-lg border bg-card p-2 shadow-sm">
                <TabsList className="flex md:flex-col h-auto w-full bg-transparent gap-1 p-0 flex-wrap md:flex-nowrap">
                  <TabsTrigger value="cursus" className="w-full md:justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><BookOpen className="h-4 w-4 mr-2" />Cursus ({cursus.length})</TabsTrigger>
                  <TabsTrigger value="poles" className="w-full md:justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Layers className="h-4 w-4 mr-2" />Pôles ({poles.length})</TabsTrigger>
                  <TabsTrigger value="modules" className="w-full md:justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FileText className="h-4 w-4 mr-2" />Modules & leçons</TabsTrigger>
                  <TabsTrigger value="resources" className="w-full md:justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FolderUp className="h-4 w-4 mr-2" />Ressources</TabsTrigger>
                  <TabsTrigger value="qcm" className="w-full md:justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><HelpCircle className="h-4 w-4 mr-2" />Banque QCM</TabsTrigger>
                  <TabsTrigger value="visio" className="w-full md:justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Video className="h-4 w-4 mr-2" />Visio / Vidéo</TabsTrigger>
                  <TabsTrigger value="exams" className="w-full md:justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><GraduationCap className="h-4 w-4 mr-2" />Examens</TabsTrigger>
                  <TabsTrigger value="projects" className="w-full md:justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FileCheck2 className="h-4 w-4 mr-2" />Projets</TabsTrigger>
                  <TabsTrigger value="certificates" className="w-full md:justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Award className="h-4 w-4 mr-2" />Certificats</TabsTrigger>
                </TabsList>
              </div>
            </aside>

            <div className="min-w-0">
              <TabsContent value="cursus" className="mt-0"><CursusPanel cursus={cursus} poles={poles} onChange={reloadAll} /></TabsContent>
              <TabsContent value="poles" className="mt-0"><PolesPanel poles={poles} onChange={reloadAll} /></TabsContent>
              <TabsContent value="modules" className="mt-0">
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
              <TabsContent value="resources" className="mt-0"><AdminModuleResources /></TabsContent>
              <TabsContent value="qcm" className="mt-0"><AdminQuestionBank /></TabsContent>
              <TabsContent value="visio" className="mt-0"><AdminLiveSessions /></TabsContent>
              <TabsContent value="exams" className="mt-0"><AdminExams /></TabsContent>
              <TabsContent value="projects" className="mt-0"><AdminProjects /></TabsContent>
              <TabsContent value="certificates" className="mt-0"><AdminCertificateTemplates /></TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
    </div>
  );
};


export default PedagogicalDashboard;

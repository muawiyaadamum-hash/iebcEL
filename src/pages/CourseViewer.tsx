import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, Circle, Lock, BookOpen, ArrowLeft, FileText, Video, Link2 } from "lucide-react";
import { fetchCursusBySlug, fetchModules, fetchLessons, fetchEnrollment, type Cursus, type CursusModule, type Lesson } from "@/lib/lms";
import LessonPdfViewer from "@/components/LessonPdfViewer";

const CourseViewer = () => {
  useScrollToTop();
  const { id: slug } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [cursus, setCursus] = useState<Cursus | null>(null);
  const [modules, setModules] = useState<CursusModule[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessOk, setAccessOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading || !slug || !user) return;
    (async () => {
      setLoading(true);
      const c = await fetchCursusBySlug(slug);
      if (!c) { setLoading(false); return; }
      setCursus(c);
      const enr = await fetchEnrollment(user.id, c.id);
      if (enr?.status !== "validated") { setAccessOk(false); setLoading(false); return; }
      setAccessOk(true);
      const mods = await fetchModules(c.id);
      setModules(mods);
      const map: Record<string, Lesson[]> = {};
      for (const m of mods) map[m.id] = await fetchLessons(m.id);
      setLessonsByModule(map);
      const { data: prog } = await supabase.from("module_progress").select("module_id,completed").eq("user_id", user.id).eq("course_id", c.id);
      const pmap: Record<string, boolean> = {};
      (prog || []).forEach((p: any) => { pmap[p.module_id] = !!p.completed; });
      setProgress(pmap);
      setLoading(false);
    })();
  }, [slug, user, authLoading]);

  const currentModule = modules[activeModuleIdx];
  const currentLessons = currentModule ? lessonsByModule[currentModule.id] || [] : [];
  const currentLesson = currentLessons[activeLessonIdx];

  useEffect(() => {
    setSignedUrl(null);
    if (currentLesson?.file_path) {
      supabase.storage.from("course-content").createSignedUrl(currentLesson.file_path, 3600)
        .then(({ data }) => setSignedUrl(data?.signedUrl || null));
    }
  }, [currentLesson?.id, currentLesson?.file_path]);

  const completedCount = Object.values(progress).filter(Boolean).length;
  const overall = modules.length ? Math.round((completedCount / modules.length) * 100) : 0;

  const markComplete = async () => {
    if (!user || !cursus || !currentModule) return;
    await supabase.from("module_progress").upsert({
      user_id: user.id, course_id: cursus.id, module_id: currentModule.id,
      completed: true, completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,course_id,module_id" });
    setProgress((p) => ({ ...p, [currentModule.id]: true }));
    toast.success("Module marqué comme terminé");
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!cursus) return <Navigate to="/courses" replace />;
  if (accessOk === false) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4">Accès verrouillé</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Votre inscription à ce cursus n'est pas encore validée. Finalisez votre paiement via WhatsApp.
            </p>
            <Button asChild><Link to={`/courses/${cursus.slug}`}>Retour à la fiche cursus</Link></Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col lg:flex-row">
        <aside className="w-full lg:w-80 border-r border-border bg-muted/30">
          <div className="p-4 border-b border-border">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" />Retour au tableau de bord</Link>
            </Button>
            <h2 className="font-bold text-lg line-clamp-2">{cursus.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={overall} className="flex-1 h-2" />
              <span className="text-sm font-medium">{overall}%</span>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="p-4 space-y-2">
              {modules.map((m, idx) => {
                const done = progress[m.id];
                const active = idx === activeModuleIdx;
                return (
                  <button key={m.id} onClick={() => { setActiveModuleIdx(idx); setActiveLessonIdx(0); }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    <div className="flex items-start gap-3">
                      {done ? <CheckCircle2 className={`h-5 w-5 ${active ? "text-primary-foreground" : "text-primary"}`} /> : <Circle className={`h-5 w-5 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />}
                      <div>
                        <p className="font-medium text-sm">Module {idx + 1}</p>
                        <p className={`text-sm line-clamp-2 ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{m.title}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {modules.length === 0 && <p className="text-sm text-muted-foreground p-3">Aucun module disponible pour le moment.</p>}
            </div>
          </ScrollArea>
        </aside>

        <main className="flex-1 flex flex-col">
          {currentModule ? (
            <>
              <div className="border-b border-border p-4 bg-background flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">Module {activeModuleIdx + 1}/{modules.length}</Badge>
                  <h1 className="text-2xl font-bold">{currentModule.title}</h1>
                  {currentModule.description && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{currentModule.description}</p>}
                </div>
                {!progress[currentModule.id] ? (
                  <Button onClick={markComplete} variant="outline"><CheckCircle2 className="mr-2 h-4 w-4" />Marquer terminé</Button>
                ) : (
                  <Badge className="bg-primary/10 text-primary border-primary/20"><CheckCircle2 className="mr-1 h-3 w-3" />Terminé</Badge>
                )}
              </div>

              <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                {currentLesson ? (
                  <Card>
                    <CardContent className="p-6 md:p-8 space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {currentLesson.lesson_type === "pdf" && <FileText className="h-4 w-4" />}
                        {currentLesson.lesson_type === "video" && <Video className="h-4 w-4" />}
                        {currentLesson.lesson_type === "link" && <Link2 className="h-4 w-4" />}
                        <span className="capitalize">{currentLesson.lesson_type}</span>
                        <span>•</span>
                        <span>Leçon {activeLessonIdx + 1}/{currentLessons.length}</span>
                      </div>
                      <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                      {(currentLesson as any).content_html
                        ? <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: (currentLesson as any).content_html }} />
                        : currentLesson.content && <div className="prose prose-sm max-w-none whitespace-pre-line">{currentLesson.content}</div>}
                      {currentLesson.lesson_type === "pdf" && signedUrl && (
                        <iframe src={signedUrl} className="w-full h-[70vh] rounded border" title={currentLesson.title} />
                      )}
                      {currentLesson.lesson_type === "video" && (currentLesson.external_url || signedUrl) && (
                        <video controls src={currentLesson.external_url || signedUrl || undefined} className="w-full rounded" />
                      )}
                      {currentLesson.lesson_type === "link" && currentLesson.external_url && (
                        <a href={currentLesson.external_url} target="_blank" rel="noreferrer" className="text-primary underline">
                          Ouvrir le lien externe
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card><CardContent className="p-8 text-center text-muted-foreground">Aucune leçon publiée dans ce module.</CardContent></Card>
                )}
              </div>

              <div className="border-t border-border p-4 bg-muted/30">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                  <Button variant="outline" disabled={activeLessonIdx === 0 && activeModuleIdx === 0}
                    onClick={() => {
                      if (activeLessonIdx > 0) setActiveLessonIdx(i => i - 1);
                      else if (activeModuleIdx > 0) {
                        const prev = activeModuleIdx - 1;
                        setActiveModuleIdx(prev);
                        const ls = lessonsByModule[modules[prev].id] || [];
                        setActiveLessonIdx(Math.max(0, ls.length - 1));
                      }
                    }}>
                    <ChevronLeft className="mr-2 h-4 w-4" />Précédent
                  </Button>
                  <Button onClick={() => {
                    if (activeLessonIdx < currentLessons.length - 1) setActiveLessonIdx(i => i + 1);
                    else if (activeModuleIdx < modules.length - 1) { setActiveModuleIdx(i => i + 1); setActiveLessonIdx(0); }
                  }} disabled={activeModuleIdx === modules.length - 1 && activeLessonIdx >= currentLessons.length - 1}>
                    Suivant<ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun module disponible pour ce cursus.</p>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CourseViewer;

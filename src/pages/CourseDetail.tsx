import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Clock, TrendingUp, CheckCircle2, ArrowRight, FileText, Award, MessageCircle, User, LogIn, Loader2, BookOpen, Lock, Hourglass } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { toast } from "sonner";
import {
  fetchCursusBySlug, fetchModules, fetchEnrollment,
  whatsappRegistrationLink, formatXaf,
  type Cursus, type CursusModule, type CourseEnrollment
} from "@/lib/lms";

const CourseDetail = () => {
  useScrollToTop();
  const { id: slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cursus, setCursus] = useState<Cursus | null>(null);
  const [modules, setModules] = useState<CursusModule[]>([]);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string; email?: string; phone?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const c = await fetchCursusBySlug(slug);
      if (!c) { setLoading(false); return; }
      setCursus(c);
      const mods = await fetchModules(c.id);
      setModules(mods);
      if (user) {
        const e = await fetchEnrollment(user.id, c.id);
        setEnrollment(e);
        const { data: prof } = await supabase
          .from("profiles").select("full_name,email,phone").eq("user_id", user.id).maybeSingle();
        setProfile(prof as any);
      }
      setLoading(false);
    })();
  }, [slug, user]);

  const requestEnrollment = async () => {
    if (!user || !cursus) { navigate("/auth"); return; }
    setSubmitting(true);
    try {
      if (!enrollment) {
        const { data, error } = await supabase
          .from("course_enrollments")
          .insert({ user_id: user.id, cursus_id: cursus.id, status: "pending" })
          .select().single();
        if (error) throw error;
        setEnrollment(data as CourseEnrollment);
      }
      const link = whatsappRegistrationLink({
        cursusTitle: cursus.title,
        fullName: profile?.full_name,
        email: profile?.email ?? user.email ?? undefined,
        phone: profile?.phone,
        fee: cursus.registration_fee_xaf,
      });
      window.open(link, "_blank");
      toast.success("Demande enregistrée. Finalisez le paiement via WhatsApp.");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!cursus) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Cursus introuvable</h1>
          <Button asChild><Link to="/courses">Retour au catalogue</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const statusBanner = enrollment && (
    enrollment.status === "pending" ? (
      <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20"><Hourglass className="h-3 w-3 mr-1" />En attente de validation</Badge>
    ) : enrollment.status === "validated" ? (
      <Badge className="bg-green-500/10 text-green-700 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Inscription validée</Badge>
    ) : enrollment.status === "rejected" ? (
      <Badge variant="destructive">Inscription refusée</Badge>
    ) : null
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {cursus.pole && <Badge variant="outline">{cursus.pole.title}</Badge>}
                  {cursus.level && <Badge variant="secondary">{cursus.level}</Badge>}
                  {cursus.featured && <Badge className="bg-secondary text-secondary-foreground">Recommandé</Badge>}
                  {cursus.certification && <Badge variant="outline"><Award className="h-3 w-3 mr-1" />Certifiant</Badge>}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{cursus.title}</h1>
                {cursus.description && <p className="text-lg text-muted-foreground mb-6">{cursus.description}</p>}
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2"><Clock className="h-5 w-5" /><span>{cursus.duration_label || `${cursus.duration_hours} h`}</span></div>
                  <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /><span>{modules.length} module(s)</span></div>
                  <div className="flex items-center gap-2"><FileText className="h-5 w-5" /><span>{cursus.modality === "presentiel" ? "Présentiel" : cursus.modality === "hybride" ? "Hybride" : "En ligne"}</span></div>
                </div>
              </div>

              {cursus.objectives && (
                <div>
                  <h2 className="text-2xl font-bold mb-3">Objectifs</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{cursus.objectives}</p>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold mb-4">Programme du cursus</h2>
                {modules.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Le programme détaillé sera bientôt disponible.</p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {modules.map((m, i) => (
                      <AccordionItem key={m.id} value={m.id}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">{i + 1}</div>
                            <div>
                              <h3 className="font-semibold">{m.title}</h3>
                              <p className="text-xs text-muted-foreground">{m.duration_hours} h</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {m.description && <p className="pl-11 text-muted-foreground text-sm">{m.description}</p>}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </div>

            <div>
              <div className="sticky top-24 bg-card rounded-2xl p-8 shadow-[var(--shadow-elevated)] border border-border space-y-6">
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Tarif du cursus</p>
                  <p className="text-3xl font-bold text-primary mb-1">{formatXaf(cursus.price_xaf)}</p>
                  <p className="text-sm text-muted-foreground">
                    Frais d'inscription : <span className="font-medium text-foreground">{formatXaf(cursus.registration_fee_xaf)}</span>
                  </p>
                </div>

                {statusBanner && <div>{statusBanner}</div>}

                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold mb-4">Ce cursus inclut :</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /><span>{modules.length} modules pédagogiques</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /><span>Supports PDF et vidéos</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /><span>Évaluations QCM</span></li>
                    {cursus.certification && <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /><span>Certificat de réussite</span></li>}
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /><span>Accompagnement formateur</span></li>
                  </ul>
                </div>

                {!user ? (
                  <div className="space-y-2">
                    <Link to="/auth" className="block">
                      <Button size="lg" className="w-full bg-gradient-to-r from-primary to-accent"><LogIn className="mr-2 h-4 w-4" />Se connecter pour s'inscrire</Button>
                    </Link>
                    <Link to="/register" className="block">
                      <Button size="lg" variant="outline" className="w-full"><User className="mr-2 h-4 w-4" />Créer un compte</Button>
                    </Link>
                  </div>
                ) : enrollment?.status === "validated" ? (
                  <div className="space-y-2">
                    <Button size="lg" className="w-full" onClick={() => navigate(`/learn/${cursus.slug}`)}>
                      <BookOpen className="mr-2 h-4 w-4" />Accéder au cursus<ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" onClick={() => navigate(`/exam/${cursus.slug}`)}>
                      Passer l'examen QCM (50 questions)
                    </Button>
                  </div>
                ) : (
                  <Button size="lg" className="w-full bg-gradient-to-r from-secondary to-secondary/90" onClick={requestEnrollment} disabled={submitting}>
                    {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Chargement</> : (
                      <><MessageCircle className="mr-2 h-4 w-4" />{enrollment?.status === "pending" ? "Renvoyer le message WhatsApp" : "S'inscrire via WhatsApp"}</>
                    )}
                  </Button>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Paiement validé manuellement par notre équipe après réception WhatsApp.
                </p>

                {enrollment?.status === "pending" && (
                  <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground flex items-start gap-2">
                    <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    L'accès aux modules sera débloqué dès validation de votre paiement.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CourseDetail;

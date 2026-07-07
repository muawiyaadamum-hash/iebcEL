import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { toast } from "sonner";
import {
  fetchCursusList, fetchPoles,
  formatXaf, formatEur, xafToEur,
  REGISTRATION_FEE_EUR, REGISTRATION_FEE_XAF,
  WHATSAPP_NUMBER,
  type Cursus, type Pole,
} from "@/lib/lms";
import {
  Loader2, Search, CheckCircle2, ArrowRight, ArrowLeft,
  ShoppingCart, MessageCircle, LogIn, Award, Clock, Trash2,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

const Enroll = () => {
  useScrollToTop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [step, setStep] = useState<Step>(1);
  const [poles, setPoles] = useState<Pole[]>([]);
  const [cursus, setCursus] = useState<Cursus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [poleFilter, setPoleFilter] = useState<string>("all");
  const [profile, setProfile] = useState<{ full_name?: string; email?: string; phone?: string } | null>(null);
  const [existing, setExisting] = useState<Set<string>>(new Set()); // cursus already enrolled
  const [submitting, setSubmitting] = useState(false);

  // Preselect from ?cursus=slug
  useEffect(() => {
    (async () => {
      const [p, c] = await Promise.all([fetchPoles(), fetchCursusList()]);
      setPoles(p);
      setCursus(c);
      const preslug = params.get("cursus");
      if (preslug) {
        const match = c.find((x) => x.slug === preslug);
        if (match) setSelected(new Set([match.id]));
      }
      setLoading(false);
    })();
  }, [params]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase
        .from("profiles").select("full_name,email,phone").eq("user_id", user.id).maybeSingle();
      setProfile(prof as any);
      const { data: enrs } = await supabase
        .from("course_enrollments")
        .select("cursus_id,status")
        .eq("user_id", user.id)
        .in("status", ["pending", "validated"]);
      setExisting(new Set((enrs || []).map((e: any) => e.cursus_id)));
    })();
  }, [user]);

  const filtered = useMemo(() => cursus.filter((c) => {
    const poleOk = poleFilter === "all" || c.pole?.slug === poleFilter;
    const s = search.toLowerCase().trim();
    const sOk = !s || c.title.toLowerCase().includes(s) || (c.description ?? "").toLowerCase().includes(s);
    return poleOk && sOk;
  }), [cursus, poleFilter, search]);

  const selectedCursus = useMemo(
    () => cursus.filter((c) => selected.has(c.id)),
    [cursus, selected]
  );

  const totals = useMemo(() => {
    const coursesXaf = selectedCursus.reduce((sum, c) => sum + (c.price_xaf || 0), 0);
    const totalXaf = REGISTRATION_FEE_XAF + coursesXaf;
    return {
      coursesXaf,
      coursesEur: xafToEur(coursesXaf),
      registrationXaf: REGISTRATION_FEE_XAF,
      registrationEur: REGISTRATION_FEE_EUR,
      totalXaf,
      totalEur: xafToEur(totalXaf),
    };
  }, [selectedCursus]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const goNext = () => {
    if (step === 1 && !user) { navigate("/auth?redirect=/inscription"); return; }
    if (step === 2 && selected.size === 0) { toast.error("Sélectionnez au moins un cursus"); return; }
    setStep((s) => Math.min(4, (s + 1) as Step));
  };
  const goPrev = () => setStep((s) => Math.max(1, (s - 1) as Step));

  const submit = async () => {
    if (!user) { navigate("/auth?redirect=/inscription"); return; }
    if (selected.size === 0) return;
    setSubmitting(true);
    try {
      // Create pending enrollments for each selected cursus (skip if already exists)
      const toInsert = selectedCursus
        .filter((c) => !existing.has(c.id))
        .map((c) => ({ user_id: user.id, cursus_id: c.id, status: "pending" as const }));

      if (toInsert.length > 0) {
        const { error } = await supabase.from("course_enrollments").insert(toInsert);
        if (error) throw error;
      }

      // Build WhatsApp recap
      const lines: string[] = [
        `Bonjour Centre de Formation IEBC,`,
        ``,
        `Je souhaite finaliser mon inscription :`,
        `• Nom : ${profile?.full_name ?? "[à compléter]"}`,
        `• Email : ${profile?.email ?? user.email ?? ""}`,
        `• Téléphone : ${profile?.phone ?? "[à compléter]"}`,
        ``,
        `Cursus choisis (${selectedCursus.length}) :`,
        ...selectedCursus.map((c) => `  - ${c.title} — ${formatXaf(c.price_xaf)} (~ ${formatEur(xafToEur(c.price_xaf))})`),
        ``,
        `Détail des frais :`,
        `• Frais d'inscription : ${formatEur(REGISTRATION_FEE_EUR)} (~ ${formatXaf(REGISTRATION_FEE_XAF)})`,
        `• Total cursus : ${formatEur(totals.coursesEur)} (~ ${formatXaf(totals.coursesXaf)})`,
        `• TOTAL À PAYER : ${formatEur(totals.totalEur)} (~ ${formatXaf(totals.totalXaf)})`,
        ``,
        `Merci de me confirmer la procédure de paiement.`,
      ];
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
      window.open(url, "_blank");
      toast.success("Demande enregistrée. Finalisez le paiement via WhatsApp.");
      setStep(4);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { n: 1, label: "Compte" },
    { n: 2, label: "Choix des cursus" },
    { n: 3, label: "Récapitulatif" },
    { n: 4, label: "Paiement" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Parcours d'inscription</h1>
            <p className="text-muted-foreground">
              Frais d'inscription {formatEur(REGISTRATION_FEE_EUR)} + tarifs par cursus
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-10">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 ${step >= s.n ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
                    step > s.n ? "bg-primary text-primary-foreground border-primary"
                    : step === s.n ? "border-primary text-primary" : "border-muted"
                  }`}>
                    {step > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s.n ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              {step === 1 && (
                <Card>
                  <CardHeader><CardTitle>Étape 1 — Votre compte</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {user ? (
                      <>
                        <div className="rounded-lg bg-muted/50 p-4">
                          <p className="text-sm text-muted-foreground mb-1">Connecté en tant que</p>
                          <p className="font-medium">{profile?.full_name || user.email}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Button size="lg" onClick={goNext} className="w-full">
                          Continuer <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-muted-foreground">
                          Vous devez avoir un compte pour vous inscrire. Connectez-vous ou créez-en un.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Link to="/auth?redirect=/inscription">
                            <Button size="lg" className="w-full"><LogIn className="mr-2 h-4 w-4" />Se connecter</Button>
                          </Link>
                          <Link to="/register">
                            <Button size="lg" variant="outline" className="w-full">Créer un compte</Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <Card>
                      <CardHeader><CardTitle>Étape 2 — Choisissez vos cursus</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                          </div>
                          <select
                            value={poleFilter}
                            onChange={(e) => setPoleFilter(e.target.value)}
                            className="rounded-md border bg-background px-3 py-2 text-sm"
                          >
                            <option value="all">Tous les pôles</option>
                            {poles.map((p) => <option key={p.id} value={p.slug}>{p.title}</option>)}
                          </select>
                        </div>

                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                          {filtered.map((c) => {
                            const isSel = selected.has(c.id);
                            const alreadyEnrolled = existing.has(c.id);
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => !alreadyEnrolled && toggle(c.id)}
                                disabled={alreadyEnrolled}
                                className={`w-full text-left rounded-lg border p-4 transition ${
                                  alreadyEnrolled ? "opacity-60 cursor-not-allowed" :
                                  isSel ? "border-primary bg-primary/5" : "hover:border-primary/50"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <Checkbox checked={isSel} disabled={alreadyEnrolled} className="mt-1" />
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between gap-3 mb-1">
                                      <h3 className="font-semibold">{c.title}</h3>
                                      <div className="text-right shrink-0">
                                        <p className="font-bold text-primary text-sm">{formatEur(xafToEur(c.price_xaf))}</p>
                                        <p className="text-xs text-muted-foreground">{formatXaf(c.price_xaf)}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                      {c.pole && <Badge variant="outline" className="text-xs">{c.pole.title}</Badge>}
                                      {c.level && <Badge variant="secondary" className="text-xs">{c.level}</Badge>}
                                      {c.certification && <Badge variant="outline" className="text-xs"><Award className="h-3 w-3 mr-1" />Certifiant</Badge>}
                                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                                        <Clock className="h-3 w-3" />{c.duration_label || `${c.duration_hours} h`}
                                      </span>
                                      {alreadyEnrolled && <Badge className="text-xs">Déjà inscrit</Badge>}
                                    </div>
                                    {c.description && <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                          {filtered.length === 0 && (
                            <p className="text-center text-muted-foreground py-8 text-sm">Aucun cursus ne correspond.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />Panier ({selectedCursus.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedCursus.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Aucun cursus sélectionné.</p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {selectedCursus.map((c) => (
                              <div key={c.id} className="flex items-start gap-2 text-sm">
                                <button onClick={() => toggle(c.id)} className="text-muted-foreground hover:text-destructive mt-0.5">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className="truncate">{c.title}</p>
                                  <p className="text-xs text-muted-foreground">{formatEur(xafToEur(c.price_xaf))}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="border-t pt-3 space-y-1 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Cursus</span><span>{formatEur(totals.coursesEur)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Inscription</span><span>{formatEur(REGISTRATION_FEE_EUR)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-base pt-2 border-t">
                            <span>Total</span><span className="text-primary">{formatEur(totals.totalEur)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground text-right">~ {formatXaf(totals.totalXaf)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={goPrev} className="flex-1"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>
                          <Button onClick={goNext} className="flex-1" disabled={selected.size === 0}>
                            Suivant <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {step === 3 && (
                <Card>
                  <CardHeader><CardTitle>Étape 3 — Récapitulatif</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Cursus sélectionnés</h3>
                      <div className="space-y-2">
                        {selectedCursus.map((c) => (
                          <div key={c.id} className="flex justify-between items-center rounded-lg border p-3">
                            <div>
                              <p className="font-medium">{c.title}</p>
                              <p className="text-xs text-muted-foreground">{c.pole?.title} · {c.duration_label || `${c.duration_hours} h`}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatEur(xafToEur(c.price_xaf))}</p>
                              <p className="text-xs text-muted-foreground">{formatXaf(c.price_xaf)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total cursus ({selectedCursus.length})</span>
                        <span>{formatEur(totals.coursesEur)} <span className="text-muted-foreground">({formatXaf(totals.coursesXaf)})</span></span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Frais d'inscription (unique)</span>
                        <span>{formatEur(REGISTRATION_FEE_EUR)} <span className="text-muted-foreground">({formatXaf(REGISTRATION_FEE_XAF)})</span></span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>TOTAL À PAYER</span>
                        <span className="text-primary">{formatEur(totals.totalEur)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-right">~ {formatXaf(totals.totalXaf)}</p>
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                      <p className="font-medium mb-2">🔒 Accès verrouillé jusqu'au paiement</p>
                      <p className="text-muted-foreground">
                        Après validation, vous serez redirigé vers WhatsApp pour finaliser le paiement.
                        L'accès aux modules sera débloqué dès la confirmation par notre équipe.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={goPrev} className="flex-1"><ArrowLeft className="mr-2 h-4 w-4" />Modifier</Button>
                      <Button onClick={submit} disabled={submitting} className="flex-1 bg-gradient-to-r from-secondary to-secondary/90">
                        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi...</> :
                          <><MessageCircle className="mr-2 h-4 w-4" />Confirmer et payer via WhatsApp</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      Demande enregistrée
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      Votre demande d'inscription à <strong>{selectedCursus.length} cursus</strong> a été enregistrée.
                      Un message WhatsApp a été ouvert avec le récapitulatif.
                    </p>
                    <div className="rounded-lg bg-muted/50 p-4 space-y-1 text-sm">
                      <div className="flex justify-between"><span>Total à régler</span><strong className="text-primary">{formatEur(totals.totalEur)}</strong></div>
                      <div className="flex justify-between text-muted-foreground"><span>Équivalent</span><span>{formatXaf(totals.totalXaf)}</span></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Prochaines étapes : envoyez la preuve de paiement via WhatsApp. Notre équipe valide sous 24 h et débloque
                      l'accès à vos modules.
                    </p>
                    <div className="flex gap-3">
                      <Button asChild variant="outline" className="flex-1"><Link to="/etudiant">Mon espace</Link></Button>
                      <Button asChild className="flex-1"><Link to="/courses">Voir le catalogue</Link></Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Enroll;

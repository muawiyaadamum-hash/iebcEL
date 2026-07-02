import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Download, CheckCircle2, XCircle, AlertTriangle, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchCursusBySlug, type Cursus } from "@/lib/lms";
import { useAuth } from "@/contexts/AuthContext";
import { generateExamReportPdf, type ExamReviewItem } from "@/lib/examReport";
import { generateCertificateCode, generateCertificatePdf } from "@/lib/certificate";
import { useAntiCheat } from "@/hooks/useAntiCheat";

const EXAM_DURATION_SEC = 60 * 60; // 60 min

interface ExamQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  topic: string | null;
}

const Exam = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cursus, setCursus] = useState<Cursus | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | {
    score: number; total: number; passed: boolean; review: ExamReviewItem[]; submittedAt: string;
  }>(null);
  const [certCode, setCertCode] = useState<string | null>(null);
  const [issuingCert, setIssuingCert] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SEC);
  const examActive = questions.length > 0 && !result;

  const { violations, maxViolations } = useAntiCheat({
    active: examActive,
    maxViolations: 3,
    onForceSubmit: () => { submitExamRef.current?.(); },
  });
  const submitExamRef = useRef<() => void>();

  // Countdown timer
  useEffect(() => {
    if (!examActive) return;
    setTimeLeft(EXAM_DURATION_SEC);
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(iv); submitExamRef.current?.(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [examActive]);


  useEffect(() => {
    if (!slug) return;
    fetchCursusBySlug(slug).then((c) => setCursus(c)).finally(() => setLoading(false));
  }, [slug]);

  const answered = Object.keys(answers).length;
  const progress = questions.length ? (answered / questions.length) * 100 : 0;
  const current = questions[currentIdx];

  const startExam = async () => {
    if (!cursus || !user) return;
    setStarting(true);
    const { data, error } = await supabase.functions.invoke("exam-start", {
      body: { cursus_id: cursus.id, n: 50 },
    });
    setStarting(false);
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Impossible de démarrer l'examen");
      return;
    }
    setAttemptId(data.attempt_id);
    setQuestions(data.questions);
    setCurrentIdx(0);
    setAnswers({});
  };

  // Force-submit path (no confirm) used by anti-cheat / timer
  useEffect(() => { submitExamRef.current = () => { void submitExamInternal(true); }; });

  const submitExamInternal = async (force = false) => {
    if (!attemptId) return;
    if (!force && answered < questions.length) {
      const ok = window.confirm(`Vous n'avez répondu qu'à ${answered}/${questions.length} questions. Soumettre quand même ?`);
      if (!ok) return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("exam-submit", {
      body: { attempt_id: attemptId, answers },
    });
    setSubmitting(false);
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Erreur lors de la soumission");
      return;
    }
    const built = {
      score: data.score as number,
      total: data.total as number,
      passed: data.passed as boolean,
      review: data.review as ExamReviewItem[],
      submittedAt: new Date().toISOString(),
    };
    setResult(built);
    setQuestions([]);

    // Phase 4: auto-issue certificate on pass
    if (built.passed && cursus && user) {
      setIssuingCert(true);
      const code = generateCertificateCode();
      const studentName = (user.user_metadata as any)?.full_name || user.email || "Apprenant";
      const { error: insertErr } = await supabase.from("certificates").insert({
        user_id: user.id,
        cursus_id: cursus.id,
        attempt_id: attemptId,
        code,
        student_name: studentName,
        cursus_title: cursus.title,
        score: built.score,
        total: built.total,
      });
      setIssuingCert(false);
      if (insertErr) {
        toast.error("Certificat non émis : " + insertErr.message);
      } else {
        setCertCode(code);
        toast.success("Certificat émis avec QR de vérification !");
      }
    }
  };

  const downloadCertificate = async () => {
    if (!result || !cursus || !certCode || !user) return;
    const verifyUrl = `${window.location.origin}/verify/${certCode}`;
    const doc = await generateCertificatePdf({
      code: certCode,
      studentName: (user.user_metadata as any)?.full_name || user.email || "Apprenant",
      cursusTitle: cursus.title,
      score: result.score,
      total: result.total,
      issuedAt: result.submittedAt,
      verifyUrl,
    });
    doc.save(`Certificat-IEBC-${cursus.slug}-${certCode}.pdf`);
  };

  const downloadReport = () => {
    if (!result || !cursus) return;
    const doc = generateExamReportPdf({
      studentName: user?.user_metadata?.full_name || user?.email || "Apprenant",
      cursusTitle: cursus.title,
      attemptId: attemptId || "",
      score: result.score,
      total: result.total,
      passed: result.passed,
      submittedAt: result.submittedAt,
      review: result.review,
    });
    doc.save(`Rapport-QCM-${cursus.slug}.pdf`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (!cursus) {
    return <div className="min-h-screen flex items-center justify-center">Cursus introuvable.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Évaluation QCM</h1>
        <p className="text-muted-foreground mb-8">{cursus.title}</p>

        {/* Result view */}
        {result && (
          <Card className="border-2" >
            <CardHeader className={result.passed ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}>
              <CardTitle className="flex items-center gap-3">
                {result.passed ? <CheckCircle2 className="h-7 w-7 text-green-600" /> : <XCircle className="h-7 w-7 text-red-600" />}
                Score : {result.score} / {result.total} — {result.passed ? "ADMIS" : "NON ADMIS"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Seuil de réussite : 60%. Vous avez obtenu {Math.round((result.score / result.total) * 100)}%.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={downloadReport}><Download className="h-4 w-4 mr-2" />Rapport PDF</Button>
                {result.passed && certCode && (
                  <Button onClick={downloadCertificate} className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Award className="h-4 w-4 mr-2" />Télécharger le certificat
                  </Button>
                )}
                {result.passed && issuingCert && (
                  <Button disabled variant="outline"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Émission du certificat…</Button>
                )}
                <Button variant="outline" onClick={() => navigate("/dashboard")}>Tableau de bord</Button>
                <Button variant="ghost" onClick={() => { setResult(null); setAttemptId(null); setCertCode(null); }}>Refaire</Button>
              </div>
              {result.passed && certCode && (
                <div className="text-xs text-muted-foreground p-3 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-300">
                  Réf. certificat : <span className="font-mono">{certCode}</span> · vérifiable sur <span className="font-mono">/verify/{certCode}</span>
                </div>
              )}
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold">Détail des réponses</h3>
                {result.review.map((r, i) => (
                  <div key={r.id} className={`p-3 rounded border ${r.ok ? "border-green-300 bg-green-50/50 dark:bg-green-950/10" : "border-red-300 bg-red-50/50 dark:bg-red-950/10"}`}>
                    <div className="text-sm font-medium">Q{i + 1}. {r.question}</div>
                    <div className="text-xs mt-1">Votre réponse : <b>{r.given || "—"}</b> · Correcte : <b>{r.correct}</b></div>
                    {r.explanation && <div className="text-xs text-muted-foreground mt-1">{r.explanation}</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* In-exam view */}
        {!result && questions.length > 0 && current && (
          <Card className="select-none">
            <CardHeader>
              <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                <span className="text-sm text-muted-foreground">Question {currentIdx + 1} / {questions.length}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`font-mono px-2 py-1 rounded ${timeLeft < 300 ? "bg-red-100 text-red-700" : "bg-muted"}`}>
                    ⏱ {String(Math.floor(timeLeft / 60)).padStart(2,"0")}:{String(timeLeft % 60).padStart(2,"0")}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${violations > 0 ? "bg-yellow-100 text-yellow-800" : "bg-muted"}`}>
                    Avertissements {violations}/{maxViolations}
                  </span>
                  <span className="font-medium">{answered} répondue(s)</span>
                </div>
              </div>
              <Progress value={progress} />
            </CardHeader>
            <CardContent className="space-y-6">
              <h2 className="text-lg font-semibold">{current.question}</h2>
              <RadioGroup
                value={answers[current.id] || ""}
                onValueChange={(v) => setAnswers((a) => ({ ...a, [current.id]: v }))}
              >
                {(["A", "B", "C", "D"] as const).map((k) => (
                  <div key={k} className="flex items-start gap-3 p-3 rounded border hover:bg-accent/30">
                    <RadioGroupItem value={k} id={`${current.id}-${k}`} className="mt-1" />
                    <Label htmlFor={`${current.id}-${k}`} className="cursor-pointer flex-1">
                      <span className="font-bold mr-2">{k}.</span>
                      {(current as any)[`option_${k.toLowerCase()}`]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" disabled={currentIdx === 0} onClick={() => setCurrentIdx((i) => i - 1)}>
                  Précédente
                </Button>
                {currentIdx < questions.length - 1 ? (
                  <Button onClick={() => setCurrentIdx((i) => i + 1)}>Suivante</Button>
                ) : (
                  <Button onClick={() => submitExamInternal(false)} disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Soumettre l'examen
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pre-start view */}
        {!result && questions.length === 0 && (
          <Card>
            <CardHeader><CardTitle>Démarrer l'examen final</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• 50 questions tirées aléatoirement dans la banque officielle.</li>
                <li>• Durée : 60 minutes (soumission automatique à l'écoulement).</li>
                <li>• Seuil de réussite : 60% (30/50).</li>
                <li>• Une seule tentative active, soumission définitive.</li>
                <li>• Rapport PDF noté téléchargeable à la fin.</li>
              </ul>
              <div className="flex items-start gap-2 p-3 rounded bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <b>Mode surveillance activé :</b> plein écran obligatoire, copier/coller et clic-droit désactivés, changement d'onglet / perte de focus / sortie plein écran comptés comme avertissements. <b>3 avertissements = soumission automatique.</b>
                </div>
              </div>
              <Button onClick={startExam} disabled={starting} size="lg">
                {starting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Commencer l'examen
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Exam;

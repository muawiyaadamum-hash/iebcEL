import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Award, RotateCcw } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passing_score: number;
}

interface QuizComponentProps {
  courseId: string;
}

const QuizComponent = ({ courseId }: QuizComponentProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("course_id", courseId)
        .maybeSingle();

      if (quizData) {
        setQuiz(quizData as Quiz);
        const { data: qs } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quizData.id)
          .order("order", { ascending: true });
        setQuestions((qs || []) as any);
      }
      setLoading(false);
    };
    load();
  }, [courseId]);

  const handleSubmit = async () => {
    if (!user || !quiz) return;
    if (Object.keys(answers).length < questions.length) {
      toast.error("Répondez à toutes les questions");
      return;
    }
    setSubmitting(true);
    const correct = questions.filter(q => answers[q.id] === q.correct_index).length;
    const total = questions.length;
    const scorePct = Math.round((correct / total) * 100);
    const passed = scorePct >= quiz.passing_score;

    const { error } = await supabase.from("quiz_attempts").insert({
      user_id: user.id,
      quiz_id: quiz.id,
      course_id: courseId,
      score: scorePct,
      total,
      passed,
      answers,
    });

    if (error) {
      toast.error("Erreur lors de la soumission");
      setSubmitting(false);
      return;
    }

    setResult({ score: scorePct, total, passed });
    setSubmitted(true);
    setSubmitting(false);
    toast.success(passed ? "Bravo, examen réussi !" : "Examen terminé");
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (!quiz) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Aucune évaluation QCM disponible pour ce cours pour le moment.
        </CardContent>
      </Card>
    );
  }

  if (submitted && result) {
    return (
      <Card>
        <CardHeader className="text-center">
          {result.passed ? (
            <Award className="h-16 w-16 mx-auto text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 mx-auto text-destructive" />
          )}
          <CardTitle className="text-3xl">
            {result.score}/100
          </CardTitle>
          <CardDescription>
            {result.passed
              ? `Félicitations ! Vous avez réussi (seuil ${quiz.passing_score}/100).`
              : `Score insuffisant. Seuil requis : ${quiz.passing_score}/100.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={result.score} />
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const correct = answers[q.id] === q.correct_index;
              return (
                <div key={q.id} className="border rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    {correct ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{idx + 1}. {q.question}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Votre réponse : {q.options[answers[q.id]]}
                      </p>
                      {!correct && (
                        <p className="text-sm text-green-600 mt-1">
                          Bonne réponse : {q.options[q.correct_index]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Button onClick={reset} variant="outline" className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" /> Recommencer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{quiz.title}</CardTitle>
            {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
          </div>
          <Badge>Seuil : {quiz.passing_score}/100</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Aucune question pour le moment.</p>
        ) : (
          questions.map((q, idx) => (
            <div key={q.id} className="space-y-3">
              <p className="font-medium">{idx + 1}. {q.question}</p>
              <RadioGroup
                value={answers[q.id]?.toString() ?? ""}
                onValueChange={(v) => setAnswers(prev => ({ ...prev, [q.id]: parseInt(v) }))}
              >
                {q.options.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <RadioGroupItem value={i.toString()} id={`${q.id}-${i}`} />
                    <Label htmlFor={`${q.id}-${i}`} className="cursor-pointer">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))
        )}
        {questions.length > 0 && (
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Soumettre l'examen
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizComponent;

-- Lot 4: Quiz auto & banque de questions

-- 1) Enrichir quiz_questions (niveau + difficulté + thème)
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS difficulty text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS theme text,
  ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'standard';

-- 2) Rattacher les quiz à un module (optionnel — support "quiz par module")
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS module_id uuid REFERENCES public.cursus_modules(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS cursus_id uuid REFERENCES public.cursus(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'standard';

CREATE INDEX IF NOT EXISTS idx_quizzes_module ON public.quizzes(module_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_cursus ON public.quizzes(cursus_id);

-- 3) Ordre des options tirées (pour randomisation en examen)
ALTER TABLE public.exam_attempts
  ADD COLUMN IF NOT EXISTS option_orders jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 4) Fonction: peut-il passer l'examen final ?
-- Règles: inscription validée + tous les modules publiés complétés (module_progress.completed=true)
--         + toutes les tentatives de quiz de module réussies (passed=true)
CREATE OR REPLACE FUNCTION public.can_take_final_exam(_user_id uuid, _cursus_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enrolled boolean;
  v_total_modules int;
  v_completed_modules int;
  v_total_quizzes int;
  v_passed_quizzes int;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.course_enrollments
    WHERE user_id = _user_id AND cursus_id = _cursus_id AND status = 'validated'
  ) INTO v_enrolled;

  SELECT COUNT(*) INTO v_total_modules
  FROM public.cursus_modules
  WHERE cursus_id = _cursus_id AND published = true;

  SELECT COUNT(*) INTO v_completed_modules
  FROM public.module_progress mp
  JOIN public.cursus_modules m ON m.id = mp.module_id
  WHERE m.cursus_id = _cursus_id AND m.published = true
    AND mp.user_id = _user_id AND mp.completed = true;

  SELECT COUNT(*) INTO v_total_quizzes
  FROM public.quizzes q
  WHERE q.cursus_id = _cursus_id OR q.module_id IN (
    SELECT id FROM public.cursus_modules WHERE cursus_id = _cursus_id AND published = true
  );

  SELECT COUNT(DISTINCT qa.quiz_id) INTO v_passed_quizzes
  FROM public.quiz_attempts qa
  JOIN public.quizzes q ON q.id = qa.quiz_id
  WHERE qa.user_id = _user_id AND qa.passed = true
    AND (q.cursus_id = _cursus_id OR q.module_id IN (
      SELECT id FROM public.cursus_modules WHERE cursus_id = _cursus_id AND published = true
    ));

  RETURN jsonb_build_object(
    'allowed', v_enrolled
                AND (v_total_modules = 0 OR v_completed_modules >= v_total_modules)
                AND (v_total_quizzes = 0 OR v_passed_quizzes >= v_total_quizzes),
    'enrolled', v_enrolled,
    'modules_total', v_total_modules,
    'modules_completed', v_completed_modules,
    'quizzes_total', v_total_quizzes,
    'quizzes_passed', v_passed_quizzes
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_take_final_exam(uuid, uuid) TO authenticated;
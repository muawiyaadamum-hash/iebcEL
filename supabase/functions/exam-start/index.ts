import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: authErr } = await userClient.auth.getUser();
    if (authErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const cursusId = String(body.cursus_id || "");
    const n = Math.min(Math.max(parseInt(body.n ?? "50", 10) || 50, 1), 100);
    if (!cursusId) return json({ error: "cursus_id required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Must be validated enrollment
    const { data: enr } = await admin
      .from("course_enrollments")
      .select("status")
      .eq("user_id", userId)
      .eq("cursus_id", cursusId)
      .maybeSingle();
    if (!enr || enr.status !== "validated") {
      return json({ error: "Inscription non validée pour ce cursus" }, 403);
    }

    // Anti-cheat: block if already passed, or auto-fail any in_progress attempt (single active attempt)
    const { data: prior } = await admin
      .from("exam_attempts")
      .select("id, status, passed")
      .eq("user_id", userId)
      .eq("cursus_id", cursusId);
    if ((prior || []).some((p) => p.passed)) {
      return json({ error: "Vous avez déjà réussi cet examen." }, 403);
    }
    const stale = (prior || []).filter((p) => p.status === "in_progress").map((p) => p.id);
    if (stale.length > 0) {
      await admin.from("exam_attempts")
        .update({ status: "submitted", passed: false, score: 0, submitted_at: new Date().toISOString() })
        .in("id", stale);
    }

    // Draw random questions
    const { data: drawn, error: drawErr } = await admin
      .rpc("draw_exam_questions", { _cursus_id: cursusId, _n: n });
    if (drawErr) return json({ error: drawErr.message }, 500);
    const ids: string[] = drawn || [];
    if (ids.length < n) {
      return json({
        error: `Banque insuffisante: ${ids.length} questions disponibles sur ${n} requises.`,
      }, 400);
    }

    // Create attempt
    const { data: attempt, error: attErr } = await admin
      .from("exam_attempts")
      .insert({
        user_id: userId,
        cursus_id: cursusId,
        question_ids: ids,
        total: n,
        status: "in_progress",
      })
      .select()
      .single();
    if (attErr) return json({ error: attErr.message }, 500);

    // Fetch questions WITHOUT correct_option
    const { data: questions } = await admin
      .from("exam_question_bank")
      .select("id, question, option_a, option_b, option_c, option_d, topic, question_type")
      .in("id", ids);

    // Preserve draw order + shuffle answer options per question
    const LETTERS = ["a", "b", "c", "d"] as const;
    const orders: Record<string, string[]> = {};
    const ordered = ids.map((id) => {
      const q: any = questions?.find((x: any) => x.id === id);
      if (!q) return null;
      const isTF = q.question_type === "true_false";
      const pool = isTF ? ["a", "b"] : ["a", "b", "c", "d"];
      // Fisher-Yates
      const perm = [...pool];
      for (let i = perm.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [perm[i], perm[j]] = [perm[j], perm[i]];
      }
      orders[id] = perm; // served letter index -> original letter
      const out: any = { id: q.id, question: q.question, topic: q.topic, question_type: q.question_type };
      LETTERS.forEach((L, idx) => {
        const origLetter = perm[idx];
        out[`option_${L}`] = origLetter ? q[`option_${origLetter}`] : "—";
      });
      return out;
    }).filter(Boolean);

    // Save shuffle order on attempt for submit-time un-shuffling
    await admin.from("exam_attempts").update({ option_orders: orders }).eq("id", attempt.id);

    return json({ attempt_id: attempt.id, total: n, questions: ordered });
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

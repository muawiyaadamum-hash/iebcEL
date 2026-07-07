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
    const attemptId = String(body.attempt_id || "");
    const answers = (body.answers ?? {}) as Record<string, string>;
    if (!attemptId) return json({ error: "attempt_id required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: attempt, error: aErr } = await admin
      .from("exam_attempts")
      .select("*")
      .eq("id", attemptId)
      .maybeSingle();
    if (aErr || !attempt) return json({ error: "Attempt introuvable" }, 404);
    if (attempt.user_id !== userId) return json({ error: "Forbidden" }, 403);
    if (attempt.status !== "in_progress") {
      return json({ error: "Attempt déjà soumis" }, 400);
    }

    const ids: string[] = attempt.question_ids || [];
    const orders: Record<string, string[]> = attempt.option_orders || {};
    const { data: keys } = await admin
      .from("exam_question_bank")
      .select("id, correct_option, correct_options, question_type, explanation, question, option_a, option_b, option_c, option_d")
      .in("id", ids);

    const LETTERS = ["A", "B", "C", "D"];
    let score = 0;
    const review = ids.map((id) => {
      const k = keys?.find((x: any) => x.id === id);
      const givenLetter = String(answers[id] ?? "").toUpperCase();
      // Un-shuffle: served letter -> original letter (via orders[id])
      const perm = orders[id] || ["a", "b", "c", "d"];
      const idx = LETTERS.indexOf(givenLetter);
      const originalGiven = idx >= 0 && perm[idx] ? perm[idx].toUpperCase() : "";
      const correct = (k?.correct_option ?? "").toUpperCase();
      const ok = !!originalGiven && originalGiven === correct;
      if (ok) score++;
      // Build served options in the shuffled order for review display
      const servedOptions: Record<string, string> = {};
      LETTERS.forEach((L, i) => {
        const orig = perm[i];
        servedOptions[L] = orig ? (k as any)?.[`option_${orig}`] : "";
      });
      // Convert correct to served letter
      const correctServed = LETTERS[perm.indexOf(correct.toLowerCase())] || correct;
      return {
        id,
        question: k?.question,
        options: { A: servedOptions.A, B: servedOptions.B, C: servedOptions.C, D: servedOptions.D },
        given: givenLetter,
        correct: correctServed,
        ok,
        explanation: k?.explanation ?? null,
      };
    });

    const total = attempt.total ?? ids.length;
    const passed = score >= Math.ceil(total * 0.6); // 60% pass threshold

    const { error: upErr } = await admin
      .from("exam_attempts")
      .update({
        status: "submitted",
        answers,
        score,
        passed,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", attemptId);
    if (upErr) return json({ error: upErr.message }, 500);

    return json({ attempt_id: attemptId, score, total, passed, review });
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

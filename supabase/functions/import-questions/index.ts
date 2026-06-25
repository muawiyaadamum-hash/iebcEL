// deno-lint-ignore-file no-explicit-any
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const SYSTEM_BASE = `Tu es un assistant expert qui extrait des questions d'évaluation à partir de documents pédagogiques.
Tu réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après.

Le JSON doit avoir cette forme exacte :
{
  "questions": [
    {
      "question": "Énoncé",
      "question_type": "qcm" | "true_false" | "multi",
      "option_a": "Option A",
      "option_b": "Option B",
      "option_c": "Option C",
      "option_d": "Option D",
      "correct_option": "A" | "B" | "C" | "D",
      "correct_options": ["A","C"],
      "explanation": "Justification courte",
      "topic": "Thème exact (voir liste ci-dessous si fournie)",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

DÉTECTION AUTOMATIQUE DU TYPE :
- "true_false" : question vrai/faux. option_a="Vrai", option_b="Faux", option_c="—", option_d="—". correct_option = "A" ou "B". correct_options = [correct_option].
- "multi" : plusieurs bonnes réponses possibles. Remplis correct_options avec TOUTES les bonnes lettres (ex: ["A","C"]). correct_option = la première bonne lettre.
- "qcm" : une seule bonne réponse. correct_option = lettre, correct_options = [correct_option].

INDICES MULTI-RÉPONSES : "cochez toutes", "plusieurs réponses possibles", "lesquelles", "select all that apply".
INDICES VRAI/FAUX : "vrai ou faux", "true or false", question affirmative simple oui/non.

MAPPING DE THÈMES :
- Si une liste de thèmes est fournie ci-dessous, choisis TOUJOURS le thème le plus pertinent dans cette liste (correspondance exacte du libellé).
- Sinon, propose un thème court (2-4 mots) déduit du contenu.

Règles :
- correct_option DOIT être A, B, C ou D
- Chaque question doit avoir exactement 4 options (sauf true_false où C et D valent "—")
- Si la bonne réponse n'est pas indiquée, déduis-la du contenu
- Ne traduis pas, garde la langue d'origine
- Extrais TOUTES les questions du document`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { filename, mime, base64, raw_text, format, topics } = body as {
      filename?: string; mime?: string; base64?: string; raw_text?: string;
      format?: string; topics?: string[];
    };

    const system = SYSTEM_BASE + (topics && topics.length
      ? `\n\nLISTE DES THÈMES DISPONIBLES (utilise une de ces valeurs EXACTES pour "topic") :\n- ${topics.join("\n- ")}`
      : "");

    if (format === "json" && raw_text) {
      try {
        const parsed = JSON.parse(raw_text);
        const arr = Array.isArray(parsed) ? parsed : parsed.questions;
        if (!Array.isArray(arr)) throw new Error("JSON invalide: tableau 'questions' attendu");
        return new Response(JSON.stringify({ questions: normalize(arr, topics) }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: "JSON invalide: " + e.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const userContent: any[] = [
      { type: "text", text: "Extrais toutes les questions selon le schéma JSON imposé. Détecte automatiquement le type (qcm/true_false/multi) et mappe au thème le plus proche." },
    ];

    if (base64 && mime) {
      if (mime.startsWith("image/")) {
        userContent.push({ type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } });
      } else {
        userContent.push({
          type: "file",
          file: { filename: filename || "document", file_data: `data:${mime};base64,${base64}` },
        });
      }
    } else if (raw_text) {
      userContent.push({ type: "text", text: "Contenu brut :\n\n" + raw_text });
    } else {
      return new Response(JSON.stringify({ error: "Aucun contenu fourni" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "manual",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Limite IA atteinte, réessayez dans quelques instants." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés. Ajoutez des crédits Lovable AI." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error: " + errText }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content;
    if (!content) throw new Error("Pas de contenu retourné par l'IA");

    let parsed: any;
    try {
      parsed = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      const match = String(content).match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Réponse IA non JSON");
      parsed = JSON.parse(match[0]);
    }

    const questions = normalize(parsed.questions || [], topics);
    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function normalize(arr: any[], topics?: string[]): any[] {
  const topicLower = (topics || []).map((t) => t.toLowerCase());
  return arr.map((q: any) => {
    const rawType = String(q.question_type || q.type || "qcm").toLowerCase();
    let qtype: "qcm" | "true_false" | "multi" = "qcm";
    if (rawType.includes("true") || rawType.includes("vrai") || rawType === "tf") qtype = "true_false";
    else if (rawType.includes("multi")) qtype = "multi";

    let option_a = String(q.option_a || q.a || q.A || "").trim();
    let option_b = String(q.option_b || q.b || q.B || "").trim();
    let option_c = String(q.option_c || q.c || q.C || "").trim();
    let option_d = String(q.option_d || q.d || q.D || "").trim();

    if (qtype === "true_false") {
      option_a = option_a || "Vrai";
      option_b = option_b || "Faux";
      option_c = "—"; option_d = "—";
    }

    const correct_option = String(q.correct_option || q.correct || q.answer || "A").toUpperCase().charAt(0);
    let correct_options: string[] = Array.isArray(q.correct_options)
      ? q.correct_options.map((x: any) => String(x).toUpperCase().charAt(0)).filter((x: string) => "ABCD".includes(x))
      : [];
    if (correct_options.length === 0) correct_options = [correct_option];

    // Topic mapping snap to provided list (case-insensitive)
    let topic = q.topic || q.theme || null;
    if (topic && topicLower.length) {
      const idx = topicLower.indexOf(String(topic).toLowerCase());
      if (idx >= 0) topic = topics![idx];
    }

    return {
      question: String(q.question || q.q || "").trim(),
      question_type: qtype,
      option_a, option_b, option_c, option_d,
      correct_option,
      correct_options,
      explanation: q.explanation || q.explication || null,
      topic,
      difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
    };
  }).filter((q: any) => q.question && q.option_a && q.option_b);
}

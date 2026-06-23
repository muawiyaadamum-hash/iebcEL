// deno-lint-ignore-file no-explicit-any
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const SYSTEM = `Tu es un assistant expert qui extrait des questions de QCM (quiz à choix multiples) à partir de documents pédagogiques.
Tu réponds UNIQUEMENT en JSON valide, sans aucun texte avant ou après.
Le JSON doit avoir cette forme exacte :
{
  "questions": [
    {
      "question": "Énoncé de la question",
      "option_a": "Option A",
      "option_b": "Option B",
      "option_c": "Option C",
      "option_d": "Option D",
      "correct_option": "A",
      "explanation": "Justification courte (optionnel)",
      "topic": "Thème (optionnel)",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}
Règles :
- correct_option DOIT être A, B, C ou D
- Chaque question doit avoir exactement 4 options
- Si une question n'a pas 4 options dans la source, complète intelligemment
- Si la réponse correcte n'est pas indiquée, déduis-la du contenu
- Ne traduis pas, garde la langue d'origine du document
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
    const { filename, mime, base64, raw_text, format } = body as {
      filename?: string; mime?: string; base64?: string; raw_text?: string; format?: string;
    };

    // Shortcut: if user uploads strict JSON, parse client-side or here without AI
    if (format === "json" && raw_text) {
      try {
        const parsed = JSON.parse(raw_text);
        const arr = Array.isArray(parsed) ? parsed : parsed.questions;
        if (!Array.isArray(arr)) throw new Error("JSON invalide: tableau 'questions' attendu");
        return new Response(JSON.stringify({ questions: normalize(arr) }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: "JSON invalide: " + e.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Build multimodal message for Lovable AI Gateway
    const userContent: any[] = [
      { type: "text", text: "Extrais toutes les questions QCM de ce document selon le schéma JSON imposé." },
    ];

    if (base64 && mime) {
      if (mime.startsWith("image/")) {
        userContent.push({ type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } });
      } else {
        // PDF / DOCX as file
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
          { role: "system", content: SYSTEM },
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
      // try to extract JSON block
      const match = String(content).match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Réponse IA non JSON");
      parsed = JSON.parse(match[0]);
    }

    const questions = normalize(parsed.questions || []);
    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function normalize(arr: any[]): any[] {
  return arr.map((q: any) => ({
    question: String(q.question || q.q || "").trim(),
    option_a: String(q.option_a || q.a || q.A || "").trim(),
    option_b: String(q.option_b || q.b || q.B || "").trim(),
    option_c: String(q.option_c || q.c || q.C || "").trim(),
    option_d: String(q.option_d || q.d || q.D || "").trim(),
    correct_option: String(q.correct_option || q.correct || q.answer || "A").toUpperCase().charAt(0),
    explanation: q.explanation || q.explication || null,
    topic: q.topic || q.theme || null,
    difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
  })).filter((q: any) => q.question && q.option_a && q.option_b && q.option_c && q.option_d);
}

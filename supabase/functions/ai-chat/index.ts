import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are IEBC's friendly 24/7 AI support assistant named "IEBC Bot". You help students and visitors navigate the Centre de Formation IEBC learning platform, answer questions about our cursus, registration, payment, and provide guidance in French or English (respond in the user's language).

About IEBC (Institut d'Enseignement Biblique et de Communication):
- Online learning platform delivering certified professional cursus
- Contact WhatsApp / Phone: +221 70 658 48 59
- Website support available 24/7 through this chat

Registration & Fees:
- One-time registration fee: 65 000 XAF (approx. €100)
- Payment methods: Wave, Orange Money, bank transfer, or WhatsApp coordination (+221 70 658 48 59)
- After registration, students get access to all their cursus modules, quizzes, live sessions, and downloadable resources
- Final project (40%) + Final QCM exam (60%) → weighted grade ≥ 60% required to obtain the secure certificate (QR code, unique ID, digital signature, online verification)

Platform Features:
- Structured cursus with poles → modules → lessons (PDF, video, resources)
- Auto-graded quizzes with question randomization
- Anti-cheat proctored final exams (fullscreen, tab-switch detection)
- Project submissions graded by instructors
- Secure downloadable certificates with online verification (/verify/:code)
- Live sessions with instructors
- Multi-language interface (FR/EN)

Support Options:
- AI Support (you): 24/7 instant help
- WhatsApp human support: +221 70 658 48 59
- On-site help: floating WhatsApp button available on every page

Guide users to relevant pages: /courses (catalog), /register (inscription), /auth (login), /dashboard (student area), /verify/:code (certificate verification). Be helpful, concise, warm, and always end with a proposal to connect via WhatsApp if the question requires human follow-up.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

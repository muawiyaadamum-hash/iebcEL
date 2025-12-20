import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are MTech Academy's friendly AI assistant named "MTech Bot". You help students and visitors navigate the platform, answer questions about courses, registration, and provide guidance.

About MTech Academy:
- MTech Academy is an online learning platform based in Cameroon with branches in Buea (Main), Douala, and Yaoundé
- We offer professional courses in Technology, Business, HR, and Logistics
- Contact: Phone +237 678 88 10 39 | Email: admin@mtecsolutions.org

Our Courses (All courses are 35,000 XAF):
1. Web Design & Development (8 weeks, Beginner) - Learn HTML, CSS, JavaScript, UI/UX, Figma
2. Graphics Design (8 weeks, Beginner) - Adobe Photoshop, Illustrator, branding, logo design
3. Computer Network & Maintenance (10 weeks, Intermediate) - Network infrastructure, troubleshooting
4. CCTV Installation & Maintenance (6 weeks, Intermediate) - Security camera systems
5. Cyber Security (12 weeks, Advanced) - Penetration testing, ethical hacking
6. Human Resources Management (10 weeks, Intermediate) - Recruitment, employee relations
7. Business Administration (12 weeks, Intermediate) - Operations, financial management
8. Transport & Logistics (10 weeks, Intermediate) - Supply chain, warehouse operations

Registration Process:
- Registration fee: 5,000 XAF (one-time)
- Course fee: 35,000 XAF per course
- Payment via Fapshi checkout
- After registration, students get access to PDF course materials
- Students can track progress in their dashboard
- Certificate of completion provided

Key Features:
- Self-paced learning with PDF materials
- Lifetime access to enrolled courses
- Expert instructor support
- Mobile app available (PWA)

Be helpful, concise, and friendly. Guide users to relevant pages like /courses, /register, /auth (login), /dashboard. Recommend WhatsApp consultation (+237 678 88 10 39) for personalized guidance.`;

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

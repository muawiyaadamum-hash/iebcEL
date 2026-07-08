import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const key = Deno.env.get('LOVABLE_API_KEY');
    if (!key) {
      return new Response(JSON.stringify({ error: 'Missing LOVABLE_API_KEY' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt, partnerName, programName, sourceImageUrl } = await req.json();
    if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
      return new Response(JSON.stringify({ error: 'Prompt invalide' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const basePrompt = sourceImageUrl
      ? `You are given an EXISTING certificate template image uploaded by an administrator. Produce a NEW clean version that PRESERVES its overall visual identity — colors, borders, decorative motifs, corner ornaments, seals — but STRIPS every pre-existing text/name/date/placeholder from it and CLEARS the center completely so overlay text can be added programmatically. Additional stylistic guidance from admin: "${prompt}".`
      : `Design an ELEGANT, PROFESSIONAL CERTIFICATE BACKGROUND ONLY. A4 landscape format (1600x1131 aspect). Style guidance from admin: "${prompt}".`;

    const fullPrompt = `${basePrompt}

STRICT RULES — the generated image MUST follow ALL of these:
1. ABSOLUTELY NO TEXT of any kind anywhere on the image — no words, no letters, no numbers, no titles, no "CERTIFICATE", no "CERTIFICAT", no "OF COMPLETION", no institution names, no signatures, no dates, no placeholder text like "Name Surname", no "Lorem Ipsum", no Latin script, no non-Latin script, no calligraphy words. Zero text.
2. NO fake logos, NO fake seals with text inside, NO fake signatures. Decorative wax seals or medallions are OK ONLY if they contain no letters/numbers.
3. Leave the ENTIRE CENTER (middle 75% of width, middle 65% of height) COMPLETELY EMPTY / clean neutral background — this space is reserved for overlaid text that will be added later programmatically. Do not draw ribbons, banners, or decorative flourishes through this central zone.
4. Decoration lives ONLY at the four corners and along the outer edges: ornamental borders, corner filigree, subtle gradients, a decorative frame, optional bottom-corner wax seal (textless), optional small abstract crest at the top center that must sit in the top 12% only.
5. Professional color palette matching the institution's brand. Clean, high-end, executive academic feel. High resolution, crisp lines.

Context for style only (do NOT render any of these words in the image): partner is "${partnerName || 'Partner Institution'}", program is "${programName || 'Joint Program'}".`;

    const userContent: any[] = [{ type: 'text', text: fullPrompt }];
    if (sourceImageUrl && typeof sourceImageUrl === 'string') {
      userContent.push({ type: 'image_url', image_url: { url: sourceImageUrl } });
    }

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': key },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: userContent }],
        modalities: ['image', 'text'],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: 'AI gateway error', detail: t }), {
        status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    const images = data?.choices?.[0]?.message?.images;
    const imageUrl = images?.[0]?.image_url?.url;
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'Aucune image générée' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ image: imageUrl, source: sourceImageUrl ? 'ai-from-model' : 'ai' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

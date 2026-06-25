// ===========================================================
// Kaito OS — Edge Function: chromo-chat
// Proxy seguro hacia api.navy. La NAVY_API_KEY se lee como
// secret de Supabase, nunca llega al navegador del usuario.
//
// Deploy:
//   supabase functions deploy chromo-chat
//   supabase secrets set NAVY_API_KEY=sk-navy-TU_KEY_NUEVA
// ===========================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const NAVY_API_KEY = Deno.env.get("NAVY_API_KEY");
    if (!NAVY_API_KEY) {
      return new Response(JSON.stringify({ error: "NAVY_API_KEY not configured on server" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const navyRes = await fetch("https://api.navy/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NAVY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "gpt-5",
        messages: [
          { role: "system", content: "Eres Chromo AI, el asistente integrado de Kaito OS. Responde de forma clara y concisa." },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!navyRes.ok) {
      const errText = await navyRes.text();
      return new Response(JSON.stringify({ error: "Navy API error", detail: errText }), {
        status: navyRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await navyRes.json();
    const content = data?.choices?.[0]?.message?.content ?? "(sin respuesta)";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

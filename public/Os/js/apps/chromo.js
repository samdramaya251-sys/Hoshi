/* ===========================================================
   KAITO OS — Chromo AI

   Esta app NUNCA llama a api.navy directamente desde el navegador.
   Llama a tu Supabase Edge Function "chromo-chat", que guarda
   la NAVY_API_KEY como secret y hace el proxy real.

   Edge Function esperada (Deno), endpoint:
     POST https://<project>.functions.supabase.co/chromo-chat
     body: { messages: [...], model: "gpt-5" }
     responde: { content: "..." }  (no streaming, simplificado)
   =========================================================== */

window.KaitoApps = window.KaitoApps || {};

KaitoApps.chromo = (() => {
  let history = [];
  let model = "gpt-5";

  function open(){
    KaitoWM.focusOrCreate("chromo", () => {
      KaitoWM.createWindow({
        appId:"chromo", title:"Chromo AI", width:440, height:520,
        render: (body) => renderUI(body)
      });
    });
  }

  function renderUI(body){
    body.innerHTML = `
      <div style="display:flex; flex-direction:column; height:100%;">
        <div style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.07); display:flex; gap:8px; align-items:center;">
          <span style="font-size:12px; color:var(--ink-dim);">Modelo:</span>
          <select id="chromo-model" class="k-input" style="padding:5px 8px; flex:1;">
            <option value="gpt-5">gpt-5</option>
            <option value="claude-opus-4.6">claude-opus-4.6</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
          </select>
        </div>
        <div id="chromo-messages" style="flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px; font-size:13.5px;"></div>
        <div style="display:flex; gap:8px; padding:10px 14px; border-top:1px solid rgba(255,255,255,0.07);">
          <input id="chromo-input" class="k-input" placeholder="Pregúntale algo a Chromo…" style="flex:1;">
          <button class="btn primary" id="chromo-send">Enviar</button>
        </div>
      </div>
    `;
    body.querySelector("#chromo-model").addEventListener("change", (e) => model = e.target.value);

    const msgBox = body.querySelector("#chromo-messages");
    function addBubble(role, text){
      const el = document.createElement("div");
      el.style.alignSelf = role === "user" ? "flex-end" : "flex-start";
      el.style.maxWidth = "85%";
      el.style.padding = "9px 13px";
      el.style.borderRadius = "14px";
      el.style.background = role === "user" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.08)";
      el.style.color = role === "user" ? "#000" : "var(--ink)";
      el.textContent = text;
      msgBox.appendChild(el);
      msgBox.scrollTop = msgBox.scrollHeight;
      return el;
    }

    async function send(){
      const input = body.querySelector("#chromo-input");
      const text = input.value.trim();
      if(!text) return;
      input.value = "";
      addBubble("user", text);
      history.push({ role:"user", content:text });

      const thinking = addBubble("assistant", "…");

      if(!KaitoBackend.isReady()){
        thinking.textContent = "Conectando con el backend, intenta de nuevo en un momento.";
        return;
      }

      try{
        const sb = KaitoBackend.getClient();
        const { data, error } = await sb.functions.invoke("chromo-chat", {
          body: { messages: history, model }
        });
        if(error) throw error;
        if(data?.error){
          thinking.textContent = "Error de Navy: " + (data.detail || data.error);
          return;
        }
        const reply = data?.content || "(sin respuesta)";
        thinking.textContent = reply;
        history.push({ role:"assistant", content: reply });
      }catch(err){
        thinking.textContent = "No se pudo conectar con Chromo AI: " + (err.message || err);
      }
    }

    body.querySelector("#chromo-send").addEventListener("click", send);
    body.querySelector("#chromo-input").addEventListener("keydown", (e) => { if(e.key === "Enter") send(); });

    if(history.length === 0){
      addBubble("assistant", "Hola, soy Chromo AI. ¿En qué te ayudo?");
    } else {
      history.forEach(m => addBubble(m.role, m.content));
    }
  }

  return { open };
})();

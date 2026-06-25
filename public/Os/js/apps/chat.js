/* ===========================================================
   KAITO OS — Chat Global (Supabase Realtime)

   Requiere una tabla en Supabase llamada "messages":
     id bigint generated always as identity primary key,
     username text not null,
     content text not null,
     created_at timestamptz default now()

   Y tener Realtime activado para esa tabla.
   =========================================================== */

window.KaitoApps = window.KaitoApps || {};

KaitoApps.chat = (() => {
  let channel = null;
  let username = localStorage.getItem ? null : null; // localStorage no disponible en artifacts; usamos memoria
  let memUsername = "Invitado" + Math.floor(Math.random()*9000+1000);

  function open(){
    KaitoWM.focusOrCreate("chat", () => {
      KaitoWM.createWindow({
        appId:"chat", title:"Chat Global", width:420, height:500,
        render: (body) => renderUI(body)
      });
    });
  }

  function renderUI(body){
    body.innerHTML = `
      <div style="display:flex; flex-direction:column; height:100%;">
        <div style="padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.07); display:flex; gap:8px; align-items:center;">
          <span style="font-size:12px; color:var(--ink-dim);">Tu nombre:</span>
          <input id="chat-username" class="k-input" value="${memUsername}" style="flex:1; padding:5px 8px;">
        </div>
        <div id="chat-messages" style="flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:8px; font-size:13px;"></div>
        <div style="display:flex; gap:8px; padding:10px 14px; border-top:1px solid rgba(255,255,255,0.07);">
          <input id="chat-input" class="k-input" placeholder="Escribe un mensaje…" style="flex:1;">
          <button class="btn primary" id="chat-send">Enviar</button>
        </div>
        <div id="chat-status" style="font-size:11px; color:var(--ink-faint); padding:0 14px 8px;">Conectando…</div>
      </div>
    `;
    body.querySelector("#chat-username").addEventListener("input", (e) => { memUsername = e.target.value || memUsername; });

    const msgBox = body.querySelector("#chat-messages");
    const statusEl = body.querySelector("#chat-status");

    function addMessage(m){
      const el = document.createElement("div");
      el.innerHTML = `<span style="color:var(--ink-dim); font-weight:600;">${m.username}:</span> <span>${escapeHtml(m.content)}</span>`;
      msgBox.appendChild(el);
      msgBox.scrollTop = msgBox.scrollHeight;
    }

    async function init(){
      if(!KaitoBackend.isReady()){
        statusEl.textContent = "Esperando conexión con Supabase…";
        document.addEventListener("kaito:supabase-ready", init, { once:true });
        return;
      }
      const sb = KaitoBackend.getClient();
      statusEl.textContent = "Cargando mensajes…";

      const { data, error } = await sb.from("messages").select("*").order("created_at",{ ascending:true }).limit(50);
      if(error){
        statusEl.textContent = "No se pudo conectar al chat. ¿Existe la tabla 'messages' en Supabase?";
        return;
      }
      (data||[]).forEach(addMessage);
      statusEl.textContent = "Conectado · en vivo";

      if(channel) sb.removeChannel(channel);
      channel = sb.channel("public:messages")
        .on("postgres_changes", { event:"INSERT", schema:"public", table:"messages" }, (payload) => {
          addMessage(payload.new);
        })
        .subscribe();
    }

    async function send(){
      const input = body.querySelector("#chat-input");
      const content = input.value.trim();
      if(!content || !KaitoBackend.isReady()) return;
      input.value = "";
      const sb = KaitoBackend.getClient();
      const { error } = await sb.from("messages").insert({ username: memUsername, content });
      if(error) statusEl.textContent = "Error al enviar: " + error.message;
    }

    body.querySelector("#chat-send").addEventListener("click", send);
    body.querySelector("#chat-input").addEventListener("keydown", (e) => { if(e.key === "Enter") send(); });

    init();
  }

  function escapeHtml(s){
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  return { open };
})();

/* ===========================================================
   KAITO OS — Navegador (vía proxy Scramjet "hoshi")
   Abre cualquier URL dentro de Kaito OS, pasándola por tu
   proxy de Render para evitar problemas de CORS / bloqueos.
   =========================================================== */

window.KaitoApps = window.KaitoApps || {};

KaitoApps.browser = (() => {
  // Cambia esto si tu dominio de hoshi cambia algún día
  const PROXY_BASE = "https://hoshi-1-c9tz.onrender.com";

  // Scramjet expone su propio prefijo de ruta (normalmente "/scram/" o similar).
  // Ajusta PROXY_PREFIX si tu deploy de hoshi usa otra ruta para el proxy.
  const PROXY_PREFIX = "/scramjet/";

  function buildProxiedUrl(targetUrl){
    // Si la URL no trae protocolo, se lo agregamos
    if(!/^https?:\/\//i.test(targetUrl)){
      targetUrl = "https://" + targetUrl;
    }
    return PROXY_BASE + PROXY_PREFIX + encodeURIComponent(targetUrl);
  }

  function open(initialUrl){
    KaitoWM.createWindow({
      appId: "browser",
      title: "Navegador",
      icon: "◈",
      width: 760,
      height: 520,
      render: (body, ctx) => renderUI(body, ctx, initialUrl)
    });
  }

  function renderUI(body, ctx, initialUrl){
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.height = "100%";
    body.innerHTML = `
      <div class="browser-toolbar" style="display:flex; gap:6px; padding:8px; border-bottom:1px solid var(--line, #2a2a2a);">
        <button class="btn" id="br-back" title="Atrás">←</button>
        <button class="btn" id="br-fwd" title="Adelante">→</button>
        <button class="btn" id="br-reload" title="Recargar">⟳</button>
        <input type="text" id="br-url" placeholder="Buscar o escribir una URL…"
               style="flex:1; background:rgba(255,255,255,0.06); border:1px solid var(--line,#333);
                      border-radius:8px; padding:6px 10px; color:inherit; font-size:13px;">
        <button class="btn" id="br-go">Ir</button>
      </div>
      <div style="position:relative; flex:1;">
        <div id="br-loading" style="position:absolute; inset:0; display:flex; align-items:center;
             justify-content:center; font-size:13px; color:var(--ink-dim,#999); background:rgba(0,0,0,0.15);">
          Cargando…
        </div>
        <iframe id="br-frame" style="width:100%; height:100%; border:0; background:#fff;"></iframe>
      </div>
    `;

    const frame = body.querySelector("#br-frame");
    const urlInput = body.querySelector("#br-url");
    const loading = body.querySelector("#br-loading");
    const history = [];
    let historyIndex = -1;

    function navigate(rawUrl, { pushHistory = true } = {}){
      if(!rawUrl) return;
      const proxied = buildProxiedUrl(rawUrl.trim());
      loading.style.display = "flex";
      frame.src = proxied;
      urlInput.value = rawUrl.trim();
      if(pushHistory){
        history.splice(historyIndex + 1); // descarta "adelante" si navegaste manualmente
        history.push(rawUrl.trim());
        historyIndex = history.length - 1;
      }
    }

    frame.addEventListener("load", () => { loading.style.display = "none"; });

    body.querySelector("#br-go").addEventListener("click", () => navigate(urlInput.value));
    urlInput.addEventListener("keydown", (e) => {
      if(e.key === "Enter") navigate(urlInput.value);
    });

    body.querySelector("#br-back").addEventListener("click", () => {
      if(historyIndex > 0){
        historyIndex--;
        navigate(history[historyIndex], { pushHistory:false });
      }
    });
    body.querySelector("#br-fwd").addEventListener("click", () => {
      if(historyIndex < history.length - 1){
        historyIndex++;
        navigate(history[historyIndex], { pushHistory:false });
      }
    });
    body.querySelector("#br-reload").addEventListener("click", () => {
      loading.style.display = "flex";
      frame.src = frame.src;
    });

    navigate(initialUrl || "https://www.google.com");
  }

  return { open, buildProxiedUrl };
})();

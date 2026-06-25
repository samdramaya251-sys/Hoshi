/* ===========================================================
   KAITO OS — Configuración
   =========================================================== */

window.KaitoApps = window.KaitoApps || {};

KaitoApps.settings = (() => {
  function open(){
    KaitoWM.createWindow({
      appId:"settings", title:"Configuración", width:480, height:360,
      render: (body) => renderUI(body)
    });
  }

  function renderUI(body){
    body.innerHTML = `
      <div class="app-row" style="height:100%">
        <div class="app-sidebar">
          <div class="sidebar-item active" data-tab="general">⚙ General</div>
          <div class="sidebar-item" data-tab="wallpaper">▢ Fondo de pantalla</div>
          <div class="sidebar-item" data-tab="about">◐ Acerca de Kaito</div>
        </div>
        <div class="app-content" id="settings-pane"></div>
      </div>
    `;
    const pane = body.querySelector("#settings-pane");
    function showTab(tab){
      if(tab === "general"){
        pane.innerHTML = `<h3 style="margin-top:0;">General</h3>
          <p style="color:var(--ink-dim); font-size:13px;">Kaito OS v0.1 — sistema operativo web.</p>`;
      } else if(tab === "wallpaper"){
        pane.innerHTML = `<h3 style="margin-top:0;">Fondo de pantalla</h3>
          <p style="color:var(--ink-dim); font-size:13px; margin-bottom:14px;">Elige uno de los fondos predeterminados, o ve a la Tienda para conseguir más.</p>
          <div style="display:flex; gap:10px;">
            <div class="wp-swatch" data-wp="default" style="width:80px;height:50px;border-radius:8px;background:radial-gradient(circle,#1a1a1c,#000);cursor:pointer;border:2px solid rgba(255,255,255,0.4);"></div>
            <div class="wp-swatch" data-wp="pure-black" style="width:80px;height:50px;border-radius:8px;background:#000;cursor:pointer;border:2px solid transparent;"></div>
            <div class="wp-swatch" data-wp="grid" style="width:80px;height:50px;border-radius:8px;background:repeating-linear-gradient(0deg,#111 0 1px,#000 1px 8px);cursor:pointer;border:2px solid transparent;"></div>
          </div>
          <button class="btn primary" style="margin-top:14px;" id="open-store">Ir a la Tienda</button>`;
        pane.querySelectorAll(".wp-swatch").forEach(s => {
          s.addEventListener("click", () => KaitoApps.settings.setWallpaper(s.dataset.wp));
        });
        pane.querySelector("#open-store").addEventListener("click", () => KaitoApps.store.open());
      } else if(tab === "about"){
        pane.innerHTML = `<h3 style="margin-top:0;">Acerca de Kaito OS</h3>
          <p style="color:var(--ink-dim); font-size:13px;">Un sistema operativo web, con apps reales, archivos reales, chat global y una IA integrada llamada Chromo AI.</p>`;
      }
    }
    body.querySelectorAll(".sidebar-item").forEach(el => {
      el.addEventListener("click", () => {
        body.querySelectorAll(".sidebar-item").forEach(o=>o.classList.remove("active"));
        el.classList.add("active");
        showTab(el.dataset.tab);
      });
    });
    showTab("general");
  }

  function setWallpaper(name){
    const wp = document.getElementById("wallpaper");
    if(name === "pure-black") wp.style.background = "#000";
    else if(name === "grid") wp.style.background = "repeating-linear-gradient(0deg, #0a0a0a 0 1px, #000 1px 26px), repeating-linear-gradient(90deg, #0a0a0a 0 1px, #000 1px 26px)";
    else wp.style.background = "radial-gradient(circle at 50% 46%, #050505 0%, #000 38%), conic-gradient(from 200deg at 50% 50%, #050505, #1a1a1c 8%, #050505 16%, #000 28%, #131315 40%, #000 55%, #0c0c0d 70%, #000 100%)";
    KaitoNotify.push("Fondo de pantalla", "Aplicado correctamente");
  }

  return { open, setWallpaper };
})();

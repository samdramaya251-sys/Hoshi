/* ===========================================================
   KAITO OS — Tienda de Wallpapers

   Requiere tabla "wallpapers":
     id bigint generated always as identity primary key,
     name text, price int, image_url text, created_at timestamptz default now()

   Y tabla "purchases" (opcional, para persistir compras por usuario):
     id bigint generated always as identity primary key,
     user_id text, wallpaper_id bigint, created_at timestamptz default now()
   =========================================================== */

window.KaitoApps = window.KaitoApps || {};

KaitoApps.store = (() => {
  let credits = 100; // créditos de sesión por defecto; conectar a perfil real cuando haya auth

  function open(){
    KaitoWM.focusOrCreate("store", () => {
      KaitoWM.createWindow({
        appId:"store", title:"Tienda", width:560, height:420,
        render: (body) => renderUI(body)
      });
    });
  }

  async function renderUI(body){
    body.innerHTML = `
      <div style="padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h3 style="margin:0;">Fondos de pantalla</h3>
          <span style="font-size:13px; color:var(--ink-dim);">Créditos: <b id="store-credits">${credits}</b></span>
        </div>
        <div id="store-grid" style="display:grid; grid-template-columns:repeat(auto-fill,140px); gap:14px;"></div>
      </div>
    `;
    const grid = body.querySelector("#store-grid");

    if(!KaitoBackend.isReady()){
      grid.innerHTML = `<div style="color:var(--ink-faint); grid-column:1/-1;">Conectando con la tienda…</div>`;
      document.addEventListener("kaito:supabase-ready", () => renderUI(body), { once:true });
      return;
    }

    const sb = KaitoBackend.getClient();
    const { data, error } = await sb.from("wallpapers").select("*").order("price",{ ascending:true });
    if(error){
      grid.innerHTML = `<div style="color:var(--ink-faint); grid-column:1/-1;">No se pudo cargar la tienda. ¿Existe la tabla 'wallpapers' en Supabase?</div>`;
      return;
    }
    if(!data || data.length === 0){
      grid.innerHTML = `<div style="color:var(--ink-faint); grid-column:1/-1;">Aún no hay fondos en la tienda.</div>`;
      return;
    }

    grid.innerHTML = data.map(wp => `
      <div style="display:flex; flex-direction:column; gap:6px;">
        <img src="${wp.image_url}" style="width:140px;height:90px;object-fit:cover;border-radius:10px;border:1px solid rgba(255,255,255,0.1);">
        <span style="font-size:12px;">${wp.name}</span>
        <button class="btn" data-id="${wp.id}" data-url="${wp.image_url}" data-price="${wp.price}">
          ${wp.price === 0 ? "Gratis" : wp.price + " créditos"}
        </button>
      </div>
    `).join("");

    grid.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => buy(btn.dataset.url, +btn.dataset.price, body));
    });
  }

  function buy(url, price, body){
    if(price > credits){
      KaitoNotify.push("Tienda", "No tienes suficientes créditos.");
      return;
    }
    credits -= price;
    body.querySelector("#store-credits").textContent = credits;
    document.getElementById("wallpaper").style.background = `url('${url}') center/cover no-repeat`;
    KaitoNotify.push("Tienda", "Fondo de pantalla aplicado.");
  }

  return { open };
})();

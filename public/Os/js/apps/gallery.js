/* ===========================================================
   KAITO OS — Galería
   =========================================================== */

window.KaitoApps = window.KaitoApps || {};

KaitoApps.gallery = (() => {
  function open(){
    KaitoWM.createWindow({
      appId:"gallery", title:"Galería", width:520, height:380,
      render: (body) => renderUI(body)
    });
  }

  function renderUI(body){
    body.innerHTML = `
      <div style="padding:14px;">
        <div style="display:flex; gap:8px; margin-bottom:12px;">
          <input id="gallery-url" class="k-input" placeholder="Pega una URL de imagen…" style="flex:1;">
          <button class="btn primary" id="gallery-add">Añadir</button>
        </div>
        <div id="gallery-grid" style="display:grid; grid-template-columns:repeat(auto-fill,120px); gap:10px;"></div>
      </div>
    `;
    let images = JSON.parse(KaitoFS.read("/Imágenes","_meta.json")?.content || "[]");

    function persist(){ KaitoFS.write("/Imágenes","_meta.json", JSON.stringify(images)); }
    function render(){
      const grid = body.querySelector("#gallery-grid");
      grid.innerHTML = images.map((url,i) => `
        <div style="position:relative;">
          <img src="${url}" style="width:120px;height:120px;object-fit:cover;border-radius:10px;border:1px solid rgba(255,255,255,0.1);">
          <span data-i="${i}" class="gal-del" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.7);border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">✕</span>
        </div>
      `).join("") || `<div style="color:var(--ink-faint);">Sin imágenes. Añade una URL arriba.</div>`;
      grid.querySelectorAll(".gal-del").forEach(el => el.addEventListener("click", () => {
        images.splice(+el.dataset.i,1); persist(); render();
      }));
    }
    body.querySelector("#gallery-add").addEventListener("click", () => {
      const url = body.querySelector("#gallery-url").value.trim();
      if(!url) return;
      images.push(url); persist(); render();
      body.querySelector("#gallery-url").value = "";
    });
    render();
  }

  return { open };
})();

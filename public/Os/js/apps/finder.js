/* ===========================================================
   KAITO OS — Finder
   =========================================================== */

window.KaitoApps = window.KaitoApps || {};

KaitoApps.finder = (() => {
  let currentPath = "/";

  function open(){
    KaitoWM.focusOrCreate("finder", () => {
      KaitoWM.createWindow({
        appId:"finder", title:"Finder", width:560, height:380,
        render: (body, ctx) => renderUI(body, ctx)
      });
    });
  }

  function renderUI(body, ctx){
    body.innerHTML = `
      <div class="app-row" style="height:100%">
        <div class="app-sidebar" id="finder-sidebar"></div>
        <div class="app-content" id="finder-content" style="display:flex; flex-direction:column;">
          <div style="display:flex; gap:8px; margin-bottom:12px; align-items:center;">
            <span id="finder-path" style="font-size:12px; color:var(--ink-dim); flex:1;"></span>
            <button class="btn" id="finder-newfolder">Nueva carpeta</button>
            <button class="btn" id="finder-newfile">Nuevo archivo</button>
          </div>
          <div id="finder-grid" style="flex:1; overflow:auto; display:grid; grid-template-columns:repeat(auto-fill,84px); gap:14px;"></div>
        </div>
      </div>
    `;
    currentPath = "/";
    renderSidebar(body);
    renderGrid(body);

    body.querySelector("#finder-newfolder").addEventListener("click", () => {
      const name = prompt("Nombre de la carpeta:");
      if(name && KaitoFS.mkdir(currentPath, name)) renderGrid(body);
    });
    body.querySelector("#finder-newfile").addEventListener("click", () => {
      const name = prompt("Nombre del archivo:");
      if(name && KaitoFS.touch(currentPath, name, "")) renderGrid(body);
    });
  }

  function renderSidebar(body){
    const sidebar = body.querySelector("#finder-sidebar");
    const roots = KaitoFS.list("/");
    sidebar.innerHTML = roots.map(n =>
      `<div class="sidebar-item" data-name="${n.name}">${n.kind==="folder"?"▢":"▫"} ${n.name}</div>`
    ).join("");
    sidebar.querySelectorAll(".sidebar-item").forEach(el => {
      el.addEventListener("click", () => {
        currentPath = "/" + el.dataset.name;
        sidebar.querySelectorAll(".sidebar-item").forEach(o=>o.classList.remove("active"));
        el.classList.add("active");
        renderGrid(body);
      });
    });
  }

  function renderGrid(body){
    body.querySelector("#finder-path").textContent = "Kaito ▸ " + currentPath;
    const grid = body.querySelector("#finder-grid");
    const items = KaitoFS.list(currentPath) || [];
    if(items.length === 0){
      grid.innerHTML = `<div style="color:var(--ink-faint); grid-column:1/-1; padding-top:30px; text-align:center;">Carpeta vacía</div>`;
      return;
    }
    grid.innerHTML = items.map(it => `
      <div class="finder-item" data-name="${it.name}" data-kind="${it.kind}"
        style="display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; padding:8px; border-radius:10px;">
        <div style="font-size:30px;">${it.kind==="folder" ? "▢" : "▫"}</div>
        <div style="font-size:11.5px; text-align:center; color:var(--ink-dim); word-break:break-word;">${it.name}</div>
      </div>
    `).join("");
    grid.querySelectorAll(".finder-item").forEach(el => {
      el.addEventListener("mouseenter", ()=> el.style.background="rgba(255,255,255,0.07)");
      el.addEventListener("mouseleave", ()=> el.style.background="transparent");
      el.addEventListener("dblclick", () => {
        const name = el.dataset.name;
        if(el.dataset.kind === "folder"){
          currentPath = currentPath === "/" ? "/" + name : currentPath + "/" + name;
          renderGrid(body);
        } else {
          KaitoApps.notes.openFile(currentPath, name);
        }
      });
    });
  }

  return { open };
})();

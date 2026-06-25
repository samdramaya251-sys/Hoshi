/* ===========================================================
   KAITO OS — Dock
   =========================================================== */

const KaitoDock = (() => {

  const apps = [
    { id:"finder",   icon:"⌹", name:"Finder",    launch: () => KaitoApps.finder.open() },
    { id:"notes",    icon:"✎", name:"Notas",     launch: () => KaitoApps.notes.open() },
    { id:"terminal", icon:"▸", name:"Terminal",  launch: () => KaitoApps.terminal.open() },
    { id:"calc",     icon:"÷", name:"Calculadora", launch: () => KaitoApps.calculator.open() },
    { id:"gallery",  icon:"▢", name:"Galería",   launch: () => KaitoApps.gallery.open() },
    { id:"browser",  icon:"◈", name:"Navegador", launch: () => KaitoApps.browser.open() },
    { id:"sep1",     sep:true },
    { id:"chat",     icon:"◌", name:"Chat Global", launch: () => KaitoApps.chat.open() },
    { id:"store",    icon:"◎", name:"Tienda",    launch: () => KaitoApps.store.open() },
    { id:"chromo",   icon:"◐", name:"Chromo AI", launch: () => KaitoApps.chromo.open() },
    { id:"sep2",     sep:true },
    { id:"clock",    icon:"◷", name:"Reloj",     launch: () => KaitoApps.clock.open() },
    { id:"settings", icon:"⚙", name:"Configuración", launch: () => KaitoApps.settings.open() },
  ];

  function render(){
    const dock = document.getElementById("dock");
    dock.innerHTML = "";
    apps.forEach(app => {
      if(app.sep){
        const sep = document.createElement("div");
        sep.className = "dock-sep";
        dock.appendChild(sep);
        return;
      }
      const item = document.createElement("div");
      item.className = "dock-item";
      item.id = "dock-" + app.id;
      item.title = app.name;
      item.innerHTML = `${app.icon}<div class="dock-dot"></div>`;
      item.addEventListener("click", app.launch);
      dock.appendChild(item);
    });
  }

  document.addEventListener("kaito:app-state", (e) => {
    const { appId, running } = e.detail;
    const el = document.getElementById("dock-" + appId);
    if(el) el.classList.toggle("running", running);
  });

  return { render, apps };
})();

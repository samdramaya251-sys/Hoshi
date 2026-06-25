/* ===========================================================
   KAITO OS — Window Manager
   =========================================================== */

const KaitoWM = (() => {
  let zCounter = 10;
  let windows = {};
  let idCounter = 0;
  let openApps = {}; // appId -> count of open windows

  function genId(){ return "win-" + (++idCounter); }

  function createWindow({ appId, title, icon, width = 480, height = 340, x, y, render, onClose }){
    const desktop = document.getElementById("desktop");
    const id = genId();

    const winEl = document.createElement("div");
    winEl.className = "k-window opening";
    winEl.id = id;
    winEl.style.width = width + "px";
    winEl.style.height = height + "px";

    const deskRect = desktop.getBoundingClientRect();
    const left = x !== undefined ? x : Math.max(20, (deskRect.width - width)/2 + (Math.random()*60-30));
    const top = y !== undefined ? y : Math.max(20, (deskRect.height - height)/2 + (Math.random()*40-20));
    winEl.style.left = left + "px";
    winEl.style.top = top + "px";
    winEl.style.zIndex = ++zCounter;

    winEl.innerHTML = `
      <div class="k-titlebar">
        <div class="k-traffic">
          <span class="k-close" title="Cerrar"></span>
          <span class="k-min" title="Minimizar"></span>
          <span class="k-max" title="Maximizar"></span>
        </div>
        <div class="k-title">${title}</div>
      </div>
      <div class="k-body"></div>
      <div class="k-resize-handle"></div>
    `;
    desktop.appendChild(winEl);

    const body = winEl.querySelector(".k-body");
    if(render) render(body, { winEl, id, close: () => closeWindow(id) });

    windows[id] = { appId, title, el: winEl };
    openApps[appId] = (openApps[appId]||0) + 1;
    document.dispatchEvent(new CustomEvent("kaito:app-state", { detail:{ appId, running:true } }));

    setTimeout(()=>winEl.classList.remove("opening"), 320);

    focusWindow(id);
    setActiveAppName(title);

    // Dragging
    const titlebar = winEl.querySelector(".k-titlebar");
    titlebar.addEventListener("mousedown", (e) => {
      if(e.target.closest(".k-traffic")) return;
      focusWindow(id);
      const startX = e.clientX, startY = e.clientY;
      const origLeft = parseFloat(winEl.style.left), origTop = parseFloat(winEl.style.top);
      function onMove(ev){
        winEl.style.left = (origLeft + ev.clientX - startX) + "px";
        winEl.style.top = (origTop + ev.clientY - startY) + "px";
      }
      function onUp(){ document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    // Resizing
    const handle = winEl.querySelector(".k-resize-handle");
    handle.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      const startX = e.clientX, startY = e.clientY;
      const origW = winEl.offsetWidth, origH = winEl.offsetHeight;
      function onMove(ev){
        winEl.style.width = Math.max(280, origW + ev.clientX - startX) + "px";
        winEl.style.height = Math.max(180, origH + ev.clientY - startY) + "px";
      }
      function onUp(){ document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    winEl.addEventListener("mousedown", () => focusWindow(id));

    // Traffic lights
    winEl.querySelector(".k-close").addEventListener("click", () => closeWindow(id, onClose));
    winEl.querySelector(".k-min").addEventListener("click", () => minimizeWindow(id));
    let maximized = false, prevRect = null;
    winEl.querySelector(".k-max").addEventListener("click", () => {
      if(!maximized){
        prevRect = { left:winEl.style.left, top:winEl.style.top, width:winEl.style.width, height:winEl.style.height };
        winEl.style.left = "10px"; winEl.style.top = "10px";
        winEl.style.width = (deskRect.width-20) + "px"; winEl.style.height = (deskRect.height-20) + "px";
        maximized = true;
      } else {
        Object.assign(winEl.style, prevRect);
        maximized = false;
      }
    });

    return { id, winEl };
  }

  function focusWindow(id){
    const w = windows[id];
    if(!w) return;
    Object.values(windows).forEach(o => o.el.classList.remove("focused"));
    w.el.style.zIndex = ++zCounter;
    w.el.classList.add("focused");
    w.el.classList.remove("minimized");
    setActiveAppName(w.title);
  }

  function minimizeWindow(id){
    const w = windows[id];
    if(!w) return;
    w.el.classList.add("minimized");
  }

  function closeWindow(id, onClose){
    const w = windows[id];
    if(!w) return;
    w.el.classList.add("closing");
    setTimeout(()=>{
      w.el.remove();
      openApps[w.appId] = Math.max(0, (openApps[w.appId]||1) - 1);
      if(openApps[w.appId] === 0){
        document.dispatchEvent(new CustomEvent("kaito:app-state", { detail:{ appId:w.appId, running:false } }));
      }
      delete windows[id];
      if(onClose) onClose();
    }, 200);
  }

  function setActiveAppName(name){
    const el = document.getElementById("active-app-name");
    if(el) el.textContent = name;
  }

  function isRunning(appId){ return (openApps[appId]||0) > 0; }

  function focusOrCreate(appId, factory){
    // bring an existing window of this app to front, else create
    const existing = Object.entries(windows).find(([id,w]) => w.appId === appId);
    if(existing){ focusWindow(existing[0]); return; }
    factory();
  }

  return { createWindow, focusWindow, minimizeWindow, closeWindow, isRunning, focusOrCreate };
})();

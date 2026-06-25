/* ===========================================================
   KAITO OS — Dynamic Island
   =========================================================== */

const KaitoIsland = (() => {
  let expanded = false;
  let autoCollapseTimer = null;

  function tickClock(){
    const el = document.getElementById("di-clock");
    const now = new Date();
    el.textContent = now.toLocaleTimeString("es-ES", { hour:"2-digit", minute:"2-digit" });
  }

  function setStatus(text){
    document.getElementById("di-status").textContent = text;
  }

  function show(title, body, ms = 3200){
    const island = document.getElementById("dynamic-island");
    const content = document.getElementById("di-expanded-content");
    content.innerHTML = `<div class="di-title">${title}</div><div>${body}</div>`;
    island.classList.add("expanded");
    expanded = true;
    clearTimeout(autoCollapseTimer);
    autoCollapseTimer = setTimeout(collapse, ms);
  }

  function collapse(){
    document.getElementById("dynamic-island").classList.remove("expanded");
    expanded = false;
  }

  function init(){
    tickClock();
    setInterval(tickClock, 1000 * 15);
    document.getElementById("dynamic-island").addEventListener("click", () => {
      if(expanded){ collapse(); }
      else { show("Kaito OS", "Sistema en línea · todo funcionando con normalidad."); }
    });
  }

  return { init, show, collapse, setStatus };
})();

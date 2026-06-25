/* ===========================================================
   KAITO OS — Spotlight
   =========================================================== */

const KaitoSpotlight = (() => {
  let selIndex = 0;
  let currentResults = [];

  function items(){
    return KaitoDock.apps.filter(a => !a.sep).map(a => ({
      icon:a.icon, label:a.name, action:a.launch
    }));
  }

  function open(){
    const overlay = document.getElementById("spotlight-overlay");
    overlay.classList.remove("hidden");
    const input = document.getElementById("spotlight-input");
    input.value = "";
    renderResults("");
    setTimeout(()=>input.focus(), 30);
  }
  function close(){
    document.getElementById("spotlight-overlay").classList.add("hidden");
  }

  function renderResults(query){
    const all = items();
    const q = query.trim().toLowerCase();
    currentResults = q ? all.filter(i => i.label.toLowerCase().includes(q)) : all;
    selIndex = 0;
    const box = document.getElementById("spotlight-results");
    box.innerHTML = currentResults.map((i, idx) =>
      `<div class="spotlight-item ${idx===0?'sel':''}" data-idx="${idx}"><span class="si-icon">${i.icon}</span>${i.label}</div>`
    ).join("");
    box.querySelectorAll(".spotlight-item").forEach(el => {
      el.addEventListener("click", () => {
        currentResults[+el.dataset.idx].action();
        close();
      });
    });
  }

  function init(){
    const input = document.getElementById("spotlight-input");
    input.addEventListener("input", (e) => renderResults(e.target.value));
    input.addEventListener("keydown", (e) => {
      if(e.key === "Escape") close();
      if(e.key === "ArrowDown"){ e.preventDefault(); move(1); }
      if(e.key === "ArrowUp"){ e.preventDefault(); move(-1); }
      if(e.key === "Enter"){
        if(currentResults[selIndex]){ currentResults[selIndex].action(); close(); }
      }
    });
    document.getElementById("spotlight-overlay").addEventListener("mousedown", (e) => {
      if(e.target.id === "spotlight-overlay") close();
    });
    document.getElementById("spotlight-btn").addEventListener("click", open);
    document.addEventListener("keydown", (e) => {
      if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){
        e.preventDefault();
        const overlay = document.getElementById("spotlight-overlay");
        overlay.classList.contains("hidden") ? open() : close();
      }
    });
  }

  function move(dir){
    const box = document.getElementById("spotlight-results");
    const elList = box.querySelectorAll(".spotlight-item");
    if(!elList.length) return;
    elList[selIndex]?.classList.remove("sel");
    selIndex = (selIndex + dir + elList.length) % elList.length;
    elList[selIndex]?.classList.add("sel");
  }

  return { init, open, close };
})();

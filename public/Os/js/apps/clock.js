/* ===========================================================
   KAITO OS — Reloj
   =========================================================== */

window.KaitoApps = window.KaitoApps || {};

KaitoApps.clock = (() => {
  function open(){
    KaitoWM.createWindow({
      appId:"clock", title:"Reloj", width:360, height:300,
      render: (body) => renderUI(body)
    });
  }

  function renderUI(body){
    body.style.padding = "20px";
    body.style.textAlign = "center";
    body.innerHTML = `
      <div id="clock-big" style="font-size:46px; font-weight:300; margin-top:10px;">--:--:--</div>
      <div id="clock-date" style="color:var(--ink-dim); font-size:13px; margin-bottom:18px;"></div>
      <div style="display:flex; gap:8px; justify-content:center;">
        <button class="btn" id="clock-stopwatch">Cronómetro</button>
        <button class="btn" id="clock-timer">Temporizador 5 min</button>
      </div>
      <div id="clock-extra" style="margin-top:16px; font-size:24px; font-weight:300;"></div>
    `;
    const big = body.querySelector("#clock-big");
    const date = body.querySelector("#clock-date");
    function tick(){
      const now = new Date();
      big.textContent = now.toLocaleTimeString("es-ES");
      date.textContent = now.toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long" });
    }
    tick();
    const interval = setInterval(tick, 1000);

    let swInterval = null, swSeconds = 0;
    body.querySelector("#clock-stopwatch").addEventListener("click", () => {
      const extra = body.querySelector("#clock-extra");
      if(swInterval){ clearInterval(swInterval); swInterval=null; extra.textContent=""; return; }
      swSeconds = 0;
      swInterval = setInterval(() => {
        swSeconds++;
        const m = String(Math.floor(swSeconds/60)).padStart(2,"0");
        const s = String(swSeconds%60).padStart(2,"0");
        extra.textContent = `${m}:${s}`;
      }, 1000);
    });

    body.querySelector("#clock-timer").addEventListener("click", () => {
      KaitoApps.clock.startTimer(5*60);
      KaitoNotify.push("Temporizador", "Iniciado: 5 minutos");
    });

    // cleanup when window closes
    const observer = new MutationObserver(() => {
      if(!document.body.contains(body)){ clearInterval(interval); if(swInterval) clearInterval(swInterval); observer.disconnect(); }
    });
    observer.observe(document.getElementById("desktop"), { childList:true });
  }

  function startTimer(seconds){
    setTimeout(() => {
      KaitoNotify.push("Temporizador", "¡Tiempo terminado!");
      KaitoIsland.show("Temporizador", "Tiempo terminado");
    }, seconds*1000);
  }

  return { open, startTimer };
})();

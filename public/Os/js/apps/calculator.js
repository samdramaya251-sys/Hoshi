/* ===========================================================
   KAITO OS — Calculadora
   =========================================================== */

window.KaitoApps = window.KaitoApps || {};

KaitoApps.calculator = (() => {
  function open(){
    KaitoWM.createWindow({
      appId:"calc", title:"Calculadora", width:280, height:380,
      render: (body) => renderUI(body)
    });
  }

  function renderUI(body){
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.background = "#0a0a0b";
    body.innerHTML = `
      <div id="calc-display" style="flex:0 0 90px; display:flex; align-items:flex-end; justify-content:flex-end; padding:14px 18px; font-size:38px; font-weight:300; color:#fff; overflow:hidden;">0</div>
      <div id="calc-grid" style="flex:1; display:grid; grid-template-columns:repeat(4,1fr); grid-template-rows:repeat(5,1fr); gap:1px; background:rgba(255,255,255,0.06);"></div>
    `;
    const buttons = [
      ["C","±","%","÷"],
      ["7","8","9","×"],
      ["4","5","6","−"],
      ["1","2","3","+"],
      ["0",".","=",""]
    ];
    const grid = body.querySelector("#calc-grid");
    let expr = "";

    buttons.flat().forEach((b, idx) => {
      const cell = document.createElement("div");
      if(b === ""){ cell.style.background="#0a0a0b"; grid.appendChild(cell); return; }
      cell.textContent = b;
      const isOp = ["÷","×","−","+","=","C","±","%"].includes(b);
      cell.style.cssText = `
        display:flex; align-items:center; justify-content:center; cursor:pointer;
        font-size:18px; background:${isOp ? "rgba(255,255,255,0.10)" : "#161618"};
        color:${["C","±","%"].includes(b) ? "#cfcfcf" : "#fff"};
        transition:background .12s;
      `;
      // span "0" two columns
      if(b === "0"){ cell.style.gridColumn = "span 2"; cell.style.justifyContent="flex-start"; cell.style.paddingLeft="28px"; }
      cell.addEventListener("mousedown", () => cell.style.background = "rgba(255,255,255,0.22)");
      cell.addEventListener("mouseup", () => cell.style.background = isOp ? "rgba(255,255,255,0.10)" : "#161618");
      cell.addEventListener("click", () => handle(b));
      grid.appendChild(cell);
    });

    const display = body.querySelector("#calc-display");

    function handle(b){
      if(b === "C"){ expr = ""; }
      else if(b === "="){
        try{
          const safe = expr.replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-").replace(/%/g,"/100");
          expr = String(eval(safe));
        }catch(e){ expr = "Error"; }
      }
      else if(b === "±"){
        expr = expr.startsWith("-") ? expr.slice(1) : "-" + expr;
      }
      else { expr += b; }
      display.textContent = expr || "0";
    }
  }

  return { open };
})();

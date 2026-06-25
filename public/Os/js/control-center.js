/* ===========================================================
   KAITO OS — Control Center
   =========================================================== */

const KaitoControlCenter = (() => {
  function toggle(){
    document.getElementById("control-center").classList.toggle("hidden");
  }
  function init(){
    document.getElementById("control-center-btn").addEventListener("click", toggle);
    document.querySelectorAll(".cc-toggle").forEach(el => {
      el.addEventListener("click", () => el.classList.toggle("active"));
    });
    document.addEventListener("click", (e) => {
      const cc = document.getElementById("control-center");
      if(!cc.classList.contains("hidden") && !cc.contains(e.target) && e.target.id !== "control-center-btn"){
        cc.classList.add("hidden");
      }
    });
  }
  return { init, toggle };
})();

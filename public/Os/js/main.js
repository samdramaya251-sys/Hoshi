/* ===========================================================
   KAITO OS — Main bootstrap
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  KaitoDock.render();
  KaitoSpotlight.init();
  KaitoIsland.init();
  KaitoControlCenter.init();

  // Boot sequence
  setTimeout(() => {
    document.getElementById("boot-screen").classList.add("hide");
    setTimeout(() => document.getElementById("boot-screen").remove(), 1000);
    KaitoNotify.push("Kaito OS", "Sistema iniciado correctamente.");
  }, 1600);

  // Open Finder by default after boot
  setTimeout(() => {
    KaitoApps.finder.open();
  }, 1900);
});

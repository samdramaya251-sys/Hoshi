/* ===========================================================
   KAITO OS — Notifications
   =========================================================== */

const KaitoNotify = (() => {
  function push(title, body, duration = 4200){
    const stack = document.getElementById("notification-stack");
    const el = document.createElement("div");
    el.className = "notif";
    el.innerHTML = `<div class="notif-title">${title}</div><div class="notif-body">${body}</div>`;
    stack.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity .3s, transform .3s";
      el.style.opacity = "0";
      el.style.transform = "translateX(20px)";
      setTimeout(()=>el.remove(), 300);
    }, duration);
  }
  return { push };
})();

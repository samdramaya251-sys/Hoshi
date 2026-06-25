/* ===========================================================
   KAITO OS — Notas
   =========================================================== */

window.KaitoApps = window.KaitoApps || {};

KaitoApps.notes = (() => {

  function open(){
    KaitoWM.focusOrCreate("notes", () => {
      KaitoWM.createWindow({
        appId:"notes", title:"Notas", width:560, height:400,
        render: (body, ctx) => renderUI(body, ctx)
      });
    });
  }

  function openFile(path, name){
    KaitoWM.createWindow({
      appId:"notes", title:name, width:520, height:380,
      render: (body) => renderEditor(body, path, name)
    });
  }

  function renderUI(body){
    body.innerHTML = `
      <div class="app-row" style="height:100%">
        <div class="app-sidebar" id="notes-list"></div>
        <div class="app-content" style="display:flex; flex-direction:column; padding:0;">
          <div style="padding:10px 14px; display:flex; gap:8px;">
            <button class="btn" id="notes-new">+ Nueva nota</button>
          </div>
          <textarea id="notes-editor" class="k-input" style="flex:1; resize:none; border:none; border-radius:0; background:transparent; padding:14px;" placeholder="Selecciona o crea una nota…"></textarea>
        </div>
      </div>
    `;
    let activeName = null;

    function refreshList(){
      const list = body.querySelector("#notes-list");
      const notes = KaitoFS.list("/Notas") || [];
      list.innerHTML = notes.map(n => `<div class="sidebar-item" data-name="${n.name}">✎ ${n.name.replace(".txt","")}</div>`).join("")
        || `<div style="color:var(--ink-faint); font-size:12px; padding:8px;">Sin notas aún</div>`;
      list.querySelectorAll(".sidebar-item").forEach(el => {
        el.addEventListener("click", () => {
          list.querySelectorAll(".sidebar-item").forEach(o=>o.classList.remove("active"));
          el.classList.add("active");
          activeName = el.dataset.name;
          const f = KaitoFS.read("/Notas", activeName);
          body.querySelector("#notes-editor").value = f.content;
        });
      });
    }

    body.querySelector("#notes-new").addEventListener("click", () => {
      const title = prompt("Título de la nota:", "Nueva nota");
      if(!title) return;
      const name = title.endsWith(".txt") ? title : title + ".txt";
      KaitoFS.touch("/Notas", name, "");
      refreshList();
      activeName = name;
      body.querySelector("#notes-editor").value = "";
      body.querySelector("#notes-editor").focus();
    });

    body.querySelector("#notes-editor").addEventListener("input", (e) => {
      if(activeName) KaitoFS.write("/Notas", activeName, e.target.value);
    });

    refreshList();
  }

  function renderEditor(body, path, name){
    const f = KaitoFS.read(path, name);
    body.innerHTML = `<textarea id="single-editor" class="k-input" style="width:100%; height:100%; resize:none; border:none; border-radius:0; background:transparent; padding:16px;"></textarea>`;
    const ed = body.querySelector("#single-editor");
    ed.value = f ? f.content : "";
    ed.addEventListener("input", (e) => KaitoFS.write(path, name, e.target.value));
  }

  return { open, openFile };
})();

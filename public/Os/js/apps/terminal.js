/* ===========================================================
   KAITO OS — Terminal
   =========================================================== */

window.KaitoApps = window.KaitoApps || {};

KaitoApps.terminal = (() => {
  let cwd = "/";

  function open(){
    KaitoWM.createWindow({
      appId:"terminal", title:"Terminal", width:540, height:360,
      render: (body) => renderUI(body)
    });
  }

  function renderUI(body){
    body.style.background = "#000";
    body.innerHTML = `
      <div id="term-output" style="font-family:'SF Mono', Menlo, monospace; font-size:12.5px; color:#e8e8ea; padding:12px; height:calc(100% - 34px); overflow-y:auto; white-space:pre-wrap;"></div>
      <div style="display:flex; align-items:center; padding:0 12px 10px; gap:6px;">
        <span style="color:#888; font-family:monospace; font-size:12.5px;" id="term-prompt">kaito:~$</span>
        <input id="term-input" style="flex:1; background:transparent; border:none; outline:none; color:#fff; font-family:monospace; font-size:12.5px;" autocomplete="off">
      </div>
    `;
    const out = body.querySelector("#term-output");
    const input = body.querySelector("#term-input");
    const promptEl = body.querySelector("#term-prompt");

    println(out, "Kaito OS Terminal — escribe 'help' para ver comandos.");
    setTimeout(()=>input.focus(), 50);
    body.addEventListener("mousedown", () => input.focus());

    input.addEventListener("keydown", (e) => {
      if(e.key !== "Enter") return;
      const cmd = input.value;
      println(out, `${promptEl.textContent} ${cmd}`);
      run(cmd, out);
      input.value = "";
      promptEl.textContent = `kaito:${cwd}$`;
      out.scrollTop = out.scrollHeight;
    });
  }

  function println(out, text){
    const line = document.createElement("div");
    line.textContent = text;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }

  function run(cmdline, out){
    const [cmd, ...args] = cmdline.trim().split(/\s+/);
    switch(cmd){
      case "":
        break;
      case "help":
        println(out, "Comandos: ls, cd <carpeta>, mkdir <nombre>, touch <nombre>, cat <archivo>, echo <texto> > <archivo>, rm <nombre>, pwd, clear, whoami, date");
        break;
      case "pwd":
        println(out, cwd);
        break;
      case "ls": {
        const items = KaitoFS.list(cwd) || [];
        println(out, items.map(i => i.kind==="folder" ? i.name+"/" : i.name).join("   ") || "(vacío)");
        break;
      }
      case "cd": {
        const target = args[0];
        if(!target || target === "/"){ cwd = "/"; break; }
        if(target === ".."){
          const parts = cwd.split("/").filter(Boolean); parts.pop();
          cwd = "/" + parts.join("/");
          break;
        }
        const newPath = cwd === "/" ? "/"+target : cwd+"/"+target;
        const r = KaitoFS.resolvePath(newPath);
        if(r && r.node.kind === "folder") cwd = newPath;
        else println(out, `cd: no existe la carpeta '${target}'`);
        break;
      }
      case "mkdir":
        if(!args[0]) println(out, "uso: mkdir <nombre>");
        else KaitoFS.mkdir(cwd, args[0]) || println(out, "no se pudo crear (¿ya existe?)");
        break;
      case "touch":
        if(!args[0]) println(out, "uso: touch <nombre>");
        else KaitoFS.touch(cwd, args[0], "");
        break;
      case "cat": {
        const f = KaitoFS.read(cwd, args[0]);
        println(out, f ? (f.content || "(vacío)") : `cat: no existe '${args[0]}'`);
        break;
      }
      case "rm":
        if(!args[0]) println(out, "uso: rm <nombre>");
        else KaitoFS.remove(cwd, args[0]) || println(out, "no existe ese archivo/carpeta");
        break;
      case "echo": {
        const full = args.join(" ");
        if(full.includes(">")){
          const [text, filename] = full.split(">").map(s=>s.trim());
          KaitoFS.write(cwd, filename, text.replace(/^["']|["']$/g,""));
        } else {
          println(out, full);
        }
        break;
      }
      case "clear":
        document.querySelector("#term-output").innerHTML = "";
        break;
      case "whoami":
        println(out, "guest@kaito-os");
        break;
      case "date":
        println(out, new Date().toString());
        break;
      default:
        println(out, `comando no encontrado: ${cmd}`);
    }
  }

  return { open };
})();

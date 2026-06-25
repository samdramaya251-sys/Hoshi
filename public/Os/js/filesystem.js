/* ===========================================================
   KAITO OS — Virtual Filesystem
   In-memory tree, with optional Supabase sync hook later.
   =========================================================== */

const KaitoFS = (() => {

  function file(name, content = "", type = "text"){
    return { kind:"file", name, type, content, created: Date.now(), modified: Date.now() };
  }
  function folder(name, children = {}){
    return { kind:"folder", name, children, created: Date.now() };
  }

  // Root tree
  let root = folder("/", {
    "Notas":        folder("Notas", {}),
    "Documentos":   folder("Documentos", {
      "bienvenida.txt": file("bienvenida.txt",
        "Bienvenido a Kaito OS.\n\nEsto es un archivo de verdad dentro de tu sistema de archivos virtual.\nPuedes crear, editar y borrar archivos desde Finder o la Terminal.")
    }),
    "Imágenes":     folder("Imágenes", {}),
    "Papelera":     folder("Papelera", {}),
  });

  function resolvePath(path){
    if(!path || path === "/" ) return { node: root, parent: null, name: "/" };
    const parts = path.split("/").filter(Boolean);
    let node = root;
    let parent = null;
    let name = "/";
    for(const part of parts){
      if(node.kind !== "folder" || !node.children[part]) return null;
      parent = node;
      node = node.children[part];
      name = part;
    }
    return { node, parent, name };
  }

  function list(path){
    const r = resolvePath(path);
    if(!r || r.node.kind !== "folder") return null;
    return Object.values(r.node.children);
  }

  function mkdir(path, name){
    const r = resolvePath(path);
    if(!r || r.node.kind !== "folder") return false;
    if(r.node.children[name]) return false;
    r.node.children[name] = folder(name);
    return true;
  }

  function touch(path, name, content = ""){
    const r = resolvePath(path);
    if(!r || r.node.kind !== "folder") return false;
    r.node.children[name] = file(name, content);
    return true;
  }

  function write(path, name, content){
    const r = resolvePath(path);
    if(!r || r.node.kind !== "folder") return false;
    if(!r.node.children[name]) r.node.children[name] = file(name, content);
    else { r.node.children[name].content = content; r.node.children[name].modified = Date.now(); }
    return true;
  }

  function read(path, name){
    const r = resolvePath(path);
    if(!r || r.node.kind !== "folder" || !r.node.children[name]) return null;
    return r.node.children[name];
  }

  function remove(path, name){
    const r = resolvePath(path);
    if(!r || r.node.kind !== "folder" || !r.node.children[name]) return false;
    delete r.node.children[name];
    return true;
  }

  function move(fromPath, name, toPath){
    const src = resolvePath(fromPath);
    const dst = resolvePath(toPath);
    if(!src || !dst || !src.node.children[name]) return false;
    dst.node.children[name] = src.node.children[name];
    delete src.node.children[name];
    return true;
  }

  function exportTree(){ return JSON.parse(JSON.stringify(root)); }

  return { resolvePath, list, mkdir, touch, write, read, remove, move, exportTree, root: () => root };
})();

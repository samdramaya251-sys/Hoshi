/* ===========================================================
   KAITO OS — Supabase Config
   Reemplaza los valores de abajo con los de tu proyecto.
   La SUPABASE_ANON_KEY es pública y segura de usar aquí.
   NUNCA pongas la service_role key en este archivo.
   =========================================================== */

const SUPABASE_URL = "https://ngzbnymgsmpmfnoignxa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_eji0RbZVyXnDTPbAarzO4Q_M4XjsSyi";

// Carga el SDK de Supabase desde CDN (se incluye en index.html antes de este archivo
// si decides usarlo; aquí lo cargamos dinámicamente para mantener un solo <script> por archivo)
let supabaseClient = null;

(function loadSupabase(){
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
  script.onload = () => {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    document.dispatchEvent(new CustomEvent("kaito:supabase-ready"));
  };
  document.head.appendChild(script);
})();

const KaitoBackend = {
  getClient: () => supabaseClient,
  isReady: () => !!supabaseClient,
};

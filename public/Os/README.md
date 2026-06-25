# Kaito OS

Un sistema operativo web funcional: archivos reales, apps reales, chat global y una IA integrada (Chromo AI).

## Estructura

```
kaito-os/
├── index.html
├── css/
│   ├── style.css
│   └── windows.css
├── js/
│   ├── filesystem.js        ← sistema de archivos virtual
│   ├── window-manager.js     ← ventanas (mover, redimensionar, minimizar)
│   ├── notifications.js
│   ├── dock.js
│   ├── spotlight.js          ← buscador (Cmd/Ctrl + K)
│   ├── dynamic-island.js
│   ├── control-center.js
│   ├── supabase-config.js    ← conexión a Supabase (URL + anon key)
│   ├── apps/
│   │   ├── finder.js
│   │   ├── notes.js
│   │   ├── terminal.js
│   │   ├── calculator.js
│   │   ├── clock.js
│   │   ├── settings.js
│   │   ├── gallery.js
│   │   ├── chat.js            ← chat global (Supabase Realtime)
│   │   ├── store.js           ← tienda de wallpapers (Supabase)
│   │   └── chromo.js          ← IA Chromo (vía Edge Function)
│   └── main.js
└── supabase/
    ├── setup.sql              ← crea las tablas necesarias
    └── functions/
        └── chromo-chat/
            └── index.ts       ← Edge Function: proxy seguro a Navy AI
```

## Cómo correrlo localmente

Solo necesitas un servidor estático (no funciona con `file://` porque usa `fetch`/módulos):

```bash
cd kaito-os
python3 -m http.server 8080
# abre http://localhost:8080
```

## Setup de Supabase (chat global + tienda)

1. Ve a tu proyecto en supabase.com → **SQL Editor**
2. Pega y ejecuta todo el contenido de `supabase/setup.sql`
3. Eso crea las tablas `messages`, `wallpapers`, `purchases` y activa Realtime en `messages`
4. En `js/supabase-config.js` ya están puestas tu URL y tu anon/publishable key

No necesitas tocar nada más para que **Chat Global** y **Tienda** funcionen.

## Setup de Chromo AI (Edge Function + Navy API)

Esto requiere la CLI de Supabase instalada en tu computadora:

```bash
npm install -g supabase

# inicia sesión y enlaza tu proyecto
supabase login
supabase link --project-ref ngzbnymgsmpmfnoignxa

# guarda tu API key de Navy como secret (regenera la que se expuso antes)
supabase secrets set NAVY_API_KEY=sk-navy-TU_KEY_NUEVA

# despliega la función
supabase functions deploy chromo-chat
```

Importante:
- **Regenera tu key de Navy** antes de usarla aquí — la anterior quedó expuesta en una conversación
- La key vive solo como secret en Supabase, nunca en el código del frontend
- Si quieres probar la función localmente antes de desplegar: `supabase functions serve chromo-chat`

## Seguridad — resumen rápido

| Clave | Dónde va | Es pública? |
|---|---|---|
| `anon` / `publishable` key de Supabase | `js/supabase-config.js` (frontend) | Sí, está diseñada para esto |
| `service_role` key de Supabase | Nunca en código. Solo si necesitas tareas de administración server-side | No, nunca la expongas |
| `NAVY_API_KEY` | Solo como secret de Supabase (`supabase secrets set`) | No, nunca la expongas |

## Apps incluidas

- **Finder** — explorador de archivos virtual real (crear carpetas, archivos)
- **Notas** — notas que se guardan en el filesystem
- **Terminal** — `ls`, `cd`, `mkdir`, `touch`, `cat`, `rm`, `echo`, etc.
- **Calculadora**
- **Galería** — guarda URLs de imágenes
- **Reloj** — hora, fecha, cronómetro, temporizador
- **Configuración** — cambiar wallpaper
- **Chat Global** — en tiempo real, vía Supabase
- **Tienda** — wallpapers con sistema de créditos
- **Chromo AI** — asistente de IA vía Navy, con selector de modelo

## Próximos pasos sugeridos

- Auth real de usuarios (Supabase Auth) para que el chat y la tienda recuerden a cada persona entre sesiones
- Persistir el filesystem virtual en Supabase (tabla `files` por usuario) en vez de solo en memoria
- Streaming real en Chromo AI (la Edge Function ya puede soportarlo con pequeños cambios)
- Centro de notificaciones persistente
- Modo "Stage Manager" / Cmd+Tab para cambiar entre apps abiertas

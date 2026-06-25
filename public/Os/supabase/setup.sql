-- ===========================================================
-- Kaito OS — SQL Setup
-- Pega esto en Supabase → SQL Editor → Run
-- ===========================================================

-- Chat global
create table if not exists messages (
  id bigint generated always as identity primary key,
  username text not null,
  content text not null,
  created_at timestamptz default now()
);
alter table messages enable row level security;
create policy "Cualquiera puede leer mensajes" on messages for select using (true);
create policy "Cualquiera puede enviar mensajes" on messages for insert with check (true);

-- Habilitar Realtime para el chat
alter publication supabase_realtime add table messages;

-- Tienda de wallpapers
create table if not exists wallpapers (
  id bigint generated always as identity primary key,
  name text not null,
  price int not null default 0,
  image_url text not null,
  created_at timestamptz default now()
);
alter table wallpapers enable row level security;
create policy "Cualquiera puede ver la tienda" on wallpapers for select using (true);

-- Algunos wallpapers de ejemplo (cámbialos por tus URLs reales)
insert into wallpapers (name, price, image_url) values
  ('Horizonte de eventos', 0, 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800'),
  ('Nebulosa', 50, 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800'),
  ('Vacío profundo', 100, 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800');

-- Compras (opcional, para persistir por usuario cuando tengas auth)
create table if not exists purchases (
  id bigint generated always as identity primary key,
  user_id text not null,
  wallpaper_id bigint references wallpapers(id),
  created_at timestamptz default now()
);
alter table purchases enable row level security;
create policy "Cualquiera puede registrar su compra" on purchases for insert with check (true);
create policy "Cualquiera puede ver compras" on purchases for select using (true);

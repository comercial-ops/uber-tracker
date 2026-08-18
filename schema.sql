-- Ejecutar en Supabase: Dashboard > SQL Editor > pegar y correr.

create table if not exists transacciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  tipo text not null check (tipo in ('ingreso', 'egreso')),
  categoria text not null,
  monto numeric(10,2) not null check (monto > 0),
  fecha date not null default current_date,
  nota text,
  created_at timestamptz not null default now()
);

alter table transacciones enable row level security;

create policy "select own rows" on transacciones
  for select using (auth.uid() = user_id);

create policy "insert own rows" on transacciones
  for insert with check (auth.uid() = user_id);

create policy "update own rows" on transacciones
  for update using (auth.uid() = user_id);

create policy "delete own rows" on transacciones
  for delete using (auth.uid() = user_id);

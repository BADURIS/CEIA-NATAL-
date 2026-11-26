-- ceia.fácil — esquema inicial (Fase 7)
-- Catálogo legível só por quem tem acesso pago; dados de usuário isolados por RLS;
-- eventos de pagamento acessíveis apenas pelo backend (service role).

create extension if not exists pgcrypto;

-- ============ Catálogo ============
create table public.categories (
  id text primary key,
  name text not null,
  kind text not null check (kind in ('salgado', 'sobremesa', 'bebida')),
  sort int not null default 0
);

create table public.recipes (
  id text primary key,
  number int not null,
  name text not null,
  kind text not null check (kind in ('salgado', 'sobremesa')),
  category_id text not null references public.categories(id),
  role text not null check (role in ('principal', 'acompanhamento', 'salada', 'entrada', 'sobremesa')),
  yield_text text not null,
  base_portions numeric not null check (base_portions > 0),
  prep_time text,
  cook_time text,
  steps jsonb not null default '[]',
  tips jsonb not null default '[]',
  swaps jsonb not null default '[]',
  storage text,
  scale_notes text,
  image_path text,
  status text not null default 'rascunho' check (status in ('rascunho', 'revisado')),
  updated_at timestamptz not null default now()
);

create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  market_section text not null default 'Mercearia'
);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id text not null references public.recipes(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id),
  qty numeric,
  unit text,
  note text,
  grp text,
  sort int not null default 0,
  -- Regras de escala por ingrediente (Fase 4): linear | tempero | fixo | peca_inteira
  scale_rule text not null default 'linear' check (scale_rule in ('linear', 'tempero', 'fixo', 'peca_inteira'))
);
create index on public.recipe_ingredients (recipe_id);

create table public.drinks (
  id text primary key,
  name text not null,
  grp text not null,
  kind text not null check (kind in ('comprada', 'preparada')),
  alcoholic boolean not null,
  pack_label text,
  pack_ml int,
  recipe jsonb
);

create table public.pairings (
  recipe_id text references public.recipes(id) on delete cascade,
  drink_id text references public.drinks(id) on delete cascade,
  primary key (recipe_id, drink_id)
);

-- Parâmetros do motor ajustáveis sem deploy (porções, bebidas por pessoa etc.)
create table public.calc_rules (
  key text primary key,
  value jsonb not null,
  description text
);

-- ============ Acesso pago ============
create table public.products (
  id text primary key,
  name text not null,
  price_cents int not null,
  active boolean not null default true
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  product_id text not null references public.products(id),
  status text not null check (status in ('active', 'revoked')),
  source_event_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, product_id)
);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  email text,
  product_id text,
  payload jsonb not null,
  processed_at timestamptz,
  received_at timestamptz not null default now(),
  unique (provider, provider_event_id)            -- idempotência
);

-- ============ Dados do usuário ============
create table public.ceias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null default 'Minha ceia',
  guests int not null default 10 check (guests between 1 and 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ceia_items (
  id uuid primary key default gen_random_uuid(),
  ceia_id uuid not null references public.ceias(id) on delete cascade,
  recipe_id text references public.recipes(id),
  drink_id text references public.drinks(id),
  check ((recipe_id is null) <> (drink_id is null))
);

create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  ceia_id uuid not null unique references public.ceias(id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists(id) on delete cascade,
  item_key text not null,
  name text not null,
  display text not null,
  checked boolean not null default false,
  removed boolean not null default false,
  manual boolean not null default false,
  unique (list_id, item_key)
);

create table public.change_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id text not null,
  action text not null,
  actor uuid default auth.uid(),
  at timestamptz not null default now()
);

-- ============ Funções de acesso ============
-- Liga entitlements ao usuário pelo e-mail confirmado (compra pode vir antes do cadastro).
create or replace function public.has_access()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.entitlements e
    where e.status = 'active'
      and (e.user_id = auth.uid() or lower(e.email) = lower(auth.jwt() ->> 'email'))
      and coalesce((auth.jwt() ->> 'email_verified')::boolean, (auth.jwt() -> 'user_metadata' ->> 'email_verified')::boolean, false)
  );
$$;

create or replace function public.owns_ceia(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.ceias where id = c and user_id = auth.uid());
$$;

-- ============ RLS ============
alter table public.categories enable row level security;
alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.drinks enable row level security;
alter table public.pairings enable row level security;
alter table public.calc_rules enable row level security;
alter table public.products enable row level security;
alter table public.entitlements enable row level security;
alter table public.payment_events enable row level security;
alter table public.ceias enable row level security;
alter table public.ceia_items enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
alter table public.change_log enable row level security;

-- Vitrine pública: categorias, nomes de receitas e produtos (para a landing)
create policy "categorias públicas" on public.categories for select using (true);
create policy "produtos ativos públicos" on public.products for select using (active);

-- Conteúdo pago: só com acesso ativo
create policy "receitas para quem comprou" on public.recipes for select to authenticated using (public.has_access());
create policy "ingredientes para quem comprou" on public.ingredients for select to authenticated using (public.has_access());
create policy "itens de receita para quem comprou" on public.recipe_ingredients for select to authenticated using (public.has_access());
create policy "bebidas para quem comprou" on public.drinks for select to authenticated using (public.has_access());
create policy "harmonização para quem comprou" on public.pairings for select to authenticated using (public.has_access());
create policy "regras para quem comprou" on public.calc_rules for select to authenticated using (public.has_access());

-- O usuário vê o próprio acesso, mas nunca escreve nele
create policy "ver meu acesso" on public.entitlements for select to authenticated
  using (user_id = auth.uid() or lower(email) = lower(auth.jwt() ->> 'email'));

-- payment_events e change_log: sem políticas = nenhum acesso pelo cliente (só service role)

create policy "minhas ceias" on public.ceias for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.has_access());
create policy "itens das minhas ceias" on public.ceia_items for all to authenticated
  using (public.owns_ceia(ceia_id)) with check (public.owns_ceia(ceia_id));
create policy "minhas listas" on public.shopping_lists for all to authenticated
  using (public.owns_ceia(ceia_id)) with check (public.owns_ceia(ceia_id));
create policy "itens das minhas listas" on public.shopping_items for all to authenticated
  using (exists (select 1 from public.shopping_lists l where l.id = list_id and public.owns_ceia(l.ceia_id)))
  with check (exists (select 1 from public.shopping_lists l where l.id = list_id and public.owns_ceia(l.ceia_id)));

-- Funções security definer: não expor a anon
revoke execute on function public.has_access() from anon;
revoke execute on function public.owns_ceia(uuid) from anon;

insert into public.products (id, name, price_cents) values ('ceia-facil-2026', 'ceia.fácil — Natal 2026', 2990);

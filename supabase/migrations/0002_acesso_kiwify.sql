-- ceia.fácil — acesso por e-mail da compra (Kiwify) + conta de teste
-- Rode no SQL Editor do Supabase depois do 0001.

-- 1) Acesso = existe compra aprovada para o e-mail da conta logada.
--    Não exige e-mail confirmado (o plano grátis do Supabase envia poucos e-mails por hora).
create or replace function public.has_access()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.entitlements e
    where e.status = 'active'
      and (e.user_id = auth.uid() or lower(e.email) = lower(auth.jwt() ->> 'email'))
  );
$$;
revoke execute on function public.has_access() from anon;
grant execute on function public.has_access() to authenticated;

-- 2) Produto vendido na Kiwify (o preço aqui é só referência).
insert into public.products (id, name, price_cents)
values ('ceia-facil-2026', 'ceia.fácil — Natal 2026', 2990)
on conflict (id) do nothing;

-- 3) Conta de teste com acesso liberado (a senha é criada em Authentication > Users).
insert into public.entitlements (email, product_id, status)
values ('teste@gmail.com', 'ceia-facil-2026', 'active')
on conflict (email, product_id) do update set status = 'active', updated_at = now();

-- Liberar alguém manualmente (ex.: venda fora da Kiwify):
--   insert into public.entitlements (email, product_id, status) values ('cliente@email.com', 'ceia-facil-2026', 'active')
--   on conflict (email, product_id) do update set status = 'active', updated_at = now();
-- Bloquear:
--   update public.entitlements set status = 'revoked', updated_at = now() where email = 'cliente@email.com';

-- ceia.fácil — só quem comprou pode criar conta.
-- Antes de criar qualquer usuário, confere se o e-mail tem compra aprovada (entitlement ativo).
-- Sem compra, o cadastro é recusado (o app mostra "compra não encontrada").
create or replace function public.bloquear_cadastro_sem_compra()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.entitlements e
    where e.status = 'active' and lower(e.email) = lower(new.email)
  ) then
    raise exception 'cadastro_sem_compra' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists cadastro_so_compradores on auth.users;
create trigger cadastro_so_compradores
  before insert on auth.users
  for each row execute function public.bloquear_cadastro_sem_compra();

-- Para liberar alguém manualmente, insira o e-mail em public.entitlements antes de criar o usuário.

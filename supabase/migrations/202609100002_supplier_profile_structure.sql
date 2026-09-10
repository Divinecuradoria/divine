begin;

-- Acréscimos opcionais: perfis publicados continuam ativos.
alter table public.suppliers
  add column if not exists primary_category_id uuid references public.categories(id),
  add column if not exists service_city_ids uuid[] not null default '{}',
  add column if not exists other_service_areas text,
  add column if not exists investment_levels text[] not null default '{}';

-- Apenas os campos públicos editáveis. Não concede edição de chancela/status.
grant update (city_id, primary_category_id, service_city_ids, other_service_areas, investment_levels)
  on public.suppliers to authenticated;

-- Toda a edição é uma transação. SECURITY INVOKER mantém as políticas RLS.
create or replace function public.divine_save_supplier_profile(
  p_id uuid, p_profile jsonb, p_category_ids uuid[]
) returns void language plpgsql security invoker set search_path = '' as $$
declare
  v_owner uuid;
  v_city uuid;
  v_primary uuid;
  v_cities uuid[];
  v_levels text[];
  v_services text[];
  v_key text;
begin
  if auth.uid() is null then raise exception 'Acesso necessário'; end if;
  select owner_user_id into v_owner from public.suppliers where id = p_id for update;
  if not found or v_owner is distinct from auth.uid() then
    raise exception 'Perfil não disponível para edição';
  end if;
  if p_profile is null or jsonb_typeof(p_profile) <> 'object' then raise exception 'Perfil inválido'; end if;
  if coalesce(cardinality(p_category_ids), 0) = 0 or cardinality(p_category_ids) > 15
    or exists(select 1 from unnest(p_category_ids) as c(id) where c.id is null or not exists(select 1 from public.categories where id = c.id))
    then raise exception 'Categorias inválidas'; end if;
  if coalesce(length(trim(p_profile->>'business_name')), 0) = 0 or length(p_profile->>'business_name') > 160
    or length(p_profile->>'bio') > 1200 or length(p_profile->>'whatsapp') > 30
    or length(p_profile->>'other_service_areas') > 500 then raise exception 'Revise os dados do perfil'; end if;

  v_city := nullif(p_profile->>'city_id', '')::uuid;
  v_primary := nullif(p_profile->>'primary_category_id', '')::uuid;
  if v_primary is not null and not (v_primary = any(p_category_ids)) then raise exception 'Categoria principal inválida'; end if;
  select coalesce(array_agg(distinct value::uuid), '{}'::uuid[]) into v_cities
    from jsonb_array_elements_text(p_profile->'service_city_ids');
  if cardinality(v_cities) > 200 or exists(select 1 from unnest(v_cities) as c(id) where c.id is null or not exists(select 1 from public.cities where id = c.id))
    then raise exception 'Território inválido'; end if;
  select coalesce(array_agg(distinct value), '{}'::text[]) into v_levels
    from jsonb_array_elements_text(p_profile->'investment_levels');
  if not (v_levels <@ array['essencial', 'ampliado', 'exclusivo']::text[]) or array_position(v_levels, null) is not null then raise exception 'Faixa inválida'; end if;
  select coalesce(array_agg(service order by first_position), '{}'::text[]) into v_services
    from (select trim(value) as service, min(position) as first_position
      from jsonb_array_elements_text(p_profile->'services') with ordinality as entries(value, position)
      where nullif(trim(value), '') is not null group by trim(value)) as normalized;
  if cardinality(v_services) > 40 or exists(select 1 from unnest(v_services) as service where length(service) > 120) then raise exception 'Revise os serviços'; end if;
  foreach v_key in array array['instagram_url', 'facebook_url', 'tiktok_url', 'website_url'] loop
    if coalesce(p_profile->>v_key, '') <> '' and
      (length(p_profile->>v_key) > 2000 or (p_profile->>v_key) !~* '^https://[^[:space:]]+$') then raise exception 'Use links https://'; end if;
  end loop;
  if jsonb_typeof(p_profile->'portfolio') is distinct from 'array' then raise exception 'Portfólio inválido'; end if;
  if exists(select 1 from jsonb_array_elements(p_profile->'portfolio') as item
    where jsonb_typeof(item) <> 'object' or coalesce(item->>'url', '') !~* '^https://[^[:space:]]+$' or length(item->>'url') > 2000)
    then raise exception 'Link de portfólio inválido'; end if;

  update public.suppliers set
    business_name = trim(p_profile->>'business_name'), bio = nullif(trim(p_profile->>'bio'), ''),
    whatsapp = nullif(trim(p_profile->>'whatsapp'), ''), services = v_services,
    instagram_url = nullif(p_profile->>'instagram_url', ''), facebook_url = nullif(p_profile->>'facebook_url', ''),
    tiktok_url = nullif(p_profile->>'tiktok_url', ''), website_url = nullif(p_profile->>'website_url', ''),
    portfolio = p_profile->'portfolio', city_id = v_city, primary_category_id = v_primary,
    service_city_ids = v_cities, other_service_areas = nullif(trim(p_profile->>'other_service_areas'), ''),
    investment_levels = v_levels
    where id = p_id and owner_user_id = auth.uid();
  if not found then raise exception 'Não foi possível atualizar o perfil'; end if;
  delete from public.supplier_categories where supplier_id = p_id;
  insert into public.supplier_categories (supplier_id, category_id)
    select p_id, id from (select distinct unnest(p_category_ids) as id) as selected;
end;
$$;
revoke all on function public.divine_save_supplier_profile(uuid, jsonb, uuid[]) from public;
grant execute on function public.divine_save_supplier_profile(uuid, jsonb, uuid[]) to authenticated;

commit;

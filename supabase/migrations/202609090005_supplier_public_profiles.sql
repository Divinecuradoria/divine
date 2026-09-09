begin;

-- Campos comerciais/editoriais editáveis pelo proprietário do perfil público.
alter table public.suppliers
  add column if not exists services text[] not null default '{}',
  add column if not exists instagram_url text,
  add column if not exists facebook_url text,
  add column if not exists tiktok_url text,
  add column if not exists website_url text;

grant update (
  business_name, bio, cover_image_url, whatsapp, style, portfolio,
  services, instagram_url, facebook_url, tiktok_url, website_url
)
on public.suppliers to authenticated;

drop policy if exists supplier_profile_owner_update on public.suppliers;
create policy supplier_profile_owner_update
on public.suppliers
for update to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

grant select, insert, delete on public.supplier_categories to authenticated;

drop policy if exists supplier_categories_owner_select on public.supplier_categories;
create policy supplier_categories_owner_select
on public.supplier_categories
for select to authenticated
using (
  exists (
    select 1 from public.suppliers s
    where s.id = supplier_id and s.owner_user_id = auth.uid()
  )
  or public.divine_is_reviewer()
);

drop policy if exists supplier_categories_owner_insert on public.supplier_categories;
create policy supplier_categories_owner_insert
on public.supplier_categories
for insert to authenticated
with check (
  exists (
    select 1 from public.suppliers s
    where s.id = supplier_id and s.owner_user_id = auth.uid()
  )
);

drop policy if exists supplier_categories_owner_delete on public.supplier_categories;
create policy supplier_categories_owner_delete
on public.supplier_categories
for delete to authenticated
using (
  exists (
    select 1 from public.suppliers s
    where s.id = supplier_id and s.owner_user_id = auth.uid()
  )
);

-- Bucket público para capas do Acervo. A gravação continua restrita ao
-- fornecedor dono da pasta com o próprio user id.
insert into storage.buckets (id, name, public)
values ('supplier-covers', 'supplier-covers', true)
on conflict (id) do update set public = true;

drop policy if exists supplier_covers_public_read on storage.objects;
create policy supplier_covers_public_read
on storage.objects
for select to public
using (bucket_id = 'supplier-covers');

drop policy if exists supplier_covers_owner_insert on storage.objects;
create policy supplier_covers_owner_insert
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'supplier-covers'
  and name like (auth.uid()::text || '/%')
);

drop policy if exists supplier_covers_owner_update on storage.objects;
create policy supplier_covers_owner_update
on storage.objects
for update to authenticated
using (
  bucket_id = 'supplier-covers'
  and name like (auth.uid()::text || '/%')
)
with check (
  bucket_id = 'supplier-covers'
  and name like (auth.uid()::text || '/%')
);

drop policy if exists supplier_covers_owner_delete on storage.objects;
create policy supplier_covers_owner_delete
on storage.objects
for delete to authenticated
using (
  bucket_id = 'supplier-covers'
  and name like (auth.uid()::text || '/%')
);

-- A publicação editorial cria/ativa o registro que o Acervo já consome.
-- A retirada da publicação desativa o card sem apagar o histórico editorial.
create or replace function public.divine_publish(p_id uuid, p_publish boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare
  a public.divine_applications;
  reviewed_at timestamptz;
  supplier_id uuid;
  category_id uuid;
  city_id uuid;
  supplier_slug text;
begin
  if not public.divine_is_reviewer() then raise exception 'Editorial access required'; end if;

  select * into a from public.divine_applications where id = p_id for update;
  if not found then raise exception 'Application not found'; end if;
  if p_publish is null then raise exception 'Publication choice required'; end if;

  if not p_publish then
    update public.divine_publications
      set is_published = false
      where application_id = p_id;
    update public.suppliers
      set is_active = false
      where owner_user_id = a.user_id;
    return;
  end if;

  if a.status <> 'approved' then raise exception 'Editorial approval required'; end if;
  select max(created_at) into reviewed_at
    from public.divine_reviews where application_id = p_id;
  if reviewed_at is null or reviewed_at + interval '1 year' <= now() then
    raise exception 'Editorial renewal required';
  end if;

  select s.id into supplier_id
    from public.suppliers s
    where s.owner_user_id = a.user_id
    order by s.created_at nulls last
    limit 1;

  if supplier_id is null then supplier_id := gen_random_uuid(); end if;

  select c.id into category_id
    from public.categories c
    where lower(trim(c.name)) = lower(trim(a.category))
    limit 1;

  select c.id into city_id
    from public.cities c
    where lower(trim(c.name)) = lower(trim(a.base_city))
    limit 1;

  supplier_slug := trim(both '-' from regexp_replace(lower(a.brand_name), '[^a-z0-9]+', '-', 'g'))
    || '-' || left(a.id::text, 8);

  insert into public.suppliers as target (
    id, slug, business_name, bio, cover_image_url, whatsapp,
    price_min, price_max, style, agenda_aberta, has_divine_seal,
    is_active, featured, city_id, portfolio, owner_user_id, created_at
  ) values (
    supplier_id, supplier_slug, a.brand_name, a.signature, null, null,
    null, null, null, false, true, true, false, city_id,
    jsonb_build_array(jsonb_build_object('url', a.portfolio_url)),
    a.user_id, now()
  )
  on conflict (id) do update set
    business_name = excluded.business_name,
    bio = coalesce(nullif(target.bio, ''), excluded.bio),
    cover_image_url = target.cover_image_url,
    city_id = coalesce(target.city_id, excluded.city_id),
    portfolio = case
      when target.portfolio is null or target.portfolio = '[]'::jsonb
        then excluded.portfolio
      else target.portfolio
    end,
    owner_user_id = excluded.owner_user_id,
    has_divine_seal = true,
    is_active = true;

  if category_id is not null then
    insert into public.supplier_categories (supplier_id, category_id)
    values (supplier_id, category_id)
    on conflict do nothing;
  end if;

  insert into public.divine_publications (
    application_id, brand_name, category, base_city, service_area,
    portfolio_url, signature, published_at, valid_until, is_published
  ) values (
    a.id, a.brand_name, a.category, a.base_city, a.service_area,
    a.portfolio_url, a.signature, now(), reviewed_at + interval '1 year', true
  )
  on conflict (application_id) do update set
    brand_name = excluded.brand_name,
    category = excluded.category,
    base_city = excluded.base_city,
    service_area = excluded.service_area,
    portfolio_url = excluded.portfolio_url,
    signature = excluded.signature,
    published_at = excluded.published_at,
    valid_until = excluded.valid_until,
    is_published = true;
end;
$$;

revoke all on function public.divine_publish(uuid, boolean) from public;
grant execute on function public.divine_publish(uuid, boolean) to authenticated;

commit;

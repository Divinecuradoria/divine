-- Seleção pública restrita aos cinco últimos aprovados com publicação vigente.
begin;
create or replace function public.divine_latest_references()
returns table (id uuid, nome text, categoria text, imagem text, slug text)
language sql stable security definer set search_path = '' as $$
  select s.id, s.business_name,
    coalesce((
      select string_agg(distinct c.name, ' · ' order by c.name)
      from public.supplier_categories sc
      join public.categories c on c.id = sc.category_id
      where sc.supplier_id = s.id
    ), p.category),
    s.cover_image_url, s.slug
  from public.divine_applications a
  join public.divine_publications p on p.application_id = a.id
  join lateral (
    select r.decision, r.created_at
    from public.divine_reviews r
    where r.application_id = a.id
    order by r.created_at desc, r.id desc
    limit 1
  ) review on review.decision = 'approved'
  join lateral (
    select candidate.id, candidate.business_name, candidate.cover_image_url, candidate.slug
    from public.suppliers candidate
    where candidate.owner_user_id = a.user_id
      and candidate.is_active = true
      and candidate.has_divine_seal = true
      and nullif(trim(candidate.slug), '') is not null
    order by candidate.created_at, candidate.id
    limit 1
  ) s on true
  where a.status = 'approved'
    and a.publication_consent = true
    and p.is_published = true
    and p.valid_until > now()
  order by review.created_at desc, s.id
  limit 5;
$$;
revoke all on function public.divine_latest_references() from public;
grant execute on function public.divine_latest_references() to anon, authenticated;
comment on function public.divine_latest_references() is
  'Até cinco Referências públicas vigentes, por avaliação mais recente; não expõe dados privados nem notas.';
commit;

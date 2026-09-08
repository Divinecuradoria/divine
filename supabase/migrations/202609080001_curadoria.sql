-- Additive workflow. Does not alter suppliers, favorites or existing auth triggers.
begin;
create table public.divine_reviewers (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.divine_reviewers enable row level security;
revoke all on public.divine_reviewers from anon, authenticated;

create function public.divine_is_reviewer() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.divine_reviewers where user_id = auth.uid());
$$;
revoke all on function public.divine_is_reviewer() from public;
grant execute on function public.divine_is_reviewer() to authenticated;

create table public.divine_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  brand_name text not null check (length(trim(brand_name)) between 1 and 160),
  category text not null check (category in ('Alta Costura & Alfaiataria','Papelaria Fina & Identidade','Cinematografia','Design Floral & Cenografia','Alta Confeitaria','Coquetelaria','Curadoria de Destinos','Assessoria & Orquestração','Curadoria Musical','Beleza & Styling','Alta Gastronomia','Preparação Emocional & Bem-Estar','Arquitetura & Espaços','Joalheria Nupcial','Fotografia Documental')),
  base_city text not null check (length(trim(base_city)) between 1 and 160),
  service_area text not null check (length(trim(service_area)) between 1 and 500),
  years_active integer not null check (years_active between 0 and 150),
  weddings_count integer not null check (weddings_count between 0 and 100000),
  portfolio_url text not null check (portfolio_url ~ '^https://[^[:space:]]+$' and length(portfolio_url) <= 2000),
  signature text not null check (length(trim(signature)) between 1 and 500),
  reference_one text not null check (length(trim(reference_one)) between 1 and 300),
  reference_two text not null check (length(trim(reference_two)) between 1 and 300),
  notes text not null default '' check (length(notes) <= 1000),
  publication_consent boolean not null check (publication_consent),
  created_at timestamptz not null default now(),
  status text not null default 'submitted' check (status in ('submitted','approved','observation','declined'))
);
alter table public.divine_applications enable row level security;
revoke all on public.divine_applications from anon, authenticated;
grant select on public.divine_applications to authenticated;
grant insert (user_id,brand_name,category,base_city,service_area,years_active,weddings_count,portfolio_url,signature,reference_one,reference_two,notes,publication_consent) on public.divine_applications to authenticated;
create policy application_read on public.divine_applications for select to authenticated
  using (user_id = auth.uid() or public.divine_is_reviewer());
create policy application_submit on public.divine_applications for insert to authenticated
  with check (user_id = auth.uid());

create table public.divine_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.divine_applications(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id),
  quality integer not null check (quality between 1 and 5),
  trust integer not null check (trust between 1 and 5),
  experience integer not null check (experience between 1 and 5),
  identity integer not null check (identity between 1 and 5),
  professionalism integer not null check (professionalism between 1 and 5),
  weighted_score numeric generated always as ((quality*30+trust*25+experience*20+identity*15+professionalism*10)/100.0) stored,
  decision text not null check (decision in ('approved','observation','declined')),
  justification text not null check (length(trim(justification)) between 1 and 300),
  created_at timestamptz not null default now()
);
alter table public.divine_reviews enable row level security;
revoke all on public.divine_reviews from anon, authenticated;
grant select on public.divine_reviews to authenticated;
create policy reviews_private on public.divine_reviews for select to authenticated using (public.divine_is_reviewer());

-- Deliberately contains only fields authorized for public display.
create table public.divine_publications (
  application_id uuid primary key references public.divine_applications(id) on delete cascade,
  brand_name text not null, category text not null, base_city text not null,
  service_area text not null, portfolio_url text not null, signature text not null,
  published_at timestamptz not null, valid_until timestamptz not null,
  is_published boolean not null default false
);
alter table public.divine_publications enable row level security;
revoke all on public.divine_publications from anon, authenticated;
grant select on public.divine_publications to anon, authenticated;
create policy published_only on public.divine_publications for select to anon, authenticated
  using (is_published and valid_until > now());

create function public.divine_review(p_id uuid, p_scores integer[], p_decision text, p_justification text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.divine_is_reviewer() then raise exception 'Editorial access required'; end if;
  if cardinality(p_scores) is distinct from 5 then raise exception 'Five scores required'; end if;
  perform 1 from public.divine_applications where id = p_id for update;
  if not found then raise exception 'Application not found'; end if;
  insert into public.divine_reviews(application_id,reviewer_id,quality,trust,experience,identity,professionalism,decision,justification)
    values(p_id,auth.uid(),p_scores[1],p_scores[2],p_scores[3],p_scores[4],p_scores[5],p_decision,p_justification);
  update public.divine_applications set status = p_decision where id = p_id;
  -- A new decision always requires a new explicit publication.
  update public.divine_publications set is_published = false where application_id = p_id;
end;
$$;
create function public.divine_publish(p_id uuid, p_publish boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare a public.divine_applications; reviewed_at timestamptz;
begin
  if not public.divine_is_reviewer() then raise exception 'Editorial access required'; end if;
  select * into a from public.divine_applications where id = p_id for update;
  if not found then raise exception 'Application not found'; end if;
  if p_publish is null then raise exception 'Publication choice required'; end if;
  if not p_publish then
    update public.divine_publications set is_published = false where application_id = p_id;
    return;
  end if;
  if a.status <> 'approved' then raise exception 'Editorial approval required'; end if;
  select max(created_at) into reviewed_at from public.divine_reviews where application_id = p_id;
  if reviewed_at is null or reviewed_at + interval '1 year' <= now() then raise exception 'Editorial renewal required'; end if;
  insert into public.divine_publications values (
    a.id,a.brand_name,a.category,a.base_city,a.service_area,a.portfolio_url,a.signature,now(),reviewed_at+interval '1 year',true
  ) on conflict (application_id) do update set
    brand_name=excluded.brand_name,category=excluded.category,base_city=excluded.base_city,
    service_area=excluded.service_area,portfolio_url=excluded.portfolio_url,signature=excluded.signature,
    published_at=excluded.published_at,valid_until=excluded.valid_until,is_published=true;
end;
$$;
revoke all on function public.divine_review(uuid,integer[],text,text) from public;
revoke all on function public.divine_publish(uuid,boolean) from public;
grant execute on function public.divine_review(uuid,integer[],text,text) to authenticated;
grant execute on function public.divine_publish(uuid,boolean) to authenticated;
commit;

-- Basic supplier interest form for the public Curadoria entry point.
begin;
create table public.divine_supplier_leads (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null check (length(trim(brand_name)) between 1 and 160),
  contact_name text not null check (length(trim(contact_name)) between 1 and 160),
  email text not null check (length(trim(email)) between 3 and 320),
  category text not null check (category in ('Alta Costura & Alfaiataria','Papelaria Fina & Identidade','Cinematografia','Design Floral & Cenografia','Alta Confeitaria','Coquetelaria','Curadoria de Destinos','Assessoria & Orquestração','Curadoria Musical','Beleza & Styling','Alta Gastronomia','Preparação Emocional & Bem-Estar','Arquitetura & Espaços','Joalheria Nupcial','Fotografia Documental')),
  base_city text not null check (length(trim(base_city)) between 1 and 160),
  portfolio_url text not null check (portfolio_url ~ '^https://[^[:space:]]+$' and length(portfolio_url) <= 2000),
  notes text not null default '' check (length(notes) <= 500),
  status text not null default 'new' check (status in ('new','contacted','invited','archived')),
  created_at timestamptz not null default now()
);
alter table public.divine_supplier_leads enable row level security;
revoke all on public.divine_supplier_leads from anon, authenticated;
grant insert (brand_name,contact_name,email,category,base_city,portfolio_url,notes) on public.divine_supplier_leads to anon, authenticated;
grant select on public.divine_supplier_leads to authenticated;
create policy supplier_lead_submit on public.divine_supplier_leads for insert to anon, authenticated with check (true);
create policy supplier_lead_review on public.divine_supplier_leads for select to authenticated using (public.divine_is_reviewer());
commit;

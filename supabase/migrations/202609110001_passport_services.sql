begin;

-- Renomear mantendo ID e slug: links e categorias já selecionadas permanecem válidos.
update public.categories set name = 'Curadoria Musical e Efeitos'
where name = 'Curadoria Musical';


-- Compatibilidade com formulários abertos antes da atualização.
create or replace function public.normalize_divine_music_category()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.category = 'Curadoria Musical' then new.category := 'Curadoria Musical e Efeitos'; end if;
  return new;
end;
$$;
alter table public.divine_applications drop constraint if exists divine_applications_category_check;
update public.divine_applications set category = 'Curadoria Musical e Efeitos' where category = 'Curadoria Musical';
alter table public.divine_applications add constraint divine_applications_category_check check (category in ('Alta Costura & Alfaiataria','Papelaria Fina & Identidade','Cinematografia','Design Floral & Cenografia','Alta Confeitaria','Coquetelaria','Curadoria de Destinos','Assessoria & Orquestração','Curadoria Musical e Efeitos','Beleza & Styling','Alta Gastronomia','Preparação Emocional & Bem-Estar','Arquitetura & Espaços','Joalheria Nupcial','Fotografia Documental'));
drop trigger if exists normalize_music_category on public.divine_applications;
create trigger normalize_music_category before insert or update of category on public.divine_applications
for each row execute function public.normalize_divine_music_category();
alter table public.divine_supplier_leads drop constraint if exists divine_supplier_leads_category_check;
update public.divine_supplier_leads set category = 'Curadoria Musical e Efeitos' where category = 'Curadoria Musical';
alter table public.divine_supplier_leads add constraint divine_supplier_leads_category_check check (category in ('Alta Costura & Alfaiataria','Papelaria Fina & Identidade','Cinematografia','Design Floral & Cenografia','Alta Confeitaria','Coquetelaria','Curadoria de Destinos','Assessoria & Orquestração','Curadoria Musical e Efeitos','Beleza & Styling','Alta Gastronomia','Preparação Emocional & Bem-Estar','Arquitetura & Espaços','Joalheria Nupcial','Fotografia Documental'));
drop trigger if exists normalize_music_category on public.divine_supplier_leads;
create trigger normalize_music_category before insert or update of category on public.divine_supplier_leads
for each row execute function public.normalize_divine_music_category();
update public.divine_publications set category = 'Curadoria Musical e Efeitos' where category = 'Curadoria Musical';

create or replace function public.valid_couple_service_choices(value jsonb)
returns boolean language plpgsql immutable set search_path = public
as $$
declare item jsonb; seen jsonb := '[]'::jsonb; item_key jsonb;
begin
  if value is null or jsonb_typeof(value) <> 'array' then return false; end if;
  if jsonb_array_length(value) > 200 then return false; end if;
  for item in select * from jsonb_array_elements(value) loop
    if jsonb_typeof(item) <> 'object' then return false; end if;
    if not (item ?& array['category','service','status','priority']) then return false; end if;
    if jsonb_typeof(item->'category') <> 'string' or jsonb_typeof(item->'service') <> 'string'
      or jsonb_typeof(item->'status') <> 'string' or jsonb_typeof(item->'priority') <> 'boolean' then return false; end if;
    if length(btrim(item->>'category')) not between 1 and 120
      or length(btrim(item->>'service')) not between 1 and 120
      or item->>'status' not in ('wanted','contracted') then return false; end if;
    if (item->>'priority')::boolean and item->>'status' <> 'wanted' then return false; end if;
    item_key := jsonb_build_array(item->>'category', item->>'service');
    if seen @> jsonb_build_array(item_key) then return false; end if;
    seen := seen || jsonb_build_array(item_key);
  end loop;
  return true;
end;
$$;

create table if not exists public.couple_service_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  selections jsonb not null default '[]'::jsonb,
  constraint valid_couple_service_selections check (public.valid_couple_service_choices(selections))
);

alter table public.couple_service_preferences enable row level security;
revoke all on public.couple_service_preferences from anon, authenticated;
grant select, insert, update on public.couple_service_preferences to authenticated;

drop policy if exists couple_services_select on public.couple_service_preferences;
create policy couple_services_select on public.couple_service_preferences for select to authenticated using (auth.uid() = user_id);
drop policy if exists couple_services_insert on public.couple_service_preferences;
create policy couple_services_insert on public.couple_service_preferences for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists couple_services_update on public.couple_service_preferences;
create policy couple_services_update on public.couple_service_preferences for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;

begin;

-- Dados editáveis do Passaporte dos casais.
alter table public.profiles
  add column if not exists whatsapp text,
  add column if not exists location text,
  add column if not exists guests integer,
  add column if not exists notes text,
  add column if not exists photo_url text;

grant select, insert, update on public.profiles to authenticated;

-- Bucket privado: a foto do casal só deve ser acessível pelo próprio usuário.
insert into storage.buckets (id, name, public)
values ('couple-photos', 'couple-photos', false)
on conflict (id) do update set public = false;

drop policy if exists couple_photos_owner_select on storage.objects;
create policy couple_photos_owner_select
on storage.objects
for select to authenticated
using (
  bucket_id = 'couple-photos'
  and name like (auth.uid()::text || '/%')
);

drop policy if exists couple_photos_owner_insert on storage.objects;
create policy couple_photos_owner_insert
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'couple-photos'
  and name like (auth.uid()::text || '/%')
);

drop policy if exists couple_photos_owner_update on storage.objects;
create policy couple_photos_owner_update
on storage.objects
for update to authenticated
using (
  bucket_id = 'couple-photos'
  and name like (auth.uid()::text || '/%')
)
with check (
  bucket_id = 'couple-photos'
  and name like (auth.uid()::text || '/%')
);

drop policy if exists couple_photos_owner_delete on storage.objects;
create policy couple_photos_owner_delete
on storage.objects
for delete to authenticated
using (
  bucket_id = 'couple-photos'
  and name like (auth.uid()::text || '/%')
);

commit;

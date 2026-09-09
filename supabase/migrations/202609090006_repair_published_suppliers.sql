begin;

-- Repara fornecedores que já tinham uma publicação antes da sincronização
-- automática ser adicionada. Não cria publicação nem altera decisões editoriais.
update public.suppliers s
set
  is_active = true,
  has_divine_seal = true
from public.divine_applications a
join public.divine_publications p on p.application_id = a.id
where s.owner_user_id = a.user_id
  and a.status = 'approved'
  and p.is_published = true
  and p.valid_until > now();

insert into public.supplier_categories (supplier_id, category_id)
select s.id, c.id
from public.suppliers s
join public.divine_applications a on a.user_id = s.owner_user_id
join public.divine_publications p on p.application_id = a.id
join public.categories c on lower(trim(c.name)) = lower(trim(a.category))
where a.status = 'approved'
  and p.is_published = true
  and p.valid_until > now()
on conflict do nothing;

commit;

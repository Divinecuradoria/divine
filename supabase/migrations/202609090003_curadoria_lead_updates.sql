begin;

create policy supplier_lead_reviewer_update
on public.divine_supplier_leads
for update
to authenticated
using (public.divine_is_reviewer())
with check (public.divine_is_reviewer());

commit;

begin;

alter table public.divine_supplier_leads
  add column if not exists invitation_sent_at timestamptz;

grant update (status)
on public.divine_supplier_leads
to authenticated;

commit;

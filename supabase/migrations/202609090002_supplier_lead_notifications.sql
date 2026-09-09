begin;

alter table public.divine_supplier_leads
  add column if not exists notification_sent_at timestamptz;

commit;

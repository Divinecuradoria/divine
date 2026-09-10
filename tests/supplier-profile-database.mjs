// Disposable database: PGLITE_MODULE=/path/to/pglite/dist/index.js node tests/supplier-profile-database.mjs
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite')
const db = new PGlite()
const owner='00000000-0000-0000-0000-000000000001', other='00000000-0000-0000-0000-000000000002'
const id='00000000-0000-0000-0000-000000000003', cat='00000000-0000-0000-0000-000000000004', city='00000000-0000-0000-0000-000000000005'
await db.exec(`create role authenticated; create role anon; create schema auth;
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
create table categories(id uuid primary key); create table cities(id uuid primary key);
create table suppliers(id uuid primary key,owner_user_id uuid,business_name text,bio text,whatsapp text,services text[],instagram_url text,facebook_url text,tiktok_url text,website_url text,portfolio jsonb,city_id uuid references cities,has_divine_seal boolean default true,is_active boolean default true);
create table supplier_categories(supplier_id uuid references suppliers, category_id uuid references categories, primary key(supplier_id,category_id));
insert into categories values('${cat}'); insert into cities values('${city}');
insert into suppliers(id,owner_user_id,business_name,services) values('${id}','${owner}','Original',array['Serviço antigo']);
insert into supplier_categories values('${id}','${cat}');
alter table suppliers enable row level security; alter table supplier_categories enable row level security;
create policy supplier_read on suppliers for select using(true);
create policy supplier_update on suppliers for update using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());
create policy category_read on supplier_categories for select using(true);
create policy category_insert on supplier_categories for insert with check(exists(select 1 from suppliers where id=supplier_id and owner_user_id=auth.uid()));
create policy category_delete on supplier_categories for delete using(exists(select 1 from suppliers where id=supplier_id and owner_user_id=auth.uid()));
grant select on suppliers,supplier_categories,categories,cities to authenticated;
grant update(business_name,bio,whatsapp,services,instagram_url,facebook_url,tiktok_url,website_url,portfolio) on suppliers to authenticated;
grant insert,delete on supplier_categories to authenticated;`)
const migration=await readFile(new URL('../supabase/migrations/202609100002_supplier_profile_structure.sql',import.meta.url),'utf8')
await db.exec(migration)
await db.exec(migration) // safe rerun
async function role(user){await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${user}',false);`)}
const profile={business_name:'Vértice teste',bio:'Apresentação',whatsapp:'37999999999',services:['Filme do casamento','Serviço antigo'],portfolio:[{url:'https://example.com'}],city_id:city,primary_category_id:cat,service_city_ids:[city],other_service_areas:'MG sob consulta',investment_levels:['ampliado'],has_divine_seal:false,is_active:false}
const save=(p=profile)=>db.query('select divine_save_supplier_profile($1,$2::jsonb,$3::uuid[])',[id,JSON.stringify(p),[cat]])
await role(other); await assert.rejects(()=>save())
await role(owner); await save()
let row=(await db.query('select * from suppliers')).rows[0]
assert.equal(row.business_name,'Vértice teste'); assert.deepEqual(row.services,profile.services)
assert.deepEqual(row.service_city_ids,[city]); assert.deepEqual(row.investment_levels,['ampliado'])
assert.equal(row.has_divine_seal,true); assert.equal(row.is_active,true)
await assert.rejects(()=>save({...profile,investment_levels:['diamante']}))
await assert.rejects(()=>save({...profile,primary_category_id:other}))
await assert.rejects(()=>save({...profile,service_city_ids:[other]}))
// Force failure after profile UPDATE and category DELETE; all changes must roll back.
await db.exec(`reset role; create function reject_link() returns trigger language plpgsql as $$begin raise exception 'simulated'; end$$; create trigger reject_link before insert on supplier_categories for each row execute function reject_link();`)
await role(owner); await assert.rejects(()=>save({...profile,business_name:'Não deve persistir'}))
assert.equal((await db.query('select business_name from suppliers')).rows[0].business_name,'Vértice teste')
assert.equal((await db.query('select * from supplier_categories')).rows.length,1)
await db.exec('reset role; drop trigger reject_link on supplier_categories;')
await role(owner); await save({...profile,bio:'',whatsapp:'',portfolio:[],primary_category_id:null,service_city_ids:[],investment_levels:[],services:[]})
assert.equal((await db.query('select is_active from suppliers')).rows[0].is_active,true)
await db.exec('reset role; set role anon;'); await assert.rejects(()=>save())
await db.close()
console.log('PASS: migration rerun, ownership, anonymous denial, structured data, editorial fields protected, invalid values rejected, transaction rollback and partial profile preserved.')

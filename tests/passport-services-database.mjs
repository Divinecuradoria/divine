import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite')
const db = new PGlite()
const owner='00000000-0000-0000-0000-000000000001', other='00000000-0000-0000-0000-000000000002'
await db.exec(`create role authenticated; create role anon; create schema auth;
create table auth.users(id uuid primary key);
insert into auth.users values('${owner}'),('${other}');
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
create table categories(id int primary key,name text,slug text);
insert into categories values(1,'Curadoria Musical','curadoria-musical');
create table divine_applications(category text check(category in ('Curadoria Musical')));
create table divine_supplier_leads(category text check(category in ('Curadoria Musical')));
create table divine_publications(category text);
insert into divine_applications values('Curadoria Musical');`)
const migration = await readFile(new URL('../supabase/migrations/202609110001_passport_services.sql',import.meta.url),'utf8')
await db.exec(migration); await db.exec(migration)
assert.equal((await db.query('select slug from categories')).rows[0].slug,'curadoria-musical')
assert.equal((await db.query('select category from divine_applications')).rows[0].category,'Curadoria Musical e Efeitos')
await db.exec("insert into divine_supplier_leads values('Curadoria Musical')")
assert.equal((await db.query('select category from divine_supplier_leads')).rows[0].category,'Curadoria Musical e Efeitos')
const role=async user=>db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${user}',false)`)
const save=(id,value)=>db.query('insert into couple_service_preferences values($1,$2) on conflict(user_id) do update set selections=excluded.selections returning *',[id,JSON.stringify(value)])
const choices=[{category:'Alta Gastronomia',service:'Degustação',status:'wanted',priority:true},{category:'Alta Confeitaria',service:'Degustação',status:'contracted',priority:false}]
await role(owner); await save(owner,choices)
assert.deepEqual((await db.query('select selections from couple_service_preferences')).rows[0].selections,choices)
for(const invalid of [null,{},[{}],[...choices,choices[0]],[{...choices[0],service:null}],[{...choices[0],status:'contracted'}],[{...choices[0],service:'a'.repeat(121)}]]) await assert.rejects(()=>save(owner,invalid))
assert.deepEqual((await db.query('select selections from couple_service_preferences')).rows[0].selections,choices)
await role(other)
assert.equal((await db.query('select * from couple_service_preferences')).rows.length,0)
await assert.rejects(()=>save(owner,[]))
await db.query('update couple_service_preferences set selections=$1 where user_id=$2',['[]',owner])
await role(owner)
assert.deepEqual((await db.query('select selections from couple_service_preferences')).rows[0].selections,choices)
await save(owner,[])
await db.exec('reset role; set role anon')
await assert.rejects(()=>db.query('select * from couple_service_preferences'))
await assert.rejects(()=>save(owner,choices))
await db.close()
console.log('PASS: repeatable migration, category compatibility, private read/write, validation rollback, empty selection and anonymous denial')

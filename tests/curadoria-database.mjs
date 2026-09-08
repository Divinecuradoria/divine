// Run with PGLITE_MODULE=/absolute/path/to/@electric-sql/pglite/dist/index.js node tests/curadoria-database.mjs
// Disposable PostgreSQL engine; never connects to production.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite')
const db = new PGlite()
await db.exec(`create role anon; create role authenticated; create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth to anon,authenticated;
grant execute on function auth.uid() to anon,authenticated;`)
await db.exec(await readFile(new URL('../supabase/migrations/202609080001_curadoria.sql',import.meta.url),'utf8'))
const applicant='00000000-0000-0000-0000-000000000001', reviewer='00000000-0000-0000-0000-000000000002', other='00000000-0000-0000-0000-000000000003'
await db.exec(`insert into auth.users values('${applicant}'),('${reviewer}'),('${other}'); insert into divine_reviewers values('${reviewer}');`)
async function role(name,id='') { await db.exec(`reset role; set role ${name}; select set_config('request.jwt.claim.sub','${id}',false);`) }
async function rejects(sql) { await assert.rejects(()=>db.exec(sql)) }
await role('authenticated',applicant)
const result=await db.query(`insert into divine_applications(user_id,brand_name,category,base_city,service_area,years_active,weddings_count,portfolio_url,signature,reference_one,reference_two,publication_consent)
values('${applicant}','Teste editorial','Cinematografia','Divinópolis','Centro-Oeste Mineiro',0,0,'https://example.com','Assinatura de teste','Cliente A','Parceiro B',true) returning id`)
const id=result.rows[0].id
assert.equal((await db.query('select * from divine_applications')).rows.length,1)
await rejects(`update divine_applications set status='approved' where id='${id}'`)
await rejects(`insert into divine_reviewers values('${applicant}')`)
await rejects(`select divine_review('${id}',array[5,5,5,5,5],'approved','Autoaprovação')`)
await rejects(`select divine_publish('${id}',true)`)
await role('authenticated',other)
assert.equal((await db.query('select * from divine_applications')).rows.length,0)
await role('authenticated',reviewer)
await rejects(`select divine_publish('${id}',true)`)
await rejects(`select divine_review('${id}',array[6,5,5,5,5],'approved','Inválido')`)
await rejects(`select divine_review('${id}',array[5,5],'approved','Inválido')`)
await db.exec(`select divine_review('${id}',array[5,4,5,5,4],'approved','Evidências verificadas')`)
assert.equal(Number((await db.query('select weighted_score from divine_reviews')).rows[0].weighted_score),4.65)
await role('anon')
assert.equal((await db.query('select * from divine_publications')).rows.length,0)
await rejects('select * from divine_reviews')
await rejects('select * from divine_applications')
await role('authenticated',reviewer)
await db.exec(`select divine_publish('${id}',true)`)
await role('anon')
const published=(await db.query('select * from divine_publications')).rows
assert.equal(published.length,1)
assert.equal('reference_one' in published[0],false)
const validUntil=String(published[0].valid_until)
await role('authenticated',applicant)
assert.equal((await db.query('select * from divine_reviews')).rows.length,0)
await rejects(`update divine_publications set is_published=false`)
await role('authenticated',reviewer)
await db.exec(`select divine_publish('${id}',false); select divine_publish('${id}',true)`)
assert.equal(String((await db.query('select valid_until from divine_publications')).rows[0].valid_until),validUntil)
await db.exec(`select divine_review('${id}',array[4,4,4,4,4],'observation','Reavaliar evidências')`)
await rejects(`select divine_publish('${id}',true)`)
await role('anon')
assert.equal((await db.query('select * from divine_publications')).rows.length,0)
await role('authenticated',reviewer)
await db.exec(`select divine_review('${id}',array[5,5,5,5,5],'approved','Reavaliação concluída'); select divine_publish('${id}',true)`)
await role('postgres')
await db.exec(`update divine_publications set valid_until=now()-interval '1 second'`)
await role('anon')
assert.equal((await db.query('select * from divine_publications')).rows.length,0)
await db.close()
console.log('PASS: candidacy isolation, role protection, private scores, weighted score, approval gate, explicit publication, revocation, expiry and no renewal by republishing.')

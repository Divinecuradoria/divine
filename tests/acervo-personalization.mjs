import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const search = compile(readFileSync(new URL('../lib/acervo-search.ts', import.meta.url),'utf8'))
const searchUrl = `data:text/javascript;base64,${Buffer.from(search).toString('base64')}`
const code = compile(readFileSync(new URL('../lib/acervo-personalization.ts', import.meta.url),'utf8')).replace('"./acervo-search"',JSON.stringify(searchUrl))
const { supplierAffinity, compareAffinity } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
const supplier = { id:'a', business_name:'A', city_id:'div', service_city_ids:['arc'], services:['Degustação'], categories:[{name:'Alta Gastronomia',slug:'alta-gastronomia'}] }
const favorite = new Set(['a'])
const choice = {category:'Alta Gastronomia',service:'Degustação',status:'wanted',priority:true}
let match = supplierAffinity(supplier,[choice],'arc',favorite)
assert.equal(match.priorities.length,1)
assert.equal(match.location,true)
assert(match.reasons.includes('Atende a cidade informada'))
assert.equal(supplierAffinity(supplier,[choice],'div',favorite).location,false)
assert.equal(supplierAffinity(supplier,[{...choice,category:'Alta Confeitaria'}],null,favorite).wanted.length,0)
assert.equal(supplierAffinity(supplier,[{...choice,status:'contracted',priority:false}],null,favorite).wanted.length,0)
assert.equal(supplierAffinity(supplier,[{...choice,service:'degustacao'}],null,favorite).wanted.length,1)
assert.equal(supplierAffinity({...supplier,services:null},[choice],null,favorite).wanted.length,0)
assert.equal(supplierAffinity({...supplier,categories:null},[choice],null,favorite).wanted.length,0)
assert.equal(supplierAffinity(supplier,[{...choice,service:'Experiência personalizada'}],null,favorite).wanted.length,0)
const normal = supplierAffinity(supplier,[{...choice,priority:false}],'arc',favorite)
assert(compareAffinity(match, normal) < 0)
const noInterest = supplierAffinity(supplier,[],'arc',favorite)
assert(compareAffinity(normal, noInterest) < 0)
const noCity = supplierAffinity(supplier,[],null,favorite)
assert(compareAffinity(noInterest, noCity) < 0)
const noFavorite = supplierAffinity(supplier,[],null,new Set())
assert(compareAffinity(noCity, noFavorite) < 0)
assert.equal(compareAffinity(noFavorite,noFavorite),0)
assert(supplierAffinity({...supplier,service_city_ids:null},[],'div',new Set()).reasons.includes('Sediado na cidade informada'))
assert.equal(supplierAffinity({...supplier,categories:[{name:'Curadoria Musical',slug:'curadoria-musical'}],services:['DJ']},[{...choice,category:'Curadoria Musical e Efeitos',service:'DJ'}],null,new Set()).priorities.length,1)
console.log('PASS: category-scoped matching, priorities, contracted exclusions, declared territory, legacy base, normalization, unknown services, ties and no commercial weighting')

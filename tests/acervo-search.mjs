import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const code = ts.transpileModule(readFileSync(new URL('../lib/acervo-search.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText
const { matchesAcervo, availableServices, servesCity } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
const cities = [{ id: 'div', slug: 'divinopolis' }, { id: 'arc', slug: 'arcos' }]
const supplier = { city_id: 'div', service_city_ids: ['arc'], services: ['Cerimônia completa', 'Filme do casamento', 'Serviço personalizado'], investment_levels: ['ampliado', 'exclusivo'], categories: [{ slug: 'cinematografia' }] }
const empty = { categoria: '', cidade: '', servico: '', investimento: '' }
assert(matchesAcervo(supplier, empty, cities))
assert(matchesAcervo(supplier, { ...empty, categoria: 'cinematografia', cidade: 'arcos', servico: 'cerimonia completa', investimento: 'ampliado' }, cities))
assert(!matchesAcervo(supplier, { ...empty, cidade: 'divinopolis' }, cities)) // explicit territory wins over base
assert(!matchesAcervo(supplier, { ...empty, cidade: 'unknown' }, cities))
assert(!matchesAcervo(supplier, { ...empty, servico: 'Cerimônia' }, cities)) // exact normalized service, not arbitrary substring
assert(!matchesAcervo(supplier, { ...empty, investimento: 'essencial' }, cities))
assert(!matchesAcervo(supplier, { ...empty, categoria: 'fotografia' }, cities))
const legacy = { city_id: 'div', categories: null, services: null, investment_levels: null, service_city_ids: null }
assert(matchesAcervo(legacy, empty, cities))
assert(servesCity(legacy, 'div'))
assert(!matchesAcervo(legacy, { ...empty, investimento: 'essencial' }, cities))
assert(!matchesAcervo(legacy, { ...empty, servico: 'Filme do casamento' }, cities))
assert.equal(availableServices([supplier, { ...supplier, services: ['cerimonia completa'] }], 'cinematografia').length, 3)
assert.deepEqual(availableServices([supplier], 'fotografia'), [])
assert(availableServices([supplier], '').includes('Serviço personalizado'))
console.log('PASS: combined filters, territory vs base, legacy profiles, multiple investment bands, normalization, no inferred service/budget and category-dependent options.')

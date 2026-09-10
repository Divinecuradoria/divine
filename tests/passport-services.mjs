import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
async function load(path) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
}
const { SERVICE_OPTIONS, servicesForCategory } = await load('../lib/supplier-profile.ts')
const { changeService, validateChoices } = await load('../lib/passport-services.ts')
assert.equal(Object.keys(SERVICE_OPTIONS).length, 15)
assert.equal(Object.values(SERVICE_OPTIONS).flat().length, 113)
assert(servicesForCategory('Curadoria Musical').includes('Fogos de artifício'))
let choices = changeService([], 'Alta Confeitaria', 'Degustação', 'wanted')
choices[0].priority = true
choices = changeService(choices, 'Alta Gastronomia', 'Degustação', 'contracted')
assert.equal(choices.length, 2) // same label in different categories must remain independent
assert(validateChoices(choices))
choices = changeService(choices, 'Alta Confeitaria', 'Degustação', 'contracted')
assert.equal(choices.find(item => item.category === 'Alta Confeitaria').priority, false)
assert(!validateChoices([...choices, choices[0]]))
assert(!validateChoices([{ ...choices[0], priority: true }]))
assert(!validateChoices([{ ...choices[0], service: ' ' }]))
assert(!validateChoices([{ ...choices[0], service: 'a'.repeat(121) }]))
assert(validateChoices(changeService(choices, 'Cinematografia', 'Serviço personalizado', 'wanted')))
assert.equal(changeService(choices, 'Alta Confeitaria', 'Degustação', '').length, 1)
console.log('PASS: catalog, legacy category, category-scoped choices, priority transitions, custom services and validation')

import type { ServiceChoice } from "./passport-services"
import { normalizeSearch, servesCity, type SearchSupplier } from "./acervo-search"

export type PersonalSupplier = Omit<SearchSupplier, "categories"> & {
  id: string
  business_name: string
  categories: { name: string; slug: string }[] | { name: string; slug: string } | null
}
export type Affinity = { priorities: string[]; wanted: string[]; location: boolean; favorite: boolean; reasons: string[] }
const categoryName = (name: string) => normalizeSearch(name === "Curadoria Musical" ? "Curadoria Musical e Efeitos" : name)

export function supplierAffinity(supplier: PersonalSupplier, choices: ServiceChoice[], cityId: string | null, favorites: Set<string>): Affinity {
  const categories = !supplier.categories ? [] : Array.isArray(supplier.categories) ? supplier.categories : [supplier.categories]
  // Coincidir categoria E serviço evita cruzar, por exemplo, degustações de bar e buffet.
  const wanted = choices.filter(choice => choice.status === "wanted" &&
    categories.some(category => categoryName(category.name) === categoryName(choice.category)) &&
    (supplier.services || []).some(service => normalizeSearch(service) === normalizeSearch(choice.service)))
  const priorities = wanted.filter(choice => choice.priority).map(choice => choice.service)
  const location = !!cityId && servesCity(supplier, cityId)
  const favorite = favorites.has(supplier.id)
  const reasons: string[] = []
  if (priorities.length) reasons.push(`Prioridade de vocês: ${priorities[0]}`)
  else if (wanted.length) reasons.push(`Vocês procuram: ${wanted[0].service}`)
  if (location) reasons.push(supplier.service_city_ids?.length ? "Atende a cidade informada" : "Sediado na cidade informada")
  if (favorite) reasons.push("Salvo no Passaporte")
  return { priorities, wanted: wanted.map(choice => choice.service), location, favorite, reasons }
}

export function compareAffinity(a: Affinity, b: Affinity): number {
  return b.priorities.length - a.priorities.length || b.wanted.length - a.wanted.length ||
    Number(b.location) - Number(a.location) || Number(b.favorite) - Number(a.favorite)
}

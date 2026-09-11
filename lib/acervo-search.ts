export function normalizeSearch(value: string | null | undefined): string {
  return (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

export type AcervoFilters = { categoria: string; cidade: string; servico: string; servicos?: string[]; investimento: string }

export function selectedServices(filters: Pick<AcervoFilters, "servico" | "servicos">): string[] {
  return [...new Set([...(filters.servicos || []), filters.servico].map(normalizeSearch).filter(Boolean))]
}

export function readServiceParams(params: URLSearchParams | { getAll(name: string): string[] }): string[] {
  return [...new Set(params.getAll("servico").map(value => value.trim()).filter(Boolean))]
}

export function acervoQuery(filters: AcervoFilters): URLSearchParams {
  const query = new URLSearchParams()
  if (filters.categoria) query.set("categoria", filters.categoria)
  if (filters.cidade) query.set("cidade", filters.cidade)
  for (const service of [...new Set([...(filters.servicos || []), filters.servico].map(value => value.trim()).filter(Boolean))]) query.append("servico", service)
  if (filters.investimento) query.set("investimento", filters.investimento)
  return query
}
export type SearchSupplier = {
  city_id: string | null
  service_city_ids?: string[] | null
  services?: string[] | null
  investment_levels?: string[] | null
  categories: { slug: string }[] | { slug: string } | null
}

export function servesCity(supplier: SearchSupplier, cityId: string): boolean {
  // Perfis legados sem território continuam encontráveis pela sede. Não inferir
  // deslocamento a partir de texto livre ou de cidades próximas.
  return supplier.service_city_ids?.length
    ? supplier.service_city_ids.includes(cityId)
    : supplier.city_id === cityId
}

export function matchesAcervo(supplier: SearchSupplier, filters: AcervoFilters, cities: { id: string; slug: string }[]): boolean {
  const categories = !supplier.categories ? [] : Array.isArray(supplier.categories) ? supplier.categories : [supplier.categories]
  if (filters.categoria && !categories.some(category => category.slug === filters.categoria)) return false
  if (filters.cidade) {
    const city = cities.find(city => city.slug === filters.cidade)
    if (!city || !servesCity(supplier, city.id)) return false
  }
  const services = new Set((supplier.services || []).map(normalizeSearch))
  if (!selectedServices(filters).every(service => services.has(service))) return false
  if (filters.investimento && !(supplier.investment_levels || []).includes(filters.investimento)) return false
  return true
}

export function availableServices(suppliers: SearchSupplier[], categorySlug: string): string[] {
  const choices = new Map<string, string>()
  for (const supplier of suppliers) {
    if (!matchesAcervo(supplier, { categoria: categorySlug, cidade: "", servico: "", investimento: "" }, [])) continue
    for (const service of supplier.services || []) {
      const label = service.trim()
      if (label && !choices.has(normalizeSearch(label))) choices.set(normalizeSearch(label), label)
    }
  }
  return [...choices.values()].sort((a, b) => a.localeCompare(b, "pt-BR"))
}

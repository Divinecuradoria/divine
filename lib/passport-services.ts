export type ServiceChoice = {
  category: string
  service: string
  status: "wanted" | "contracted"
  priority: boolean
}

export const serviceKey = (category: string, service: string) => JSON.stringify([category, service])

export function changeService(choices: ServiceChoice[], category: string, service: string, status: ServiceChoice["status"] | "") {
  const current = choices.find(item => serviceKey(item.category, item.service) === serviceKey(category, service))
  const rest = choices.filter(item => serviceKey(item.category, item.service) !== serviceKey(category, service))
  return status ? [...rest, { category, service, status, priority: status === "wanted" && !!current?.priority }] : rest
}

export function validateChoices(value: unknown): value is ServiceChoice[] {
  if (!Array.isArray(value) || value.length > 200) return false
  const keys = new Set<string>()
  for (const item of value) {
    if (!item || typeof item.category !== "string" || !item.category.trim() || item.category.length > 120 ||
        typeof item.service !== "string" || !item.service.trim() || item.service.length > 120 ||
        !["wanted", "contracted"].includes(item.status) || typeof item.priority !== "boolean" ||
        (item.priority && item.status !== "wanted")) return false
    const key = serviceKey(item.category, item.service)
    if (keys.has(key)) return false
    keys.add(key)
  }
  return true
}

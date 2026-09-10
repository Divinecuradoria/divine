export const CATEGORIES = [
  "Alta Costura & Alfaiataria", "Papelaria Fina & Identidade", "Cinematografia",
  "Design Floral & Cenografia", "Alta Confeitaria", "Coquetelaria", "Curadoria de Destinos",
  "Assessoria & Orquestração", "Curadoria Musical e Efeitos", "Beleza & Styling", "Alta Gastronomia",
  "Preparação Emocional & Bem-Estar", "Arquitetura & Espaços", "Joalheria Nupcial", "Fotografia Documental",
] as const
export const DIMENSIONS = [
  { key: "quality", label: "Qualidade do trabalho", weight: 30 },
  { key: "trust", label: "Reputação e confiança", weight: 25 },
  { key: "experience", label: "Experiência do cliente", weight: 20 },
  { key: "identity", label: "Identidade e diferenciação", weight: 15 },
  { key: "professionalism", label: "Profissionalismo", weight: 10 },
] as const
export const STATES: Record<string, string> = {
  submitted: "Candidatura recebida", approved: "Aprovado como Referência DIVINE",
  observation: "Manter em observação", declined: "Não aprovado neste ciclo",
}
export function safeNext(value: string | null) {
  return value === "/aplicar" || value === "/curadoria" ? value : "/diretorio"
}
export const fieldClass = "mt-2 w-full rounded-lg border border-linha bg-white px-4 py-3 text-base text-onix focus:outline-bronze"


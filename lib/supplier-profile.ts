// Vocabulário compartilhado pelo painel e pelas futuras recomendações.
export const SERVICE_OPTIONS: Record<string, string[]> = {
  "Alta Costura & Alfaiataria": ["Vestido sob medida", "Locação de vestido", "Traje do noivo", "Ajustes e provas", "Acessórios"],
  "Papelaria Fina & Identidade": ["Identidade visual", "Convites impressos", "Convites digitais", "Papelaria do evento", "Sinalização"],
  "Cinematografia": ["Filme do casamento", "Teaser", "Cerimônia completa", "Pré-wedding em vídeo", "Imagens aéreas"],
  "Design Floral & Cenografia": ["Projeto de decoração", "Decoração da cerimônia", "Decoração da recepção", "Buquê", "Cenografia"],
  "Alta Confeitaria": ["Bolo de casamento", "Doces finos", "Bem-casados", "Lembranças comestíveis", "Mesa de sobremesas"],
  "Coquetelaria": ["Bar de drinks", "Drinks autorais", "Drinks sem álcool", "Bartenders", "Carta de bebidas"],
  "Curadoria de Destinos": ["Lua de mel", "Roteiro personalizado", "Hospedagem", "Passagens e traslados", "Destination wedding"],
  "Assessoria & Orquestração": ["Assessoria completa", "Assessoria parcial", "Coordenação do dia", "Gestão de fornecedores", "Planejamento do cronograma"],
  "Curadoria Musical": ["Música para cerimônia", "Banda para recepção", "DJ", "Coral", "Sonorização"],
  "Beleza & Styling": ["Maquiagem", "Penteado", "Teste de produção", "Atendimento no local", "Produção do noivo"],
  "Alta Gastronomia": ["Buffet completo", "Coquetel", "Jantar empratado", "Estações gastronômicas", "Menu personalizado"],
  "Preparação Emocional & Bem-Estar": ["Acompanhamento de casais", "Preparação pré-casamento", "Atendimento individual", "Práticas de relaxamento", "Bem-estar"],
  "Arquitetura & Espaços": ["Espaço para cerimônia", "Espaço para recepção", "Cerimônia ao ar livre", "Hospedagem no local", "Estrutura para preparação do casal"],
  "Joalheria Nupcial": ["Alianças", "Anel de noivado", "Joias sob medida", "Gravação personalizada", "Ajustes de joias"],
  "Fotografia Documental": ["Cobertura do casamento", "Ensaio pré-wedding", "Making of", "Álbum", "Ensaio pós-casamento"],
}

export const INVESTMENT_OPTIONS = [
  { value: "essencial", label: "Essencial", description: "Propostas enxutas, com os serviços fundamentais." },
  { value: "ampliado", label: "Ampliado", description: "Maior abrangência de serviços e personalização." },
  { value: "exclusivo", label: "Exclusivo", description: "Produção personalizada de maior investimento." },
] as const

export function uniqueServices(values: string[]): string[] {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)))
}

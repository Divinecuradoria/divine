// Catálogo aprovado: categoria → serviços, sem subcategorias.
export const SERVICE_OPTIONS: Record<string, string[]> = {
  "Alta Costura & Alfaiataria": [
    "Vestido sob medida",
    "Primeiro aluguel ou locação",
    "Traje do noivo",
    "Ajustes e provas",
    "Véu, grinalda e acessórios",
    "Consultoria de styling"
  ],
  "Papelaria Fina & Identidade": [
    "Identidade visual e monograma",
    "Convite impresso",
    "Convite digital",
    "Menus e cartões",
    "Placas e sinalização"
  ],
  "Cinematografia": [
    "Filme completo do casamento",
    "Teaser ou highlight",
    "Filmagem da cerimônia",
    "Vídeo pré-wedding",
    "Making-of do casal",
    "Same-day edit",
    "Storymaker",
    "Filmagem com drone"
  ],
  "Design Floral & Cenografia": [
    "Projeto floral e decorativo",
    "Decoração da cerimônia",
    "Decoração da recepção",
    "Buquê da noiva",
    "Lapelas",
    "Cenografia",
    "Iluminação cênica",
    "Mobiliário e lounges",
    "Plantas ornamentais"
  ],
  "Alta Confeitaria": [
    "Bolo de casamento",
    "Doces finos",
    "Bem-casados",
    "Mesa de sobremesas",
    "Lembranças comestíveis",
    "Degustação",
    "Personalização de bolo e embalagens"
  ],
  "Coquetelaria": [
    "Bar móvel",
    "Open bar",
    "Drinks autorais",
    "Carta de coquetéis clássicos",
    "Espumantes e vinhos",
    "Drinks sem álcool",
    "Bartenders"
  ],
  "Curadoria de Destinos": [
    "Planejamento de lua de mel",
    "Roteiro personalizado",
    "Hospedagem",
    "Passagens",
    "Traslados",
    "Destination wedding",
    "Seguro e documentação"
  ],
  "Assessoria & Orquestração": [
    "Assessoria completa",
    "Coordenação do dia",
    "Cronograma do casamento",
    "Planejamento orçamentário",
    "Gestão de fornecedores",
    "Montagem e coordenação",
    "Aulas de Coreografia"
  ],
  "Curadoria Musical e Efeitos": [
    "Música para cerimônia",
    "Banda para recepção",
    "DJ",
    "Coral",
    "Músicos instrumentais",
    "Sonorização",
    "Iluminação de pista",
    "Painéis de LED",
    "Fogos de artifício"
  ],
  "Beleza & Styling": [
    "Maquiagem da noiva",
    "Penteado",
    "Teste de maquiagem e penteado",
    "Produção do noivo",
    "Produção de madrinhas",
    "Retoque durante o evento",
    "Consultoria de imagem",
    "Harmonização facial",
    "Sapatos",
    "Sandálias personalizadas"
  ],
  "Alta Gastronomia": [
    "Buffet e coquetel",
    "Jantar empratado",
    "Estações gastronômicas",
    "Menu personalizado",
    "Serviço à mesa",
    "Equipe de garçons e maître",
    "Degustação",
    "Opções vegetarianas e veganas"
  ],
  "Preparação Emocional & Bem-Estar": [
    "Acompanhamento de casal",
    "Terapia pré-casamento",
    "Terapia individual",
    "Práticas de respiração",
    "Spa",
    "Massagem",
    "Wellness durante o evento"
  ],
  "Arquitetura & Espaços": [
    "Espaço para cerimônia",
    "Espaço para recepção",
    "Fazenda, sítio ou chácara",
    "Espaço ao ar livre",
    "Estrutura e mobiliário",
    "Plano alternativo para chuva",
    "Hospedagem no local"
  ],
  "Joalheria Nupcial": [
    "Alianças",
    "Anel de noivado",
    "Joias sob medida",
    "Gravação",
    "Ajustes",
    "Joias para o dia do casamento"
  ],
  "Fotografia Documental": [
    "Cobertura completa",
    "Ensaio pré-wedding",
    "Making-of",
    "Fotografia da cerimônia",
    "Fotografia da recepção",
    "Álbum",
    "Ensaio pós-casamento",
    "Segundo fotógrafo",
    "Galeria online",
    "Backup e segurança do material"
  ]
}

// Compatibilidade com o nome anterior enquanto a migração não foi aplicada.
export function servicesForCategory(name: string): string[] {
  return SERVICE_OPTIONS[name === "Curadoria Musical" ? "Curadoria Musical e Efeitos" : name] || []
}

export const INVESTMENT_OPTIONS = [
  { value: "essencial", label: "Essencial", description: "Propostas enxutas, com os serviços fundamentais." },
  { value: "ampliado", label: "Ampliado", description: "Maior abrangência de serviços e personalização." },
  { value: "exclusivo", label: "Exclusivo", description: "Produção personalizada de maior investimento." },
] as const

export function uniqueServices(values: string[]): string[] {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)))
}


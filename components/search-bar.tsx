"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, MapPin, Search, Sparkles } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

type Opcao = { value: string; label: string }

// Se o Supabase estiver fora do ar, a busca continua de pé
const CATEGORIAS_FALLBACK: Opcao[] = [
  { value: "assessoria-orquestracao", label: "Assessoria & Orquestração" },
  { value: "cinematografia", label: "Cinematografia" },
  { value: "fotografia-documental", label: "Fotografia Documental" },
  { value: "alta-costura-alfaiataria", label: "Alta Costura & Alfaiataria" },
  { value: "design-floral-cenografia", label: "Design Floral & Cenografia" },
  { value: "arquitetura-espacos", label: "Arquitetura & Espaços" },
  { value: "alta-gastronomia", label: "Alta Gastronomia" },
  { value: "alta-confeitaria", label: "Alta Confeitaria" },
  { value: "beleza-styling", label: "Beleza & Styling" },
  { value: "curadoria-musical", label: "Curadoria Musical" },
  { value: "papelaria-fina-identidade", label: "Papelaria Fina & Identidade" },
  { value: "coquetelaria", label: "Coquetelaria" },
  { value: "joalheria-nupcial", label: "Joalheria Nupcial" },
  { value: "preparacao-emocional-bem-estar", label: "Preparação Emocional & Bem-Estar" },
  { value: "curadoria-destinos", label: "Curadoria de Destinos" },
]

const CIDADES_FALLBACK: Opcao[] = [
  { value: "belo-horizonte", label: "Belo Horizonte, MG" },
  { value: "divinopolis", label: "Divinópolis, MG" },
  { value: "nova-serrana", label: "Nova Serrana, MG" },
  { value: "formiga", label: "Formiga, MG" },
  { value: "arcos", label: "Arcos, MG" },
  { value: "bom-despacho", label: "Bom Despacho, MG" },
  { value: "lagoa-da-prata", label: "Lagoa da Prata, MG" },
]

function CampoSelecao({
  icone,
  placeholder,
  valor,
  opcoes,
  aoSelecionar,
}: {
  icone: React.ReactNode
  placeholder: string
  valor: string
  opcoes: Opcao[]
  aoSelecionar: (v: string) => void
}) {
  return (
    <div className="relative flex-1">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-bronze">{icone}</span>
      <select
        value={valor}
        onChange={(e) => aoSelecionar(e.target.value)}
        className="w-full appearance-none rounded-2xl border border-transparent bg-transparent py-4 pl-11 pr-9 text-sm font-medium text-onix outline-none transition hover:border-linha focus:border-bronze"
      >
        <option value="">{placeholder}</option>
        {opcoes.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-onix/40" />
    </div>
  )
}

export default function SearchBar() {
  const router = useRouter()
  const [categoria, setCategoria] = useState("")
  const [cidade, setCidade] = useState("")
  const [categorias, setCategorias] = useState<Opcao[]>(CATEGORIAS_FALLBACK)
  const [cidades, setCidades] = useState<Opcao[]>(CIDADES_FALLBACK)

  useEffect(() => {
    async function carregar() {
      const [cats, cts] = await Promise.all([
        supabase.from("categories").select("name, slug").order("name"),
        supabase.from("cities").select("name, state, slug").order("name"),
      ])
      if (cats.data && cats.data.length > 0) {
        setCategorias(cats.data.map((c) => ({ value: c.slug, label: c.name })))
      }
      if (cts.data && cts.data.length > 0) {
        setCidades(cts.data.map((c) => ({ value: c.slug, label: `${c.name}, ${c.state}` })))
      }
    }
    carregar()
  }, [])

  function buscar() {
    const p = new URLSearchParams()
    if (categoria) p.set("categoria", categoria)
    if (cidade) p.set("cidade", cidade)
    const q = p.toString()
    router.push(q ? `/diretorio?${q}` : "/diretorio")
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4">
      <p className="mb-3 text-center font-serif text-lg italic text-onix/60">
        O que você procura para o grande dia?
      </p>
      <div className="flex flex-col gap-2 rounded-3xl border border-linha bg-white/95 p-2 shadow-[0_30px_80px_-40px_rgba(18,18,18,0.35)] backdrop-blur sm:flex-row sm:items-center">
        <CampoSelecao
          icone={<Sparkles className="h-4 w-4" />}
          placeholder="Categoria de nicho"
          valor={categoria}
          opcoes={categorias}
          aoSelecionar={setCategoria}
        />
        <div className="hidden h-8 w-px bg-linha sm:block" />
        <CampoSelecao
          icone={<MapPin className="h-4 w-4" />}
          placeholder="Cidade polo"
          valor={cidade}
          opcoes={cidades}
          aoSelecionar={setCidade}
        />
        <button
          onClick={buscar}
          className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-onix px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-alabastro transition hover:bg-bronze"
        >
          Encontrar
          <Search className="h-4 w-4" />
        </button>
      </div>
    </section>
  )
}

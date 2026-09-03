"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  CalendarCheck,
  Heart,
  MapPin,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

type CategoriaRef = { name: string; slug: string }

type Fornecedor = {
  id: string
  slug: string
  business_name: string
  cover_image_url: string | null
  whatsapp: string | null
  price_min: number | null
  price_max: number | null
  style: string | null
  agenda_aberta: boolean
  has_divine_seal: boolean
  city: { name: string; state: string; slug: string } | null
  categories: CategoriaRef[] | CategoriaRef | null
}

type Filtros = {
  categoria: string
  cidade: string
  faixa: string
  estilo: string
  soComAgenda: boolean
}

const FAIXAS: { id: string; label: string; teste: (f: Fornecedor) => boolean }[] = [
  { id: "", label: "Qualquer preço", teste: () => true },
  { id: "ate-5", label: "Até R$ 5 mil", teste: (f) => (f.price_min ?? 0) <= 5000 },
  {
    id: "5-15",
    label: "R$ 5 mil – 15 mil",
    teste: (f) => (f.price_min ?? 0) <= 15000 && (f.price_max ?? Infinity) >= 5000,
  },
  {
    id: "15-30",
    label: "R$ 15 mil – 30 mil",
    teste: (f) => (f.price_min ?? 0) <= 30000 && (f.price_max ?? Infinity) >= 15000,
  },
  { id: "30-mais", label: "Acima de R$ 30 mil", teste: (f) => (f.price_max ?? 0) >= 30000 },
]

// Filtros comportamentais — não apenas técnicos
const ESTILOS = [
  { id: "pe-na-grama", label: "Pé na Grama", desc: "Dia, ar livre e chácaras" },
  { id: "tradicional", label: "Tradicional", desc: "O clássico, impecável" },
  { id: "editorial", label: "Editorial", desc: "Vanguarda e autoral" },
  { id: "atemporal", label: "Atemporal", desc: "Sobrio, sem data de validade" },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function normalizaCategorias(c: Fornecedor["categories"]): CategoriaRef[] {
  if (!c) return []
  return Array.isArray(c) ? c : [c]
}

function formataFaixa(f: Fornecedor): string {
  if (f.price_min != null && f.price_max != null) {
    return `R$ ${(f.price_min / 1000).toFixed(0)}–${(f.price_max / 1000).toFixed(0)} mil`
  }
  if (f.price_min != null) return `A partir de R$ ${(f.price_min / 1000).toFixed(0)} mil`
  return "Sob consulta"
}

function linkZap(f: Fornecedor): string {
  const numero = (f.whatsapp || "").replace(/\D/g, "")
  const texto = encodeURIComponent(
    `Olá! Encontrei o seu trabalho na DIVINE e adoraria um orçamento para o meu casamento.`
  )
  return `https://wa.me/${numero}?text=${texto}`
}

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs transition ${
        ativo
          ? "border-onix bg-onix text-alabastro"
          : "border-linha bg-white text-onix/70 hover:border-onix/40"
      }`}
    >
      {children}
    </button>
  )
}

function CartaoFornecedor({
  fornecedor,
  indice,
  salvo,
  aoFavoritar,
  aoChamar,
}: {
  fornecedor: Fornecedor
  indice: number
  salvo: boolean
  aoFavoritar: (id: string) => void
  aoChamar: (id: string) => void
}) {
  const categorias = normalizaCategorias(fornecedor.categories)
  const local = fornecedor.city ? `${fornecedor.city.name}, ${fornecedor.city.state}` : "Minas Gerais"

  return (
    <motion.article
      initial="hidden"
      animate="visible"
      custom={indice}
      variants={fadeUp}
      className="group relative overflow-hidden rounded-2xl border border-linha bg-white shadow-[0_10px_40px_-24px_rgba(18,18,18,0.2)]"
    >
      {/* A imagem ocupa ~80% do card (Camada 2) */}
      <Link href={`/fornecedor/${fornecedor.slug}`} className="relative block aspect-[4/5] overflow-hidden">
        {fornecedor.cover_image_url ? (
          <Image
            src={fornecedor.cover_image_url}
            alt={fornecedor.business_name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-onix">
            <span className="font-serif text-3xl tracking-[0.3em] text-alabastro">D</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-onix/75 via-onix/10 to-transparent" />
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-alabastro/90">
            <MapPin className="h-3 w-3" /> {local}
          </span>
          <span className="rounded-full bg-alabastro/95 px-2.5 py-1 text-[10px] font-medium text-onix">
            {formataFaixa(fornecedor)}
          </span>
        </div>
      </Link>

      {/* Tags de nicho + selo de curadoria */}
      <div className="absolute left-3 top-3 z-10 flex max-w-[80%] flex-wrap gap-1.5">
        {categorias.slice(0, 2).map((c) => (
          <span
            key={c.slug}
            className="rounded-full bg-alabastro/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-onix"
          >
            {c.name}
          </span>
        ))}
        {fornecedor.has_divine_seal && (
          <span className="flex items-center gap-1 rounded-full bg-bronze px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-alabastro">
            <ShieldCheck className="h-3 w-3" /> Chancela
          </span>
        )}
      </div>

      {/* Coração — wishlist da noiva */}
      <button
        onClick={() => aoFavoritar(fornecedor.id)}
        aria-label="Salvar nos favoritos"
        className="absolute right-3 top-3 z-10 rounded-full bg-alabastro/95 p-2 text-onix shadow-sm transition hover:scale-110 hover:text-bronze"
      >
        <Heart className={`h-4 w-4 ${salvo ? "fill-bronze text-bronze" : ""}`} />
      </button>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-xl leading-tight">{fornecedor.business_name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-onix/50">
            <CalendarCheck className={`h-3.5 w-3.5 ${fornecedor.agenda_aberta ? "text-bronze" : "text-onix/30"}`} />
            {fornecedor.agenda_aberta ? "Agenda aberta" : "Lista de espera"}
          </p>
        </div>

        {/* Regra de ouro: WhatsApp a um clique, direto do card */}
        <a
          href={linkZap(fornecedor)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => aoChamar(fornecedor.id)}
          title="Chamar no WhatsApp"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-onix text-alabastro transition hover:bg-bronze"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      </div>
    </motion.article>
  )
}

function Diretorio() {
  const params = useSearchParams()
  const router = useRouter()
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [categorias, setCategorias] = useState<CategoriaRef[]>([])
  const [cidades, setCidades] = useState<{ name: string; state: string; slug: string }[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [aviso, setAviso] = useState("")
  const [filtros, setFiltros] = useState<Filtros>({
    categoria: params.get("categoria") || "",
    cidade: params.get("cidade") || "",
    faixa: "",
    estilo: "",
    soComAgenda: false,
  })

  useEffect(() => {
    async function carregar() {
      const [resFornecedores, resCategorias, resCidades] = await Promise.all([
        supabase
          .from("suppliers")
          .select(
            "id, slug, business_name, cover_image_url, whatsapp, price_min, price_max, style, agenda_aberta, has_divine_seal, city(name, state, slug), categories(name, slug)"
          )
          .eq("is_active", true),
        supabase.from("categories").select("name, slug").order("name"),
        supabase.from("cities").select("name, state, slug").order("name"),
      ])
      if (resFornecedores.error) setErro(true)
      if (resFornecedores.data) setFornecedores(resFornecedores.data as unknown as Fornecedor[])
      if (resCategorias.data) setCategorias(resCategorias.data as CategoriaRef[])
      if (resCidades.data) setCidades(resCidades.data as { name: string; state: string; slug: string }[])
      setCarregando(false)
    }
    carregar()
  }, [])

  // Carrega os favoritos existentes da noiva (se logada)
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: favs } = await supabase
        .from("favorites")
        .select("supplier_id")
        .eq("user_id", data.user.id)
      if (favs) setFavoritos(new Set(favs.map((f) => f.supplier_id)))
    })
  }, [])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(""), 4500)
    return () => clearTimeout(t)
  }, [aviso])

  const lista = useMemo(() => {
    const faixaSel = FAIXAS.find((x) => x.id === filtros.faixa) ?? FAIXAS[0]
    return fornecedores
      .filter((f) => {
        if (filtros.categoria) {
          const slugs = normalizaCategorias(f.categories).map((c) => c.slug)
          if (!slugs.includes(filtros.categoria)) return false
        }
        if (filtros.cidade && f.city?.slug !== filtros.cidade) return false
        if (filtros.estilo && f.style !== filtros.estilo) return false
        if (filtros.soComAgenda && !f.agenda_aberta) return false
        return faixaSel.teste(f)
      })
      .sort((a, b) => Number(b.has_divine_seal) - Number(a.has_divine_seal))
  }, [fornecedores, filtros])

  function limparFiltros() {
    setFiltros({ categoria: "", cidade: "", faixa: "", estilo: "", soComAgenda: false })
  }

  async function alternarFavorito(id: string) {
    setAviso("")
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push("/entrar")
      return
    }
    const jaSalvo = favoritos.has(id)
    setFavoritos((prev) => {
      const n = new Set(prev)
      if (jaSalvo) n.delete(id)
      else n.add(id)
      return n
    })
    if (jaSalvo) {
      await supabase.from("favorites").delete().match({ user_id: data.user.id, supplier_id: id })
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: data.user.id, supplier_id: id })
      if (error) setAviso("Não foi possível salvar agora — confirme a tabela favorites no SQL da Fase 2.")
    }
  }

  // Métrica de vaidade: contabiliza o clique que virá no painel do fornecedor
  async function registrarClique(id: string) {
    try {
      await supabase.from("whatsapp_clicks").insert({ supplier_id: id })
    } catch {}
  }

  return (
    <div className="min-h-screen bg-alabastro font-sans text-onix">
      <header className="sticky top-0 z-40 border-b border-linha bg-alabastro/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-serif text-2xl tracking-[0.25em]">
            DIVINE
          </Link>
          <span className="hidden text-[11px] uppercase tracking-[0.3em] text-onix/50 sm:block">
            Diretório de Curadoria
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/entrar"
              className="rounded-full bg-onix px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-alabastro transition hover:bg-bronze"
            >
              Entrar
            </Link>
            <Link
              href="/"
              className="rounded-full border border-linha px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition hover:border-onix hover:bg-onix hover:text-alabastro"
            >
              Voltar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {erro && (
          <div className="mb-6 rounded-xl border border-bronze/40 bg-bronze/5 px-4 py-3 text-sm text-onix/80">
            Não consegui falar com o acervo. Confirme que o <strong>SQL da Fase 2</strong> foi executado e que
            as variáveis <code>NEXT_PUBLIC_SUPABASE_URL</code> / <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            estão configuradas na Vercel.
          </div>
        )}

        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl">O Diretório</h1>
            <p className="mt-2 text-sm text-onix/50">
              {carregando ? "Abrindo o acervo..." : `${lista.length} fornecedores chancelados`}
            </p>
          </div>
          <button
            onClick={() => setFiltrosAbertos((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-linha bg-white px-4 py-2.5 text-xs uppercase tracking-[0.2em] lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filtros enxutos na lateral */}
          <aside className={`${filtrosAbertos ? "block" : "hidden"} lg:block`}>
            <div className="space-y-6 rounded-2xl border border-linha bg-white p-5 lg:sticky lg:top-24">
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-onix/40">
                  Categoria
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Chip ativo={filtros.categoria === ""} onClick={() => setFiltros({ ...filtros, categoria: "" })}>
                    Todas
                  </Chip>
                  {categorias.map((c) => (
                    <Chip
                      key={c.slug}
                      ativo={filtros.categoria === c.slug}
                      onClick={() => setFiltros({ ...filtros, categoria: c.slug })}
                    >
                      {c.name}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-onix/40">
                  Cidade polo
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Chip ativo={filtros.cidade === ""} onClick={() => setFiltros({ ...filtros, cidade: "" })}>
                    Todas
                  </Chip>
                  {cidades.map((c) => (
                    <Chip
                      key={c.slug}
                      ativo={filtros.cidade === c.slug}
                      onClick={() => setFiltros({ ...filtros, cidade: c.slug })}
                    >
                      {c.name}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-onix/40">
                  Preço médio
                </p>
                <div className="space-y-1">
                  {FAIXAS.map((fx) => (
                    <button
                      key={fx.id}
                      onClick={() => setFiltros({ ...filtros, faixa: fx.id })}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${
                        filtros.faixa === fx.id ? "bg-onix text-alabastro" : "hover:bg-white/60"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          filtros.faixa === fx.id ? "bg-bronze" : "bg-linha"
                        }`}
                      />
                      {fx.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-onix/40">Estilo</p>
                <div className="space-y-1.5">
                  {ESTILOS.map((e) => (
                    <button
                      key={e.id}
                      onClick={() =>
                        setFiltros({ ...filtros, estilo: filtros.estilo === e.id ? "" : e.id })
                      }
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        filtros.estilo === e.id ? "border-bronze bg-bronze/5" : "border-linha hover:border-onix/30"
                      }`}
                    >
                      <span className="block text-sm font-medium">{e.label}</span>
                      <span className="block text-[11px] text-onix/50">{e.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-linha p-3">
                <span className="flex items-center gap-2 text-sm">
                  <CalendarCheck className="h-4 w-4 text-bronze" /> Só com agenda aberta
                </span>
                <input
                  type="checkbox"
                  checked={filtros.soComAgenda}
                  onChange={(e) => setFiltros({ ...filtros, soComAgenda: e.target.checked })}
                  className="peer sr-only"
                />
                <span className="relative h-5 w-9 shrink-0 rounded-full bg-linha transition after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-bronze peer-checked:after:translate-x-4" />
              </label>

              <button
                onClick={limparFiltros}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-linha py-2.5 text-[11px] uppercase tracking-[0.2em] text-onix/60 transition hover:border-onix hover:text-onix"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Limpar filtros
              </button>
            </div>
          </aside>

          {/* Listagem */}
          <section>
            {carregando ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-linha bg-white">
                    <div className="aspect-[4/5] bg-linha/60" />
                    <div className="space-y-2 p-4">
                      <div className="h-4 w-2/3 rounded bg-linha/60" />
                      <div className="h-3 w-1/3 rounded bg-linha/40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : lista.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-linha bg-white/60 p-12 text-center">
                <p className="font-serif text-2xl">Nenhuma obra com esses filtros</p>
                <p className="mt-2 text-sm text-onix/50">
                  Ajuste a curadoria para ver o acervo completo.
                </p>
                <button
                  onClick={limparFiltros}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-onix px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-alabastro transition hover:bg-bronze"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {lista.map((f, i) => (
                  <CartaoFornecedor
                    key={f.id}
                    fornecedor={f}
                    indice={i}
                    salvo={favoritos.has(f.id)}
                    aoFavoritar={alternarFavorito}
                    aoChamar={registrarClique}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {aviso && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-onix px-5 py-2.5 text-xs text-alabastro shadow-xl">
          {aviso}
        </div>
      )}
    </div>
  )
}

export default function PaginaDiretorio() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-alabastro" />}>
      <Diretorio />
    </Suspense>
  )
}

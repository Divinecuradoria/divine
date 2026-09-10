"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Header } from "@/components/Header"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Heart,
  MapPin,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react"
import { getSupabase, ACCESS_UNAVAILABLE } from "@/lib/supabase"


type CategoriaRef = { id?: string; name: string; slug: string }

type VinculoCategoria = { supplier_id: string; category_id: string }

type CidadeRef = { id: string; name: string; state: string; slug: string }

type Fornecedor = {
  id: string
  slug: string
  business_name: string
  cover_image_url: string | null
  whatsapp: string | null
  price_min: number | null
  price_max: number | null
  agenda_aberta: boolean
  has_divine_seal: boolean
  city_id: string | null
  city: { name: string; state: string; slug: string } | null
  categories: CategoriaRef[] | CategoriaRef | null
}

type Filtros = {
  categoria: string
  cidade: string
}

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

function normalizaTexto(valor: string | null | undefined): string {
  return (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function fornecedorNoLocal(fornecedor: Fornecedor, localInformado: string): boolean {
  const cidade = normalizaTexto(fornecedor.city?.name)
  const local = normalizaTexto(localInformado)
  if (!cidade || !local) return false
  return local === cidade || local.includes(cidade) || cidade.includes(local)
}

function formataFaixa(f: Fornecedor): string {
  if (f.price_min != null && f.price_max != null) {
    return `R$ ${(f.price_min / 1000).toFixed(0)}–${(f.price_max / 1000).toFixed(0)} mil`
  }
  if (f.price_min != null) return `A partir de R$ ${(f.price_min / 1000).toFixed(0)} mil`
  return "Sob consulta"
}

function linkZap(f: Fornecedor): string | undefined {
  const numero = (f.whatsapp || "").replace(/\D/g, "")
  const texto = encodeURIComponent(
    `Olá! Encontrei o seu trabalho na DIVINE e adoraria um orçamento para o meu casamento.`
  )
  const internacional = numero.length === 10 || numero.length === 11 ? `55${numero}` : numero
  if (!/^[1-9]\d{9,14}$/.test(internacional)) return undefined
  return `https://wa.me/${internacional}?text=${texto}`
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const contato = linkZap(fornecedor)
  const categorias = normalizaCategorias(fornecedor.categories)
  const local = fornecedor.city ? `${fornecedor.city.name}, ${fornecedor.city.state}` : "Minas Gerais"
  const query = searchParams.toString()
  const origem = `${pathname}${query ? `?${query}` : ""}`

  function abrirDetalhes(event: React.MouseEvent<HTMLElement>) {
    const alvo = event.target as HTMLElement
    if (alvo.closest("button, a")) return
    sessionStorage.setItem("divine-acervo-scroll", String(window.scrollY))
    router.push(`/diretorio/${fornecedor.slug}?from=${encodeURIComponent(origem)}`)
  }

  function abrirComTeclado(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    sessionStorage.setItem("divine-acervo-scroll", String(window.scrollY))
    router.push(`/diretorio/${fornecedor.slug}?from=${encodeURIComponent(origem)}`)
  }

  return (
    <motion.article
      initial="hidden"
      animate="visible"
      custom={indice}
      variants={fadeUp}
      role="link"
      tabIndex={0}
      onClick={abrirDetalhes}
      onKeyDown={abrirComTeclado}
      aria-label={`Ver detalhes de ${fornecedor.business_name}`}
      className="group relative overflow-hidden rounded-2xl border border-linha bg-white shadow-[0_10px_40px_-24px_rgba(18,18,18,0.2)]"
    >
      {/* A imagem ocupa ~80% do card (Camada 2) */}
      <div className="relative block aspect-[4/5] overflow-hidden">
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
      </div>

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
        aria-label={salvo ? "Remover dos favoritos" : "Salvar nos favoritos"}
        aria-pressed={salvo}
        className="absolute right-3 top-3 z-10 rounded-full bg-alabastro/95 p-2 text-onix shadow-sm transition hover:scale-110 hover:text-bronze"
      >
        <Heart className={`h-4 w-4 ${salvo ? "fill-bronze text-bronze" : ""}`} />
      </button>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-xl leading-tight">{fornecedor.business_name}</h3>
        </div>

        {/* Regra de ouro: WhatsApp a um clique, direto do card */}
        {contato ? <a
          href={contato}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => aoChamar(fornecedor.id)}
          aria-label={`Chamar ${fornecedor.business_name} no WhatsApp`}
          title="Chamar no WhatsApp"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-onix text-alabastro transition hover:bg-bronze"
        >
          <MessageCircle className="h-5 w-5" />
        </a> : <span className="text-xs text-onix/50">Contato indisponível</span>}
      </div>
    </motion.article>
  )
}

function Diretorio() {
  const params = useSearchParams()
  const router = useRouter()
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [categorias, setCategorias] = useState<CategoriaRef[]>([])
  const [cidades, setCidades] = useState<CidadeRef[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [passaporte, setPassaporte] = useState<{ local: string } | null>(null)
  const [aviso, setAviso] = useState("")
  const pendingFavorites = useRef(new Set<string>())
  const [filtros, setFiltros] = useState<Filtros>({
    categoria: params.get("categoria") || "",
    cidade: params.get("cidade") || "",
  })

  useEffect(() => {
    async function carregar() {
      const supabase = getSupabase()
      if (!supabase) { setErro(true); setCarregando(false); return }
      const [resFornecedores, resVinculos, resCategorias, resCidades] = await Promise.all([
        supabase
          .from("suppliers")
          .select(
            "id, slug, business_name, cover_image_url, whatsapp, price_min, price_max, agenda_aberta, has_divine_seal, city_id"
          )
          .eq("is_active", true)
          .eq("has_divine_seal", true),
        supabase.from("supplier_categories").select("supplier_id, category_id"),
        supabase.from("categories").select("id, name, slug").order("name"),
        supabase.from("cities").select("id, name, state, slug").order("name"),
      ])
      if (resFornecedores.error) {
        console.error("Falha ao carregar fornecedores do Acervo", resFornecedores.error)
        setErro(true)
      }

      if (resFornecedores.data) {
        // A relação many-to-many é montada explicitamente. Isso evita que uma
        // falha no relacionamento aninhado do PostgREST impeça o card inteiro
        // de aparecer no Acervo.
        const categoriasPorId = new Map(
          (resCategorias.data || []).map((categoria) => [
            categoria.id,
            { id: categoria.id, name: categoria.name, slug: categoria.slug },
          ])
        )
        const categoriasPorFornecedor = new Map<string, CategoriaRef[]>()
        for (const vinculo of (resVinculos.data || []) as VinculoCategoria[]) {
          const categoria = categoriasPorId.get(vinculo.category_id)
          if (!categoria) continue
          const atuais = categoriasPorFornecedor.get(vinculo.supplier_id) || []
          atuais.push(categoria)
          categoriasPorFornecedor.set(vinculo.supplier_id, atuais)
        }

        const cidadesPorId = new Map(
          (resCidades.data || []).map((cidade) => [cidade.id, cidade])
        )

        setFornecedores(
          resFornecedores.data.map((fornecedor) => ({
            ...(fornecedor as unknown as Fornecedor),
            city: cidadesPorId.get(fornecedor.city_id) || null,
            categories: categoriasPorFornecedor.get(fornecedor.id) || [],
          }))
        )
      }
      if (resCategorias.data) setCategorias(resCategorias.data as CategoriaRef[])
      if (resCidades.data) setCidades(resCidades.data as CidadeRef[])
      setCarregando(false)
    }
    carregar().catch(() => { setErro(true); setCarregando(false) })
  }, [])

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("divine-acervo-scroll")
    if (!savedScroll) return
    const scrollY = Number(savedScroll)
    sessionStorage.removeItem("divine-acervo-scroll")
    if (!Number.isFinite(scrollY)) return
    requestAnimationFrame(() => window.scrollTo(0, scrollY))
  }, [carregando])

  // Carrega os favoritos existentes da noiva (se logada)
  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setPassaporte(null)
        return
      }
      const { data: perfil } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle()
      const ehNoivo = perfil?.role === "couple" || data.user.user_metadata?.role === "couple"
      if (!ehNoivo) {
        setPassaporte(null)
        setFavoritos(new Set())
        return
      }
      setPassaporte({ local: String(data.user.user_metadata?.location || "") })
      const { data: favs } = await supabase
        .from("favorites")
        .select("supplier_id")
        .eq("user_id", data.user.id)
      if (favs) setFavoritos(new Set(favs.map((f) => f.supplier_id)))
    }).catch(() => setAviso("Não foi possível carregar seus favoritos. Tente novamente."))
  }, [])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(""), 4500)
    return () => clearTimeout(t)
  }, [aviso])

  const lista = useMemo(() => {
    return fornecedores
      .filter((f) => {
        if (filtros.categoria) {
          const slugs = normalizaCategorias(f.categories).map((c) => c.slug)
          if (!slugs.includes(filtros.categoria)) return false
        }
        if (filtros.cidade && f.city?.slug !== filtros.cidade) return false
        return true
      })
      .sort((a, b) => {
        // Para casais logados, interesses salvos vêm primeiro; em seguida,
        // priorizamos referências na cidade informada no Passaporte.
        if (passaporte) {
          const favoritoA = favoritos.has(a.id) ? 1 : 0
          const favoritoB = favoritos.has(b.id) ? 1 : 0
          if (favoritoA !== favoritoB) return favoritoB - favoritoA

          const localA = fornecedorNoLocal(a, passaporte.local) ? 1 : 0
          const localB = fornecedorNoLocal(b, passaporte.local) ? 1 : 0
          if (localA !== localB) return localB - localA
        }

        return a.business_name.localeCompare(b.business_name, "pt-BR")
      })
  }, [fornecedores, filtros, favoritos, passaporte])

  const grupos = useMemo(() => {
    if (passaporte) {
      return [{ key: "selecao", label: "Seleção para você", items: lista }]
    }

    const porCategoria = new Map<string, { key: string; label: string; items: Fornecedor[] }>()
    for (const fornecedor of lista) {
      const categoriasDoFornecedor = normalizaCategorias(fornecedor.categories)
      const categoriasParaExibir = categoriasDoFornecedor.length
        ? categoriasDoFornecedor
        : [{ slug: "sem-categoria", name: "Outras referências" }]

      for (const categoria of categoriasParaExibir) {
        const key = categoria.slug || normalizaTexto(categoria.name)
        const grupo = porCategoria.get(key) || { key, label: categoria.name, items: [] }
        grupo.items.push(fornecedor)
        porCategoria.set(key, grupo)
      }
    }

    return Array.from(porCategoria.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "pt-BR")
    )
  }, [lista, passaporte])

  function limparFiltros() {
    setFiltros({ categoria: "", cidade: "" })
  }

  async function alternarFavorito(id: string) {
    if (pendingFavorites.current.has(id)) return
    pendingFavorites.current.add(id)
    setAviso("")
    try {
      const supabase = getSupabase()
      if (!supabase) { setAviso(ACCESS_UNAVAILABLE); return }
      const { data, error: authError } = await supabase.auth.getUser()
      if (authError || !data.user) { router.push("/entrar"); return }
      const jaSalvo = favoritos.has(id)
      const result = jaSalvo
        ? await supabase.from("favorites").delete().match({ user_id: data.user.id, supplier_id: id })
        : await supabase.from("favorites").insert({ user_id: data.user.id, supplier_id: id })
      if (result.error) throw result.error
      setFavoritos((prev) => {
        const next = new Set(prev)
        if (jaSalvo) next.delete(id)
        else next.add(id)
        return next
      })
      setAviso(jaSalvo ? "Fornecedor removido dos favoritos." : "Fornecedor salvo nos favoritos.")
    } catch {
      setAviso("Não foi possível atualizar seus favoritos. Tente novamente.")
    } finally { pendingFavorites.current.delete(id) }
  }

  // Métrica de vaidade: contabiliza o clique que virá no painel do fornecedor
  async function registrarClique(id: string) {
    try {
      const supabase = getSupabase()
      if (!supabase) return
      await supabase.from("whatsapp_clicks").insert({ supplier_id: id })
    } catch {}
  }

  return (
    <div className="min-h-screen bg-alabastro font-sans text-onix">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-32 sm:px-6">
        {erro && (
          <div className="mb-6 rounded-xl border border-bronze/40 bg-bronze/5 px-4 py-3 text-sm text-onix/80">
            Não foi possível carregar os fornecedores. Tente novamente em instantes.
            <button onClick={() => window.location.reload()} className="ml-2 underline">Tentar novamente</button>
          </div>
        )}

        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl">O Acervo</h1>
            <p className="mt-2 text-sm text-onix/50">
              {carregando
                ? "Abrindo o acervo..."
                : passaporte
                  ? "Sua seleção começa pelos seus interesses e pelo território do Passaporte."
                  : `${lista.length} fornecedores encontrados`}
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
            ) : erro ? null : lista.length === 0 ? (
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
              <div className="space-y-12">
                {grupos.map((grupo) => (
                  <section key={grupo.key} aria-labelledby={`grupo-${grupo.key}`}>
                    {!passaporte && (
                      <h2 id={`grupo-${grupo.key}`} className="mb-5 font-serif text-2xl">
                        {grupo.label}
                      </h2>
                    )}
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {grupo.items.map((f, i) => (
                        <CartaoFornecedor
                          key={`${grupo.key}-${f.id}`}
                          fornecedor={f}
                          indice={i}
                          salvo={favoritos.has(f.id)}
                          aoFavoritar={alternarFavorito}
                          aoChamar={registrarClique}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {aviso && (
        <div role="status" aria-live="polite" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-onix px-5 py-2.5 text-xs text-alabastro shadow-xl">
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

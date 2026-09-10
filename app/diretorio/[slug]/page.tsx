"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ExternalLink, MapPin, MessageCircle, ShieldCheck } from "lucide-react"
import { Header } from "@/components/Header"
import { getSupabase } from "@/lib/supabase"

type Categoria = { id: string; name: string; slug: string }

type Fornecedor = {
  id: string
  slug: string
  business_name: string
  bio: string | null
  cover_image_url: string | null
  whatsapp: string | null
  price_min: number | null
  price_max: number | null
  agenda_aberta: boolean
  has_divine_seal: boolean
  portfolio: unknown
  services: string[] | null
  instagram_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  website_url: string | null
  city_id: string | null
}

function portfolioUrl(value: unknown): string {
  if (!Array.isArray(value) || !value.length) return ""
  const first = value[0]
  return first && typeof first === "object" && "url" in first && typeof first.url === "string" ? first.url : ""
}

function whatsappUrl(value: string | null): string | undefined {
  const number = (value || "").replace(/\D/g, "")
  const international = number.length === 10 || number.length === 11 ? `55${number}` : number
  if (!/^[1-9]\d{9,14}$/.test(international)) return undefined
  return `https://wa.me/${international}?text=${encodeURIComponent("Olá! Encontrei seu trabalho no Acervo DIVINE e gostaria de conversar sobre meu casamento.")}`
}

function formatValidity(value: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(date)
}

function priceLabel(min: number | null, max: number | null): string {
  if (min != null && max != null) return `R$ ${(min / 1000).toFixed(0)}–${(max / 1000).toFixed(0)} mil`
  if (min != null) return `A partir de R$ ${(min / 1000).toFixed(0)} mil`
  return "Sob consulta"
}

export default function DetalheFornecedor() {
  const params = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cidade, setCidade] = useState<{ name: string; state: string } | null>(null)
  const [validUntil, setValidUntil] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      const db = getSupabase()
      if (!db) { setError("O Acervo está temporariamente indisponível."); setLoading(false); return }

      const result = await db.from("suppliers")
        .select("id,slug,business_name,bio,cover_image_url,whatsapp,price_min,price_max,agenda_aberta,has_divine_seal,portfolio,services,instagram_url,facebook_url,tiktok_url,website_url,city_id")
        .eq("slug", params.slug)
        .eq("is_active", true)
        .eq("has_divine_seal", true)
        .maybeSingle()
      if (result.error) throw result.error
      if (!result.data) { setError("Esta Referência não está disponível no Acervo."); setLoading(false); return }

      const item = result.data as Fornecedor
      const [links, categoryResult, cityResult, publicationResult] = await Promise.all([
        db.from("supplier_categories").select("category_id").eq("supplier_id", item.id),
        db.from("categories").select("id,name,slug").order("name"),
        item.city_id ? db.from("cities").select("id,name,state").eq("id", item.city_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
        db.from("divine_publications").select("valid_until").eq("brand_name", item.business_name).eq("is_published", true).order("published_at", { ascending: false }).limit(1).maybeSingle(),
      ])
      if (categoryResult.error) throw categoryResult.error
      if (cityResult.error) throw cityResult.error
      if (publicationResult.error) throw publicationResult.error
      const categoryIds = new Set((links.data || []).map((link) => link.category_id))
      setCategorias(((categoryResult.data || []) as Categoria[]).filter((category) => categoryIds.has(category.id)))
      setCidade(cityResult.data ? { name: cityResult.data.name, state: cityResult.data.state } : null)
      setValidUntil(publicationResult.data?.valid_until || null)
      setFornecedor(item)
      setLoading(false)
    }
    load().catch(() => { setError("Não foi possível carregar esta Referência."); setLoading(false) })
  }, [params.slug])

  function voltar() {
    const origem = searchParams.get("from")
    router.push(origem && origem.startsWith("/diretorio") ? origem : "/diretorio")
  }

  const portfolio = fornecedor ? portfolioUrl(fornecedor.portfolio) : ""
  const contato = fornecedor ? whatsappUrl(fornecedor.whatsapp) : undefined

  return (
    <main className="min-h-screen bg-alabastro text-onix">
      <Header />
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-32 sm:px-8">
        <button onClick={voltar} className="inline-flex items-center gap-2 text-sm text-onix/60 transition hover:text-bronze">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Acervo
        </button>

        {loading ? <p role="status" className="mt-12">Abrindo a Referência…</p> : error ? (
          <section className="mt-12 rounded-2xl border border-dashed border-linha bg-white/60 p-10 text-center">
            <h1 className="font-serif text-3xl">Referência indisponível</h1>
            <p className="mt-3 text-onix/60">{error}</p>
          </section>
        ) : fornecedor ? (
          <article className="mt-10 overflow-hidden rounded-2xl border border-linha bg-white shadow-[0_16px_60px_-30px_rgba(18,18,18,0.25)]">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-[420px] bg-onix">
                {fornecedor.cover_image_url ? <Image src={fornecedor.cover_image_url} alt={fornecedor.business_name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /> : <div className="flex h-full items-center justify-center font-serif text-7xl text-alabastro">D</div>}
              </div>
              <div className="p-7 sm:p-10">
                <div className="flex flex-wrap gap-2">
                  {categorias.map((category) => <span key={category.id} className="rounded-full bg-bronze/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-bronze">{category.name}</span>)}
                  {fornecedor.has_divine_seal && <span className="inline-flex items-center gap-1 rounded-full bg-bronze px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-alabastro"><ShieldCheck className="h-3 w-3" /> Chancela DIVINE</span>}
                </div>
                {fornecedor.has_divine_seal && <div className="mt-7 flex items-center gap-4 rounded-xl border border-bronze/30 bg-bronze/5 p-4">
                  <Image src="/divine-seal2.svg" alt="Chancela DIVINE" width={84} height={84} className="h-20 w-20 shrink-0 object-contain" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bronze">Chancela DIVINE</p>
                    <p className="mt-1 text-sm leading-relaxed text-onix/70">Reconhecimento editorial da Curadoria Nupcial.</p>
                    {formatValidity(validUntil) && <p className="mt-1 text-xs text-onix/60">Válida até {formatValidity(validUntil)}</p>}
                  </div>
                </div>}
                <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">{fornecedor.business_name}</h1>
                <div className="mt-4 space-y-2 text-sm text-onix/60">
                  {cidade && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-bronze" /> {cidade.name}, {cidade.state}</p>}
                  <p>{priceLabel(fornecedor.price_min, fornecedor.price_max)}</p>
                </div>
                {fornecedor.bio && <p className="mt-8 whitespace-pre-line text-base leading-relaxed text-onix/75">{fornecedor.bio}</p>}
                {!!fornecedor.services?.length && <section className="mt-8"><h2 className="font-serif text-2xl">Principais serviços</h2><ul className="mt-3 list-inside list-disc space-y-1 text-sm text-onix/70">{fornecedor.services.map((service) => <li key={service}>{service}</li>)}</ul></section>}
                <div className="mt-9 flex flex-wrap gap-3">
                  {portfolio && <a href={portfolio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-onix px-5 py-3 text-sm text-alabastro transition hover:bg-bronze"><ExternalLink className="h-4 w-4" /> Ver portfólio</a>}
                  {contato && <a href={contato} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-onix px-5 py-3 text-sm transition hover:border-bronze hover:text-bronze"><MessageCircle className="h-4 w-4" /> Conversar pelo WhatsApp</a>}
                </div>
                <div className="mt-8 flex flex-wrap gap-4 text-sm text-onix/60">
                  {fornecedor.instagram_url && <a href={fornecedor.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-bronze">Instagram</a>}
                  {fornecedor.facebook_url && <a href={fornecedor.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-bronze">Facebook</a>}
                  {fornecedor.tiktok_url && <a href={fornecedor.tiktok_url} target="_blank" rel="noopener noreferrer" className="hover:text-bronze">TikTok</a>}
                  {fornecedor.website_url && <a href={fornecedor.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-bronze">Site</a>}
                </div>
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </main>
  )
}

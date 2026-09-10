"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { getSupabase } from "@/lib/supabase"
import SearchBar from "@/components/search-bar"
import { Header } from "../components/Header"


type Referencia = {
  id: string
  nome: string
  categoria: string
  imagem: string | null
  slug: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function ReferenciaCard({ item }: { item: Referencia }) {
  return (
    <Link href={`/diretorio/${encodeURIComponent(item.slug)}`} className="group block overflow-hidden border border-linha bg-white">
      <div className="relative aspect-[4/3] overflow-hidden bg-onix">
        {item.imagem ? <Image src={item.imagem} alt={item.nome} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center font-serif text-6xl text-alabastro" aria-hidden="true">D</div>}
      </div>
      <div className="p-6">
        <p className="text-xs leading-relaxed text-bronze">{item.categoria}</p>
        <h3 className="mt-2 font-serif text-3xl text-onix">{item.nome}</h3>
        <p className="mt-4 text-sm underline underline-offset-4">Conhecer o trabalho</p>
      </div>
    </Link>
  )
}

export default function Page() {
  const [referencias, setReferencias] = useState<Referencia[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroAcervo, setErroAcervo] = useState(false)

  useEffect(() => {
    let ativo = true
    async function fetchCuradoria() {
      const db = getSupabase()
      if (!db) throw new Error("Acervo indisponível")
      const result = await db.from("suppliers")
        .select("id,business_name,cover_image_url,slug")
        .eq("is_active", true).eq("has_divine_seal", true)
        .order("created_at", { ascending: false }).limit(6)
      if (result.error) throw result.error
      if (!result.data?.length) {
        if (ativo) setReferencias([])
        return
      }
      const [links, categories] = await Promise.all([
        db.from("supplier_categories").select("supplier_id,category_id").in("supplier_id", result.data.map(item => item.id)),
        db.from("categories").select("id,name"),
      ])
      if (links.error || categories.error) throw new Error("Categorias indisponíveis")
      const names = new Map((categories.data || []).map(item => [item.id, item.name]))
      const mapped = result.data.filter(item => !!item.slug).map(item => ({
        id: item.id,
        nome: item.business_name,
        slug: item.slug,
        imagem: item.cover_image_url,
        categoria: (links.data || []).filter(link => link.supplier_id === item.id)
          .map(link => names.get(link.category_id)).filter(Boolean).join(" · ") || "Referência DIVINE",
      }))
      if (ativo) setReferencias(mapped)
    }
    fetchCuradoria().catch(() => { if (ativo) setErroAcervo(true) })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [])

  return (
    <div className="min-h-screen bg-alabastro text-onix">
      <Header />
      
      <section className="relative px-3 pb-20 pt-24 md:px-4 md:pt-28">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid grid-cols-2 gap-2 md:h-[82vh] md:grid-cols-12 md:grid-rows-2">
            <div className="relative col-span-1 aspect-[3/4] overflow-hidden md:col-span-3 md:row-span-2 md:aspect-auto bg-onix/10">
              <Image src="https://images.unsplash.com/photo-1710090411838-5f846e289b2e?auto=format&fit=crop&w=1800&q=88" alt="Noiva em retrato editorial" fill priority sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
            </div>
            <div className="relative col-span-1 aspect-[3/4] overflow-hidden md:col-span-6 md:row-span-2 md:aspect-auto bg-onix/10">
              <Image src="/images/hero-ambience.webp" alt="Celebração de casamento" fill priority sizes="(max-width: 768px) 50vw, 50vw" className="object-cover grayscale brightness-75" />
              <div className="absolute inset-0 bg-onix/35" />
            </div>
            <div className="relative col-span-1 aspect-[4/3] overflow-hidden md:col-span-3 md:row-span-1 md:aspect-auto bg-onix/10">
              <Image src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop" alt="Detalhe" fill className="object-cover" />
            </div>
            <div className="relative col-span-1 aspect-[4/3] overflow-hidden md:col-span-3 md:row-span-1 md:aspect-auto bg-onix/10">
              <Image src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop" alt="Ambiente" fill className="object-cover" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 hidden -translate-y-1/2 px-4 md:block">
            <div className="mx-auto max-w-[1600px]">
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mx-auto max-w-3xl text-center">
                <p className="mb-6 text-[11px] font-light uppercase tracking-[0.5em] text-alabastro/95 [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
                  Curadoria Nupcial · Centro-Oeste Mineiro
                </p>
                <h1 className="text-balance font-serif text-5xl font-light leading-[0.98] tracking-tight text-alabastro [text-shadow:0_2px_18px_rgba(0,0,0,0.6)] lg:text-6xl xl:text-7xl">
                  O extraordinário <span className="italic text-alabastro">começa na escolha</span>.
                </h1>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <div className="px-5 pb-8 text-center md:hidden">
        <p className="text-xs uppercase tracking-widest text-bronze">Curadoria Nupcial · Centro-Oeste Mineiro</p>
        <h1 className="mt-3 font-serif text-4xl">O extraordinário começa na escolha.</h1>
      </div>
      <section aria-label="Sua próxima escolha" className="px-5 pb-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base leading-relaxed text-onix/80 md:text-lg">Profissionais selecionados para ajudar vocês a escolher com mais clareza no Centro-Oeste Mineiro.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/diretorio" className="rounded-lg bg-onix px-6 py-4 text-sm text-alabastro">Conhecer o Acervo</Link>
            <Link href="/passaporte" className="rounded-lg border border-onix/30 px-6 py-4 text-sm">Criar meu Passaporte</Link>
          </div>
          <p className="mt-3 text-sm text-onix/65">O Passaporte é gratuito para casais: reúna suas referências e os dados do casamento.</p>
        </div>
      </section>
      <SearchBar />

      <section id="acervo" className="scroll-mt-28 px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-t border-linha pt-6">
            <div><p className="text-xs uppercase tracking-widest text-bronze">Profissionais selecionados</p><h2 className="mt-3 font-serif text-4xl md:text-5xl">Conheça o Acervo</h2></div>
            <Link href="/diretorio" className="py-3 text-sm underline underline-offset-4">Ver todas as Referências</Link>
          </div>
          {carregando ? <p role="status" className="py-8 text-onix/70">Carregando as Referências…</p> : erroAcervo ? (
            <p role="status" className="border border-linha p-6 text-sm leading-relaxed">Não foi possível carregar a seleção agora. <Link href="/diretorio" className="underline underline-offset-4">Acessar o Acervo</Link></p>
          ) : referencias.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{referencias.map(item => <ReferenciaCard key={item.id} item={item} />)}</div>
          ) : <p className="border border-linha p-6 text-base leading-relaxed">A formação inaugural está em composição. As Referências serão apresentadas aqui conforme sua publicação.</p>}
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-28 border-y border-linha px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden bg-onix/5">
            <Image src="/images/acervo-ii-floral.svg" alt="Chancela DIVINE em bronze sobre renda" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-bronze">A Chancela DIVINE</p>
            <h2 className="mt-3 font-serif text-4xl">Reconhecimento com critério.</h2>
            <p className="mt-5 text-base leading-relaxed text-onix/80">Cada Referência passa por uma avaliação do trabalho, da reputação, da experiência do cliente, da identidade e do profissionalismo.</p>
            <ol className="mt-7 space-y-5 text-base leading-relaxed">
              <li><strong className="font-medium">01 · Conhecer.</strong> Portfólio, atuação e referências ajudam a compreender o trabalho.</li>
              <li><strong className="font-medium">02 · Avaliar.</strong> A decisão é humana e editorial. Tempo de mercado, sozinho, não determina aprovação.</li>
              <li><strong className="font-medium">03 · Acompanhar.</strong> O reconhecimento tem validade e está sujeito a reavaliação.</li>
            </ol>
            <p className="mt-7 border-t border-linha pt-5 text-sm leading-relaxed text-onix/75">A chancela não se compra. Serviços comerciais são opcionais e não alteram a decisão editorial.</p>
            <Link href="/aplicar" className="mt-5 inline-block py-3 text-sm underline underline-offset-4">Sou fornecedor e quero apresentar meu trabalho</Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="inspiracao-titulo" className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-xs uppercase tracking-widest text-bronze">Repertório visual</p>
          <h2 id="inspiracao-titulo" className="mt-3 font-serif text-4xl">Inspiração para começar.</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-onix/75">Imagens ilustrativas para despertar ideias. Os profissionais selecionados estão identificados no Acervo.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[{ src: "/images/acervo-gastronomia.webp", title: "Receber com cuidado" }, { src: "/images/acervo-floral.webp", title: "Compor o ambiente" }, { src: "/images/acervo-confeitaria.webp", title: "Celebrar os detalhes" }].map(item => (
              <figure key={item.src}><div className="relative aspect-[4/3]"><Image src={item.src} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div><figcaption className="mt-3 font-serif text-2xl">{item.title}</figcaption></figure>
            ))}
          </div>
          <Link href="/revista" className="mt-6 inline-block py-3 text-sm underline underline-offset-4">Encontrar orientação em O Editorial</Link>
        </div>
      </section>

      <section id="manifesto" className="scroll-mt-24 border-t border-linha px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
            <div className="grid grid-cols-1 gap-6 border-b border-linha pb-12 md:grid-cols-12 md:items-end">
              <p className="text-[11px] font-light uppercase tracking-[0.4em] text-bronze md:col-span-3">
                O Manifesto
              </p>
              <h2 className="text-balance font-serif text-4xl font-light leading-[1.05] tracking-tight text-onix md:col-span-9 md:text-6xl">
                O tempo desacelera diante do que é construído com intenção.
              </h2>
            </div>

            <div className="mt-12 gap-10 text-pretty text-[15px] font-light leading-[1.85] text-onix/75 md:columns-2 md:gap-14">
              <p className="mb-6 first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-7xl first-letter:font-light first-letter:leading-[0.7] first-letter:text-bronze">
                Acreditamos que um casamento não é uma lista de contratos a serem cumpridos. É um patrimônio visual e afetivo.
              </p>
              <p className="mb-6 font-normal text-onix">O DIVINE nasceu para honrar esse momento.</p>
              <p className="mb-6">
                Em vez de infinitos catálogos que geram dúvida e exaustão aos noivos, escolhemos o caminho da clareza. Mapeamos o Centro-Oeste mineiro com um único objetivo: reunir os artesãos da memória.
              </p>
              <p className="mb-6">
                Para os noivos, reunimos referências para escolhas mais informadas e tranquilas. Para os talentos, o espaço que a excelência deles merece.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-onix text-alabastro">
        <div className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-28">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-12 md:gap-8">
            
            <div className="md:col-span-5">
              <div className="flex items-center gap-4">
                <Image 
                  src="/images/divine-seal.webp"
                  alt="Selo DIVINE" 
                  width={96} 
                  height={96} 
                  className="h-16 w-16 object-contain md:h-20 md:w-20" 
                />
                <span className="font-serif text-4xl font-light tracking-[0.35em] md:text-5xl">
                  DIVINE
                </span>
              </div>
              <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-alabastro/60">
                Curadoria nupcial para quem compreende que o extraordinário não se improvisa — se seleciona.
              </p>
            </div>

            <div className="md:col-span-3 md:col-start-7">
              <p className="mb-6 text-[10px] font-light uppercase tracking-[0.25em] text-alabastro/40">Institucional</p>
              <nav className="flex flex-col gap-4">
                <Link href="/#manifesto" className="text-[12px] font-light tracking-wide text-alabastro/70 transition-colors hover:text-bronze">
                  A Curadoria
                </Link>
                <a href="mailto:divinecuradorianupcial@gmail.com?subject=Privacidade%20e%20dados%20pessoais" className="text-xs text-alabastro/70 hover:text-bronze">Dúvidas sobre privacidade</a>
              </nav>
            </div>

            <div className="md:col-span-3">
              <p className="mb-6 text-[10px] font-light uppercase tracking-[0.25em] text-alabastro/40">Conexão</p>
              <nav className="flex flex-col gap-4">
                <a href="mailto:divinecuradorianupcial@gmail.com" className="group flex items-center gap-3 text-[12px] font-light tracking-wide text-alabastro/70 transition-colors hover:text-bronze">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <span>Concierge</span>
                </a>
                <a href="https://instagram.com/divinecuradoria" target="_blank" rel="noreferrer" className="group flex items-center gap-3 text-[12px] font-light tracking-wide text-alabastro/70 transition-colors hover:text-bronze">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  <span>@divinecuradoria</span>
                </a>
              </nav>
            </div>
            
          </div>
          <div className="mt-20 flex flex-col gap-4 border-t border-alabastro/10 pt-8 text-[10px] font-light uppercase tracking-[0.25em] text-alabastro/40 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} DIVINE Curadoria Nupcial</span>
            <span>O extraordinário começa na escolha</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

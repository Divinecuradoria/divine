"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Conexão com o cofre de dados
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

type Exposicao =
  | {
      tipo: "obra"
      nome: string
      categoria: string
      imagem: string
      span: string
    }
  | {
      tipo: "categoria"
      titulo: string
      indice: string
      variante: "onix" | "bronze" | "contorno"
      span: string
    }

// A estrutura original (eskeleton) da galeria para manter o layout de revista
const paredeOriginal: Exposicao[] = [
  { tipo: "categoria", titulo: "A Curadoria", indice: "I", variante: "onix", span: "md:col-span-4" },
  { tipo: "obra", nome: "Acervo I", categoria: "Exclusivo", imagem: "/images/acervo-gastronomia.png", span: "md:col-span-8" },
  { tipo: "obra", nome: "Acervo II", categoria: "Exclusivo", imagem: "/images/acervo-floral.png", span: "md:col-span-5" },
  { tipo: "obra", nome: "Acervo III", categoria: "Exclusivo", imagem: "/images/acervo-atelier.png", span: "md:col-span-4" },
  { tipo: "categoria", titulo: "O Padrão", indice: "II", variante: "bronze", span: "md:col-span-3" },
  { tipo: "categoria", titulo: "Vanguarda", indice: "III", variante: "contorno", span: "md:col-span-3" },
  { tipo: "obra", nome: "Acervo IV", categoria: "Exclusivo", imagem: "/images/acervo-fotografia.png", span: "md:col-span-5" },
  { tipo: "obra", nome: "Acervo V", categoria: "Exclusivo", imagem: "/images/acervo-locacao.png", span: "md:col-span-4" },
  { tipo: "obra", nome: "Acervo VI", categoria: "Exclusivo", imagem: "/images/acervo-confeitaria.png", span: "md:col-span-7" },
  { tipo: "categoria", titulo: "A Excelência", indice: "IV", variante: "onix", span: "md:col-span-5" },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function ObraCard({ nome, categoria, imagem, index }: { nome: string; categoria: string; imagem: string; index: number }) {
  return (
    <a href="#" className="group relative block h-72 overflow-hidden md:h-full">
      <Image
        src={imagem || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop"}
        alt={`${nome} — ${categoria}`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 flex flex-col justify-end bg-onix/0 p-6 transition-colors duration-500 group-hover:bg-onix/60 md:p-8">
        <div className="translate-y-3 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-[10px] font-light uppercase tracking-[0.4em] text-alabastro/70">
            {categoria}
          </p>
          <h3 className="mt-2 font-serif text-3xl font-light leading-tight text-alabastro md:text-4xl">
            {nome}
          </h3>
        </div>
      </div>
      <span className="absolute right-5 top-5 text-[10px] font-light tabular-nums tracking-[0.3em] text-alabastro mix-blend-difference">
        {String(index).padStart(2, "0")}
      </span>
    </a>
  )
}

function CategoriaCard({ titulo, indice, variante }: { titulo: string; indice: string; variante: "onix" | "bronze" | "contorno" }) {
  const estilos = {
    onix: "bg-onix text-alabastro",
    bronze: "bg-bronze text-alabastro",
    contorno: "bg-alabastro text-onix border border-linha",
  }[variante]
  const legenda = variante === "contorno" ? "text-onix/50" : "text-alabastro/60"

  return (
    <div className={`flex h-72 flex-col justify-between p-8 md:h-full md:p-10 ${estilos}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-light uppercase tracking-[0.4em] ${legenda}`}>
          Chancela
        </span>
        <span className={`font-serif text-lg font-light italic ${legenda}`}>
          {indice}
        </span>
      </div>
      <h3 className="text-balance font-serif text-4xl font-light leading-[0.95] tracking-tight md:text-5xl lg:text-6xl">
        {titulo}
      </h3>
    </div>
  )
}

export default function Page() {
  const [acervo, setAcervo] = useState<Exposicao[]>(paredeOriginal)

  useEffect(() => {
    async function fetchCuradoria() {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, business_name, cover_image_url, slug, categories(name)')
        .eq('is_active', true)
        .eq('has_divine_seal', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (data && data.length > 0) {
        let indexFornecedor = 0
        const novaGrade = paredeOriginal.map((item) => {
          if (item.tipo === "obra" && indexFornecedor < data.length) {
            const fornecedor = data[indexFornecedor]
            indexFornecedor++
            
            // Tratamento caso a categoria venha como array ou objeto
            const nomeCategoria = Array.isArray(fornecedor.categories) 
              ? fornecedor.categories[0]?.name 
              : (fornecedor.categories as any)?.name

            return {
              ...item,
              nome: fornecedor.business_name,
              categoria: nomeCategoria || "Curadoria DIVINE",
              imagem: fornecedor.cover_image_url || item.imagem
            }
          }
          return item
        })
        setAcervo(novaGrade)
      }
    }
    
    fetchCuradoria()
  }, [])

  return (
    <div className="min-h-screen bg-alabastro text-onix">
      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-linha bg-alabastro/85 backdrop-blur-md">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 items-center px-5 py-4 md:grid-cols-3 md:px-10">
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#manifesto" className="text-[11px] font-light uppercase tracking-[0.25em] text-onix/60 transition-colors duration-300 hover:text-bronze">
              O Manifesto
            </a>
            <a href="#acervo" className="text-[11px] font-light uppercase tracking-[0.25em] text-onix/60 transition-colors duration-300 hover:text-bronze">
              O Acervo
            </a>
          </nav>

          <a href="#" className="flex items-center justify-start gap-3 md:justify-center">
            <Image src="/images/divine-seal.png" alt="Selo DIVINE" width={72} height={72} className="h-16 w-16 object-contain" />
            <span className="font-serif text-xl font-light tracking-[0.35em] text-onix md:text-2xl">
              DIVINE
            </span>
          </a>

          <div className="flex items-center justify-end">
            <a href="#" className="group relative text-[11px] font-light uppercase tracking-[0.25em] text-onix transition-colors duration-300 hover:text-bronze">
              Submeter Portfólio
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-bronze transition-all duration-300 group-hover:w-full" />
            </a>
          </div>
        </div>
      </header>

      {/* HERO EDITORIAL */}
      <section className="relative px-3 pb-20 pt-24 md:px-4 md:pt-28">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid grid-cols-2 gap-2 md:h-[82vh] md:grid-cols-12 md:grid-rows-2">
            <div className="relative col-span-1 aspect-[3/4] overflow-hidden md:col-span-3 md:row-span-2 md:aspect-auto bg-onix/10">
              <Image src="https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=800&auto=format&fit=crop" alt="Alta-costura" fill priority className="object-cover" />
            </div>
            <div className="relative col-span-1 aspect-[3/4] overflow-hidden md:col-span-6 md:row-span-2 md:aspect-auto bg-onix/10">
              <Image src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200&auto=format&fit=crop" alt="Rito" fill priority className="object-cover" />
              <div className="absolute inset-0 bg-onix/20" />
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
                <p className="mb-6 text-[11px] font-light uppercase tracking-[0.5em] text-alabastro/90 drop-shadow">
                  Curadoria Nupcial · Centro-Oeste Mineiro
                </p>
                <h1 className="text-balance font-serif text-5xl font-light leading-[0.98] tracking-tight text-alabastro [text-shadow:0_2px_18px_rgba(0,0,0,0.6)] lg:text-6xl xl:text-7xl">
                  Simplesmente <span className="italic text-bronze">impecável</span>.
                </h1>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="mt-10 px-3 md:hidden">
          <p className="mb-4 text-[10px] font-light uppercase tracking-[0.4em] text-bronze">
            Curadoria Nupcial · Centro-Oeste Mineiro
          </p>
          <h1 className="text-balance font-serif text-5xl font-light leading-[0.98] tracking-tight text-onix">
            Simplesmente <span className="italic text-bronze">impecável</span>.
          </h1>
        </div>
      </section>

      {/* ACERVO */}
      <section id="acervo" className="scroll-mt-24 px-3 py-20 md:px-4 md:py-28">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-10 flex items-end justify-between border-t border-linha px-2 pt-6 md:mb-12">
            <div>
              <p className="text-[10px] font-light uppercase tracking-[0.4em] text-bronze">
                Exposição Permanente
              </p>
              <h2 className="mt-3 font-serif text-4xl font-light tracking-tight text-onix md:text-5xl">
                O Acervo
              </h2>
            </div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="grid grid-cols-1 gap-2 md:auto-rows-[300px] md:grid-cols-12"
          >
            {acervo.map((item, i) =>
              item.tipo === "obra" ? (
                <div key={`${item.nome}-${i}`} className={item.span}>
                  <ObraCard nome={item.nome} categoria={item.categoria} imagem={item.imagem} index={i + 1} />
                </div>
              ) : (
                <div key={`${item.titulo}-${item.indice}`} className={item.span}>
                  <CategoriaCard titulo={item.titulo} indice={item.indice} variante={item.variante} />
                </div>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* MANIFESTO */}
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
                Para os noivos, entregamos a paz de uma escolha segura e refinada. Para os talentos, o espaço que a excelência deles merece.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-onix text-alabastro">
        <div className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-28">
          <div className="flex flex-col gap-16 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-4">
                <Image 
                  src="/images/divine-seal.png" 
                  alt="Selo DIVINE" 
                  width={96} 
                  height={96} 
                  className="h-16 w-16 object-contain md:h-20 md:w-20 invert opacity-90" 
                />
                <span className="font-serif text-4xl font-light tracking-[0.35em] md:text-5xl">
                  DIVINE
                </span>
              </div>
              <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-alabastro/60">
                Curadoria nupcial para quem compreende que o extraordinário não se improvisa — se seleciona.
              </p>
            </div>
          </div>
          <div className="mt-20 flex flex-col gap-4 border-t border-alabastro/10 pt-8 text-[10px] font-light uppercase tracking-[0.25em] text-alabastro/40 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} DIVINE Curadoria Nupcial</span>
            <span>Simplesmente impecável</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

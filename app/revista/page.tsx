"use client"

import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/Header"

type Editorial = {
  section: string
  title: string
  excerpt: string
  image: string
  href: string
  sponsored?: boolean
  sponsor?: string
}

const novidades: Editorial[] = [
  {
    section: "Mercado nupcial",
    title: "O que muda quando a escolha começa pela curadoria",
    excerpt: "Uma leitura sobre confiança, repertório e decisões mais tranquilas para o grande dia.",
    image: "/images/hero-ambience.webp",
    href: "#caderno",
  },
  {
    section: "Tendências",
    title: "Celebrações com identidade: menos excesso, mais intenção",
    excerpt: "Os sinais que apontam para casamentos mais autorais, afetivos e conectados ao território.",
    image: "/images/hero-rito.webp",
    href: "#caderno",
  },
  {
    section: "Acervo em foco",
    title: "Como reconhecer uma assinatura profissional",
    excerpt: "Qualidade consistente, experiência e cuidado também fazem parte da estética de uma celebração.",
    image: "/images/hero-detail.webp",
    href: "#segmentos",
  },
]

const segmentos: Editorial[] = [
  {
    section: "Fotografia Documental",
    title: "A memória começa antes do clique",
    excerpt: "Um olhar sobre presença, narrativa e os detalhes que não se repetem.",
    image: "/images/acervo-fotografia.webp",
    href: "#segmentos",
  },
  {
    section: "Alta Gastronomia",
    title: "Uma experiência que também se conta à mesa",
    excerpt: "Ingredientes, serviço e identidade para receber com intenção.",
    image: "/images/acervo-gastronomia.webp",
    href: "#segmentos",
  },
  {
    section: "Conteúdo patrocinado",
    title: "Quando a celebração encontra uma assinatura floral",
    excerpt: "Material apresentado por uma marca do Acervo DIVINE.",
    image: "/images/acervo-floral.webp",
    href: "/diretorio",
    sponsored: true,
    sponsor: "Marca parceira do Acervo DIVINE",
  },
]

function Card({ item, featured = false }: { item: Editorial; featured?: boolean }) {
  return (
    <Link href={item.href} className={`group block overflow-hidden border border-linha bg-white ${featured ? "md:col-span-2" : ""}`}>
      <div className={`relative overflow-hidden ${featured ? "aspect-[16/8]" : "aspect-[4/3]"}`}>
        <Image src={item.image} alt="" fill sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} className="object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-onix/10 transition group-hover:bg-onix/0" />
      </div>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] uppercase tracking-[0.28em] text-bronze">{item.section}</p>
          {item.sponsored && <span className="text-[10px] uppercase tracking-[0.18em] text-onix/50">Patrocinado</span>}
        </div>
        <h3 className="mt-4 font-serif text-3xl font-light leading-tight md:text-4xl">{item.title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-onix/65">{item.excerpt}</p>
        {item.sponsor && <p className="mt-5 text-xs text-onix/50">{item.sponsor}</p>}
        <span className="mt-6 inline-block text-[10px] uppercase tracking-[0.25em] text-onix underline-offset-4 group-hover:underline">Ler matéria</span>
      </div>
    </Link>
  )
}

export default function Revista() {
  return (
    <main className="min-h-screen bg-alabastro text-onix">
      <Header />
      <section className="px-5 pb-16 pt-36 md:pb-24 md:pt-48">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[10px] uppercase tracking-[0.4em] text-bronze">Editorial DIVINE</p>
          <h1 className="mt-5 max-w-4xl font-serif text-5xl font-light leading-[0.95] md:text-7xl">Revista DIVINE</h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-onix/70 md:text-lg">Notícias, repertório e novidades do universo nupcial. Um espaço para descobrir ideias, profissionais e movimentos que ajudam a construir celebrações com significado.</p>
        </div>
      </section>

      <section id="caderno" className="scroll-mt-24 border-t border-linha px-5 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10 flex items-end justify-between gap-6"><div><p className="text-[10px] uppercase tracking-[0.35em] text-bronze">Atualidades</p><h2 className="mt-3 font-serif text-4xl font-light md:text-5xl">Caderno DIVINE</h2></div><span className="hidden text-xs uppercase tracking-[0.2em] text-onix/45 md:block">Mercado · ideias · repertório</span></div>
          <div className="grid gap-4 md:grid-cols-3">{novidades.map((item) => <Card key={item.title} item={item} />)}</div>
        </div>
      </section>

      <section id="segmentos" className="scroll-mt-24 bg-onix px-5 py-16 text-alabastro md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10"><p className="text-[10px] uppercase tracking-[0.35em] text-bronze">Por segmento</p><h2 className="mt-3 font-serif text-4xl font-light md:text-5xl">Escolhas com contexto</h2><p className="mt-5 max-w-xl text-sm leading-relaxed text-alabastro/65">Conteúdos organizados pelas especialidades que formam o Acervo DIVINE.</p></div>
          <div className="grid gap-4 md:grid-cols-3">{segmentos.map((item) => <Card key={item.title} item={item} />)}</div>
        </div>
      </section>

      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] border border-bronze/40 bg-bronze/10 p-8 md:flex md:items-center md:justify-between md:gap-12 md:p-12">
          <div><p className="text-[10px] uppercase tracking-[0.35em] text-bronze">Para marcas do Acervo</p><h2 className="mt-3 font-serif text-3xl font-light md:text-4xl">Conteúdo com contexto e transparência</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-onix/70">Fornecedores selecionados podem apresentar projetos, novidades e experiências em espaços editoriais patrocinados. Todo material comercial será identificado e não altera a Chancela DIVINE.</p></div>
          <a href="mailto:divinecuradorianupcial@gmail.com?subject=Conteúdo patrocinado na Revista DIVINE" className="mt-7 inline-block shrink-0 rounded-lg bg-onix px-6 py-4 text-[11px] uppercase tracking-[0.2em] text-alabastro md:mt-0">Falar com a curadoria</a>
        </div>
      </section>
    </main>
  )
}

import type { ReactNode } from "react"
import Link from "next/link"
import { Header } from "@/components/Header"

export type InstitutionalSection = { id: string; title: string; content: ReactNode }

export function InstitutionalPage({ title, subtitle, summary, sections }: {
  title: string
  subtitle: string
  summary: string
  sections: InstitutionalSection[]
}) {
  return (
    <div className="min-h-screen bg-alabastro text-onix">
      <Header />
      <main id="conteudo" className="mx-auto max-w-5xl px-5 pb-20 pt-32 sm:px-8 md:pt-40">
        <Link href="/" className="text-sm text-onix/70 underline underline-offset-4 hover:text-bronze">Voltar ao início</Link>
        <p className="mt-10 text-xs uppercase tracking-[0.2em] text-bronze">Transparência DIVINE</p>
        <h1 className="mt-4 font-serif text-4xl sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-onix/80">{subtitle}</p>
        <p className="mt-4 text-xs text-onix/60">Versão de 11 de setembro de 2026</p>
        <p className="mt-8 border-l-2 border-bronze bg-white/60 p-5 text-base leading-relaxed sm:p-6">{summary}</p>
        <div className="mt-12 grid gap-12 md:grid-cols-[210px_minmax(0,1fr)]">
          <nav aria-label="Nesta página" className="self-start border-b border-onix/10 pb-6 md:sticky md:top-28 md:border-b-0">
            <p className="mb-4 text-xs uppercase tracking-widest text-onix/60">Nesta página</p>
            <ol className="space-y-3">
              {sections.map((section, index) => <li key={section.id}>
                <a href={`#${section.id}`} className="block py-1 text-sm leading-relaxed underline-offset-4 hover:text-bronze hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze">
                  <span className="mr-2 text-bronze">{String(index + 1).padStart(2, "0")}</span>{section.title}
                </a>
              </li>)}
            </ol>
          </nav>
          <div className="min-w-0 space-y-10">
            {sections.map(section => <section key={section.id} id={section.id} className="scroll-mt-32 border-b border-onix/10 pb-10 last:border-b-0">
              <h2 className="font-serif text-3xl">{section.title}</h2>
              <div className="mt-4 space-y-4 break-words text-base leading-7 text-onix/80 [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">{section.content}</div>
            </section>)}
          </div>
        </div>
      </main>
      <footer className="border-t border-onix/10 px-5 py-10">
        <nav aria-label="Páginas institucionais" className="mx-auto flex max-w-5xl flex-wrap gap-x-8 gap-y-5 text-sm">
          <Link href="/a-curadoria" className="underline underline-offset-4">A Curadoria · Termos de uso</Link>
          <Link href="/privacidade" className="underline underline-offset-4">Privacidade</Link>
          <Link href="/duvidas" className="underline underline-offset-4">Dúvidas frequentes</Link>
          <Link href="/diretorio" className="underline underline-offset-4">Conhecer o Acervo</Link>
        </nav>
      </footer>
    </div>
  )
}

export function InstitutionalContact() {
  return <a href="mailto:divinecuradorianupcial@gmail.com" className="break-all">divinecuradorianupcial@gmail.com</a>
}

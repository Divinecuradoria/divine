"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

const acervo = [
  {
    categoria: "Alta Gastronomia",
    nome: "Maison Solène",
    imagem: "/images/acervo-gastronomia.png",
  },
  {
    categoria: "Design Floral",
    nome: "Atelier Verdant",
    imagem: "/images/acervo-floral.png",
  },
  {
    categoria: "Alta Costura",
    nome: "Casa Aurelia",
    imagem: "/images/acervo-atelier.png",
  },
  {
    categoria: "Locação & Cenografia",
    nome: "Domaine Lumière",
    imagem: "/images/acervo-locacao.png",
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER — Ghost Navigation */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 md:px-12 md:py-8">
          <a
            href="#manifesto"
            className="text-[11px] font-light uppercase tracking-[0.25em] text-foreground/70 transition-colors duration-300 hover:text-[#966a38]"
          >
            O Manifesto
          </a>

          <span className="font-serif text-2xl font-light tracking-[0.35em] text-foreground md:text-3xl">
            DIVINE
          </span>

          <a
            href="#acervo"
            className="group relative text-[11px] font-light uppercase tracking-[0.25em] text-foreground transition-colors duration-300 hover:text-[#966a38]"
          >
            Acessar Acervo
            <span className="absolute -bottom-1 left-0 h-px w-full bg-current transition-all duration-300 group-hover:bg-[#966a38]" />
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="flex min-h-[90vh] flex-col items-center justify-center px-6 pt-32 pb-16 md:px-12">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-5xl text-balance text-center font-serif text-5xl font-light leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
        >
          A seleção definitiva para o seu{" "}
          <span className="italic text-[#966a38]">rito</span>.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 w-full max-w-[1400px]"
        >
          <div className="relative aspect-[2.39/1] w-full overflow-hidden border border-[#e8e5df]">
            <Image
              src="/images/hero-rito.png"
              alt="Composição de curadoria nupcial em seda e flores sobre superfície alabastro"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* MANIFESTO */}
      <section
        id="manifesto"
        className="scroll-mt-24 px-6 py-40 md:px-12 md:py-56"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="mb-10 text-[11px] font-light uppercase tracking-[0.4em] text-[#966a38]">
            O Manifesto
          </p>
          <p className="text-pretty font-serif text-3xl font-light leading-[1.35] text-foreground sm:text-4xl md:text-5xl">
            O tempo desacelera diante do que é construído com intenção.
            Rejeitamos a mediocridade. Reunimos os artesãos da memória.
          </p>
        </motion.div>
      </section>

      {/* ACERVO */}
      <section id="acervo" className="scroll-mt-24 px-6 pb-40 md:px-12 md:pb-56">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-24 border-t border-[#e8e5df] pt-8">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-2xl font-light tracking-wide text-foreground md:text-3xl">
                O Acervo
              </h2>
              <span className="text-[11px] font-light uppercase tracking-[0.3em] text-foreground/50">
                Fornecedores Fundadores
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-32 md:gap-48">
            {acervo.map((item, i) => {
              const alinhamento = i % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
              return (
                <motion.article
                  key={item.nome}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-120px" }}
                  variants={fadeUp}
                  className={`group w-full md:w-[62%] ${alinhamento}`}
                >
                  <a href="#" className="block">
                    <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#e8e5df]">
                      <Image
                        src={item.imagem || "/placeholder.svg"}
                        alt={`${item.nome} — ${item.categoria}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 62vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>

                    <div className="mt-8">
                      <p className="text-[10px] font-light uppercase tracking-[0.4em] text-[#966a38]">
                        {item.categoria}
                      </p>
                      <h3 className="mt-4 font-serif text-4xl font-light leading-none text-foreground md:text-5xl">
                        {item.nome}
                      </h3>
                      <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-light uppercase tracking-[0.25em] text-foreground transition-colors duration-300 group-hover:text-[#966a38]">
                        Explorar
                        <ArrowUpRight
                          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          strokeWidth={1}
                        />
                      </span>
                    </div>
                  </a>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      {/* FOOTER — Chancelaria */}
      <footer className="bg-[#121212] text-[#faf8f5]">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-12 md:py-32">
          <div className="flex flex-col gap-16 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-serif text-4xl font-light tracking-[0.35em] md:text-5xl">
                DIVINE
              </span>
              <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-[#faf8f5]/60">
                Curadoria nupcial para quem compreende que o extraordinário
                não se improvisa — se seleciona.
              </p>
            </div>

            <nav className="flex flex-col gap-4">
              <a
                href="#"
                className="group inline-flex items-center gap-2 text-[11px] font-light uppercase tracking-[0.25em] text-[#faf8f5]/70 transition-colors duration-300 hover:text-[#966a38]"
              >
                Submeter Portfólio
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1} />
              </a>
              <a
                href="#"
                className="group inline-flex items-center gap-2 text-[11px] font-light uppercase tracking-[0.25em] text-[#faf8f5]/70 transition-colors duration-300 hover:text-[#966a38]"
              >
                Acesso Restrito
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1} />
              </a>
            </nav>
          </div>

          <div className="mt-24 flex flex-col gap-4 border-t border-[#faf8f5]/10 pt-8 text-[10px] font-light uppercase tracking-[0.25em] text-[#faf8f5]/40 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} DIVINE Curadoria Nupcial</span>
            <span>Silent Luxury — Feito com intenção</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

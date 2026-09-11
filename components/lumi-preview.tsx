"use client"

import { useState } from "react"
import { ArrowUpRight, Check, Sparkles } from "lucide-react"

const sinais = [
  { numero: "01", titulo: "Entender", texto: "Preferências, contexto e o que vocês querem sentir." },
  { numero: "02", titulo: "Cruzar", texto: "Serviços, região e faixa de investimento — com leveza." },
  { numero: "03", titulo: "Indicar", texto: "Possibilidades compatíveis, sempre sob confirmação de vocês." },
]

const escolhas = ["Leve e natural", "Íntimo e acolhedor", "Elegante e marcante"]

export function LumiPreview() {
  const [aberta, setAberta] = useState(false)

  return (
    <section aria-labelledby="lumi-titulo" className="overflow-hidden rounded-2xl border border-[#b88752]/45 bg-onix text-alabastro shadow-[0_18px_60px_rgba(22,18,14,0.12)]">
      <div className="relative isolate overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#b88752]/15 blur-3xl" />
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8b184]">LUMI · prévia da experiência</p>
            <h2 id="lumi-titulo" className="mt-4 max-w-lg font-serif text-3xl leading-tight sm:text-4xl">Uma nova forma de escolher.</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-alabastro/75 sm:text-base">
              A LUMI está sendo desenhada para transformar desejos em caminhos possíveis: uma assessora nupcial inteligente, cuidadosa e alinhada ao jeito de cada casal.
            </p>
          </div>
          <div aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#d8b184]/45 bg-[#d8b184]/10 text-[#e3c299] shadow-[0_0_0_8px_rgba(216,177,132,0.06)]">
            <Sparkles className="h-7 w-7" strokeWidth={1.2} />
          </div>
        </div>

        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          {sinais.map((sinal) => (
            <div key={sinal.numero} className="rounded-xl border border-alabastro/15 bg-alabastro/[0.045] p-4">
              <p className="text-[10px] tracking-[0.22em] text-[#d8b184]">{sinal.numero}</p>
              <h3 className="mt-3 font-serif text-xl">{sinal.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-alabastro/65">{sinal.texto}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-8 rounded-xl border border-[#d8b184]/35 bg-[#f1e9dc] p-5 text-onix sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#8a6038]">Prévia conceitual</p>
            <span className="rounded-full border border-[#8a6038]/25 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#8a6038]">Em desenvolvimento</span>
          </div>
          <p className="mt-5 max-w-xl font-serif text-2xl leading-snug sm:text-3xl">“O que vocês querem sentir quando tudo estiver pronto?”</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {escolhas.map((escolha) => (
              <span key={escolha} className="rounded-full border border-onix/15 bg-white/45 px-3 py-2 text-xs text-onix/75">{escolha}</span>
            ))}
          </div>
          <button type="button" aria-expanded={aberta} onClick={() => setAberta((valor) => !valor)} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-onix px-4 py-3 text-sm text-alabastro transition hover:bg-onix/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6038] focus-visible:ring-offset-2">
            {aberta ? "Ocultar visão" : "Ver como funcionaria"}
            {aberta ? <Check className="h-4 w-4" aria-hidden="true" /> : <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
          </button>
          {aberta && (
            <p role="status" className="mt-4 max-w-xl border-t border-onix/15 pt-4 text-sm leading-relaxed text-onix/75">
              A LUMI usará as escolhas do Passaporte para organizar possibilidades e explicar os próximos passos. Nenhum contato será enviado a fornecedores sem a confirmação de vocês.
            </p>
          )}
        </div>

        <p className="relative mt-6 max-w-2xl text-xs leading-relaxed text-alabastro/55">
          A experiência completa será apresentada futuramente no Passaporte, com condições próprias. Esta prévia não altera seu cadastro nem compartilha suas preferências.
        </p>
      </div>
    </section>
  )
}

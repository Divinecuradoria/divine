export function LumiHomeCard() {
  return (
    <section id="lumi" aria-labelledby="lumi-titulo" className="scroll-mt-28 px-5 pb-16 md:px-10 md:pb-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative overflow-hidden rounded-2xl border border-[#b88752]/45 bg-onix px-6 py-10 text-alabastro shadow-[0_18px_60px_rgba(22,18,14,0.12)] sm:px-10 sm:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#b88752]/15 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8b184]">LUMI · em breve</p>
              <h2 id="lumi-titulo" className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
                Clareza para escolher. Presença para acompanhar.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-alabastro/75 sm:text-base">
                Estamos desenhando uma nova experiência do Passaporte: uma agente de assessoria nupcial que cruza desejos, serviços e território para organizar possibilidades mais próximas de vocês.
              </p>
              <p className="mt-4 max-w-xl text-xs leading-relaxed text-alabastro/55">
                A LUMI está em desenvolvimento. Esta apresentação é uma visão do que vem pela frente — sem cadastro adicional e sem contato automático com fornecedores.
              </p>
            </div>
            <div className="flex lg:justify-end">
              <span className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d8b184]/45 px-4 py-3 text-sm text-[#e3c299]">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#d8b184]" />
                Em construção
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

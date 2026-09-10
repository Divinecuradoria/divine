import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/Header"

const guias = [
  {
    id: "escolher-com-criterio",
    section: "Começar com clareza",
    title: "O que observar antes de escolher um profissional",
    excerpt: "Portfólio, atendimento e escopo: três pontos para uma conversa mais produtiva.",
    image: "/images/hero-ambience.webp",
    paragraphs: [
      "Antes de comparar nomes, descrevam o que precisam contratar e o que mais importa para vocês. O tamanho da celebração, o local e a proposta do serviço ajudam a tornar a conversa concreta. Se alguma decisão ainda estiver em aberto, contem isso ao profissional.",
      "Ao conhecer um portfólio, procurem exemplos completos e trabalhos em condições parecidas com as do casamento. Uma imagem de destaque pode despertar interesse; uma sequência de entregas ajuda a entender a consistência e a assinatura de quem a produziu.",
      "Na conversa, peçam clareza sobre o que está incluído, quem realizará o serviço, os prazos e as condições que precisam ser confirmadas. Guardem as respostas junto das suas referências. A Chancela DIVINE é um reconhecimento editorial; a proposta e os compromissos de cada contratação devem ser combinados diretamente com o profissional.",
    ],
    questions: ["Esse trabalho se aproxima do que procuramos?", "O que está incluído na proposta?", "Quais informações ainda precisamos confirmar?"],
  },
  {
    id: "prioridades-do-casal",
    section: "O casamento de vocês",
    title: "Transformem suas ideias em prioridades",
    excerpt: "Um exercício breve para entender o que merece mais atenção na celebração.",
    image: "/images/hero-rito.webp",
    paragraphs: [
      "Cada pessoa do casal pode começar escrevendo três coisas que gostaria de viver ou lembrar do casamento. Pode ser uma conversa tranquila com os convidados, uma pista animada ou a presença de pessoas queridas. Não é necessário começar por um estilo ou por uma lista de produtos.",
      "Compare as duas listas e escolham juntos o que é indispensável, o que seria desejável e o que pode esperar. Se houver diferenças, registrem as duas preferências antes de buscar uma solução. Esse resumo ajuda a explicar o casamento aos profissionais com mais precisão.",
      "Reúnam poucas imagens e anotem o que chamou atenção em cada uma: a luz, a atmosfera, as cores ou a maneira como as pessoas aparecem. As imagens são um ponto de partida para a conversa, não uma obrigação de reproduzir uma celebração de outra pessoa.",
    ],
    questions: ["O que queremos sentir nesse dia?", "O que é indispensável para cada um?", "O que gostamos, exatamente, nas referências que salvamos?"],
  },
  {
    id: "atendimento-regional",
    section: "Centro-Oeste Mineiro",
    title: "Cidade-base e local do casamento: o que perguntar",
    excerpt: "Entenda o atendimento regional antes de descartar uma referência de outra cidade.",
    image: "/images/acervo-gastronomia.webp",
    paragraphs: [
      "A cidade onde um profissional está sediado pode ser diferente dos lugares em que atende. Ao encontrar um trabalho que faça sentido para vocês, informem onde pretendem celebrar e perguntem se aquele local faz parte do território de atendimento.",
      "Conversem sobre deslocamento, montagem, horários e necessidades do espaço. Dependendo do serviço, acesso, energia, hospedagem ou estrutura de apoio podem fazer parte do planejamento. Peçam ao profissional que explique quais pontos se aplicam à proposta de vocês.",
      "Confirmem também a data e a capacidade de atendimento para o evento. Estar no Acervo não significa ter disponibilidade para todos os dias ou locais. Uma conversa com informações claras evita que vocês comparem propostas feitas para necessidades diferentes.",
    ],
    questions: ["Vocês atendem no local da celebração?", "Existe alguma condição de deslocamento ou estrutura?", "A data e o tamanho do evento são compatíveis com o serviço?"],
  },
]

export default function Editorial() {
  return (
    <main className="min-h-screen bg-alabastro text-onix">
      <Header />
      <section className="px-5 pb-12 pt-32 md:pb-16 md:pt-40">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-xs uppercase tracking-widest text-bronze">Ideias e escolhas</p>
          <h1 className="mt-4 font-serif text-5xl md:text-7xl">O Editorial</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-onix/80 md:text-lg">Orientação para planejar com mais clareza, reconhecer afinidades e conversar com os profissionais do seu casamento.</p>
        </div>
      </section>

      <section id="guias" aria-labelledby="guias-titulo" className="scroll-mt-28 border-t border-linha px-5 py-12 md:py-16">
        <div className="mx-auto max-w-[1200px]">
          <h2 id="guias-titulo" className="font-serif text-3xl md:text-4xl">Pequenos guias para grandes escolhas</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {guias.map(item => (
              <Link key={item.id} href={`#${item.id}`} className="group block overflow-hidden border border-linha bg-white text-onix">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={item.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.03]" />
                </div>
                <div className="p-6">
                  <p className="text-xs text-bronze">{item.section}</p>
                  <h3 className="mt-3 font-serif text-3xl leading-tight">{item.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-onix/75">{item.excerpt}</p>
                  <span className="mt-5 inline-block text-sm underline underline-offset-4">Ler o guia</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-linha px-5">
        {guias.map(item => (
          <article key={item.id} id={item.id} aria-labelledby={`${item.id}-titulo`} className="mx-auto max-w-3xl scroll-mt-28 border-b border-linha py-14 md:py-20">
            <p className="text-xs uppercase tracking-widest text-bronze">{item.section}</p>
            <h2 id={`${item.id}-titulo`} className="mt-4 font-serif text-3xl leading-tight md:text-4xl">{item.title}</h2>
            <p className="mt-4 text-sm text-onix/65">Orientação editorial · DIVINE</p>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-onix/85">
              {item.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <aside aria-label="Perguntas para levar à conversa" className="mt-8 border-l-2 border-bronze bg-bronze/5 p-6">
              <h3 className="font-medium">Para levar à conversa</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed">{item.questions.map(question => <li key={question}>{question}</li>)}</ul>
            </aside>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              <Link href="/diretorio" className="py-3 text-sm underline underline-offset-4">Conhecer as Referências</Link>
              <Link href="#guias" className="py-3 text-sm underline underline-offset-4">Voltar aos guias</Link>
            </div>
          </article>
        ))}
      </div>

      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] border border-linha bg-white p-7 md:p-10">
          <p className="text-xs uppercase tracking-widest text-bronze">Para marcas do Acervo</p>
          <h2 className="mt-3 font-serif text-3xl">Projetos que merecem ser conhecidos.</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-onix/80">Profissionais selecionados podem propor histórias, projetos e experiências para O Editorial. Propostas comerciais serão tratadas separadamente da avaliação editorial, e todo conteúdo patrocinado será identificado.</p>
          <a href="mailto:divinecuradorianupcial@gmail.com?subject=Proposta%20para%20O%20Editorial" className="mt-6 inline-block rounded-lg bg-onix px-6 py-4 text-sm text-alabastro">Apresentar uma proposta</a>
        </div>
      </section>
    </main>
  )
}

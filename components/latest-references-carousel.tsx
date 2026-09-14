"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react"

export type LatestReference = {
  id: string
  nome: string
  categoria: string
  imagem: string | null
  slug: string
}

export function LatestReferencesCarousel({ items }: { items: LatestReference[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(true)
  const [visible, setVisible] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)
  const container = useRef<HTMLDivElement>(null)
  const touchStart = useRef<number | null>(null)
  const count = items.length
  const current = count ? index % count : 0
  const automatic = count > 1 && !paused && !hovered && !focused && !reducedMotion && visible && pageVisible

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updateMotion = () => setReducedMotion(media.matches)
    const updateVisibility = () => setPageVisible(!document.hidden)
    updateMotion()
    updateVisibility()
    media.addEventListener("change", updateMotion)
    document.addEventListener("visibilitychange", updateVisibility)
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 })
    if (container.current) observer.observe(container.current)
    return () => {
      media.removeEventListener("change", updateMotion)
      document.removeEventListener("visibilitychange", updateVisibility)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!automatic) return
    const timer = window.setInterval(() => setIndex(value => (value + 1) % count), 7000)
    return () => window.clearInterval(timer)
  }, [automatic, count])

  function move(step: number) {
    if (count < 2) return
    setPaused(true)
    setIndex((current + step + count) % count)
  }

  if (!count) return null
  const item = items[current]
  const buttonClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-onix/25 px-3 text-onix hover:border-bronze focus-visible:outline-2 focus-visible:outline-bronze"

  return (
    <div ref={container} role="region" aria-roledescription="carrossel" aria-label="Novas Referências DIVINE"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false) }}>
      {count > 1 && <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-onix/70">{current + 1} de {count}</p>
        <div className="flex items-center gap-2">
          {!reducedMotion && <button type="button" className={buttonClass} onClick={() => setPaused(value => !value)}
            aria-label={paused ? "Retomar troca automática" : "Pausar troca automática"}>
            {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
          </button>}
          <button type="button" className={buttonClass} onClick={() => move(-1)} aria-label="Referência anterior"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
          <button type="button" className={buttonClass} onClick={() => move(1)} aria-label="Próxima Referência"><ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </div>}
      <div aria-live={automatic ? "off" : "polite"} aria-atomic="true"
        onTouchStart={event => { touchStart.current = event.touches.length === 1 ? event.touches[0].clientX : null; setPaused(true) }}
        onTouchCancel={() => { touchStart.current = null }}
        onTouchEnd={event => {
          const start = touchStart.current
          touchStart.current = null
          if (start === null || !event.changedTouches.length) return
          const difference = start - event.changedTouches[0].clientX
          if (Math.abs(difference) > 50) move(difference > 0 ? 1 : -1)
        }}
        className="touch-pan-y">
        <article role="group" aria-roledescription="slide" aria-label={`${current + 1} de ${count}: ${item.nome}`}
          className="grid overflow-hidden rounded-xl border border-linha bg-white md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden bg-onix md:aspect-[4/5]">
            {item.imagem ? <Image key={item.imagem} src={item.imagem} alt={item.nome} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              : <div className="flex h-full items-center justify-center font-serif text-7xl text-alabastro" aria-hidden="true">D</div>}
          </div>
          <div className="flex min-w-0 flex-col justify-center p-6 md:p-10">
            <p className="text-xs uppercase tracking-widest text-bronze">Referência DIVINE</p>
            <p className="mt-6 text-sm leading-relaxed text-onix/70">{item.categoria}</p>
            <h3 className="mt-3 break-words font-serif text-3xl md:text-5xl">{item.nome}</h3>
            <p className="mt-5 text-base leading-relaxed text-onix/75">Uma assinatura para conhecer. Descubra o trabalho, a proposta e os detalhes desta Referência do nosso Acervo.</p>
            <Link href={`/diretorio/${encodeURIComponent(item.slug)}`} aria-label={`Conhecer o trabalho de ${item.nome}`}
              className="mt-8 inline-flex min-h-11 items-center gap-3 self-start border-b border-bronze py-3 text-sm focus-visible:outline-2 focus-visible:outline-bronze">
              Conhecer o trabalho <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </article>
      </div>
      {count > 1 && <div className="mt-4 flex flex-wrap justify-center gap-1">
        {items.map((reference, position) => <button key={reference.id} type="button"
          onClick={() => { setPaused(true); setIndex(position) }}
          aria-label={`Mostrar ${reference.nome}`} aria-current={position === current ? "true" : undefined}
          className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-bronze">
          <span aria-hidden="true" className={`h-2 rounded-full ${position === current ? "w-6 bg-bronze" : "w-2 bg-onix/25"}`} />
        </button>)}
      </div>}
    </div>
  )
}

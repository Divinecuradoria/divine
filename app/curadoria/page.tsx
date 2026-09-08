"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/Header"
import { getSupabase } from "@/lib/supabase"
import { DIMENSIONS, STATES, fieldClass } from "@/lib/curadoria"

type Application = {
  id: string; brand_name: string; category: string; base_city: string; service_area: string;
  portfolio_url: string; signature: string; years_active: number; weddings_count: number;
  reference_one: string; reference_two: string; notes: string; status: string;
}
type Review = { id: string; decision: string; justification: string; weighted_score: number; created_at: string }
export default function Curadoria() {
  const [allowed, setAllowed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [items, setItems] = useState<Application[]>([])
  const [selected, setSelected] = useState<Application | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [published, setPublished] = useState(false)
  async function refresh() {
    const db = getSupabase()
    if (!db) throw new Error()
    const result = await db.from("divine_applications").select("*").order("created_at", { ascending: false })
    if (result.error) throw result.error
    setItems(result.data)
  }
  useEffect(() => {
    async function load() {
      const db = getSupabase()
      if (!db) throw new Error()
      const result = await db.rpc("divine_is_reviewer")
      if (result.error) throw result.error
      if (!result.data) { setMessage("Esta área é reservada à Curadoria DIVINE."); return }
      setAllowed(true); await refresh()
    }
    load().catch(() => setMessage("Não foi possível abrir a área de curadoria. Confira seu acesso e tente novamente."))
  }, [])
  async function choose(a: Application) {
    setBusy(true); setMessage(""); setSelected(null); setReviews([]); setPublished(false)
    try {
      const db = getSupabase()!
      const [history, publication] = await Promise.all([
        db.from("divine_reviews").select("id,decision,justification,weighted_score,created_at").eq("application_id",a.id).order("created_at",{ascending:false}),
        db.from("divine_publications").select("application_id").eq("application_id",a.id).maybeSingle(),
      ])
      if (history.error || publication.error) throw new Error()
      setReviews(history.data); setPublished(!!publication.data); setSelected(a)
    } catch { setMessage("Não foi possível carregar a ficha. Tente novamente.") }
    finally { setBusy(false) }
  }
  async function review(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || busy) return
    const f = new FormData(event.currentTarget)
    setBusy(true); setMessage("")
    try {
      const { error } = await getSupabase()!.rpc("divine_review", {
        p_id:selected.id, p_scores:DIMENSIONS.map(d=>Number(f.get(d.key))),
        p_decision:f.get("decision"), p_justification:String(f.get("justification")).trim(),
      })
      if (error) throw error
      setSelected(null); await refresh(); setMessage("Decisão registrada. A publicação exige uma ação separada na ficha aprovada.")
    } catch { setMessage("Não foi possível registrar a decisão. Confira os campos e tente novamente.") }
    finally { setBusy(false) }
  }
  async function publish(value: boolean) {
    if (!selected || busy) return
    setBusy(true); setMessage("")
    try {
      const { error } = await getSupabase()!.rpc("divine_publish", {p_id:selected.id,p_publish:value})
      if (error) throw error
      setPublished(value); setMessage(value ? "Referência publicada. Confira a página pública abaixo." : "Publicação retirada.")
    } catch { setMessage("Não foi possível alterar a publicação. Atualize a ficha e tente novamente.") }
    finally { setBusy(false) }
  }
  return <main className="min-h-screen bg-alabastro px-5 pb-24 pt-32 text-onix"><Header /><div className="mx-auto max-w-5xl">
    <h1 className="font-serif text-4xl">Curadoria DIVINE</h1><p className="mt-4">Avaliações privadas. A decisão editorial não depende de contratação comercial.</p>
    {message && <p role="status" className="my-6 rounded-lg border border-linha p-4">{message}</p>}
    {!allowed ? <Link className="mt-6 inline-block underline" href="/entrar?next=/curadoria">Entrar com minha conta</Link> : <div className="mt-8 grid gap-8 md:grid-cols-[260px_1fr]">
      <nav aria-label="Candidaturas" className="space-y-3">{!items.length && <p>Nenhuma candidatura recebida.</p>}{items.map(a=><button disabled={busy} key={a.id} onClick={()=>choose(a)} aria-pressed={selected?.id===a.id} className="block w-full rounded-lg border border-linha p-4 text-left disabled:opacity-50"><span className="block font-serif text-xl">{a.brand_name}</span><span className="text-sm">{STATES[a.status]}</span></button>)}</nav>
      {selected ? <section key={selected.id}><h2 className="font-serif text-3xl">{selected.brand_name}</h2>
        <p className="mt-3">{selected.category} · {selected.base_city}</p><p className="mt-3">Atuação: {selected.service_area}</p>
        <a href={selected.portfolio_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block underline">Ver portfólio</a>
        <p className="mt-4 whitespace-pre-wrap">{selected.signature}</p><p className="mt-4 text-sm">{selected.years_active} anos de atuação · aproximadamente {selected.weddings_count} casamentos</p>
        <p className="mt-4 text-sm">Referências: {selected.reference_one}; {selected.reference_two}</p><p className="mt-3 whitespace-pre-wrap text-sm">{selected.notes}</p>
        <form onSubmit={review} className="mt-8"><fieldset disabled={busy} className="space-y-5"><legend className="mb-4 font-serif text-2xl">Apreciação editorial</legend>
          <p className="text-sm">Pontue somente após verificar as evidências. As notas não concedem aprovação automaticamente. Uma nova decisão retira a publicação anterior.</p>
          {DIMENSIONS.map(d=><label key={d.key} className="block text-sm">{d.label} — {d.weight}%<select required name={d.key} defaultValue="" className={fieldClass}><option value="" disabled>Não verificado</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>)}
          <label className="block text-sm">Decisão<select required name="decision" defaultValue="" className={fieldClass}><option value="" disabled>Selecione</option>{["approved","observation","declined"].map(s=><option key={s} value={s}>{STATES[s]}</option>)}</select></label>
          <label className="block text-sm">Justificativa interna (até 300 caracteres)<textarea name="justification" required maxLength={300} rows={3} className={fieldClass} /></label>
          <button className="rounded-lg bg-onix px-6 py-3 text-alabastro">Registrar decisão</button>
        </fieldset></form>
        {selected.status === "approved" && <div className="mt-8 border-t border-linha pt-6"><h3 className="font-serif text-2xl">Publicação</h3><p className="mt-3 text-sm">A página pública mostra apenas nome, categoria, território, portfólio e assinatura. O reconhecimento tem validade de um ano a partir da avaliação. Republicar não renova a chancela.</p>
          <button disabled={busy} onClick={()=>publish(!published)} className="mt-4 rounded-lg border border-onix px-6 py-3">{published ? "Retirar publicação" : "Publicar Referência"}</button>
          {published && <Link className="ml-4 inline-block underline" href={`/referencia?id=${selected.id}`}>Ver página pública</Link>}</div>}
        <h3 className="mt-8 font-serif text-2xl">Histórico interno</h3>{reviews.map(r=><div className="mt-4 border-t border-linha pt-4" key={r.id}><p>{STATES[r.decision]} · {Number(r.weighted_score).toFixed(2)}/5</p><p className="mt-2 text-sm">{r.justification}</p><p className="mt-2 text-sm">{new Date(r.created_at).toLocaleString("pt-BR")}</p></div>)}
      </section> : <p>Selecione uma candidatura para avaliar.</p>}
    </div>}
  </div></main>
}

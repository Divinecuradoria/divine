"use client"

import { useEffect, useState } from "react"
import { SERVICE_OPTIONS, uniqueServices } from "@/lib/supplier-profile"
import { changeService, serviceKey, validateChoices, type ServiceChoice } from "@/lib/passport-services"
import { getSupabase, ACCESS_UNAVAILABLE } from "@/lib/supabase"

export function PassportServices({ userId }: { userId: string }) {
  const [choices, setChoices] = useState<ServiceChoice[]>([])
  const [extras, setExtras] = useState<Record<string, string[]>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setReady(false)
    setError("")
    async function load() {
      const db = getSupabase()
      if (!db) throw new Error(ACCESS_UNAVAILABLE)
      const { data, error } = await db.from("couple_service_preferences").select("selections").eq("user_id", userId).maybeSingle()
      if (error) throw error
      const saved = data?.selections ?? []
      if (!validateChoices(saved)) throw new Error("invalid_preferences")
      if (active) { setChoices(saved); setExtras({}); setDrafts({}); setDirty(false); setReady(true) }
    }
    load().catch(() => { if (active) setError("Não foi possível carregar suas escolhas. Tente novamente; os dados do Passaporte continuam disponíveis abaixo.") })
    return () => { active = false }
  }, [userId, attempt])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  function edit(next: ServiceChoice[]) {
    setChoices(next); setDirty(true); setMessage(""); setError("")
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!ready || busy) return
    if (Object.values(drafts).some(value => value.trim())) { setError("Adicionem ou apaguem o texto em Outros serviços personalizados antes de salvar."); return }
    if (!validateChoices(choices)) { setError("Usem até 200 serviços, com até 120 caracteres cada."); return }
    setBusy(true); setMessage(""); setError("")
    try {
      const db = getSupabase()
      if (!db) throw new Error(ACCESS_UNAVAILABLE)
      const auth = await db.auth.getUser()
      if (auth.error || auth.data.user?.id !== userId) throw new Error("session")
      const { data, error } = await db.from("couple_service_preferences").upsert({ user_id: userId, selections: choices }, { onConflict: "user_id" }).select("user_id").single()
      if (error || !data) throw error || new Error("not_saved")
      setDirty(false); setMessage("Escolhas salvas. Vocês podem atualizá-las conforme o casamento avança.")
    } catch { setError("Não foi possível salvar suas escolhas. Elas continuam nesta tela. Confiram o acesso à conta e tentem novamente.") }
    finally { setBusy(false) }
  }

  const wanted = choices.filter(item => item.status === "wanted").length
  const contracted = choices.filter(item => item.status === "contracted").length
  const priorities = choices.filter(item => item.priority).length
  const categories = uniqueServices([...Object.keys(SERVICE_OPTIONS), ...choices.map(item => item.category)])

  return <section id="escolhas-do-casal" aria-labelledby="escolhas-titulo" className="scroll-mt-28 border-t border-linha pt-8">
    <h2 id="escolhas-titulo" className="font-serif text-3xl">As escolhas do casamento</h2>
    <p className="mt-3 text-sm leading-relaxed text-onix/70">Marquem o que procuram e o que já contrataram. Entre os serviços procurados, indiquem suas prioridades. Suas escolhas são privadas e não fazem reservas nem enviam mensagens.</p>
    {error && <p role="alert" className="mt-4 rounded border border-red-300 p-3 text-sm text-red-800">{error}</p>}
    {!ready ? (error ? <button type="button" onClick={() => setAttempt(value => value + 1)} className="mt-3 rounded border border-onix px-4 py-3 text-sm">Tentar novamente</button> : <p role="status" className="mt-4">Carregando escolhas…</p>) : <form onSubmit={save} className="mt-6">
      <p className="mb-4 text-sm" aria-live="polite">{wanted} procurados · {contracted} contratados · {priorities} prioridades</p>
      <fieldset disabled={busy} className="space-y-3 disabled:opacity-60">
        <legend className="sr-only">Serviços por categoria</legend>
        {categories.map(category => {
          const items = uniqueServices([...(SERVICE_OPTIONS[category] || []), ...choices.filter(item => item.category === category).map(item => item.service), ...(extras[category] || [])])
          const selected = choices.filter(item => item.category === category).length
          return <details key={category} className="rounded-xl border border-linha bg-white p-4 sm:p-5">
            <summary className="cursor-pointer py-2 font-serif text-xl focus-visible:outline-2 focus-visible:outline-bronze">{category}<span className="ml-2 font-sans text-xs text-onix/60">{selected ? `${selected} selecionados` : "Escolher serviços"}</span></summary>
            <div className="mt-4 space-y-3">{items.map(service => {
              const key = serviceKey(category, service)
              const choice = choices.find(item => serviceKey(item.category, item.service) === key)
              return <div key={key} className="grid gap-3 border-t border-linha pt-3 sm:grid-cols-[1fr_180px_120px] sm:items-center">
                <span className="text-sm">{service}</span>
                <select aria-label={`${category}: ${service} — situação`} value={choice?.status || ""} onChange={event => edit(changeService(choices, category, service, event.target.value as ServiceChoice["status"] | ""))} className="min-h-11 w-full rounded border border-linha bg-white px-3 text-sm">
                  <option value="">Não selecionado</option><option value="wanted">Procuramos</option><option value="contracted">Já contratado</option>
                </select>
                <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" aria-label={`${category}: ${service} — prioridade`} disabled={choice?.status !== "wanted"} checked={!!choice?.priority} onChange={event => edit(choices.map(item => serviceKey(item.category, item.service) === key ? { ...item, priority: event.target.checked } : item))} />Prioridade</label>
              </div>
            })}</div>
            <label className="mt-5 block text-sm">Outros serviços personalizados<input maxLength={120} value={drafts[category] || ""} onChange={event => { setDrafts({ ...drafts, [category]: event.target.value }); setDirty(true); setMessage("") }} placeholder="Descrevam um serviço" className="mt-2 min-h-11 w-full rounded border border-linha px-3" /></label>
            <button type="button" disabled={!drafts[category]?.trim()} onClick={() => {
              const service = drafts[category].trim()
              const existing = items.find(item => item.toLocaleLowerCase("pt-BR") === service.toLocaleLowerCase("pt-BR"))
              const label = existing || service
              setExtras({ ...extras, [category]: uniqueServices([...(extras[category] || []), label]) })
              if (!choices.some(item => item.category === category && item.service === label)) edit(changeService(choices, category, label, "wanted"))
              setDrafts({ ...drafts, [category]: "" })
            }} className="mt-2 min-h-11 rounded border border-onix px-4 text-sm disabled:opacity-50">Adicionar serviço</button>
          </details>
        })}
        <div className="sticky bottom-0 rounded-xl border border-linha bg-alabastro p-4 shadow-sm">
          <button disabled={!dirty} type="submit" className="min-h-11 rounded-lg bg-onix px-6 py-3 text-sm text-alabastro disabled:opacity-50">{busy ? "Salvando…" : "Salvar escolhas"}</button>
          {dirty && <span className="ml-3 inline-block text-xs text-onix/70">Alterações ainda não salvas</span>}
        </div>
      </fieldset>
      {message && <p role="status" className="mt-3 text-sm text-green-800">{message}</p>}
    </form>}
  </section>
}

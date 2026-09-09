"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/Header"
import { getSupabase, ACCESS_UNAVAILABLE } from "@/lib/supabase"
import { CATEGORIES, STATES, fieldClass } from "@/lib/curadoria"

export default function AplicarCuradoria() {
  const [userId, setUserId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [application, setApplication] = useState<{ id: string; status: string } | null>(null)
  useEffect(() => {
    const db = getSupabase()
    if (!db) { setError(ACCESS_UNAVAILABLE); return }
    let live = true
    async function load() {
      const { data, error } = await db!.auth.getUser()
      if (!live) return
      if (!data.user) { setReady(true); return }
      if (error) throw error
      setUserId(data.user.id)
      const result = await db!.from("divine_applications").select("id,status").eq("user_id", data.user.id).maybeSingle()
      if (result.error) throw result.error
      if (live) { setApplication(result.data); setReady(true) }
    }
    load().catch(() => { if (live) setError("Não foi possível carregar sua candidatura. Atualize a página para tentar novamente.") })
    return () => { live = false }
  }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !userId) return
    setBusy(true); setError("")
    const values = new FormData(event.currentTarget)
    const text = (key: string) => String(values.get(key) || "").trim()
    try {
      const db = getSupabase()
      if (!db) throw new Error()
      const { data, error } = await db.from("divine_applications").insert({
        user_id: userId, brand_name: text("brand_name"), category: text("category"),
        base_city: text("base_city"), service_area: text("service_area"),
        years_active: Number(text("years_active")), weddings_count: Number(text("weddings_count")),
        portfolio_url: text("portfolio_url"), signature: text("signature"),
        reference_one: text("reference_one"), reference_two: text("reference_two"), notes: text("notes"),
        publication_consent: values.get("publication_consent") === "on",
      }).select("id,status").single()
      if (error) {
        if (error.code === "23505") {
          const existing = await db.from("divine_applications").select("id,status").eq("user_id",userId).single()
          if (!existing.error) { setApplication(existing.data); return }
        }
        throw error
      }
      setApplication(data)
    } catch { setError("Não foi possível enviar. Seus campos continuam preenchidos; confira os dados e tente novamente.") }
    finally { setBusy(false) }
  }

  function input(name: string, label: string, type = "text", maxLength = 160) {
    return <label className="block text-sm" key={name}>{label}<input name={name} type={type} required maxLength={maxLength}
      min={type === "number" ? 0 : undefined} max={name === "years_active" ? 150 : type === "number" ? 100000 : undefined}
      step={type === "number" ? 1 : undefined} pattern={type === "url" ? "https://.*" : undefined}
      className={fieldClass} /></label>
  }
  return <main className="min-h-screen bg-alabastro px-5 pb-24 pt-32 text-onix"><Header />
    <div className="mx-auto max-w-2xl">
      <p className="text-sm uppercase tracking-widest text-bronze">Para fornecedores</p>
      <h1 className="mt-3 font-serif text-4xl">Solicitar Curadoria DIVINE</h1>
      <p className="mt-5 text-base leading-relaxed">Esta é a porta de entrada para profissionais do mercado nupcial. Uma ficha breve inicia a avaliação; a entrada no Acervo depende da decisão da Curadoria.</p>
      {error && <p role="alert" className="mt-6 rounded-lg border border-red-300 p-4 text-red-800">{error}</p>}
      {!ready && !error && <p role="status" className="mt-8">Carregando…</p>}
      {ready && !userId && <div className="mt-8 border-t border-linha pt-6">
        <h2 className="font-serif text-2xl">Comece pelo seu acesso</h2>
        <p className="mt-3 leading-relaxed">A primeira etapa é entrar com seu e-mail. Depois, você preencherá uma ficha breve com seu portfólio e sua atuação.</p>
        <p className="mt-3 leading-relaxed">A equipe DIVINE avaliará o material. Se sua marca for selecionada, você receberá um e-mail com um link para ativar o cadastro completo e publicar seu perfil no Acervo.</p>
        <Link href="/entrar?next=/aplicar" className="mt-6 inline-flex items-center justify-center rounded-lg bg-onix px-6 py-3 text-sm text-alabastro">
          Entrar com e-mail
        </Link>
      </div>}
      {application ? <section className="mt-8 border-t border-linha pt-6" aria-live="polite">
        <h2 className="font-serif text-2xl">{STATES[application.status]}</h2>
        <p className="mt-3">Sua ficha foi registrada. Você pode voltar a esta página para acompanhar a decisão.</p>
        <p className="mt-3 text-sm">Protocolo: {application.id}</p>
        <p className="mt-5 text-sm">Para corrigir informações, <a className="underline" href="mailto:divinecuradorianupcial@gmail.com">fale com a Curadoria</a>.</p>
      </section> : ready && userId && <form onSubmit={submit} className="mt-8 space-y-6">
        <fieldset disabled={busy} className="space-y-6 disabled:opacity-60">
          <legend className="mb-5 font-serif text-2xl">Seu trabalho e sua atuação</legend>
          {input("brand_name", "Nome da marca ou profissional")}
          <label className="block text-sm">Categoria principal<select name="category" required defaultValue="" className={fieldClass}>
            <option value="" disabled>Selecione a categoria</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select></label>
          {input("base_city", "Cidade-base")}
          {input("service_area", "Onde atende? Inclua sua disponibilidade de deslocamento", "text", 500)}
          <div className="grid gap-6 sm:grid-cols-2">{input("years_active", "Anos de atuação (0 se menos de um ano)", "number")}{input("weddings_count", "Casamentos realizados, aproximadamente", "number")}</div>
          <p className="text-sm text-onix/70">Experiência é uma evidência, não uma condição de aprovação.</p>
          {input("portfolio_url", "Link do portfólio, site ou Instagram (https://)", "url", 2000)}
          <label className="block text-sm">Sua assinatura ou diferencial<textarea name="signature" required maxLength={500} rows={3} className={fieldClass} /></label>
          <p className="text-sm text-onix/70">Indique dois clientes ou parceiros e sua relação com o trabalho. Não inclua telefone, documentos ou informações sensíveis; combinaremos qualquer contato posteriormente.</p>
          {input("reference_one", "Primeira referência — nome e relação", "text", 300)}
          {input("reference_two", "Segunda referência — nome e relação", "text", 300)}
          <label className="block text-sm">Algo mais que devemos conhecer? (opcional)<textarea name="notes" maxLength={1000} rows={2} className={fieldClass} /></label>
          <p className="text-sm leading-relaxed">A DIVINE usará esta ficha para avaliar sua candidatura. Experiência, referências e observações ficam restritas a você e à Curadoria.</p>
          <label className="flex items-start gap-3 text-sm leading-relaxed"><input name="publication_consent" type="checkbox" required className="mt-1" />Se aprovado, autorizo a publicação do nome profissional, categoria, cidade-base, área de atuação, link do portfólio e assinatura no Acervo DIVINE.</label>
          <button className="w-full rounded-lg bg-onix px-6 py-4 text-alabastro" type="submit">{busy ? "Enviando…" : "Enviar à Curadoria"}</button>
        </fieldset>
      </form>}
    </div>
  </main>
}

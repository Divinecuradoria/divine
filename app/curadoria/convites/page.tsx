"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Allura } from "next/font/google"
import { Header } from "@/components/Header"
import { getSupabase } from "@/lib/supabase"
import { drawInvitation, invitationParagraphs, INVITATION_URL, type InvitationKind } from "@/lib/invitation-art"

const handwriting = Allura({ subsets: ["latin"], weight: "400", display: "swap" })

export default function InvitationGenerator() {
  const [access, setAccess] = useState<"loading" | "allowed" | "denied">("loading")
  const [name, setName] = useState("")
  const [kind, setKind] = useState<InvitationKind>("evaluation")
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<{ url: string; filename: string } | null>(null)
  const objectUrl = useRef<string | null>(null)
  function clearPreview() {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = null; setPreview(null)
  }
  useEffect(() => {
    let live = true
    const db = getSupabase()
    async function verify() {
      try {
        if (!db) throw new Error()
        const result = await db.rpc("divine_is_reviewer")
        if (live) setAccess(!result.error && result.data === true ? "allowed" : "denied")
      } catch { if (live) setAccess("denied") }
    }
    void verify()
    return () => { live = false; if (objectUrl.current) URL.revokeObjectURL(objectUrl.current) }
  }, [])

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || access !== "allowed" || (kind === "approved" && !confirmed)) return
    setBusy(true); setError(""); clearPreview()
    try {
      const db = getSupabase()
      if (!db) throw new Error("Entre novamente com sua conta de curadoria.")
      const permission = await db.rpc("divine_is_reviewer")
      if (permission.error || permission.data !== true) { setAccess("denied"); throw new Error("Entre novamente com sua conta de curadoria.") }
      await document.fonts.load(`84px ${handwriting.style.fontFamily}`)
      const seal = new window.Image()
      await new Promise<void>((resolve, reject) => {
        seal.onload = () => resolve()
        seal.onerror = () => reject(new Error("Não foi possível carregar o selo. Tente novamente."))
        seal.src = "/divine-seal2.svg"
      })
      const canvas = document.createElement("canvas")
      drawInvitation(canvas, seal, name, kind, handwriting.style.fontFamily)
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Não foi possível exportar o convite.")), "image/png"))
      const url = URL.createObjectURL(blob)
      objectUrl.current = url
      const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "profissional"
      setPreview({ url, filename: `convite-divine-${slug}.png` })
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível gerar o convite.") }
    finally { setBusy(false) }
  }

  return <main className="min-h-screen bg-alabastro px-5 pb-24 pt-32 text-onix"><Header />
    <div className="mx-auto max-w-6xl">
      <Link href="/curadoria" className="text-sm underline">Voltar à Curadoria</Link>
      <h1 className="mt-6 font-serif text-4xl">Convites personalizados</h1>
      <p className="mt-4 max-w-2xl leading-relaxed">Uma apresentação especial para cada profissional. Personalize, confira a arte e baixe para enviar pelo seu canal de preferência.</p>
      {access === "loading" && <p role="status" className="mt-8">Conferindo seu acesso…</p>}
      {access === "denied" && <p className="mt-8">Área reservada à Curadoria. <Link className="underline" href="/entrar?next=/curadoria/convites">Entrar com minha conta</Link></p>}
      {access === "allowed" && <div className="mt-10 grid items-start gap-10 lg:grid-cols-2">
        <form onSubmit={generate}>
          <fieldset disabled={busy} className="space-y-6">
            <label className="block text-sm">Nome da marca ou profissional<input value={name} onChange={e => { setName(e.target.value); clearPreview() }} required maxLength={100} placeholder="Ex.: Vértice Filmes" className="mt-2 w-full rounded-lg border border-onix/20 bg-white p-3" /></label>
            <label className="block text-sm">Tipo de convite<select value={kind} onChange={e => { setKind(e.target.value as InvitationKind); setConfirmed(false); clearPreview() }} className="mt-2 w-full rounded-lg border border-onix/20 bg-white p-3"><option value="evaluation">Convite para avaliação</option><option value="approved">Formação inaugural · já aprovado</option></select></label>
            {kind === "approved" && <label className="flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" required checked={confirmed} onChange={e => { setConfirmed(e.target.checked); clearPreview() }} className="mt-1" />Confirmo que este profissional já foi avaliado e aprovado pela Curadoria. A arte não registra essa decisão no sistema.</label>}
            <div className="rounded-lg border border-onix/10 p-5"><h2 className={`${handwriting.className} text-4xl text-bronze`}>Um convite especial</h2>{invitationParagraphs(kind).map(p => <p key={p} className="mt-4 text-sm leading-relaxed">{p}</p>)}</div>
            <p className="text-sm leading-relaxed">O QR code abre <a className="break-all underline" href={INVITATION_URL} target="_blank" rel="noreferrer">o formulário de solicitação de curadoria</a>. Gerar a arte não envia mensagens, cria cadastros ou publica uma Referência.</p>
            <button disabled={!name.trim() || (kind === "approved" && !confirmed)} className="w-full rounded-lg bg-onix px-6 py-4 text-alabastro disabled:opacity-50">{busy ? "Preparando convite…" : "Gerar prévia do convite"}</button>
          </fieldset>
          {error && <p role="alert" className="mt-4 text-red-800">{error}</p>}
        </form>
        <section aria-label="Prévia do convite" aria-live="polite" className="min-w-0">
          {preview ? <><img src={preview.url} alt={`Convite personalizado para ${name}`} width={1200} height={1800} className="mx-auto h-auto w-full max-w-md rounded-sm shadow-lg" /><a href={preview.url} download={preview.filename} className="mt-6 block rounded-lg bg-onix px-6 py-4 text-center text-alabastro">Baixar convite em PNG</a><p className="mt-3 text-center text-sm text-onix/70">1200 × 1800 pixels · pronto para compartilhar</p></> : <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-onix/20 p-8 text-center text-onix/60">A arte personalizada aparecerá aqui depois de gerar a prévia.</div>}
        </section>
      </div>}
    </div>
  </main>
}

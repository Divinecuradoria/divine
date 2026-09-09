"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/Header"
import { getSupabase, ACCESS_UNAVAILABLE } from "@/lib/supabase"

type Lead = {
  id: string
  brand_name: string
  contact_name: string
  email: string
  category: string
  base_city: string
  portfolio_url: string
  notes: string
  status: "new" | "contacted" | "invited" | "archived"
  created_at: string
  notification_sent_at: string | null
  invitation_sent_at: string | null
}

const labels: Record<Lead["status"], string> = {
  new: "Novo",
  contacted: "Em contato",
  invited: "Convidado à Curadoria",
  archived: "Arquivado",
}

export default function CuradoriaInteresses() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const db = getSupabase()
    if (!db) { setError(ACCESS_UNAVAILABLE); setLoading(false); return }
    async function load() {
      const reviewer = await db!.rpc("divine_is_reviewer")
      if (reviewer.error || reviewer.data !== true) throw new Error("restricted")
      const result = await db!.from("divine_supplier_leads").select("id,brand_name,contact_name,email,category,base_city,portfolio_url,notes,status,created_at,notification_sent_at").order("created_at", { ascending: false })
      if (result.error) throw result.error
      setLeads((result.data ?? []) as Lead[])
      setLoading(false)
    }
    load().catch(() => { setError("Esta área é exclusiva da Curadoria DIVINE  async function updateStatus(id: string, status: Lead["status"]) {
    const db = getSupabase()
    if (!db) return
    const currentLead = leads.find(lead => lead.id === id)
    setError("")
    setMessage("")
    const result = await db!.from("divine_supplier_leads").update({ status }).eq("id", id)
    if (result.error) { setError("Não foi possível atualizar o status."); return }

    setLeads(current => current.map(lead => lead.id === id ? { ...lead, status } : lead))

    if (status === "invited" && currentLead?.status !== "invited") {
      const invitation = await db.functions.invoke("notify-supplier-invitation", {
        body: { lead_id: id },
      })

      if (invitation.error) {
        setError("O status foi atualizado, mas não foi possível enviar o convite por e-mail. Confira a configuração do Resend.")
        return
      }

      setMessage("Convite enviado por e-mail e status atualizado.")
      return
    }

    setMessage("Status atualizado.")
  }

  return <main className="min-h-screen bg-alabastro px-5 pb-24 pt-32 text-onix"><Header /><div className="mx-auto max-w-6xl">
    <Link href="/curadoria" className="text-sm text-bronze underline">Voltar à Curadoria</Link>
    <p className="mt-8 text-sm uppercase tracking-widest text-bronze">Entrada editorial</p>
    <h1 className="mt-3 font-serif text-4xl">Interesses de fornecedores</h1>
    <p className="mt-4 max-w-2xl leading-relaxed">Cadastros iniciais recebidos pelo formulário público. Alterar o status não publica o fornecedor no Acervo.</p>
    {message && <p role="status" className="mt-5 text-sm text-green-800">{message}</p>}
    {error && <p role="alert" className="mt-5 rounded-lg border border-red-300 p-4 text-red-800">{error}</p>}
    {loading ? <p className="mt-8">Carregando…</p> : !error && <div className="mt-8 overflow-x-auto rounded-lg border border-linha bg-white"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-linha bg-onix text-alabastro"><tr><th className="px-4 py-4">Marca</th><th className="px-4 py-4">Categoria</th><th className="px-4 py-4">Cidade</th><th className="px-4 py-4">Contato</th><th className="px-4 py-4">Recebido</th><th className="px-4 py-4">Status</th></tr></thead><tbody>{leads.map(lead => <tr key={lead.id} className="border-b border-linha last:border-0"><td className="px-4 py-4"><p className="font-medium">{lead.brand_name}</p><a className="text-xs text-bronze underline" href={lead.portfolio_url} target="_blank" rel="noreferrer">Abrir portfólio</a>{lead.notes && <p className="mt-2 max-w-xs text-xs text-onix/60">{lead.notes}</p>}</td><td className="px-4 py-4">{lead.category}</td><td className="px-4 py-4">{lead.base_city}</td><td className="px-4 py-4"><p>{lead.contact_name}</p><a className="text-xs underline" href={`mailto:${lead.email}`}>{lead.email}</a></td><td className="px-4 py-4 whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</td><td className="px-4 py-4"><select aria-label={`Status de ${lead.brand_name}`} value={lead.status} onChange={event => updateStatus(lead.id, event.target.value as Lead["status"])} className="rounded border border-linha bg-alabastro px-2 py-2 text-xs">{Object.entries(labels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></td></tr>)}</tbody></table>{leads.length === 0 && <p className="p-8 text-center text-onix/60">Nenhum interesse recebido.</p>}</div>}
  </div></main>
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, MailCheck, Sparkles } from "lucide-react"
import { safeNext } from "@/lib/curadoria"
import { getSupabase, ACCESS_UNAVAILABLE } from "@/lib/supabase"


export default function Entrar() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [carregandoEmail, setCarregandoEmail] = useState(false)
  const [carregandoSenha, setCarregandoSenha] = useState(false)
  const [enviadoPara, setEnviadoPara] = useState("")
  const [erro, setErro] = useState("")

  async function enviarLinkMagico(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setCarregandoEmail(true)
    try {
      const supabase = getSupabase()
      if (!supabase) { setErro(ACCESS_UNAVAILABLE); return }
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(new URLSearchParams(window.location.search).get("next")))}` },
      })
      if (error) throw error
      setEnviadoPara(email.trim())
    } catch {
      setErro("Não foi possível enviar agora. Confira o e-mail e tente novamente em instantes.")
    } finally { setCarregandoEmail(false) }
  }

  async function entrarComSenha(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setCarregandoSenha(true)
    try {
      const supabase = getSupabase()
      if (!supabase) { setErro(ACCESS_UNAVAILABLE); return }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
      if (error) throw error
      window.location.assign(safeNext(new URLSearchParams(window.location.search).get("next")))
    } catch {
      setErro("Não foi possível entrar com esses dados. Confira o e-mail e a senha ou use o link mágico.")
    } finally { setCarregandoSenha(false) }
  }

  if (enviadoPara) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-onix px-4 font-sans text-alabastro">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md text-center"
        >
          <MailCheck className="mx-auto h-10 w-10 text-bronze" />
          <p className="mt-4 font-serif text-3xl">Link mágico enviado</p>
          <p className="mt-3 text-sm text-alabastro/60">
            Enviamos um acesso para <span className="text-alabastro">{enviadoPara}</span>. Use o link mais recente para continuar.
          </p>
          <p className="mt-2 text-xs text-alabastro/40">Não chegou? Espere um minuto e confira o spam.</p>
          <button
            onClick={() => {
              setEnviadoPara("")
              setEmail("")
            }}
            className="mt-8 text-[11px] uppercase tracking-[0.25em] text-alabastro/60 underline-offset-4 transition hover:text-alabastro hover:underline"
          >
            Usar outro e-mail
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-onix px-4 font-sans text-alabastro">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="mb-10 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.3em] text-alabastro/50 transition hover:text-alabastro"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para a vitrine
        </Link>

        <div className="rounded-3xl border border-alabastro/10 bg-alabastro/[0.04] p-8 backdrop-blur">
          <p className="text-center font-serif text-3xl">Entrar no DIVINE</p>
          <p className="mt-2 text-center text-sm text-alabastro/60">
            Acesso para casais com Passaporte e fornecedores em processo de Curadoria. Use seu e-mail, sua senha ou receba um link de acesso.
          </p>

          <form onSubmit={entrarComSenha}>
            <label htmlFor="email" className="text-[10px] uppercase tracking-[0.3em] text-alabastro/50">
              Seu melhor e-mail
            </label>
            <input
              id="email"
              autoComplete="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-2 w-full rounded-2xl border border-alabastro/20 bg-transparent px-4 py-3.5 text-sm text-alabastro outline-none transition placeholder:text-alabastro/30 focus:border-bronze"
            />
            <label htmlFor="senha" className="mt-5 block text-[10px] uppercase tracking-[0.3em] text-alabastro/50">Senha</label>
            <input id="senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" className="mt-2 w-full rounded-2xl border border-alabastro/20 bg-transparent px-4 py-3.5 text-sm text-alabastro outline-none transition placeholder:text-alabastro/30 focus:border-bronze" />
            <button
              type="submit"
              disabled={carregandoSenha || carregandoEmail || !email || !senha}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-bronze py-3.5 text-sm font-semibold text-alabastro transition hover:bg-bronze/80 disabled:opacity-50"
            >
              {carregandoSenha ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Entrar com e-mail e senha
            </button>
          </form>

          <div className="my-5 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-alabastro/40"><span className="h-px flex-1 bg-alabastro/15" /> ou <span className="h-px flex-1 bg-alabastro/15" /></div>
          <form onSubmit={enviarLinkMagico}>
            <button type="submit" disabled={carregandoEmail || carregandoSenha || !email} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-alabastro/20 py-3.5 text-sm text-alabastro transition hover:border-bronze disabled:opacity-50">
              {carregandoEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
              Receber link mágico por e-mail
            </button>
          </form>

          {erro && (
            <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-center text-xs text-red-200">
              {erro}
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-alabastro/40">
          Precisa de ajuda? Fale com a curadoria pelo e-mail divinecuradorianupcial@gmail.com.
        </p>
      </motion.div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2, MailCheck, Sparkles } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

function LogoGoogle() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.13H2.18A10.97 10.97 0 0 0 1 12c0 1.77.43 3.45 1.18 4.87l3.66-2.78z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.13l3.66 2.78c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export default function Entrar() {
  const [email, setEmail] = useState("")
  const [carregandoGoogle, setCarregandoGoogle] = useState(false)
  const [carregandoEmail, setCarregandoEmail] = useState(false)
  const [enviadoPara, setEnviadoPara] = useState("")
  const [erro, setErro] = useState("")

  async function entrarComGoogle() {
    setErro("")
    setCarregandoGoogle(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setErro("Não foi possível abrir o Google. Confirme a configuração do provedor no Supabase.")
      setCarregandoGoogle(false)
    }
  }

  async function enviarLinkMagico(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setCarregandoEmail(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setCarregandoEmail(false)
    if (error) {
      setErro("Não foi possível enviar agora. Confira o e-mail e tente de novo em instantes.")
    } else {
      setEnviadoPara(email)
    }
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
            Enviamos um acesso para <span className="text-alabastro">{enviadoPara}</span>. Ele expira em 1 hora.
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
          <p className="text-center font-serif text-3xl">O time dos sonhos</p>
          <p className="mt-2 text-center text-sm text-alabastro/60">
            Salve fornecedores, monte pastas e acompanhe o countdown. Sem senha, sem atrito.
          </p>

          <button
            onClick={entrarComGoogle}
            disabled={carregandoGoogle}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-alabastro py-3.5 text-sm font-medium text-onix transition hover:bg-white disabled:opacity-60"
          >
            {carregandoGoogle ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogoGoogle />
            )}
            Continuar com o Google
          </button>

          <div className="my-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-alabastro/40">
            <span className="h-px flex-1 bg-alabastro/15" /> ou <span className="h-px flex-1 bg-alabastro/15" />
          </div>

          <form onSubmit={enviarLinkMagico}>
            <label className="text-[10px] uppercase tracking-[0.3em] text-alabastro/50">
              Seu melhor e-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="noiva@email.com"
              className="mt-2 w-full rounded-2xl border border-alabastro/20 bg-transparent px-4 py-3.5 text-sm text-alabastro outline-none transition placeholder:text-alabastro/30 focus:border-bronze"
            />
            <button
              type="submit"
              disabled={carregandoEmail || !email}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-bronze py-3.5 text-sm font-semibold text-alabastro transition hover:bg-bronze/80 disabled:opacity-50"
            >
              {carregandoEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Receber link mágico
            </button>
          </form>

          {erro && (
            <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-center text-xs text-red-200">
              {erro}
            </p>

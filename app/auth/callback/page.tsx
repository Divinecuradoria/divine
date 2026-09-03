"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

export default function PaginaCallback() {
  const router = useRouter()
  const [falhou, setFalhou] = useState(false)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    if (sp.get("error") || sp.get("error_description")) {
      setFalhou(true)
      return
    }

    let encerrado = false

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && !encerrado) router.replace("/diretorio")
    })

    // Sessão já existente (retorno instantâneo)
    supabase.auth.getUser().then(({ data: userData }) => {
      if (userData.user && !encerrado) router.replace("/diretorio")
    })

    // Rede de segurança: se nada acontecer em 8s, volta para a home
    const t = setTimeout(() => {
      if (!encerrado) router.replace("/")
    }, 8000)

    return () => {
      encerrado = true
      data.subscription.unsubscribe()
      clearTimeout(t)
    }
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-onix px-4 font-sans text-alabastro">
      {falhou ? (
        <div className="text-center">
          <p className="font-serif text-3xl">O link expirou</p>
          <p className="mt-3 text-sm text-alabastro/60">
            Links mágicos valem por pouco tempo. Sem problemas — é só pedir outro.
          </p>
          <Link
            href="/entrar"
            className="mt-8 inline-block rounded-full bg-bronze px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-alabastro transition hover:bg-bronze/80"
          >
            Entrar novamente
          </Link>
        </div>
      ) : (
        <>
          <p className="font-serif text-4xl tracking-[0.25em]">DIVINE</p>
          <Loader2 className="mt-6 h-5 w-5 animate-spin text-bronze" />
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-alabastro/50">
            Abrindo o seu baú...
          </p>
        </>
      )}
    </div>
  )
}

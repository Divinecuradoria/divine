"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { safeNext } from "@/lib/curadoria"
import { getSupabase } from "@/lib/supabase"

export default function PaginaCallback() {
  const router = useRouter()
  const [falhou, setFalhou] = useState(false)

  useEffect(() => {
    const supabase = getSupabase()
    const query = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.slice(1))
    if (!supabase || query.has("error") || hash.has("error")) {
      setFalhou(true)
      return
    }
    let encerrado = false
    let timer: ReturnType<typeof setTimeout>
    function entrar() {
      if (encerrado) return
      encerrado = true
      clearTimeout(timer)
      router.replace(safeNext(query.get("next")))
    }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) entrar()
    })
    timer = setTimeout(() => {
      if (!encerrado) { encerrado = true; setFalhou(true) }
    }, 15000)
    supabase.auth.getSession().then(({ data, error }) => {
      if (encerrado) return
      if (data.session) entrar()
      else if (error) { encerrado = true; clearTimeout(timer); setFalhou(true) }
    }).catch(() => {
      if (!encerrado) { encerrado = true; clearTimeout(timer); setFalhou(true) }
    })
    return () => { encerrado = true; clearTimeout(timer); data.subscription.unsubscribe() }
  }, [router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-onix px-4 text-alabastro">
      {falhou ? <div className="max-w-md text-center" role="alert">
        <h1 className="font-serif text-3xl">Não foi possível concluir o acesso</h1>
        <p className="mt-3 text-sm text-alabastro/70">O link pode ter expirado ou a conexão foi interrompida. Tente entrar novamente para continuar.</p>
        <Link href="/entrar" className="mt-8 inline-block rounded-full bg-bronze px-6 py-3 text-sm">Entrar novamente</Link>
        <Link href="/" className="mt-5 block text-sm underline">Voltar ao início</Link>
      </div> : <div role="status" className="text-center">
        <p className="font-serif text-4xl tracking-[0.25em]">DIVINE</p>
        <Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin text-bronze" />
        <p className="mt-4 text-xs uppercase tracking-widest">Concluindo seu acesso...</p>
      </div>}
    </main>
  )
}

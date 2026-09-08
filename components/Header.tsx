"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { getSupabase, ACCESS_UNAVAILABLE } from "@/lib/supabase"

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [panelHref, setPanelHref] = useState("/passaporte")
  const [panelLabel, setPanelLabel] = useState("Meu painel")
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [leaving, setLeaving] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return
    const db = supabase
    async function syncUser() {
      const { data: auth } = await db.auth.getUser()
      const user = auth.user
      setIsLoggedIn(!!user)
      if (!user) { setPanelHref("/passaporte"); setPanelLabel("Meu painel"); return }
      const reviewer = await db.rpc("divine_is_reviewer")
      if (reviewer.data === true) { setPanelHref("/curadoria"); setPanelLabel("Curadoria") ; return }
      const profile = await db.from("profiles").select("role").eq("id", user.id).maybeSingle()
      if (profile.data?.role === "supplier") { setPanelHref("/aplicar"); setPanelLabel("Meu painel"); return }
      const application = await db.from("divine_applications").select("id").eq("user_id", user.id).maybeSingle()
      if (application.data) { setPanelHref("/aplicar"); setPanelLabel("Meu painel"); return }
      setPanelHref("/passaporte"); setPanelLabel("Meu Passaporte")
    }
    syncUser().catch(() => setIsLoggedIn(false))
    const { data } = supabase.auth.onAuthStateChange(() => { syncUser().catch(() => undefined) })
    return () => data.subscription.unsubscribe()
  }, [])

  async function signOut() {
    setLeaving(true)
    setMessage("")
    try {
      const supabase = getSupabase()
      if (!supabase) throw new Error(ACCESS_UNAVAILABLE)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setIsLoggedIn(false)
      // Clear user-specific state held by the current page.
      window.location.assign("/")
    } catch {
      setMessage("Não foi possível sair. Tente novamente.")
    } finally {
      setLeaving(false)
    }
  }

  const linkClass = "block rounded px-2 py-3 text-xs uppercase tracking-widest text-onix/80 hover:text-bronze focus-visible:outline-2 focus-visible:outline-bronze"
  const links = <>
    <Link className={linkClass} href="/diretorio">O Acervo</Link>
    <Link className={linkClass} href="/revista">Revista DIVINE</Link>
    {!isLoggedIn && <Link className={linkClass} href="/passaporte">Passaporte · Para noivos</Link>}
    {!isLoggedIn && <Link className={linkClass} href="/aplicar">Curadoria · Para fornecedores</Link>}
    {!isLoggedIn ? <Link className={linkClass} href="/entrar">Entrar</Link> : <>
      <Link className={linkClass} href={panelHref}>{panelLabel}</Link>
      <button className={linkClass} disabled={leaving} onClick={signOut}>{leaving ? "Saindo..." : "Sair da conta"}</button>
    </>}
  </>

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-linha bg-alabastro/95 backdrop-blur-md"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) { setOpen(false); toggle.current?.focus() }
      }}>
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-3 md:px-10">
        <Link href="/" aria-label="DIVINE — página inicial" className="flex shrink-0 items-center gap-3">
          <Image src="/images/divine-seal.webp" alt="" width={64} height={64} className="h-12 w-12 object-contain md:h-16 md:w-16" />
          <span className="font-serif text-xl tracking-[0.3em] md:text-2xl">DIVINE</span>
        </Link>
        <nav aria-label="Navegação principal" className="hidden items-center gap-3 xl:flex">{links}</nav>
        <button ref={toggle} type="button" aria-expanded={open} aria-controls="mobile-navigation"
          aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)}
          className="rounded-lg border border-linha p-3 xl:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <nav id="mobile-navigation" aria-label="Navegação móvel" hidden={!open}
        className="max-h-[75vh] overflow-y-auto border-t border-linha px-5 py-3 xl:hidden"
        onClick={(event) => { if ((event.target as HTMLElement).closest("a")) setOpen(false) }}>
        {links}
      </nav>
      {message && <p role="alert" className="px-5 pb-3 text-sm text-onix">{message}</p>}
    </header>
  )
}

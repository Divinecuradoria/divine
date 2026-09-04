"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkUser()
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-linha bg-alabastro/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 items-center px-5 py-4 md:grid-cols-3 md:px-10">
        
        {/* Lado Esquerdo */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#manifesto" className="text-[11px] font-light uppercase tracking-[0.25em] text-onix/60 transition-colors duration-300 hover:text-bronze">
            O Manifesto
          </Link>
          <Link href="/acervo" className="text-[11px] font-light uppercase tracking-[0.25em] text-onix/60 transition-colors duration-300 hover:text-bronze">
            O Acervo
          </Link>
          <Link href="/editorial" className="text-[11px] font-light uppercase tracking-[0.25em] text-onix/60 transition-colors duration-300 hover:text-bronze">
            O Editorial
          </Link>
        </nav>

        {/* Centro - Logo */}
        <Link href="/" className="flex items-center justify-start gap-3 md:justify-center">
          <Image src="/images/divine-seal.png" alt="Selo DIVINE" width={72} height={72} className="h-16 w-16 object-contain" />
          <span className="font-serif text-xl font-light tracking-[0.35em] text-onix md:text-2xl">
            DIVINE
          </span>
        </Link>

        {/* Lado Direito */}
        <div className="flex items-center justify-end gap-5">
          {!isLoggedIn ? (
            <>
              <Link href="/aplicar" className="group relative text-[10px] font-light uppercase tracking-[0.2em] text-onix transition-colors duration-300 hover:text-bronze">
                Solicitar Curadoria
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-bronze transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/passaporte" className="group relative text-[10px] font-light uppercase tracking-[0.2em] text-onix transition-colors duration-300 hover:text-bronze">
                Criar Passaporte
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-bronze transition-all duration-300 group-hover:w-full" />
              </Link>
            </>
          ) : (
            <Link href="/painel" className="group relative text-[10px] font-light uppercase tracking-[0.2em] text-onix transition-colors duration-300 hover:text-bronze">
              Meu Painel
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-bronze transition-all duration-300 group-hover:w-full" />
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}

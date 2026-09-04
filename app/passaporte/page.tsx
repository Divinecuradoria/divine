"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

// Conexão com o cofre
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
const supabase = createClient(supabaseUrl, supabaseKey)

export default function CriarPassaporte() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ msg: string; tipo: "erro" | "sucesso" | "" }>({ msg: "", tipo: "" })
  
  // Estado que guarda tudo que é digitado em tempo real
  const [form, setForm] = useState({
    nome: "",
    whatsapp: "",
    data: "",
    local: "",
    convidados: "",
    notas: "",
    email: "",
    password: ""
  })

  // Atualiza os dados conforme o usuário digita
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ msg: "", tipo: "" })

    try {
      // Cria a conta no módulo de Autenticação do Supabase
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            role: "couple",
            full_name: form.nome,
            whatsapp: form.whatsapp,
            wedding_date: form.data,
            location: form.local,
            guests: form.convidados,
            notes: form.notas
          }
        }
      })

      if (error) throw error

      // Sucesso
      setStatus({ msg: "Passaporte emitido com sucesso! O rito começou.", tipo: "sucesso" })
      
      // Limpa o formulário após o sucesso
      setForm({
        nome: "", whatsapp: "", data: "", local: "", convidados: "", notas: "", email: "", password: ""
      })

    } catch (error: any) {
      console.error(error)
      setStatus({ msg: "Falha ao criar passaporte. Tente novamente ou use outro e-mail.", tipo: "erro" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-alabastro px-5 pt-32 pb-24 md:pt-40 text-onix">
      <div className="mx-auto max-w-[800px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-16 text-center">
            <p className="mb-4 text-[10px] font-light uppercase tracking-[0.4em] text-bronze">
              Acesso Privado
            </p>
            <h1 className="text-balance font-serif text-4xl font-light leading-tight md:text-5xl lg:text-6xl">
              Criar Passaporte
            </h1>
            <p className="mx-auto mt-6 max-w-md text-sm font-light leading-relaxed text-onix/70">
              Inicie a sua jornada. Um espaço restrito e inteligente para orquestrar o seu casamento com a curadoria do LUMI.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Bloco 1: Os Noivos */}
            <div className="space-y-8">
              <h2 className="border-b border-linha pb-4 text-[11px] font-light uppercase tracking-[0.3em] text-onix/50">
                01. Os Protagonistas
              </h2>
              
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="relative">
                  <input type="text" required id="nome" value={form.nome} onChange={handleChange} className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Nome do Casal" />
                  <label htmlFor="nome" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    Nome do Casal (Ex: Sofia e Tiago)
                  </label>
                </div>
                
                <div className="relative">
                  <input type="tel" required id="whatsapp" value={form.whatsapp} onChange={handleChange} className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="WhatsApp" />
                  <label htmlFor="whatsapp" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    WhatsApp Principal
                  </label>
                </div>
              </div>
            </div>

            {/* Bloco 2: O Rito */}
            <div className="space-y-8">
              <h2 className="border-b border-linha pb-4 text-[11px] font-light uppercase tracking-[0.3em] text-onix/50">
                02. O Rito
              </h2>
              
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="relative">
                  <input type="date" required id="data" value={form.data} onChange={handleChange} className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix focus:border-bronze focus:outline-none transition-colors" />
                  <label htmlFor="data" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-bronze transition-all">
                    Data do Casamento
                  </label>
                </div>
                
                <div className="relative">
                  <input type="text" required id="local" value={form.local} onChange={handleChange} className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Cidade ou Local" />
                  <label htmlFor="local" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    Cidade ou Local
                  </label>
                </div>

                <div className="relative">
                  <input type="number" required id="convidados" value={form.convidados} onChange={handleChange} className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Nº de Convidados" />
                  <label htmlFor="convidados" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    Qtd. de Convidados
                  </label>
                </div>
              </div>

              <div className="relative">
                <textarea id="notas" rows={2} value={form.notas} onChange={handleChange} className="peer w-full resize-none border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Visão do Evento"></textarea>
                <label htmlFor="notas" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                  Como vocês imaginam o grande dia? (Opcional)
                </label>
              </div>
            </div>

            {/* Bloco 3: Acesso */}
            <div className="space-y-8">
              <h2 className="border-b border-linha pb-4 text-[11px] font-light uppercase tracking-[0.3em] text-onix/50">
                03. Credenciais
              </h2>
              
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="relative">
                  <input type="email" required id="email" value={form.email} onChange={handleChange} className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="E-mail de Acesso" />
                  <label htmlFor="email" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    E-mail Principal
                  </label>
                </div>
                
                <div className="relative">
                  <input type="password" required id="password" value={form.password} onChange={handleChange} className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Criar Senha" />
                  <label htmlFor="password" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    Criar Senha
                  </label>
                </div>
              </div>
            </div>

            {/* Mensagem de Feedback */}
            {status.msg && (
              <div className={`p-4 text-[11px] font-light uppercase tracking-widest ${status.tipo === "sucesso" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {status.msg}
              </div>
            )}

            <div className="pt-8">
              <button 
                type="submit" 
                disabled={loading}
                className="group flex w-full items-center justify-center gap-4 bg-onix py-5 text-[11px] font-light uppercase tracking-[0.3em] text-alabastro transition-colors hover:bg-bronze disabled:opacity-50"
              >
                {loading ? "Iniciando o Rito..." : "Emitir Passaporte"}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
            
            <p className="text-center text-xs font-light text-onix/50">
              Já possui um passaporte ativo? <Link href="/login" className="text-onix hover:text-bronze hover:underline underline-offset-4">Acesse o seu painel</Link>.
            </p>

          </form>
        </motion.div>
      </div>
    </div>
  )
}

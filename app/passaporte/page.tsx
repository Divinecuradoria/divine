"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function CriarPassaporte() {
  const [loading, setLoading] = useState(false)

  // Simulação de envio para testes iniciais
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
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
                  <input type="text" required id="name" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Nome do Casal" />
                  <label htmlFor="name" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    Nome do Casal (Ex: Sofia e Tiago)
                  </label>
                </div>
                
                <div className="relative">
                  <input type="tel" required id="whatsapp" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="WhatsApp" />
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
                  <input type="date" required id="date" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix focus:border-bronze focus:outline-none transition-colors" />
                  <label htmlFor="date" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-bronze transition-all">
                    Data do Casamento
                  </label>
                </div>
                
                <div className="relative">
                  <input type="text" required id="location" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Cidade ou Local" />
                  <label htmlFor="location" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    Cidade ou Local
                  </label>
                </div>

                <div className="relative">
                  <input type="number" required id="guests" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Nº de Convidados" />
                  <label htmlFor="guests" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    Qtd. de Convidados
                  </label>
                </div>
              </div>

              <div className="relative">
                <textarea id="notes" rows={2} className="peer w-full resize-none border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Visão do Evento"></textarea>
                <label htmlFor="notes" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
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
                  <input type="email" required id="email" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="E-mail de Acesso" />
                  <label htmlFor="email" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    E-mail Principal
                  </label>
                </div>
                
                <div className="relative">
                  <input type="password" required id="password" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Criar Senha" />
                  <label htmlFor="password" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    Criar Senha
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button 
                type="submit" 
                disabled={loading}
                className="group flex w-full items-center justify-center gap-4 bg-onix py-5 text-[11px] font-light uppercase tracking-[0.3em] text-alabastro transition-colors hover:bg-bronze disabled:opacity-50"
              >
                {loading ? "Iniciando o Rito..." : "Emitir Passaporte"}
                {/* Ícone de seta embutido em SVG puro para evitar erros de compilação */}
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

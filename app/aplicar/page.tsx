"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function AplicarCuradoria() {
  const [loading, setLoading] = useState(false)

  // Simulação de envio para não quebrar a tela antes de ligarmos o banco
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
              Selo Divine
            </p>
            <h1 className="text-balance font-serif text-4xl font-light leading-tight md:text-5xl lg:text-6xl">
              Solicitar Curadoria
            </h1>
            <p className="mx-auto mt-6 max-w-md text-sm font-light leading-relaxed text-onix/70">
              Submeta seu portfólio para avaliação. Apenas profissionais que atendem aos nossos critérios de excelência passam a integrar o acervo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Bloco 1: A Marca */}
            <div className="space-y-8">
              <h2 className="border-b border-linha pb-4 text-[11px] font-light uppercase tracking-[0.3em] text-onix/50">
                01. A Marca
              </h2>
              
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="relative">
                  <input type="text" required id="brand" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Nome da Marca" />
                  <label htmlFor="brand" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    Nome da Marca
                  </label>
                </div>
                
                <div className="relative">
                  <input type="text" required id="category" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Categoria Principal" />
                  <label htmlFor="category" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    Categoria Principal (Ex: Alta Gastronomia)
                  </label>
                </div>
              </div>

              <div className="relative">
                <textarea required id="description" rows={3} className="peer w-full resize-none border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Descrição do Portfólio"></textarea>
                <label htmlFor="description" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                  Descreva sua essência e serviços
                </label>
              </div>
            </div>

            {/* Bloco 2: O Responsável */}
            <div className="space-y-8">
              <h2 className="border-b border-linha pb-4 text-[11px] font-light uppercase tracking-[0.3em] text-onix/50">
                02. O Responsável
              </h2>
              
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="relative">
                  <input type="text" required id="name" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Nome Completo" />
                  <label htmlFor="name" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    Nome Completo
                  </label>
                </div>
                
                <div className="relative">
                  <input type="text" required id="document" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="CPF ou CNPJ" />
                  <label htmlFor="document" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    CPF ou CNPJ
                  </label>
                </div>

                <div className="relative">
                  <input type="tel" required id="whatsapp" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="WhatsApp" />
                  <label htmlFor="whatsapp" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    WhatsApp Corporativo
                  </label>
                </div>

                <div className="relative">
                  <input type="text" required id="city" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Cidade Base" />
                  <label htmlFor="city" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    Cidade Base
                  </label>
                </div>
              </div>
            </div>

            {/* Bloco 3: Acesso */}
            <div className="space-y-8">
              <h2 className="border-b border-linha pb-4 text-[11px] font-light uppercase tracking-[0.3em] text-onix/50">
                03. Credenciais
              </h2>
              
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="relative">
                  <input type="email" required id="email" className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="E-mail Profissional" />
                  <label htmlFor="email" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    E-mail Profissional
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
                {loading ? "Enviando Portfólio..." : "Submeter para Análise"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            
            <p className="text-center text-xs font-light text-onix/50">
              Já possui a chancela? <Link href="/login" className="text-onix hover:text-bronze hover:underline underline-offset-4">Acesse o seu painel</Link>.
            </p>

          </form>
        </motion.div>
      </div>
    </div>
  )
}

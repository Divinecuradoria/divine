"use client"
import { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { getSupabase } from "@/lib/supabase"
type Reference = { brand_name: string; category: string; base_city: string; service_area: string; signature: string; portfolio_url: string; valid_until: string }
export default function Referencia() {
  const [item,setItem]=useState<Reference | null>(null)
  const [message,setMessage]=useState("Carregando Referência…")
  useEffect(()=>{
    let live=true
    async function load(){
      const id=new URLSearchParams(window.location.search).get("id")
      if (!id || !/^[0-9a-f-]{36}$/i.test(id)) { setMessage("Referência não encontrada."); return }
      const db=getSupabase(); if(!db) throw new Error()
      const {data,error}=await db.from("divine_publications").select("brand_name,category,base_city,service_area,signature,portfolio_url,valid_until").eq("application_id",id).maybeSingle()
      if(error) throw error
      if(live){setItem(data);setMessage(data ? "" : "Esta Referência não possui uma publicação vigente.")}
    }
    load().catch(()=>{if(live)setMessage("Não foi possível carregar esta Referência. Tente novamente em instantes.")})
    return()=>{live=false}
  },[])
  return <main className="min-h-screen bg-alabastro px-5 pb-24 pt-32 text-onix"><Header /><article className="mx-auto max-w-2xl">
    {message && <p role="status">{message}</p>}{item && <><p className="text-sm uppercase tracking-widest text-bronze">Referência DIVINE</p>
      <h1 className="mt-4 font-serif text-5xl">{item.brand_name}</h1><p className="mt-5 text-lg">{item.category}</p>
      <p className="mt-8 whitespace-pre-wrap text-base leading-relaxed">{item.signature}</p>
      <dl className="mt-8 space-y-3"><dt className="text-sm text-onix/70">Cidade-base</dt><dd>{item.base_city}</dd><dt className="text-sm text-onix/70">Território de atuação informado</dt><dd>{item.service_area}</dd></dl>
      <a className="mt-8 inline-block rounded-lg bg-onix px-6 py-3 text-alabastro" href={item.portfolio_url} target="_blank" rel="noopener noreferrer">Conhecer o trabalho</a>
      <p className="mt-8 text-sm">Chancela editorial vigente até {new Date(item.valid_until).toLocaleDateString("pt-BR",{timeZone:"UTC"})}.</p>
      <p className="mt-3 text-sm leading-relaxed">A seleção considera qualidade do trabalho, reputação e confiança, experiência do cliente, identidade e profissionalismo. A aprovação resulta de apreciação editorial; a chancela não se compra.</p>
    </>}
  </article></main>
}

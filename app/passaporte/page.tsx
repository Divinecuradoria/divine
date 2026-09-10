"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Header } from "@/components/Header"
import { getSupabase, ACCESS_UNAVAILABLE } from "@/lib/supabase"
import { fieldClass } from "@/lib/curadoria"
import { compactarImagem } from "@/lib/image-compression"
import { CalendarDays, ImagePlus, LockKeyhole, MapPin, Save } from "lucide-react"

type PerfilCasal = {
  full_name: string
  wedding_date: string | null
  role: string
  whatsapp: string | null
  location: string | null
  guests: number | null
  notes: string | null
  photo_url: string | null
  created_at: string
}

type ReferenciaFavorita = {
  id: string
  slug: string
  business_name: string
  cover_image_url: string | null
  city: { name: string; state: string } | null
  categories: { id: string; name: string; slug: string }[]
}

function PainelPassaporte() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [perfil, setPerfil] = useState<PerfilCasal | null>(null)
  const [form, setForm] = useState({ nome: "", whatsapp: "", data: "", local: "", convidados: "", notas: "" })
  const [favoritos, setFavoritos] = useState<ReferenciaFavorita[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const [alterandoSenha, setAlterandoSenha] = useState(false)
  const [senha, setSenha] = useState("")
  const [confirmacao, setConfirmacao] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")

  useEffect(() => {
    let ativo = true
    async function carregar() {
      const db = getSupabase()
      if (!db) throw new Error(ACCESS_UNAVAILABLE)
      const auth = await db.auth.getUser()
      if (!auth.data.user) return
      const user = auth.data.user
      const meta = user.user_metadata || {}
      const [perfilResult, favResult] = await Promise.all([
        db.from("profiles").select("full_name,wedding_date,role,whatsapp,location,guests,notes,photo_url,created_at").eq("id", user.id).maybeSingle(),
        db.from("favorites").select("supplier_id").eq("user_id", user.id),
      ])
      if (perfilResult.error) throw perfilResult.error
      if (favResult.error) throw favResult.error
      const base: PerfilCasal = perfilResult.data || {
        full_name: String(meta.full_name || ""),
        wedding_date: meta.wedding_date || null,
        role: "couple",
        whatsapp: meta.whatsapp || null,
        location: meta.location || null,
        guests: meta.guests ? Number(meta.guests) : null,
        notes: meta.notes || null,
        photo_url: null,
        created_at: new Date().toISOString(),
      }
      const ids = (favResult.data || []).map((item) => item.supplier_id)
      let referencias: ReferenciaFavorita[] = []
      if (ids.length) {
        const [supplierResult, linksResult, categoriesResult, citiesResult] = await Promise.all([
          db.from("suppliers").select("id,slug,business_name,cover_image_url,city_id").in("id", ids).eq("is_active", true).eq("has_divine_seal", true),
          db.from("supplier_categories").select("supplier_id,category_id").in("supplier_id", ids),
          db.from("categories").select("id,name,slug"),
          db.from("cities").select("id,name,state"),
        ])
        if (supplierResult.error || linksResult.error || categoriesResult.error || citiesResult.error) throw new Error("Não foi possível carregar seus favoritos.")
        const cats = new Map((categoriesResult.data || []).map((item) => [item.id, item]))
        const cities = new Map((citiesResult.data || []).map((item) => [item.id, item]))
        const bySupplier = new Map<string, { id: string; name: string; slug: string }[]>()
        for (const link of linksResult.data || []) {
          const category = cats.get(link.category_id)
          if (category) bySupplier.set(link.supplier_id, [...(bySupplier.get(link.supplier_id) || []), category])
        }
        referencias = (supplierResult.data || []).map((item) => ({
          ...item,
          city: cities.get(item.city_id) || null,
          categories: bySupplier.get(item.id) || [],
        })) as ReferenciaFavorita[]
      }
      if (!ativo) return
      setUserId(user.id); setEmail(user.email || ""); setPerfil(base)
      setForm({ nome: base.full_name || "", whatsapp: base.whatsapp || "", data: base.wedding_date || "", local: base.location || "", convidados: base.guests ? String(base.guests) : "", notas: base.notes || "" })
      setFavoritos(referencias); setCarregando(false)
    }
    carregar().catch((reason) => { if (ativo) { setErro(reason instanceof Error ? reason.message : "Não foi possível carregar seu Passaporte."); setCarregando(false) } })
    return () => { ativo = false }
  }, [])

  const grupos = useMemo(() => {
    const mapa = new Map<string, { nome: string; itens: ReferenciaFavorita[] }>()
    for (const favorito of favoritos) {
      const categorias = favorito.categories.length ? favorito.categories : [{ id: "outros", name: "Outras referências", slug: "outros" }]
      for (const categoria of categorias) {
        const grupo = mapa.get(categoria.slug) || { nome: categoria.name, itens: [] }
        grupo.itens.push(favorito); mapa.set(categoria.slug, grupo)
      }
    }
    return Array.from(mapa.values()).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
  }, [favoritos])

  async function salvarPerfil(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!userId || salvando) return
    setSalvando(true); setMensagem(""); setErro("")
    try {
      const db = getSupabase(); if (!db) throw new Error(ACCESS_UNAVAILABLE)
      const values = { id: userId, full_name: form.nome.trim(), wedding_date: form.data || null, role: "couple", whatsapp: form.whatsapp.trim() || null, location: form.local.trim() || null, guests: form.convidados ? Number(form.convidados) : null, notes: form.notas.trim() || null, photo_url: perfil?.photo_url || null, created_at: perfil?.created_at || new Date().toISOString() }
      const result = await db.from("profiles").upsert(values, { onConflict: "id" })
      if (result.error) throw result.error
      await db.auth.updateUser({ data: { ...((await db.auth.getUser()).data.user?.user_metadata || {}), role: "couple", full_name: values.full_name, whatsapp: values.whatsapp, wedding_date: values.wedding_date, location: values.location, guests: values.guests, notes: values.notes } })
      setPerfil((current) => ({ ...(current || values), ...values })); setMensagem("Passaporte atualizado com sucesso.")
    } catch (reason) { setErro(reason instanceof Error ? reason.message : "Não foi possível salvar seu Passaporte.") }
    finally { setSalvando(false) }
  }

  async function enviarFoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file || !userId || enviandoFoto) return
    if (!file.type.startsWith("image/")) { setErro("Escolha uma imagem JPG, PNG ou WebP."); return }
    setEnviandoFoto(true); setMensagem(""); setErro("")
    try {
      const db = getSupabase(); if (!db) throw new Error(ACCESS_UNAVAILABLE)
      const optimized = await compactarImagem(file, { maxDimension: 1400, quality: 0.84 })
      const path = `${userId}/${crypto.randomUUID()}.webp`
      const upload = await db.storage.from("couple-photos").upload(path, optimized, { contentType: optimized.type, cacheControl: "3600", upsert: false })
      if (upload.error) throw upload.error
      const url = db.storage.from("couple-photos").getPublicUrl(path).data.publicUrl
      const result = await db.from("profiles").update({ photo_url: url }).eq("id", userId)
      if (result.error) throw result.error
      setPerfil((current) => current ? { ...current, photo_url: url } : current); setMensagem("Foto do casal atualizada.")
    } catch { setErro("Não foi possível enviar a foto. Tente novamente.") }
    finally { setEnviandoFoto(false); event.target.value = "" }
  }

  async function trocarSenha(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (senha.length < 8) { setErro("A senha deve ter pelo menos 8 caracteres."); return }; if (senha !== confirmacao) { setErro("A confirmação da senha não confere."); return }
    setAlterandoSenha(true); setMensagem(""); setErro("")
    try { const db = getSupabase(); if (!db) throw new Error(ACCESS_UNAVAILABLE); const result = await db.auth.updateUser({ password: senha }); if (result.error) throw result.error; setSenha(""); setConfirmacao(""); setMensagem("Senha atualizada com sucesso.") }
    catch { setErro("Não foi possível atualizar a senha.") } finally { setAlterandoSenha(false) }
  }

  return <main className="min-h-screen bg-alabastro text-onix"><div className="mx-auto max-w-5xl">
    <p className="text-sm uppercase tracking-widest text-bronze">Área dos noivos</p><h1 className="mt-3 font-serif text-4xl">Meu Passaporte DIVINE</h1>
    {mensagem && <p role="status" className="mt-6 rounded-lg border border-green-300 bg-green-50 p-4 text-green-900">{mensagem}</p>}{erro && <p role="alert" className="mt-6 rounded-lg border border-red-300 p-4 text-red-800">{erro}</p>}
    {carregando ? <p className="mt-8">Carregando seu Passaporte…</p> : <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-10"><form onSubmit={salvarPerfil} className="space-y-5 border-t border-linha pt-6"><h2 className="font-serif text-2xl">Dados do casamento</h2>
        <label className="block text-sm">Nome do casal<input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={fieldClass} /></label>
        <label className="block text-sm">WhatsApp<input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={fieldClass} /></label>
        <label className="block text-sm">Data do casamento<input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className={fieldClass} /></label>
        <label className="block text-sm">Cidade ou local<input value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} className={fieldClass} /></label>
        <label className="block text-sm">Número de convidados<input type="number" min="1" value={form.convidados} onChange={(e) => setForm({ ...form, convidados: e.target.value })} className={fieldClass} /></label>
        <label className="block text-sm">Como vocês imaginam o grande dia?<textarea rows={4} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className={fieldClass} /></label>
        <button disabled={salvando} className="inline-flex items-center gap-2 rounded-lg bg-onix px-5 py-3 text-sm text-alabastro disabled:opacity-60"><Save className="h-4 w-4" />{salvando ? "Salvando…" : "Salvar dados"}</button>
      </form>
      <section className="border-t border-linha pt-6"><h2 className="font-serif text-2xl">Referências salvas</h2><p className="mt-2 text-sm text-onix/60">Seus fornecedores favoritos organizados por categoria.</p>{!favoritos.length ? <p className="mt-6 text-sm text-onix/60">Você ainda não salvou nenhuma Referência. <Link className="underline" href="/diretorio">Explorar o Acervo</Link></p> : <div className="mt-6 space-y-8">{grupos.map((grupo) => <section key={grupo.nome}><h3 className="mb-3 font-serif text-xl">{grupo.nome}</h3><div className="grid gap-4 sm:grid-cols-2">{grupo.itens.map((item) => <Link key={item.id} href={`/diretorio/${item.slug}`} className="overflow-hidden rounded-xl border border-linha bg-white"><div className="aspect-[4/3] bg-onix">{item.cover_image_url && <img src={item.cover_image_url} alt="" className="h-full w-full object-cover" />}</div><div className="p-3"><p className="font-serif text-lg">{item.business_name}</p>{item.city && <p className="mt-1 flex items-center gap-1 text-xs text-onix/60"><MapPin className="h-3 w-3" />{item.city.name}, {item.city.state}</p>}</div></Link>)}</div></section>)}</div>}</section>
      </div>
      <aside className="space-y-8"><section className="border-t border-linha pt-6"><h2 className="font-serif text-2xl">Foto do casal</h2>{perfil?.photo_url ? <img src={perfil.photo_url} alt="Foto do casal" className="mt-4 aspect-[4/3] w-full rounded-xl object-cover" /> : <div className="mt-4 flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-linha text-onix/40"><ImagePlus className="h-8 w-8" /></div>}<label className="mt-4 block cursor-pointer rounded-lg border border-onix px-4 py-3 text-center text-sm">{enviandoFoto ? "Compactando e enviando…" : "Enviar foto"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={enviarFoto} disabled={enviandoFoto} className="sr-only" /></label><p className="mt-2 text-xs text-onix/60">A imagem é compactada automaticamente antes do armazenamento.</p></section>
      <section className="border-t border-linha pt-6"><h2 className="font-serif text-2xl">Acesso</h2><p className="mt-3 text-sm text-onix/60">E-mail</p><p className="break-all text-sm">{email}</p><form onSubmit={trocarSenha} className="mt-5 space-y-4"><label className="block text-sm">Nova senha<input type="password" minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} className={fieldClass} /></label><label className="block text-sm">Confirmar nova senha<input type="password" minLength={8} value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} className={fieldClass} /></label><button disabled={alterandoSenha || !senha || !confirmacao} className="inline-flex items-center gap-2 rounded-lg border border-onix px-4 py-3 text-sm disabled:opacity-50"><LockKeyhole className="h-4 w-4" />{alterandoSenha ? "Atualizando…" : "Atualizar senha"}</button></form></section><Link href="/diretorio" className="inline-flex items-center gap-2 rounded-lg bg-bronze px-5 py-3 text-sm text-alabastro"><CalendarDays className="h-4 w-4" />Explorar o Acervo</Link></aside>
    </div>}
  </div></main>
}

// Conexão com o cofre

export default function CriarPassaporte() {
  const [existingUser, setExistingUser] = useState(false)
  const [checkingUser, setCheckingUser] = useState(true)
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

  useEffect(() => {
    const db = getSupabase()
    if (!db) { setCheckingUser(false); return }
    db.auth.getUser().then(({ data }) => {
      setExistingUser(!!data.user)
      setCheckingUser(false)
    }).catch(() => setCheckingUser(false))
  }, [])

  // Atualiza os dados conforme o usuário digita
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ msg: "", tipo: "" })

    try {
      const supabase = getSupabase()
      if (!supabase) {
        setStatus({ msg: ACCESS_UNAVAILABLE, tipo: "erro" })
        return
      }
      // Cria a conta no módulo de Autenticação do Supabase
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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
      setStatus({ msg: data.session ? "Conta criada! Acesse o diretório para encontrar e salvar fornecedores." : "Confira seu e-mail para confirmar o cadastro. Se já possui uma conta, use a página de entrada.", tipo: "sucesso" })
      
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
      <Header />
      <div className="mx-auto max-w-[800px]">
        {checkingUser ? <p role="status" className="text-center">Carregando seu Passaporte…</p> : existingUser ? <PainelPassaporte /> : <>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-16 text-center">
            <p className="mb-4 text-[10px] font-light uppercase tracking-[0.4em] text-bronze">
              Para noivos e casais
            </p>
            <h1 className="text-balance font-serif text-4xl font-light leading-tight md:text-5xl lg:text-6xl">
              Criar Passaporte DIVINE
            </h1>
            <p className="mx-auto mt-6 max-w-md text-sm font-light leading-relaxed text-onix/70">
              O Passaporte é a área dos casais: crie seu perfil, organize a busca e salve as Referências DIVINE para o seu casamento.
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
                  <input type="password" minLength={6} autoComplete="new-password" required id="password" value={form.password} onChange={handleChange} className="peer w-full border-b border-linha bg-transparent py-3 text-sm font-light text-onix placeholder-transparent focus:border-bronze focus:outline-none transition-colors" placeholder="Criar Senha" />
                  <label htmlFor="password" className="absolute left-0 -top-3.5 text-[10px] uppercase tracking-widest text-onix/50 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-bronze">
                    Criar Senha
                  </label>
                </div>
              </div>
            </div>

            {/* Mensagem de Feedback */}
            {status.msg && (
              <div role="status" aria-live="polite" className={`p-4 text-[11px] font-light uppercase tracking-widest ${status.tipo === "sucesso" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
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
              Já possui um passaporte ativo? <Link href="/entrar" className="text-onix hover:text-bronze hover:underline underline-offset-4">Entre na sua conta</Link>.
            </p>

          </form>
        </motion.div></>}
      </div>
    </div>
  )
}

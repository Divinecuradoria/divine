"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { getSupabase, ACCESS_UNAVAILABLE } from "@/lib/supabase"
import { fieldClass } from "@/lib/curadoria"

type Category = { id: string; name: string; slug: string }
type Supplier = {
  id: string
  business_name: string
  bio: string | null
  cover_image_url: string | null
  whatsapp: string | null
  style: string | null
  portfolio: unknown
  services: string[] | null
  instagram_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  website_url: string | null
  has_divine_seal: boolean
}

const STYLES = [
  ["", "Não informar"],
  ["pe-na-grama", "Pé na Grama"],
  ["tradicional", "Tradicional"],
  ["editorial", "Editorial"],
  ["atemporal", "Atemporal"],
] as const

function portfolioUrl(value: unknown): string {
  if (!Array.isArray(value) || !value.length) return ""
  const first = value[0]
  return first && typeof first === "object" && "url" in first && typeof first.url === "string" ? first.url : ""
}

export default function PainelFornecedor() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [form, setForm] = useState({
    businessName: "", bio: "", whatsapp: "", portfolioUrl: "", style: "",
    services: "", instagram: "", facebook: "", tiktok: "", website: "",
  })
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const selectedNames = useMemo(
    () => categories.filter((category) => selectedCategories.includes(category.id)).map((category) => category.name),
    [categories, selectedCategories]
  )

  useEffect(() => {
    let live = true
    async function load() {
      const db = getSupabase()
      if (!db) throw new Error(ACCESS_UNAVAILABLE)
      const auth = await db.auth.getUser()
      if (!auth.data.user) {
        router.replace("/entrar?next=/painel/fornecedor")
        return
      }
      const currentUser = auth.data.user
      const [supplierResult, categoriesResult] = await Promise.all([
        db.from("suppliers")
          .select("id,business_name,bio,cover_image_url,whatsapp,style,portfolio,services,instagram_url,facebook_url,tiktok_url,website_url,has_divine_seal")
          .eq("owner_user_id", currentUser.id)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle(),
        db.from("categories").select("id,name,slug").order("name"),
      ])
      if (supplierResult.error) throw supplierResult.error
      if (categoriesResult.error) throw categoriesResult.error
      if (!live) return
      setUserId(currentUser.id)
      setEmail(currentUser.email || "")
      setCategories(categoriesResult.data || [])
      if (!supplierResult.data) {
        setLoading(false)
        return
      }
      const links = await db.from("supplier_categories").select("category_id").eq("supplier_id", supplierResult.data.id)
      if (links.error) throw links.error
      const item = supplierResult.data as Supplier
      setSupplier(item)
      setSelectedCategories((links.data || []).map((link) => link.category_id))
      setForm({
        businessName: item.business_name || "",
        bio: item.bio || "",
        whatsapp: item.whatsapp || "",
        portfolioUrl: portfolioUrl(item.portfolio),
        style: item.style || "",
        services: (item.services || []).join("\n"),
        instagram: item.instagram_url || "",
        facebook: item.facebook_url || "",
        tiktok: item.tiktok_url || "",
        website: item.website_url || "",
      })
      setLoading(false)
    }
    load().catch((reason) => {
      if (!live) return
      setError(reason instanceof Error && reason.message !== ACCESS_UNAVAILABLE ? "Não foi possível carregar seu painel." : ACCESS_UNAVAILABLE)
      setLoading(false)
    })
    return () => { live = false }
  }, [router])

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supplier || !userId || saving) return
    setSaving(true); setMessage(""); setError("")
    try {
      const db = getSupabase()
      if (!db) throw new Error(ACCESS_UNAVAILABLE)
      const url = form.portfolioUrl.trim()
      if (url && !/^https:\/\/[^\s]+$/i.test(url)) throw new Error("O link do portfólio deve começar com https://.")
      const existingPortfolio = Array.isArray(supplier.portfolio) ? supplier.portfolio : []
      const services = form.services.split("\n").map((service) => service.trim()).filter(Boolean).slice(0, 12)
      const profileResult = await db.from("suppliers").update({
        business_name: form.businessName.trim(),
        bio: form.bio.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        style: form.style || null,
        services,
        instagram_url: form.instagram.trim() || null,
        facebook_url: form.facebook.trim() || null,
        tiktok_url: form.tiktok.trim() || null,
        website_url: form.website.trim() || null,
        portfolio: url ? [{ url }] : existingPortfolio,
      }).eq("id", supplier.id).eq("owner_user_id", userId)
      if (profileResult.error) throw profileResult.error
      const removeResult = await db.from("supplier_categories").delete().eq("supplier_id", supplier.id)
      if (removeResult.error) throw removeResult.error
      if (selectedCategories.length) {
        const categoryResult = await db.from("supplier_categories").insert(
          selectedCategories.map((category_id) => ({ supplier_id: supplier.id, category_id }))
        )
        if (categoryResult.error) throw categoryResult.error
      }
      setSupplier((current) => current ? {
        ...current,
        business_name: form.businessName.trim(), bio: form.bio.trim() || null,
        whatsapp: form.whatsapp.trim() || null, style: form.style || null,
        services, instagram_url: form.instagram.trim() || null,
        facebook_url: form.facebook.trim() || null, tiktok_url: form.tiktok.trim() || null,
        website_url: form.website.trim() || null, portfolio: url ? [{ url }] : existingPortfolio,
      } : current)
      setMessage("Perfil atualizado. As mudanças já estão disponíveis no Acervo.")
    } catch (reason) {
      setError(reason instanceof Error && reason.message !== ACCESS_UNAVAILABLE ? reason.message : "Não foi possível salvar seu perfil.")
    } finally { setSaving(false) }
  }

  async function uploadCover(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !supplier || !userId || uploading) return
    if (!file.type.startsWith("image/")) { setError("Escolha uma imagem JPG, PNG ou WebP."); return }
    if (file.size > 6 * 1024 * 1024) { setError("A imagem deve ter no máximo 6 MB."); return }
    setUploading(true); setMessage(""); setError("")
    try {
      const db = getSupabase()
      if (!db) throw new Error(ACCESS_UNAVAILABLE)
      const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
      const path = `${userId}/${crypto.randomUUID()}.${extension}`
      const upload = await db.storage.from("supplier-covers").upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false })
      if (upload.error) throw upload.error
      const publicUrl = db.storage.from("supplier-covers").getPublicUrl(path).data.publicUrl
      const result = await db.from("suppliers").update({ cover_image_url: publicUrl }).eq("id", supplier.id).eq("owner_user_id", userId)
      if (result.error) throw result.error
      setSupplier((current) => current ? { ...current, cover_image_url: publicUrl } : current)
      setMessage("Foto de capa atualizada no Acervo.")
    } catch { setError("Não foi possível enviar a foto. Verifique o formato e tente novamente.") }
    finally { setUploading(false); event.target.value = "" }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (changingPassword) return
    if (password.length < 8) { setError("A senha deve ter pelo menos 8 caracteres."); return }
    if (password !== passwordConfirmation) { setError("A confirmação da senha não confere."); return }
    setChangingPassword(true); setMessage(""); setError("")
    try {
      const db = getSupabase()
      if (!db) throw new Error(ACCESS_UNAVAILABLE)
      const result = await db.auth.updateUser({ password })
      if (result.error) throw result.error
      setPassword(""); setPasswordConfirmation("")
      setMessage("Senha atualizada. Você já pode entrar com e-mail e senha.")
    } catch { setError("Não foi possível atualizar a senha. Tente novamente.") }
    finally { setChangingPassword(false) }
  }

  function toggleCategory(id: string) {
    setSelectedCategories((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  return (
    <main className="min-h-screen bg-alabastro px-5 pb-24 pt-32 text-onix">
      <Header />
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-widest text-bronze">Área do fornecedor</p>
        <h1 className="mt-3 font-serif text-4xl">Meu painel</h1>
        <p className="mt-4 max-w-2xl leading-relaxed">Aqui você mantém as informações que aparecem no card público da sua Referência DIVINE. A Chancela continua sendo uma decisão exclusiva da Curadoria.</p>
        {message && <p role="status" className="mt-6 rounded-lg border border-green-300 bg-green-50 p-4 text-green-900">{message}</p>}
        {error && <p role="alert" className="mt-6 rounded-lg border border-red-300 p-4 text-red-800">{error}</p>}
        {loading ? <p role="status" className="mt-8">Carregando seu painel…</p> : !supplier ? (
          <section className="mt-8 border-t border-linha pt-8">
            <h2 className="font-serif text-2xl">Seu perfil ainda não foi publicado</h2>
            <p className="mt-3 max-w-xl leading-relaxed">O painel de configuração é liberado quando a candidatura é aprovada e a Referência é publicada no Acervo.</p>
            <Link href="/aplicar" className="mt-6 inline-block rounded-lg bg-onix px-6 py-3 text-alabastro">Acompanhar candidatura</Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <form onSubmit={saveProfile} className="space-y-6">
              <section className="space-y-5 border-t border-linha pt-6">
                <h2 className="font-serif text-2xl">Informações do card</h2>
                <label className="block text-sm">Nome público<input required maxLength={160} value={form.businessName} onChange={(event) => updateField("businessName", event.target.value)} className={fieldClass} /></label>
                <label className="block text-sm">Texto de apresentação<textarea required maxLength={1200} rows={5} value={form.bio} onChange={(event) => updateField("bio", event.target.value)} className={fieldClass} /></label>
                <label className="block text-sm">Link principal do portfólio<input type="url" placeholder="https://" value={form.portfolioUrl} onChange={(event) => updateField("portfolioUrl", event.target.value)} className={fieldClass} /></label>
                <label className="block text-sm">Estilo<select value={form.style} onChange={(event) => updateField("style", event.target.value)} className={fieldClass}>{STYLES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                <label className="block text-sm">Principais serviços <span className="text-onix/50">(um por linha)</span><textarea maxLength={1200} rows={5} value={form.services} onChange={(event) => updateField("services", event.target.value)} className={fieldClass} /></label>
                <fieldset>
                  <legend className="text-sm">Categorias de atuação <span className="text-onix/50">(selecione uma ou mais)</span></legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">{categories.map((category) => <label key={category.id} className="flex items-start gap-2 rounded border border-linha bg-white p-3 text-sm"><input type="checkbox" checked={selectedCategories.includes(category.id)} onChange={() => toggleCategory(category.id)} className="mt-0.5" />{category.name}</label>)}</div>
                  {!!selectedNames.length && <p className="mt-3 text-xs text-onix/60">Selecionadas: {selectedNames.join(" · ")}</p>}
                </fieldset>
                <button type="submit" disabled={saving} className="w-full rounded-lg bg-onix px-6 py-4 text-alabastro disabled:opacity-60">{saving ? "Salvando…" : "Salvar informações públicas"}</button>
              </section>
            </form>

            <aside className="space-y-8">
              <section className="border-t border-linha pt-6">
                <h2 className="font-serif text-2xl">Foto de capa</h2>
                {supplier.cover_image_url ? <img src={supplier.cover_image_url} alt="Capa atual do perfil" className="mt-4 aspect-[4/5] w-full rounded-lg object-cover" /> : <div className="mt-4 flex aspect-[4/5] items-center justify-center rounded-lg bg-onix text-4xl text-alabastro">D</div>}
                <label className="mt-4 block cursor-pointer rounded-lg border border-onix px-4 py-3 text-center text-sm hover:border-bronze">{uploading ? "Enviando…" : "Enviar nova foto"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadCover} disabled={uploading} className="sr-only" /></label>
                <p className="mt-3 text-xs leading-relaxed text-onix/60">Use uma imagem horizontal ou vertical de boa qualidade, com até 6 MB. Ela ficará visível no card público do Acervo.</p>
              </section>

              <section className="border-t border-linha pt-6">
                <h2 className="font-serif text-2xl">Contato e redes</h2>
                <div className="mt-5 space-y-4">
                  <label className="block text-sm">WhatsApp<input value={form.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} className={fieldClass} /></label>
                  <label className="block text-sm">Instagram<input type="url" placeholder="https://instagram.com/" value={form.instagram} onChange={(event) => updateField("instagram", event.target.value)} className={fieldClass} /></label>
                  <label className="block text-sm">Facebook<input type="url" placeholder="https://facebook.com/" value={form.facebook} onChange={(event) => updateField("facebook", event.target.value)} className={fieldClass} /></label>
                  <label className="block text-sm">TikTok<input type="url" placeholder="https://tiktok.com/@" value={form.tiktok} onChange={(event) => updateField("tiktok", event.target.value)} className={fieldClass} /></label>
                  <label className="block text-sm">Outro site<input type="url" placeholder="https://" value={form.website} onChange={(event) => updateField("website", event.target.value)} className={fieldClass} /></label>
                </div>
              </section>

              <section className="border-t border-linha pt-6">
                <h2 className="font-serif text-2xl">Configuração da conta</h2>
                <p className="mt-3 text-sm text-onix/60">E-mail de acesso</p><p className="mt-1 break-all text-sm">{email}</p>
                <form onSubmit={changePassword} className="mt-5 space-y-4">
                  <label className="block text-sm">Nova senha<input type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} /></label>
                  <label className="block text-sm">Confirmar nova senha<input type="password" minLength={8} autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} className={fieldClass} /></label>
                  <button type="submit" disabled={changingPassword || !password || !passwordConfirmation} className="w-full rounded-lg border border-onix px-4 py-3 text-sm disabled:opacity-50">{changingPassword ? "Atualizando…" : "Atualizar senha"}</button>
                </form>
              </section>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}

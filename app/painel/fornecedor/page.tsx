"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { getSupabase, ACCESS_UNAVAILABLE } from "@/lib/supabase"
import { fieldClass } from "@/lib/curadoria"
import { compactarImagem } from "@/lib/image-compression"
import { servicesForCategory, INVESTMENT_OPTIONS, uniqueServices } from "@/lib/supplier-profile"

type City = { id: string; name: string; state: string }
type Category = { id: string; name: string; slug: string }
type Supplier = {
  city_id: string | null
  primary_category_id: string | null
  service_city_ids: string[]
  other_service_areas: string | null
  investment_levels: string[]
  id: string
  business_name: string
  bio: string | null
  cover_image_url: string | null
  whatsapp: string | null
  portfolio: unknown
  services: string[] | null
  instagram_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  website_url: string | null
  has_divine_seal: boolean
}

function portfolioUrl(value: unknown): string {
  if (!Array.isArray(value) || !value.length) return ""
  const first = value[0]
  return first && typeof first === "object" && "url" in first && typeof first.url === "string" ? first.url : ""
}

function formatValidity(value: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(date)
}

export default function PainelFornecedor() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [form, setForm] = useState({
    businessName: "", bio: "", whatsapp: "", portfolioUrl: "",
    services: "", instagram: "", facebook: "", tiktok: "", website: "",
  })
  const [cities, setCities] = useState<City[]>([])
  const [baseCity, setBaseCity] = useState("")
  const [primaryCategory, setPrimaryCategory] = useState("")
  const [serviceCities, setServiceCities] = useState<string[]>([])
  const [otherAreas, setOtherAreas] = useState("")
  const [investmentLevels, setInvestmentLevels] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [downloadingSeal, setDownloadingSeal] = useState(false)
  const [validUntil, setValidUntil] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const selectedNames = useMemo(
    () => categories.filter((category) => selectedCategories.includes(category.id)).map((category) => category.name),
    [categories, selectedCategories]
  )

  const serviceOptions = useMemo(() => uniqueServices(selectedNames.flatMap(name => servicesForCategory(name))), [selectedNames])
  const allServices = uniqueServices([...selectedServices, ...form.services.split("\n")])
  const missing = [
    !form.businessName.trim() && { label: "Nome público", target: "public-name" },
    !form.bio.trim() && { label: "Apresentação", target: "presentation" },
    !form.portfolioUrl.trim() && { label: "Portfólio", target: "portfolio-link" },
    !form.whatsapp.trim() && { label: "WhatsApp", target: "contact-whatsapp" },
    !supplier?.cover_image_url && { label: "Foto de capa", target: "cover-photo" },
    (!primaryCategory || !selectedCategories.includes(primaryCategory)) && { label: "Categoria principal", target: "primary-category" },
    !allServices.length && { label: "Serviços", target: "offered-services" },
    !baseCity && { label: "Cidade-base", target: "base-city" },
    (!serviceCities.length && !otherAreas.trim()) && { label: "Território atendido", target: "service-territory" },
    !investmentLevels.length && { label: "Faixa de investimento", target: "investment-levels" },
  ].filter((item): item is { label: string; target: string } => Boolean(item))

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
      const [supplierResult, categoriesResult, citiesResult] = await Promise.all([
        db.from("suppliers")
        .select("id,business_name,bio,cover_image_url,whatsapp,portfolio,services,instagram_url,facebook_url,tiktok_url,website_url,has_divine_seal,city_id,primary_category_id,service_city_ids,other_service_areas,investment_levels")
          .eq("owner_user_id", currentUser.id)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle(),
        db.from("categories").select("id,name,slug").order("name"),
        db.from("cities").select("id,name,state").order("name"),
      ])
      if (supplierResult.error) throw supplierResult.error
      if (categoriesResult.error) throw categoriesResult.error
      if (citiesResult.error) throw citiesResult.error
      if (!live) return
      setUserId(currentUser.id)
      setEmail(currentUser.email || "")
      setCategories(categoriesResult.data || [])
      setCities(citiesResult.data || [])
      if (!supplierResult.data) {
        setLoading(false)
        return
      }
      const links = await db.from("supplier_categories").select("category_id").eq("supplier_id", supplierResult.data.id)
      if (links.error) throw links.error
      const item = supplierResult.data as Supplier
      let publishedValidity: string | null = null

      // A publicação é vinculada à candidatura, não ao nome editável do fornecedor.
      // Assim, a Chancela continua disponível mesmo se a marca alterar o nome público.
      const applicationResult = await db.from("divine_applications")
        .select("id")
        .eq("user_id", currentUser.id)
        .maybeSingle()
      if (applicationResult.error) throw applicationResult.error

      if (applicationResult.data?.id) {
        const publicationResult = await db.from("divine_publications")
          .select("valid_until")
          .eq("application_id", applicationResult.data.id)
          .eq("is_published", true)
          .maybeSingle()
        if (publicationResult.error) throw publicationResult.error
        publishedValidity = publicationResult.data?.valid_until || null
      }

      // Compatibilidade com publicações antigas que ainda não estejam vinculadas
      // pela candidatura, usando o nome original como segunda tentativa.
      if (!publishedValidity) {
        const legacyPublication = await db.from("divine_publications")
          .select("valid_until")
          .eq("brand_name", item.business_name)
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(1)
          .maybeSingle()
        if (legacyPublication.error) throw legacyPublication.error
        publishedValidity = legacyPublication.data?.valid_until || null
      }

      setValidUntil(publishedValidity)
      setSupplier(item)
      setBaseCity(item.city_id || "")
      setPrimaryCategory(item.primary_category_id || "")
      setServiceCities(item.service_city_ids || [])
      setOtherAreas(item.other_service_areas || "")
      setInvestmentLevels(item.investment_levels || [])
      const linkedNames = (categoriesResult.data || []).filter(category => (links.data || []).some(link => link.category_id === category.id)).map(category => category.name)
      const knownServices = uniqueServices(linkedNames.flatMap(name => servicesForCategory(name)))
      setSelectedServices((item.services || []).filter(service => knownServices.includes(service)))
      setSelectedCategories((links.data || []).map((link) => link.category_id))
      setForm({
        businessName: item.business_name || "",
        bio: item.bio || "",
        whatsapp: item.whatsapp || "",
        portfolioUrl: portfolioUrl(item.portfolio),
        services: (item.services || []).filter(service => !knownServices.includes(service)).join("\n"),
        instagram: item.instagram_url || "",
        facebook: item.facebook_url || "",
        tiktok: item.tiktok_url || "",
        website: item.website_url || "",
      })
      setLoading(false)
    }
    load().catch((reason) => {
      if (!live) return
      setError(reason instanceof Error && reason.message === ACCESS_UNAVAILABLE ? ACCESS_UNAVAILABLE : "Não foi possível carregar seu painel. Se esta atualização acabou de ser instalada, a equipe DIVINE precisa aplicar a atualização do banco de dados.")
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
      const services = allServices
      if (services.length > 40 || services.some(service => service.length > 120)) throw new Error("Use até 40 serviços, com no máximo 120 caracteres cada.")
      if (!selectedCategories.length) throw new Error("Selecione ao menos uma categoria.")
      if (primaryCategory && !selectedCategories.includes(primaryCategory)) throw new Error("Selecione uma categoria principal entre suas categorias de atuação.")
      const profileResult = await db.rpc("divine_save_supplier_profile", {
        p_id: supplier.id,
        p_profile: {
          business_name: form.businessName.trim(), bio: form.bio.trim(),
          whatsapp: form.whatsapp.trim(), services,
          instagram_url: form.instagram.trim(), facebook_url: form.facebook.trim(),
          tiktok_url: form.tiktok.trim(), website_url: form.website.trim(),
          portfolio: url ? [{ url }, ...existingPortfolio.slice(1)] : [],
          city_id: baseCity || null, primary_category_id: primaryCategory || null,
          service_city_ids: serviceCities, other_service_areas: otherAreas.trim(),
          investment_levels: investmentLevels,
        },
        p_category_ids: selectedCategories,
      })
      if (profileResult.error) throw new Error("Não foi possível salvar. Verifique sua conexão e seu acesso. Se o problema persistir, informe a Curadoria.")
      setSupplier((current) => current ? {
        ...current,
        business_name: form.businessName.trim(), bio: form.bio.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        services, instagram_url: form.instagram.trim() || null,
        facebook_url: form.facebook.trim() || null, tiktok_url: form.tiktok.trim() || null,
        website_url: form.website.trim() || null, portfolio: url ? [{ url }, ...existingPortfolio.slice(1)] : [],
        city_id: baseCity || null, primary_category_id: primaryCategory || null,
        service_city_ids: serviceCities, other_service_areas: otherAreas.trim() || null,
        investment_levels: investmentLevels,
      } : current)
      setMessage(missing.length ? "Alterações salvas. Complete os itens indicados para enriquecer seu perfil. Seu card continua no Acervo." : "Perfil completo e salvo. Seus serviços já estão disponíveis na página da sua Referência.")
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
      const optimized = await compactarImagem(file, { maxDimension: 1800, quality: 0.84 })
      const extension = "webp"
      const path = `${userId}/${crypto.randomUUID()}.${extension}`
      const upload = await db.storage.from("supplier-covers").upload(path, optimized, { contentType: optimized.type, cacheControl: "3600", upsert: false })
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

  async function downloadSeal() {
    if (!supplier || !validUntil || downloadingSeal) return
    setDownloadingSeal(true)
    setMessage("")
    setError("")
    try {
      const expiry = new Date(validUntil)
      if (!supplier.has_divine_seal || !Number.isFinite(expiry.getTime()) || expiry.getTime() <= Date.now()) {
        throw new Error("A Chancela precisa estar vigente para gerar a arte.")
      }
      const image = new window.Image()
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error("Não foi possível carregar a Chancela DIVINE."))
        image.src = "/divine-seal2.svg"
      })

      const canvas = document.createElement("canvas")
      canvas.width = 1200
      canvas.height = 1800
      const context = canvas.getContext("2d")
      if (!context) throw new Error("Seu navegador não permite gerar a arte.")
      const center = canvas.width / 2
      context.fillStyle = "#171715"
      context.fillRect(0, 0, 1200, 1800)
      context.strokeStyle = "#aa8050"
      context.lineWidth = 2
      context.strokeRect(46, 46, 1108, 1708)
      context.strokeStyle = "#443b2d"
      context.lineWidth = 1
      context.strokeRect(59, 59, 1082, 1682)
      context.textAlign = "center"
      context.fillStyle = "#f3ecdf"
      context.font = "46px Georgia, serif"
      context.fillText("D I V I N E", center, 174)
      context.fillStyle = "#baa27d"
      context.font = "18px Arial, sans-serif"
      context.fillText("C U R A D O R I A   N U P C I A L", center, 220)
      context.drawImage(image, 400, 302, 400, 400)
      context.fillStyle = "#c9a677"
      context.font = "22px Arial, sans-serif"
      context.fillText("R E F E R Ê N C I A   D I V I N E", center, 777)

      // Fit the complete saved name, including long names, without truncation.
      const nome = supplier.business_name.trim() || "Referência DIVINE"
      const wrapName = (size: number): string[] => {
        context.font = size + "px Georgia, serif"
        const lines: string[] = []
        let line = ""
        for (const character of Array.from(nome)) {
          if (context.measureText(line + character).width > 940 && line) {
            const space = line.lastIndexOf(" ")
            if (space > 0) {
              lines.push(line.slice(0, space))
              line = line.slice(space + 1) + character
            } else {
              lines.push(line)
              line = character
            }
          } else line += character
        }
        if (line) lines.push(line.trim())
        return lines
      }
      let size = 66
      let lines = wrapName(size)
      while (lines.length > 3 && size > 20) {
        size -= 2
        lines = wrapName(size)
      }
      context.fillStyle = "#f3ecdf"
      const lineHeight = size * 1.18
      const firstLine = 906 - ((lines.length - 1) * lineHeight) / 2
      lines.forEach((line, index) => context.fillText(line, center, firstLine + index * lineHeight))

      context.strokeStyle = "#aa8050"
      context.beginPath()
      context.moveTo(505, 1060)
      context.lineTo(695, 1060)
      context.stroke()
      context.fillStyle = "#d2c8b7"
      context.font = "25px Georgia, serif"
      context.fillText("Um reconhecimento à excelência.", center, 1122)
      context.font = "20px Arial, sans-serif"
      context.fillText("Selecionado para integrar o Acervo DIVINE.", center, 1166)
      const validade = new Intl.DateTimeFormat("pt-BR", { year: "numeric", timeZone: "America/Sao_Paulo" }).format(expiry)
      context.fillStyle = "#c9a677"
      context.font = "38px Georgia, serif"
      context.fillText("Chancela · " + validade, center, 1250)
      context.font = "18px Arial, sans-serif"
      context.fillText("Válida até " + new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(expiry), center, 1288)

      // Fixed site QR: error correction M and four-module white quiet zone.
      // Destination: https://www.divinecuradoria.com.br/
      const qrRows = ["0000000000000000000000000000000000000","0000000000000000000000000000000000000","0000000000000000000000000000000000000","0000000000000000000000000000000000000","0000111111101010011010100011111110000","0000100000100111011100010010000010000","0000101110100100001001000010111010000","0000101110101110100010100010111010000","0000101110101010100001100010111010000","0000100000101011000011011010000010000","0000111111101010101010101011111110000","0000000000001010010001110000000000000","0000100010111111010101010111110010000","0000100110011001011100000011111110000","0000100010111001000110001011100010000","0000000000000110001011001110110110000","0000111100110011011011010100000100000","0000111000000100000111100010111110000","0000101001110010111111001100111010000","0000110011001001010011110010000110000","0000001110110110010001011101000100000","0000100100001110011110100111110110000","0000001110110100100111001010101010000","0000000101001001101001101100000110000","0000110011101101011101111111110010000","0000000000001010000101111000100010000","0000111111101110011100111010111010000","0000100000100010110101011000100000000","0000101110101101110101011111110000000","0000101110100010011110110101000010000","0000101110100010101100011100011110000","0000100000100010010001101100110110000","0000111111101111100101001101100100000","0000000000000000000000000000000000000","0000000000000000000000000000000000000","0000000000000000000000000000000000000","0000000000000000000000000000000000000"]
      const moduleSize = 6
      const qrSize = qrRows.length * moduleSize
      const qrX = (canvas.width - qrSize) / 2
      const qrY = 1360
      context.fillStyle = "#ffffff"
      context.fillRect(qrX, qrY, qrSize, qrSize)
      context.fillStyle = "#111111"
      qrRows.forEach((row, y) => {
        Array.from(row).forEach((cell, x) => {
          if (cell === "1") context.fillRect(qrX + x * moduleSize, qrY + y * moduleSize, moduleSize, moduleSize)
        })
      })
      context.fillStyle = "#d2c8b7"
      context.font = "18px Arial, sans-serif"
      context.fillText("divinecuradoria.com.br", center, 1624)
      context.fillStyle = "#baa27d"
      context.font = "16px Arial, sans-serif"
      context.fillText("CENTRO-OESTE MINEIRO", center, 1692)

      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error("Não foi possível preparar o arquivo.")), "image/png"
      ))
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = `chancela-divine-${nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${validade}.png`
      link.href = url
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 60000)
      setMessage("Arte personalizada da Chancela baixada.")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível gerar a arte da Chancela.")
    } finally {
      setDownloadingSeal(false)
    }
  }

  function toggleCategory(id: string) {
    const next = selectedCategories.includes(id) ? selectedCategories.filter(item => item !== id) : [...selectedCategories, id]
    const nextOptions = uniqueServices(categories.filter(category => next.includes(category.id)).flatMap(category => servicesForCategory(category.name)))
    // Ao remover uma categoria, conservar serviços como texto editável evita perda silenciosa.
    const retainedAsOther = selectedServices.filter(service => !nextOptions.includes(service))
    if (retainedAsOther.length) updateField("services", uniqueServices([...form.services.split("\n"), ...retainedAsOther]).join("\n"))
    setSelectedServices(current => current.filter(service => nextOptions.includes(service)))
    setSelectedCategories(next)
    if (primaryCategory === id && !next.includes(id)) setPrimaryCategory("")
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
            <form id="supplier-profile" onSubmit={saveProfile} className="space-y-6">
              <fieldset disabled={saving || uploading} className="space-y-6 min-w-0">
              <section aria-label="Preenchimento do perfil" className="rounded-xl border border-bronze/30 bg-bronze/5 p-5">
                <h2 className="font-serif text-2xl">{missing.length ? `Faltam ${missing.length} informações para completar seu perfil` : "Seu perfil está completo"}</h2>
                <p className="mt-2 text-sm leading-relaxed">Você pode salvar aos poucos. Completar o perfil ajuda os casais a conhecer sua proposta; a Chancela é uma decisão editorial.</p>
                {!!missing.length && <ul className="mt-3 flex flex-wrap gap-2">{missing.map(item => <li key={item.target}><a className="inline-block rounded border border-bronze/30 bg-white px-3 py-2 text-sm underline underline-offset-4" href={`#${item.target}`}>{item.label}</a></li>)}</ul>}
              </section>
              <section className="space-y-5 border-t border-linha pt-6">
                <h2 className="font-serif text-2xl">Informações do card</h2>
                <label className="block text-sm">Nome público<input id="public-name" required maxLength={160} value={form.businessName} onChange={(event) => updateField("businessName", event.target.value)} className={fieldClass} /></label>
                <label className="block text-sm">Texto de apresentação<textarea id="presentation" maxLength={1200} rows={5} value={form.bio} onChange={(event) => updateField("bio", event.target.value)} className={fieldClass} /></label>
                <label className="block text-sm">Link principal do portfólio<input id="portfolio-link" type="url" placeholder="https://" value={form.portfolioUrl} onChange={(event) => updateField("portfolioUrl", event.target.value)} className={fieldClass} /></label>

                <fieldset>
                  <legend className="text-sm">Categorias de atuação <span className="text-onix/50">(selecione uma ou mais)</span></legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">{categories.map((category) => <label key={category.id} className="flex items-start gap-2 rounded border border-linha bg-white p-3 text-sm"><input type="checkbox" checked={selectedCategories.includes(category.id)} onChange={() => toggleCategory(category.id)} className="mt-0.5" />{category.name}</label>)}</div>
                  {!!selectedNames.length && <p className="mt-3 text-xs text-onix/60">Selecionadas: {selectedNames.join(" · ")}</p>}
                </fieldset>
                <label className="block text-sm">Categoria principal<select id="primary-category" value={primaryCategory} onChange={event => setPrimaryCategory(event.target.value)} className={fieldClass}><option value="">Selecione</option>{categories.filter(category => selectedCategories.includes(category.id)).map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                <fieldset id="offered-services" className="scroll-mt-32">
                  <legend className="font-serif text-2xl">Serviços oferecidos</legend>
                  <p className="mt-2 text-sm text-onix/70">Marque apenas o que você oferece. A composição da proposta será combinada com o casal.</p>
                  {!selectedCategories.length && <p className="mt-3 text-sm">Selecione uma categoria acima para ver os serviços.</p>}
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">{serviceOptions.map(service => <label key={service} className="flex items-start gap-2 rounded border border-linha bg-white p-3 text-sm"><input type="checkbox" checked={selectedServices.includes(service)} onChange={() => setSelectedServices(current => current.includes(service) ? current.filter(item => item !== service) : [...current, service])} className="mt-0.5" />{service}</label>)}</div>
                  <label className="mt-4 block text-sm">Outros serviços personalizados<textarea maxLength={4800} rows={3} value={form.services} onChange={event => updateField("services", event.target.value)} className={fieldClass} /><span className="mt-2 block text-xs text-onix/60">Um por linha. Seus serviços anteriores foram preservados.</span></label>
                </fieldset>
                <section id="service-territory" className="scroll-mt-32 space-y-4 border-t border-linha pt-5">
                  <h2 className="font-serif text-2xl">Onde você atende</h2>
                  <label className="block text-sm">Cidade-base<select id="base-city" value={baseCity} onChange={event => setBaseCity(event.target.value)} className={fieldClass}><option value="">Selecione</option>{cities.map(city => <option key={city.id} value={city.id}>{city.name} — {city.state}</option>)}</select></label>
                  <fieldset><legend className="text-sm">Cidades atendidas — marque também sua cidade-base se atender nela</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{cities.map(city => <label key={city.id} className="flex items-start gap-2 rounded border border-linha bg-white p-3 text-sm"><input type="checkbox" checked={serviceCities.includes(city.id)} onChange={() => setServiceCities(current => current.includes(city.id) ? current.filter(id => id !== city.id) : [...current, city.id])} className="mt-0.5" />{city.name} — {city.state}</label>)}</div></fieldset>
                  <label className="block text-sm">Outras cidades ou regiões atendidas<input maxLength={500} value={otherAreas} onChange={event => setOtherAreas(event.target.value)} className={fieldClass} placeholder="Ex.: outras cidades de Minas Gerais, sob consulta" /></label>
                </section>
                <fieldset id="investment-levels" className="scroll-mt-32 space-y-3 border-t border-linha pt-5">
                  <legend className="font-serif text-2xl">Faixas de investimento</legend>
                  <p className="text-sm leading-relaxed text-onix/70">Selecione uma ou mais faixas que representem suas propostas. São orientações de investimento, sem relação com a qualidade ou a Chancela DIVINE.</p>
                  {INVESTMENT_OPTIONS.map(option => <label key={option.value} className="flex items-start gap-3 rounded-lg border border-linha bg-white p-4 text-sm"><input type="checkbox" checked={investmentLevels.includes(option.value)} onChange={() => setInvestmentLevels(current => current.includes(option.value) ? current.filter(value => value !== option.value) : [...current, option.value])} className="mt-1" /><span><strong>{option.label}</strong><span className="mt-1 block text-onix/70">{option.description}</span></span></label>)}
                  <p className="text-sm text-onix/70">Disponibilidade e proposta comercial sempre sob consulta.</p>
                </fieldset>
                <button type="submit" disabled={saving || uploading} className="w-full rounded-lg bg-onix px-6 py-4 text-alabastro disabled:opacity-60">{saving ? "Salvando…" : "Salvar informações públicas"}</button>
              </section>
              </fieldset>
            </form>

            <aside className="space-y-8">
              <section id="cover-photo" className="scroll-mt-32 border-t border-linha pt-6">
                <h2 className="font-serif text-2xl">Foto de capa</h2>
                {supplier.cover_image_url ? <img src={supplier.cover_image_url} alt="Capa atual do perfil" className="mt-4 aspect-[4/5] w-full rounded-lg object-cover" /> : <div className="mt-4 flex aspect-[4/5] items-center justify-center rounded-lg bg-onix text-4xl text-alabastro">D</div>}
                <label className="mt-4 block cursor-pointer rounded-lg border border-onix px-4 py-3 text-center text-sm hover:border-bronze">{uploading ? "Enviando…" : "Enviar nova foto"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadCover} disabled={uploading || saving} className="sr-only" /></label>
                <p className="mt-3 text-xs leading-relaxed text-onix/60">Use uma imagem horizontal ou vertical de boa qualidade, com até 6 MB. Ela ficará visível no card público do Acervo.</p>
              </section>

              {supplier.has_divine_seal && <section className="border-t border-linha pt-6">
                <h2 className="font-serif text-2xl">Chancela DIVINE</h2>
                <div className="mt-4 flex items-center gap-4 rounded-xl border border-bronze/30 bg-bronze/5 p-4">
                  <img src="/divine-seal2.svg" alt="Chancela DIVINE" className="h-20 w-20 shrink-0 object-contain" />
                  <div>
                    <p className="text-sm font-medium">Referência DIVINE</p>
                    {validUntil
                      ? <p className="mt-1 text-xs leading-relaxed text-onix/60">Validade editorial até {formatValidity(validUntil)}.</p>
                      : <p className="mt-1 text-xs leading-relaxed text-onix/60">A validade editorial está sendo sincronizada.</p>}
                  </div>
                </div>
                <button type="button" onClick={downloadSeal} disabled={downloadingSeal || !validUntil} className="mt-4 w-full rounded-lg border border-onix px-4 py-3 text-sm transition hover:border-bronze hover:text-bronze disabled:opacity-50">
                  {downloadingSeal ? "Preparando arte…" : validUntil ? "Baixar arte personalizada" : "Arte aguardando validade"}
                </button>
                <p className="mt-3 text-xs leading-relaxed text-onix/60">Arte vertical em PNG com o nome público da sua empresa, validade da Chancela e QR code para o site DIVINE. Use-a apenas enquanto a referência estiver vigente.</p>
              </section>}

              <section className="border-t border-linha pt-6">
                <h2 className="font-serif text-2xl">Contato e redes</h2>
                <div className="mt-5 space-y-4">
                  <label className="block text-sm">WhatsApp<input id="contact-whatsapp" form="supplier-profile" disabled={saving || uploading} type="tel" maxLength={30} value={form.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} className={fieldClass} /></label>
                  <label className="block text-sm">Instagram<input form="supplier-profile" disabled={saving || uploading} type="url" maxLength={2000} placeholder="https://instagram.com/" value={form.instagram} onChange={(event) => updateField("instagram", event.target.value)} className={fieldClass} /></label>
                  <label className="block text-sm">Facebook<input form="supplier-profile" disabled={saving || uploading} type="url" maxLength={2000} placeholder="https://facebook.com/" value={form.facebook} onChange={(event) => updateField("facebook", event.target.value)} className={fieldClass} /></label>
                  <label className="block text-sm">TikTok<input form="supplier-profile" disabled={saving || uploading} type="url" maxLength={2000} placeholder="https://tiktok.com/@" value={form.tiktok} onChange={(event) => updateField("tiktok", event.target.value)} className={fieldClass} /></label>
                  <label className="block text-sm">Outro site<input form="supplier-profile" disabled={saving || uploading} type="url" maxLength={2000} placeholder="https://" value={form.website} onChange={(event) => updateField("website", event.target.value)} className={fieldClass} /></label>
                </div>
                <button type="submit" form="supplier-profile" disabled={saving || uploading} className="mt-4 w-full rounded-lg border border-onix px-4 py-3 text-sm disabled:opacity-50">{saving ? "Salvando…" : "Salvar contato e perfil"}</button>
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



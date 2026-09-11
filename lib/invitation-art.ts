import { INVITATION_QR_ROWS } from "@/lib/invitation-qr"

export const INVITATION_URL = "https://www.divinecuradoria.com.br/aplicar"
export type InvitationKind = "evaluation" | "approved"

export function invitationParagraphs(kind: InvitationKind): string[] {
  return kind === "approved" ? [
    "Seu trabalho foi avaliado pela Curadoria e aprovado como Referência DIVINE.",
    "Convidamos sua marca a integrar a formação inaugural do Acervo, ao lado de profissionais que expressam cuidado, identidade e compromisso com cada celebração.",
    "Acesse o formulário pelo QR code e apresente seus dados para darmos continuidade à sua participação e prepararmos seu perfil no Acervo.",
  ] : [
    "Seu trabalho despertou o olhar da Curadoria DIVINE.",
    "Convidamos sua marca a apresentar sua assinatura e trajetória para a formação inaugural do nosso Acervo no Centro-Oeste Mineiro.",
    "Acesse o formulário pelo QR code para iniciar sua apresentação. A participação no Acervo depende da avaliação e da aprovação editorial.",
  ]
}

function lines(context: CanvasRenderingContext2D, text: string, width: number) {
  const result: string[] = []
  let line = ""
  for (const word of text.split(/\s+/)) {
    if (context.measureText(word).width > width) throw new Error("O nome contém uma palavra muito longa. Use uma versão mais curta.")
    const next = line ? `${line} ${word}` : word
    if (context.measureText(next).width > width) { result.push(line); line = word }
    else line = next
  }
  if (line) result.push(line)
  return result
}

export function drawInvitation(canvas: HTMLCanvasElement, seal: CanvasImageSource, name: string, kind: InvitationKind, scriptFont: string) {
  const clean = name.trim().replace(/\s+/g, " ")
  if (!clean || clean.length > 100) throw new Error("Informe um nome com até 100 caracteres.")
  canvas.width = 1200; canvas.height = 1800
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Seu navegador não permite gerar a arte.")
  ctx.fillStyle = "#171715"; ctx.fillRect(0, 0, 1200, 1800)
  ctx.strokeStyle = "#aa8050"; ctx.lineWidth = 2; ctx.strokeRect(46, 46, 1108, 1708)
  ctx.strokeStyle = "#443b2d"; ctx.lineWidth = 1; ctx.strokeRect(59, 59, 1082, 1682)
  ctx.textAlign = "center"
  ctx.fillStyle = "#f3ecdf"; ctx.font = "46px Georgia, serif"; ctx.fillText("D I V I N E", 600, 148)
  ctx.fillStyle = "#baa27d"; ctx.font = "20px Arial, sans-serif"; ctx.fillText("C U R A D O R I A   N U P C I A L", 600, 192)
  ctx.drawImage(seal, 475, 232, 250, 250)
  ctx.fillStyle = "#d5b78d"; ctx.font = `84px ${scriptFont}`; ctx.fillText("Um convite especial", 600, 578)
  ctx.fillStyle = "#f3ecdf"
  let nameLines: string[] = []
  let size = 58
  for (; size >= 34; size -= 2) {
    ctx.font = `${size}px Georgia, serif`
    try { nameLines = lines(ctx, clean, 950) } catch { continue }
    if (nameLines.length <= 2) break
  }
  if (size < 34 || !nameLines.length || nameLines.length > 2) throw new Error("Use uma versão mais curta do nome para manter a leitura da arte.")
  nameLines.forEach((line, index) => ctx.fillText(line, 600, 688 + index * 68))
  ctx.strokeStyle = "#aa8050"; ctx.beginPath(); ctx.moveTo(480, 800); ctx.lineTo(720, 800); ctx.stroke()
  ctx.font = "32px Georgia, serif"
  let y = 872
  for (const paragraph of invitationParagraphs(kind)) {
    for (const line of lines(ctx, paragraph, 920)) { ctx.fillText(line, 600, y); y += 45 }
    y += 22
  }
  if (y > 1370) throw new Error("O texto ultrapassou o espaço da arte.")
  ctx.fillStyle = "#baa27d"; ctx.font = "20px Arial, sans-serif"; ctx.fillText("F O R M A Ç Ã O   I N A U G U R A L", 600, 1375)
  const unit = 5, width = INVITATION_QR_ROWS.length * unit, x = (1200 - width) / 2, top = 1410
  ctx.fillStyle = "#ffffff"; ctx.fillRect(x, top, width, width)
  ctx.fillStyle = "#111111"
  INVITATION_QR_ROWS.forEach((row, iy) => Array.from(row).forEach((cell, ix) => { if (cell === "1") ctx.fillRect(x + ix * unit, top + iy * unit, unit, unit) }))
  ctx.fillStyle = "#f3ecdf"; ctx.font = "22px Arial, sans-serif"; ctx.fillText("Aponte a câmera e apresente sua marca", 600, 1694)
  ctx.fillStyle = "#baa27d"; ctx.font = "18px Arial, sans-serif"; ctx.fillText("www.divinecuradoria.com.br/aplicar", 600, 1730)
}

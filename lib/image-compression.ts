export async function compactarImagem(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  const maxDimension = options.maxDimension ?? 1800
  const quality = options.quality ?? 0.84

  if (!file.type.startsWith("image/")) return file

  const source = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Imagem inválida")) }
    image.src = url
  })

  const scale = Math.min(1, maxDimension / Math.max(source.naturalWidth, source.naturalHeight))
  const width = Math.max(1, Math.round(source.naturalWidth * scale))
  const height = Math.max(1, Math.round(source.naturalHeight * scale))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) return file
  context.drawImage(source, 0, 0, width, height)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality))
  if (!blob) return file
  const baseName = file.name.replace(/\.[^.]+$/, "") || "imagem"
  return new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() })
}

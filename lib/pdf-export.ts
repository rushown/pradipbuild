export async function exportToPDF(element: HTMLElement, filename: string): Promise<void> {
const { default: html2canvas } = await import('html2canvas')
const { jsPDF } = await import('jspdf')
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const SCALE = 2
const originalBg = element.style.background
const originalBoxShadow = element.style.boxShadow
const originalBorderRadius = element.style.borderRadius
const originalWidth = element.style.width
const originalMaxWidth = element.style.maxWidth
element.style.background = '#ffffff'
element.style.boxShadow = 'none'
element.style.borderRadius = '0'
element.style.width = '794px'
element.style.maxWidth = '794px'
await document.fonts.ready

// Collect section break points before capture
const sections = element.querySelectorAll<HTMLElement>('[data-pdf-section]')
const elementTop = element.getBoundingClientRect().top
const breakPoints: number[] = [0]
sections.forEach((sec) => {
  const top = sec.getBoundingClientRect().top - elementTop + element.scrollTop
  breakPoints.push(top)
})

const canvas = await html2canvas(element, {
scale: SCALE,
useCORS: true,
allowTaint: true,
backgroundColor: '#ffffff',
logging: false,
imageTimeout: 15000,
width: 794,
windowWidth: 794,
windowHeight: element.scrollHeight,
  })
element.style.background = originalBg
element.style.boxShadow = originalBoxShadow
element.style.borderRadius = originalBorderRadius
element.style.width = originalWidth
element.style.maxWidth = originalMaxWidth
const pdf = new jsPDF({
orientation: 'portrait',
unit: 'mm',
format: 'a4',
compress: true,
  })
const canvasWidthPx = canvas.width
const canvasHeightPx = canvas.height
const pxPerMm = canvasWidthPx / A4_WIDTH_MM
const pageHeightPx = A4_HEIGHT_MM * pxPerMm

// Scale break points to canvas coordinates
const scaledBreaks = breakPoints.map((b) => b * SCALE)

// Build smart page cut points
const cuts: number[] = [0]
let pageStart = 0
while (pageStart < canvasHeightPx) {
  const idealEnd = pageStart + pageHeightPx
  if (idealEnd >= canvasHeightPx) break
  // Find the last break point that fits before idealEnd
  const best = scaledBreaks.filter((b) => b > pageStart && b <= idealEnd).pop()
  const cutAt = best ?? idealEnd
  cuts.push(cutAt)
  pageStart = cutAt
}
cuts.push(canvasHeightPx)

for (let i = 0; i < cuts.length - 1; i++) {
  if (i > 0) pdf.addPage()
  const srcY = cuts[i]
  const srcH = cuts[i + 1] - cuts[i]
  const pageCanvas = document.createElement('canvas')
  pageCanvas.width = canvasWidthPx
  pageCanvas.height = pageHeightPx
  const ctx = pageCanvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
  ctx.drawImage(canvas, 0, srcY, canvasWidthPx, srcH, 0, 0, canvasWidthPx, srcH)
  const imgData = pageCanvas.toDataURL('image/png')
  pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM)
}
  pdf.save(filename)
}
export function getFilename(base: string, ext = 'pdf'): string {
const date = new Date().toISOString().slice(0, 10)
const safe = base.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30)
return `${safe}-${date}.${ext}`
}
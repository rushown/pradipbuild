/**
 * Proper multi-page PDF export.
 * Splits a tall DOM element into A4 pages using canvas rendering.
 */
export async function exportToPDF(element: HTMLElement, filename: string): Promise<void> {
  const { default: html2canvas } = await import('html2canvas')
  const { jsPDF } = await import('jspdf')

  const A4_WIDTH_MM = 210
  const A4_HEIGHT_MM = 297
  const SCALE = 2 // retina quality

  // Temporarily force white background and full width
  const originalBg = element.style.background
  const originalBoxShadow = element.style.boxShadow
  const originalBorderRadius = element.style.borderRadius
  element.style.background = '#ffffff'
  element.style.boxShadow = 'none'
  element.style.borderRadius = '0'

  const canvas = await html2canvas(element, {
    scale: SCALE,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 15000,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  })

  // Restore
  element.style.background = originalBg
  element.style.boxShadow = originalBoxShadow
  element.style.borderRadius = originalBorderRadius

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const canvasWidthPx = canvas.width
  const canvasHeightPx = canvas.height

  // How many px = 1mm at this scale
  const pxPerMm = canvasWidthPx / A4_WIDTH_MM

  // Page height in px
  const pageHeightPx = A4_HEIGHT_MM * pxPerMm

  const totalPages = Math.ceil(canvasHeightPx / pageHeightPx)

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) pdf.addPage()

    // Slice the canvas into a page-sized chunk
    const srcY = page * pageHeightPx
    const srcH = Math.min(pageHeightPx, canvasHeightPx - srcY)

    // Create a page-sized canvas
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvasWidthPx
    pageCanvas.height = pageHeightPx // always full page height (blank at bottom for last page)
    const ctx = pageCanvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    ctx.drawImage(canvas, 0, srcY, canvasWidthPx, srcH, 0, 0, canvasWidthPx, srcH)

    const imgData = pageCanvas.toDataURL('image/jpeg', 0.92)
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM)
  }

  pdf.save(filename)
}

export function getFilename(base: string, ext = 'pdf'): string {
  const date = new Date().toISOString().slice(0, 10)
  const safe = base.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30)
  return `${safe}-${date}.${ext}`
}

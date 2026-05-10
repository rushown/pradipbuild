import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import type { ParsedDocument } from '@/types/europass'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    const parsed: ParsedDocument[] = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const name = file.name.toLowerCase()

      let text = ''

      try {
        if (name.endsWith('.pdf')) {
          const result = await pdfParse(buffer)
          text = result.text
        } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
          const result = await mammoth.extractRawText({ buffer })
          text = result.value
        } else if (name.endsWith('.txt') || name.endsWith('.md')) {
          text = buffer.toString('utf-8')
        } else if (name.endsWith('.json')) {
          const raw = buffer.toString('utf-8')
          const obj = JSON.parse(raw)
          text = JSON.stringify(obj, null, 2)
        } else {
          text = buffer.toString('utf-8')
        }
      } catch {
        text = `[Could not parse ${file.name} — it may be image-based or encrypted]`
      }

      parsed.push({
        filename: file.name,
        text: text.trim().slice(0, 20000),
        type: file.type,
      })
    }

    const combinedText = parsed
      .map((d) => `=== ${d.filename} ===\n${d.text}`)
      .join('\n\n')

    return NextResponse.json({ documents: parsed, combinedText })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

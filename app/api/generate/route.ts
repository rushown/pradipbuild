import { NextRequest, NextResponse } from 'next/server'
import { getGroqClient, GROQ_MODEL } from '@/lib/groq'
import type { EuropassCV } from '@/types/europass'

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are an expert Europass CV writer and career consultant. 
You extract structured information from raw document text and produce a complete, professional Europass CV in JSON format.

CRITICAL: Respond ONLY with valid JSON. No markdown, no explanation, no backticks. Pure JSON only.

The JSON must match this exact structure:
{
  "personalInfo": {
    "firstName": "", "lastName": "", "email": "", "phone": "",
    "address": "", "city": "", "country": "", "nationality": "",
    "dateOfBirth": "", "gender": "", "linkedin": "", "website": ""
  },
  "personalStatement": "2-3 sentences professional summary in first person",
  "workExperience": [
    {
      "id": "unique-id",
      "jobTitle": "", "employer": "", "city": "", "country": "",
      "startDate": "MM/YYYY", "endDate": "MM/YYYY", "current": false,
      "description": "Role overview",
      "activities": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "id": "unique-id",
      "title": "", "institution": "", "city": "", "country": "",
      "startDate": "MM/YYYY", "endDate": "MM/YYYY", "current": false,
      "eqfLevel": "6", "field": "", "description": ""
    }
  ],
  "languages": [
    {
      "language": "", "native": true,
      "listening": "C2", "reading": "C2", "spokenProduction": "C2",
      "spokenInteraction": "C2", "writing": "C2", "certificate": ""
    }
  ],
  "digitalSkills": [
    { "area": "", "level": "Advanced", "description": "" }
  ],
  "otherSkills": [
    { "category": "", "description": "" }
  ],
  "drivingLicense": [],
  "additionalInfo": ""
}

Rules:
- Infer missing dates as empty strings, not null
- CEFR levels: A1, A2, B1, B2, C1, C2, or Native
- EQF levels: 1-8 (bachelor=6, master=7, phd=8)
- Make personalStatement compelling and professional
- Enhance bullet points to be achievement-oriented
- Fill ALL fields — never leave them as null
- Deduplicate and order work experience by most recent first
- IDs should be short random strings like "exp1", "edu2"`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { combinedText, additionalContext } = body as {
      combinedText: string
      additionalContext?: string
    }

    if (!combinedText) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const groq = getGroqClient()

    const userPrompt = `Extract and structure a complete Europass CV from the following documents.
${additionalContext ? `\nAdditional context from user: ${additionalContext}\n` : ''}

DOCUMENTS:
${combinedText.slice(0, 15000)}

Return ONLY the JSON object. No other text.`

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'

    let cv: EuropassCV
    try {
      cv = JSON.parse(raw)
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('AI did not return valid JSON')
      cv = JSON.parse(jsonMatch[0])
    }

    const notes: string[] = []
    if (!cv.personalInfo?.email) notes.push('No email found — please add manually')
    if (!cv.workExperience?.length) notes.push('No work experience detected')
    if (!cv.education?.length) notes.push('No education detected')

    return NextResponse.json({
      cv,
      confidence: notes.length === 0 ? 95 : notes.length === 1 ? 80 : 65,
      notes,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getGroqClient, GROQ_MODEL } from '@/lib/groq'
import type { IntelligenceReport } from '@/types/europass'

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are a document intelligence expert. You analyse raw text extracted from uploaded documents and identify:
1. What type each document is
2. Key information extracted from each
3. Overall profile of the person

CRITICAL: Respond ONLY with valid JSON. No markdown, no backticks, no explanation.

Return exactly this structure:
{
  "documents": [
    {
      "filename": "exactly as given",
      "category": "one of: cv_resume | cover_letter | passport_id | degree_transcript | work_certificate | reference_letter | linkedin_export | portfolio | other",
      "categoryLabel": "Human readable label like 'CV / Resume' or 'University Transcript'",
      "confidence": 95,
      "keyFindings": ["Full name detected: John Smith", "5 years experience in software", "Degree: BSc Computer Science"],
      "summary": "One sentence summary of what this document contains"
    }
  ],
  "combinedInsights": "2-3 sentence overall assessment of the person's profile based on all documents",
  "detectedLanguages": ["English", "French"],
  "detectedSkills": ["Python", "Project Management", "SQL"],
  "detectedRoles": ["Software Engineer", "Team Lead"],
  "recommendedMode": "europass",
  "overallConfidence": 88
}

Category guide:
- cv_resume: any CV, resume, or career profile
- cover_letter: any cover letter or motivation letter
- passport_id: passport, national ID, birth certificate
- degree_transcript: university degree, diploma, academic transcript, course certificate
- work_certificate: employer reference, work contract, employment letter, payslip
- reference_letter: recommendation letter, professional reference
- linkedin_export: LinkedIn data export (usually JSON or PDF with LinkedIn branding)
- portfolio: portfolio, project list, publication list
- other: anything else

recommendedMode: suggest 'europass' if they have a CV, 'cover_letter' if they need a letter, 'cv_summary' for analysis only`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { documents, combinedText } = body as {
      documents: Array<{ filename: string; text: string }>
      combinedText: string
    }

    const groq = getGroqClient()

    const docsSnippet = documents
      .map((d) => `=== FILE: ${d.filename} ===\n${d.text.slice(0, 3000)}`)
      .join('\n\n')

    const userPrompt = `Analyse the following ${documents.length} document(s) and classify each one.

${docsSnippet}

Return the intelligence report JSON.`

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    let report: IntelligenceReport

    try {
      report = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('AI did not return valid JSON')
      report = JSON.parse(match[0])
    }

    return NextResponse.json(report)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

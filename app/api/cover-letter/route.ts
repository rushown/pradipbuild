import { NextRequest, NextResponse } from 'next/server'
import { getGroqClient, GROQ_MODEL } from '@/lib/groq'
import type { CoverLetter, CoverLetterRequest } from '@/types/europass'

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are an expert cover letter writer specialising in Europass-style professional cover letters.
Write compelling, personalised cover letters based on the candidate documents and the target job.

CRITICAL: Respond ONLY with valid JSON. No markdown, no backticks.

Return exactly:
{
  "recipientName": "Hiring Manager",
  "recipientTitle": "Hiring Manager",
  "company": "Company name",
  "companyAddress": "",
  "date": "DD Month YYYY",
  "subject": "Application for [Job Title] position",
  "salutation": "Dear Hiring Manager,",
  "opening": "Strong opening paragraph 2-3 sentences",
  "body": ["Second paragraph", "Third paragraph with achievements", "Fourth paragraph cultural fit"],
  "closing": "Closing with call to action",
  "signoff": "Yours sincerely,",
  "senderName": "Full Name",
  "senderTitle": "Current title",
  "senderEmail": "email@example.com",
  "senderPhone": "+XX XXX XXX XXXX"
}

Rules: Be specific, reference actual achievements, 350-450 words total, active voice.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { combinedText, jobDetails } = body as {
      combinedText: string
      jobDetails: CoverLetterRequest
    }

    const groq = getGroqClient()

    const userPrompt = `Write a cover letter for:
Job Title: ${jobDetails.jobTitle}
Company: ${jobDetails.company}
${jobDetails.country ? `Country: ${jobDetails.country}` : ''}
${jobDetails.recipientName ? `Recipient: ${jobDetails.recipientName}` : ''}
${jobDetails.jobDescription ? `\nJob Description:\n${jobDetails.jobDescription.slice(0, 1500)}` : ''}

CANDIDATE DOCUMENTS:
${combinedText.slice(0, 12000)}

Return ONLY the JSON.`

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    let letter: CoverLetter
    try {
      letter = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('AI did not return valid JSON')
      letter = JSON.parse(match[0])
    }

    return NextResponse.json({ letter })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getGroqClient, GROQ_MODEL_FAST } from '@/lib/groq'
import type { AIGuide, AppStep, GenerationMode } from '@/types/europass'

export const runtime = 'nodejs'
export const maxDuration = 30

const SYSTEM_PROMPT = `You are a friendly, expert career coach embedded inside a CV builder app called PradipBuild.
Your job is to guide the user step by step through building a perfect Europass CV.

You receive: the current app step, mode, and the current state of their CV (which fields are filled, which are empty).

CRITICAL: Respond ONLY with valid JSON. No markdown, no explanation, no backticks.

Return exactly:
{
  "stepSummary": "One sentence describing where the user currently is in the process",
  "completenessScore": 72,
  "actions": [
    {
      "id": "unique-action-id",
      "priority": "critical",
      "section": "Personal Info",
      "title": "Add your email address",
      "description": "Your CV is missing an email. Recruiters need this to contact you.",
      "howTo": "Click the 'Personal' tab in the editor on the left, then fill in the Email field.",
      "ctaLabel": "Go to Personal Info",
      "ctaTarget": "personal"
    }
  ],
  "nextStep": "What the user should do immediately next (1-2 sentences)",
  "encouragement": "A short, genuine, non-cringe motivational line based on their actual progress"
}

Priority levels:
- critical: missing data that makes the CV unusable (no name, no email, no work experience)
- high: important missing sections (no languages, no education)  
- medium: quality improvements (weak bullet points, vague summary)
- low: polish items (missing LinkedIn, no driving license)

Action ctaTarget values (editor tabs): personal | statement | work | education | languages | skills

Keep actions concise and specific. Max 6 actions. Order by priority.
completenessScore: 0 = empty, 100 = perfect Europass CV with everything filled.
Be honest about the score — don't inflate it.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { step, mode, cvSnapshot } = body as {
      step: AppStep
      mode: GenerationMode
      cvSnapshot: Record<string, unknown>
    }

    const groq = getGroqClient()

    const userPrompt = `Current app step: ${step}
Current mode: ${mode}

CV state snapshot:
${JSON.stringify(cvSnapshot, null, 2).slice(0, 4000)}

Analyse this CV and return a guide with specific, actionable feedback.`

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL_FAST,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    let guide: AIGuide

    try {
      guide = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('AI returned invalid JSON')
      guide = JSON.parse(match[0])
    }

    return NextResponse.json(guide)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
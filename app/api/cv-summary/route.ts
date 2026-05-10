import { NextRequest, NextResponse } from 'next/server'
import { getGroqClient, GROQ_MODEL } from '@/lib/groq'
import type { CvSummary } from '@/types/europass'

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are a senior career coach. Analyse the candidate's documents and produce an insightful professional summary report.

CRITICAL: Respond ONLY with valid JSON. No markdown, no backticks.

Return exactly:
{
  "headline": "Senior Data Engineer | 7 years | Python · Spark · AWS",
  "professionalSummary": "3-4 sentences painting a compelling picture of this person's career",
  "topStrengths": ["Leadership", "Python & data engineering", "Cross-cultural communication"],
  "keyAchievements": ["Led migration of 200TB data warehouse saving €400k/year", "Built team from 2 to 12 engineers"],
  "skillsOverview": ["Python", "SQL", "Apache Spark", "AWS", "Team leadership", "Agile"],
  "careerTrajectory": "2-3 sentences describing their career arc and progression",
  "recommendedRoles": ["Senior Data Engineer", "Data Architect", "Engineering Manager"],
  "gaps": ["No certifications detected", "Gap in employment 2020-2021 not explained"]
}

Be honest about gaps. Highlight genuine strengths. Base everything on the actual documents.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { combinedText } = body as { combinedText: string }

    const groq = getGroqClient()

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyse these documents and produce a career summary:\n\n${combinedText.slice(0, 14000)}\n\nReturn ONLY JSON.` },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    let summary: CvSummary
    try {
      summary = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('AI did not return valid JSON')
      summary = JSON.parse(match[0])
    }

    return NextResponse.json({ summary })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

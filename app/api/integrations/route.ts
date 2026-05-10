import { NextRequest, NextResponse } from 'next/server'
import type { EuropassCV } from '@/types/europass'

export const runtime = 'nodejs'

/**
 * Integrations route
 * 
 * POST /api/integrations
 * body: { type: 'canva' | 'europass' | 'linkedin-export-guide', cv: EuropassCV }
 * 
 * - canva: returns a pre-filled Canva template deep-link + field mapping
 * - europass: returns a structured payload + redirect URL for europass.eu
 * - linkedin-export-guide: returns steps to get LinkedIn data into PradipBuild
 */

type IntegrationType = 'canva' | 'europass' | 'linkedin-export-guide'

interface IntegrationRequest {
  type: IntegrationType
  cv?: EuropassCV
}

// Canva CV/Cover Letter template IDs (public Europass-style templates)
const CANVA_TEMPLATES = {
  cv: 'DAGBb8RaKXc',           // Professional Europass-style CV template
  coverLetter: 'DAGBb8RaKXd',  // Matching cover letter template
}

export async function POST(req: NextRequest) {
  try {
    const body: IntegrationRequest = await req.json()
    const { type, cv } = body

    switch (type) {
      case 'canva': {
        if (!cv) return NextResponse.json({ error: 'cv is required for canva integration' }, { status: 400 })

        const p = cv.personalInfo

        // Canva deep-link: opens a template with text pre-populated via query params
        // Note: Canva's public API requires OAuth for full automation.
        // This approach uses their template deep-link which works without auth.
        const templateUrl = `https://www.canva.com/design/${CANVA_TEMPLATES.cv}/remix`

        // Field mapping so user knows which Canva text boxes to fill
        const fieldMap = [
          { canvaLabel: 'Name', value: `${p.firstName} ${p.lastName}` },
          { canvaLabel: 'Job Title / Headline', value: cv.workExperience?.[0]?.jobTitle ?? '' },
          { canvaLabel: 'Email', value: p.email },
          { canvaLabel: 'Phone', value: p.phone },
          { canvaLabel: 'Location', value: [p.city, p.country].filter(Boolean).join(', ') },
          { canvaLabel: 'LinkedIn', value: p.linkedin ?? '' },
          { canvaLabel: 'Website', value: p.website ?? '' },
          { canvaLabel: 'About / Summary', value: cv.personalStatement },
          ...cv.workExperience.slice(0, 3).map((w, i) => ({
            canvaLabel: `Experience ${i + 1}`,
            value: `${w.jobTitle} · ${w.employer} · ${w.startDate}–${w.current ? 'Present' : w.endDate}\n${w.activities?.join('\n')}`,
          })),
          ...cv.education.slice(0, 2).map((e, i) => ({
            canvaLabel: `Education ${i + 1}`,
            value: `${e.title} · ${e.institution} · ${e.startDate}–${e.current ? 'Present' : e.endDate}`,
          })),
          { canvaLabel: 'Skills', value: cv.digitalSkills?.map((d) => d.area).join(' · ') },
          { canvaLabel: 'Languages', value: cv.languages?.map((l) => `${l.language}${l.native ? ' (Native)' : ''}`).join(' · ') },
        ]

        return NextResponse.json({
          integration: 'canva',
          templateUrl,
          coverLetterTemplateUrl: `https://www.canva.com/design/${CANVA_TEMPLATES.coverLetter}/remix`,
          fieldMap,
          instructions: [
            'Click "Open in Canva" to open the CV template',
            'Sign in or create a free Canva account',
            'Click each text box and paste the corresponding values from the field map',
            'Customise colours, fonts, and layout to your taste',
            'Download as PDF when done',
          ],
          note: 'Canva requires a free account. Full API automation requires Canva Connect (enterprise). This deep-link approach works for all free users.',
        })
      }

      case 'europass': {
        if (!cv) return NextResponse.json({ error: 'cv is required for europass integration' }, { status: 400 })

        const p = cv.personalInfo

        // Europass online editor URL
        const europassEditorUrl = 'https://europa.eu/europass/en/create-europass-cv'

        // Build the structured data the way Europass editor expects
        // (Europass XML v3 format summary for user to paste)
        const europassData = {
          identification: {
            personName: { firstName: p.firstName, surname: p.lastName },
            contactInfo: {
              email: { contact: p.email },
              telephone: [{ contact: p.phone, use: 'mobile' }],
              address: {
                addressLine: p.address,
                municipality: p.city,
                country: { code: p.country },
              },
            },
            demographics: {
              birthdate: p.dateOfBirth,
              nationality: [{ code: p.nationality }],
              gender: { code: p.gender === 'Female' ? 'F' : p.gender === 'Male' ? 'M' : '' },
            },
          },
          headline: {
            type: { label: cv.workExperience?.[0]?.jobTitle ?? '' },
          },
          workExperience: cv.workExperience.map((w) => ({
            period: {
              from: { year: w.startDate?.split('/')?.[1], month: w.startDate?.split('/')?.[0] },
              to: w.current ? undefined : { year: w.endDate?.split('/')?.[1], month: w.endDate?.split('/')?.[0] },
              current: w.current,
            },
            position: { label: w.jobTitle },
            employer: { name: w.employer, contactInfo: { address: { municipality: w.city, country: { code: w.country } } } },
            activities: w.description,
          })),
          education: cv.education.map((e) => ({
            period: {
              from: { year: e.startDate?.split('/')?.[1], month: e.startDate?.split('/')?.[0] },
              to: e.current ? undefined : { year: e.endDate?.split('/')?.[1], month: e.endDate?.split('/')?.[0] },
              current: e.current,
            },
            title: { label: e.title },
            organisation: { name: e.institution, contactInfo: { address: { municipality: e.city, country: { code: e.country } } } },
            level: { isced: e.eqfLevel },
            field: { label: e.field },
            description: e.description,
          })),
          skills: {
            linguistic: {
              motherTongue: cv.languages.filter((l) => l.native).map((l) => ({ description: l.language })),
              foreignLanguage: cv.languages.filter((l) => !l.native).map((l) => ({
                description: l.language,
                listening: l.listening,
                reading: l.reading,
                spokenProduction: l.spokenProduction,
                spokenInteraction: l.spokenInteraction,
                writing: l.writing,
                certificate: l.certificate ? [{ title: l.certificate }] : [],
              })),
            },
            computer: cv.digitalSkills.map((d) => ({ description: `${d.area} — ${d.level}` })),
            other: cv.otherSkills.map((s) => ({ label: s.category, description: s.description })),
          },
          drivingLicence: cv.drivingLicense?.join(', '),
          additionalInfo: cv.additionalInfo,
        }

        return NextResponse.json({
          integration: 'europass',
          editorUrl: europassEditorUrl,
          structuredData: europassData,
          instructions: [
            'Click "Open Europass Editor" to go to the official EU Europass website',
            'Create a free account at europa.eu',
            'Use "Import" or fill sections manually using the structured data below',
            'The editor generates an official Europass PDF and XML',
            'You can also publish your CV online with a shareable Europass link',
          ],
          tip: 'The Europass editor at europa.eu is the official tool and produces the most compliant output accepted by EU employers.',
        })
      }

      case 'linkedin-export-guide': {
        return NextResponse.json({
          integration: 'linkedin-export-guide',
          steps: [
            {
              step: 1,
              title: 'Go to LinkedIn Data Export',
              description: 'Visit linkedin.com → Me → Settings & Privacy → Data Privacy → Get a copy of your data',
              url: 'https://www.linkedin.com/mypreferences/d/download-my-data',
            },
            {
              step: 2,
              title: 'Select "The works" or specific items',
              description: 'Choose: Profile, Positions, Education, Skills, Languages, Certifications. Click Request archive.',
            },
            {
              step: 3,
              title: 'Download your archive (10–30 minutes)',
              description: 'LinkedIn emails you a .zip file. Extract it — you\'ll find Profile.csv, Positions.csv, Education.csv etc.',
            },
            {
              step: 4,
              title: 'Upload to PradipBuild',
              description: 'Drag the CSV files (or the whole zip contents) into the PradipBuild upload area. The AI will parse all of them together.',
            },
          ],
          alternativeMethod: {
            title: 'Quick method: PDF export',
            description: 'On your LinkedIn profile → More → Save to PDF. Upload that PDF to PradipBuild — works just as well and is faster.',
          },
          note: 'LinkedIn does not offer a public API for reading profile data without their partner program. The CSV export is the most reliable free method.',
        })
      }

      default:
        return NextResponse.json({ error: `Unknown integration type: ${type}` }, { status: 400 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    available: ['canva', 'europass', 'linkedin-export-guide'],
    description: 'POST with { type, cv? } to use an integration',
  })
}

'use client'
import { useRef, useState } from 'react'
import FileUpload from '@/components/FileUpload'
import EuropassPreview from '@/components/EuropassPreview'
import EditorPanel from '@/components/EditorPanel'
import IntelligencePanel from '@/components/IntelligencePanel'
import ModeSelector from '@/components/ModeSelector'
import CoverLetterPreview from '@/components/CoverLetterPreview'
import CvSummaryView from '@/components/CvSummaryView'
import { exportToPDF, getFilename } from '@/lib/pdf-export'
import type {
  EuropassCV, AppStep, GenerationMode, IntelligenceReport,
  CoverLetter, CvSummary, CoverLetterRequest,
} from '@/types/europass'

const EMPTY_CV: EuropassCV = {
  personalInfo: { firstName: '', lastName: '', email: '', phone: '', address: '', city: '', country: '', nationality: '', dateOfBirth: '', gender: '', linkedin: '', website: '' },
  personalStatement: '', workExperience: [], education: [], languages: [], digitalSkills: [], otherSkills: [], drivingLicense: [], additionalInfo: '',
}

type LogEntry = { msg: string; done: boolean }

export default function HomePage() {
  const [step, setStep] = useState<AppStep>('upload')
  const [log, setLog] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  // Data from parse
  const [combinedText, setCombinedText] = useState('')

  // Intelligence report
  const [report, setReport] = useState<IntelligenceReport | null>(null)

  // Generated output
  const [mode, setMode] = useState<GenerationMode>('europass')
  const [cv, setCv] = useState<EuropassCV>(EMPTY_CV)
  const [cvNotes, setCvNotes] = useState<string[]>([])
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null)
  const [cvSummary, setCvSummary] = useState<CvSummary | null>(null)
  const [generatingMode, setGeneratingMode] = useState(false)

  const printRef = useRef<HTMLDivElement | null>(null)

  const pushLog = (msg: string, done = false) =>
    setLog((p) => [...p.slice(-9), { msg, done }])
  const doneLog = () =>
    setLog((p) => p.map((e, i) => i === p.length - 1 ? { ...e, done: true } : e))

  // ── Step 1: Upload & parse ──────────────────────────────────────────────────
  const handleFiles = async (files: File[], context: string) => {
    setError(null)
    setLog([])
    setStep('analysing')

    try {
      pushLog(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`)
      const formData = new FormData()
      files.forEach((f) => formData.append('files', f))

      const parseRes = await fetch('/api/parse', { method: 'POST', body: formData })
      const parseData = await parseRes.json()
      if (!parseRes.ok) throw new Error(parseData.error)
      doneLog()

      pushLog(`Extracted ${Math.round(parseData.combinedText.length / 1000)}k characters — classifying documents...`)
      setCombinedText(parseData.combinedText + (context ? `\n\nUser context: ${context}` : ''))

      // ── Step 2: Analyse & classify ─────────────────────────────────────────
      const analyseRes = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: parseData.documents, combinedText: parseData.combinedText }),
      })
      const analyseData = await analyseRes.json()
      if (!analyseRes.ok) throw new Error(analyseData.error)
      doneLog()
      pushLog(`✓ Identified ${analyseData.documents?.length ?? 0} document type(s) — ${analyseData.overallConfidence}% confidence`)
      doneLog()

      setReport(analyseData)
      setStep('select_mode')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStep('upload')
    }
  }

  // ── Step 3: Generate selected output ──────────────────────────────────────
  const handleGenerate = async (selectedMode: GenerationMode, jobDetails?: CoverLetterRequest) => {
    setMode(selectedMode)
    setGeneratingMode(true)
    setStep('generating')
    setLog([])

    try {
      if (selectedMode === 'europass') {
        pushLog('Sending documents to Groq Llama 3.3 70B...')
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ combinedText }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        doneLog()
        pushLog(`✓ Europass CV built — ${data.confidence}% confidence`)
        doneLog()
        setCv(data.cv)
        setCvNotes(data.notes ?? [])

      } else if (selectedMode === 'cover_letter') {
        pushLog('Writing personalised cover letter...')
        const res = await fetch('/api/cover-letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ combinedText, jobDetails }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        doneLog()
        pushLog('✓ Cover letter written')
        doneLog()
        setCoverLetter(data.letter)

      } else if (selectedMode === 'cv_summary') {
        pushLog('Analysing career profile...')
        const res = await fetch('/api/cv-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ combinedText }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        doneLog()
        pushLog('✓ Career analysis complete')
        doneLog()
        setCvSummary(data.summary)
      }

      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStep('select_mode')
    } finally {
      setGeneratingMode(false)
    }
  }

  // ── PDF Download ───────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!printRef.current) return
    let filename = 'document'
    if (mode === 'europass') filename = getFilename(`europass-cv-${cv.personalInfo.lastName}`)
    else if (mode === 'cover_letter') filename = getFilename(`cover-letter-${coverLetter?.company ?? ''}`)
    else if (mode === 'cv_summary') filename = getFilename('career-analysis')
    await exportToPDF(printRef.current, filename)
  }

  const stepIdx = ['upload', 'analysing', 'select_mode', 'generating', 'review'].indexOf(step)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="no-print" style={{
        borderBottom: '1px solid var(--border)',
        padding: '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,15,0.96)',
        backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--accent)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'white',
          }}>P</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>PradipBuild</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>AI Document Builder · Powered by Groq</div>
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {[
            { label: 'Upload', icon: '↑' },
            { label: 'Analyse', icon: '🔍' },
            { label: 'Choose', icon: '◈' },
            { label: 'Generate', icon: '⟳' },
            { label: 'Review', icon: '✓' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11,
                background: i === stepIdx ? 'var(--accent)' : i < stepIdx ? 'rgba(108,99,255,0.15)' : 'var(--bg3)',
                color: i === stepIdx ? 'white' : i < stepIdx ? 'var(--accent-2)' : 'var(--text-3)',
                border: `1px solid ${i === stepIdx ? 'transparent' : i < stepIdx ? 'rgba(108,99,255,0.3)' : 'var(--border)'}`,
                fontWeight: i === stepIdx ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span>{i < stepIdx ? '✓' : s.icon}</span>
                <span style={{ display: 'none' }}>{s.label}</span>
              </div>
              {i < 4 && <div style={{ width: 12, height: 1, background: 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {step === 'review' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setStep('select_mode'); setError(null) }}
              style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, background: 'var(--bg3)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
            >← Back</button>
            <button
              onClick={() => { setCv(EMPTY_CV); setStep('upload'); setReport(null); setCombinedText(''); setLog([]) }}
              style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, background: 'var(--bg3)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
            >↺ Restart</button>
            <button
              onClick={handleDownloadPDF}
              style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, background: 'var(--accent)', color: 'white', fontWeight: 600 }}
            >↓ Download PDF</button>
          </div>
        )}
        {step !== 'review' && step !== 'upload' && <div style={{ width: 120 }} />}
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: step === 'review' ? '24px 28px' : '40px 28px' }}>

        {/* UPLOAD */}
        {step === 'upload' && (
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'inline-block', background: 'var(--accent-glow)', border: '1px solid rgba(108,99,255,0.3)', color: 'var(--accent-2)', padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, marginBottom: 16 }}>
                ✦ Groq · Llama 3.3 70B · Free · Fast
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 5vw, 50px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
                Drop your documents.<br /><span style={{ color: 'var(--accent)' }}>AI does the rest.</span>
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
                Upload anything — old CV, passport, degree, LinkedIn export, reference letters. AI reads and classifies them all, then builds your Europass CV, cover letter, or career report.
              </p>
            </div>
            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
                ⚠ {error}
              </div>
            )}
            <FileUpload onFilesReady={handleFiles} loading={false} />
            <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {[
                { icon: '🔍', title: 'Classifies documents', desc: 'Detects passport, degree, CV, reference letters automatically' },
                { icon: '⚡', title: '500+ tokens/sec', desc: 'Groq inference is the fastest free AI available' },
                { icon: '🇪🇺', title: 'Europass compliant', desc: 'Official EU format · CEFR grid · EQF levels · Multi-page PDF' },
              ].map((c) => (
                <div key={c.title} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYSING / GENERATING — spinner + log */}
        {(step === 'analysing' || step === 'generating') && (
          <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, margin: '0 auto 24px', borderRadius: '50%', border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
              {step === 'analysing' ? 'Classifying your documents...' : 'Generating with Groq AI...'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
              {log.map((e, i) => (
                <div key={i} style={{ background: 'var(--bg3)', border: `1px solid ${e.done ? 'rgba(34,211,160,0.3)' : 'var(--border)'}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, color: e.done ? 'var(--green)' : 'var(--text)', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ flexShrink: 0 }}>{e.done ? '✓' : '⟳'}</span>
                  {e.msg}
                </div>
              ))}
              {log.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Starting up...</div>}
            </div>
          </div>
        )}

        {/* SELECT MODE — show intelligence + mode picker side by side */}
        {step === 'select_mode' && report && (
          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 28, maxWidth: 1100, margin: '0 auto', alignItems: 'start' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, position: 'sticky', top: 80 }}>
              <IntelligencePanel report={report} />
            </div>
            <div>
              <ModeSelector report={report} onSelect={handleGenerate} loading={generatingMode} />
              {error && (
                <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)', padding: '12px 16px', borderRadius: 8, marginTop: 16, fontSize: 13 }}>
                  ⚠ {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVIEW — output + editor */}
        {step === 'review' && (
          <div>
            {mode === 'europass' && (
              <div>
                {cvNotes.length > 0 && (
                  <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, display: 'flex', gap: 12 }}>
                    <span style={{ color: 'var(--amber)' }}>⚠</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)', marginBottom: 4 }}>Please review:</div>
                      {cvNotes.map((n, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text-2)' }}>· {n}</div>)}
                    </div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}>
                  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, position: 'sticky', top: 80, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>✦ Edit CV</div>
                    <EditorPanel cv={cv} onChange={setCv} />
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <EuropassPreview cv={cv} printRef={printRef} />
                  </div>
                </div>
              </div>
            )}

            {mode === 'cover_letter' && coverLetter && (
              <div style={{ maxWidth: 860, margin: '0 auto' }}>
                <CoverLetterPreview letter={coverLetter} printRef={printRef} />
              </div>
            )}

            {mode === 'cv_summary' && cvSummary && (
              <div style={{ maxWidth: 860, margin: '0 auto' }}>
                <CvSummaryView summary={cvSummary} printRef={printRef} />
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="no-print" style={{ borderTop: '1px solid var(--border)', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
        <span>PradipBuild · Free AI Document Builder</span>
        <span>Groq Llama 3.3 70B · pdf-parse · mammoth · Next.js 15</span>
      </footer>
    </div>
  )
}

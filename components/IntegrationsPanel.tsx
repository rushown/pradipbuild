'use client'
import { useState } from 'react'
import type { EuropassCV } from '@/types/europass'

interface IntegrationsPanelProps {
  cv: EuropassCV
}

type IntegrationState = 'idle' | 'loading' | 'done' | 'error'

interface CanvaField { canvaLabel: string; value: string }

interface CanvaResult {
  templateUrl: string
  coverLetterTemplateUrl: string
  fieldMap: CanvaField[]
  instructions: string[]
  note: string
}

interface EuropassResult {
  editorUrl: string
  structuredData: unknown
  instructions: string[]
  tip: string
}

interface LinkedInStep {
  step: number
  title: string
  description: string
  url?: string
}

interface LinkedInResult {
  steps: LinkedInStep[]
  alternativeMethod: { title: string; description: string }
  note: string
}

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: 24,
  marginBottom: 20,
}

export default function IntegrationsPanel({ cv }: IntegrationsPanelProps) {
  const [canvaState, setCanvaState] = useState<IntegrationState>('idle')
  const [canvaData, setCanvaData] = useState<CanvaResult | null>(null)
  const [europassState, setEuropassState] = useState<IntegrationState>('idle')
  const [europassData, setEuropassData] = useState<EuropassResult | null>(null)
  const [linkedinData, setLinkedinData] = useState<LinkedInResult | null>(null)

  const callIntegration = async (type: string, setter: (d: unknown) => void, setStatus: (s: IntegrationState) => void) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, cv }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setter(data)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const [copied, setCopied] = useState<string | null>(null)
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Integrations
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
          Export your CV data to third-party tools or get your info from LinkedIn.
        </p>
      </div>

      {/* ── CANVA ── */}
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#7D2AE8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 18 }}>C</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Canva</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>CV & Cover Letter templates · Free account</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {canvaData && (
              <a
                href={canvaData.templateUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: '#7D2AE8', color: 'white', textDecoration: 'none',
                }}
              >
                Open CV in Canva ↗
              </a>
            )}
            <button
              onClick={() => callIntegration('canva', (d) => setCanvaData(d as CanvaResult), setCanvaState)}
              disabled={canvaState === 'loading'}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13,
                background: canvaState === 'done' ? 'var(--bg3)' : 'var(--accent)',
                color: canvaState === 'done' ? 'var(--text-2)' : 'white',
                border: canvaState === 'done' ? '1px solid var(--border)' : 'none',
              }}
            >
              {canvaState === 'loading' ? '⟳ Preparing...' : canvaState === 'done' ? '↺ Refresh' : '✦ Prepare Canva Export'}
            </button>
          </div>
        </div>

        {canvaData && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <a href={canvaData.templateUrl} target="_blank" rel="noreferrer"
                style={{ padding: '6px 12px', background: '#7D2AE820', color: '#a78bfa', borderRadius: 6, fontSize: 12, border: '1px solid #7D2AE840', textDecoration: 'none' }}>
                📄 CV Template ↗
              </a>
              <a href={canvaData.coverLetterTemplateUrl} target="_blank" rel="noreferrer"
                style={{ padding: '6px 12px', background: '#7D2AE820', color: '#a78bfa', borderRadius: 6, fontSize: 12, border: '1px solid #7D2AE840', textDecoration: 'none' }}>
                ✉ Cover Letter Template ↗
              </a>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your data — copy into Canva text boxes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {canvaData.fieldMap.filter((f) => f.value).map((f) => (
                  <div key={f.canvaLabel} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--bg3)', borderRadius: 6, padding: '6px 10px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 160, flexShrink: 0, paddingTop: 2 }}>{f.canvaLabel}</div>
                    <div style={{ fontSize: 12, flex: 1, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>{f.value}</div>
                    <button
                      onClick={() => copy(f.value, f.canvaLabel)}
                      style={{ flexShrink: 0, fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--bg)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                    >
                      {copied === f.canvaLabel ? '✓' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--bg3)', borderRadius: 6, padding: '8px 12px' }}>
              ℹ {canvaData.note}
            </div>
          </div>
        )}
      </div>

      {/* ── EUROPASS ── */}
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#003399', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFCC00', fontSize: 22, fontWeight: 800 }}>€</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Europass Official Editor</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>europa.eu · Official EU format · Free</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {europassData && (
              <a href={europassData.editorUrl} target="_blank" rel="noreferrer"
                style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#003399', color: 'white', textDecoration: 'none' }}>
                Open Europass Editor ↗
              </a>
            )}
            <button
              onClick={() => callIntegration('europass', (d) => setEuropassData(d as EuropassResult), setEuropassState)}
              disabled={europassState === 'loading'}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13,
                background: europassState === 'done' ? 'var(--bg3)' : 'var(--accent)',
                color: europassState === 'done' ? 'var(--text-2)' : 'white',
                border: europassState === 'done' ? '1px solid var(--border)' : 'none',
              }}
            >
              {europassState === 'loading' ? '⟳ Preparing...' : europassState === 'done' ? '↺ Refresh' : '✦ Prepare Europass Data'}
            </button>
          </div>
        </div>

        {europassData && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Steps</div>
              {europassData.instructions.map((step: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#FFCC00', background: '#003399', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ color: 'var(--text-2)' }}>{step}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Structured data (JSON)</span>
                <button
                  onClick={() => copy(JSON.stringify(europassData.structuredData, null, 2), 'europass-json')}
                  style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: 'var(--bg)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                >
                  {copied === 'europass-json' ? '✓ Copied' : 'Copy JSON'}
                </button>
              </div>
              <pre style={{ fontSize: 10, color: 'var(--text-3)', overflow: 'auto', maxHeight: 200, margin: 0 }}>
                {JSON.stringify(europassData.structuredData, null, 2)}
              </pre>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-3)', background: 'rgba(0,51,153,0.1)', border: '1px solid rgba(0,51,153,0.2)', borderRadius: 6, padding: '8px 12px' }}>
              💡 {europassData.tip}
            </div>
          </div>
        )}
      </div>

      {/* ── LINKEDIN ── */}
      <div style={CARD_STYLE}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#0077B5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 800 }}>in</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>LinkedIn Export Guide</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>How to get your LinkedIn data into PradipBuild</div>
            </div>
          </div>
          <button
            onClick={async () => {
              const res = await fetch('/api/integrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'linkedin-export-guide' }) })
              const data = await res.json()
              setLinkedinData(data as LinkedInResult)
            }}
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, background: linkedinData ? 'var(--bg3)' : '#0077B5', color: 'white', border: linkedinData ? '1px solid var(--border)' : 'none' }}
          >
            {linkedinData ? 'Hide guide' : 'Show guide'}
          </button>
        </div>

        {linkedinData && (
          <div>
            {linkedinData.steps.map((s) => (
              <div key={s.step} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0077B5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{s.description}</div>
                  {s.url && (
                    <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#60a5fa', marginTop: 4, display: 'inline-block' }}>
                      {s.url} ↗
                    </a>
                  )}
                </div>
              </div>
            ))}

            <div style={{ background: 'rgba(0,119,181,0.1)', border: '1px solid rgba(0,119,181,0.2)', borderRadius: 8, padding: '10px 14px', marginTop: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>⚡ {linkedinData.alternativeMethod.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{linkedinData.alternativeMethod.description}</div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10, padding: '6px 10px', background: 'var(--bg3)', borderRadius: 6 }}>
              ℹ {linkedinData.note}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

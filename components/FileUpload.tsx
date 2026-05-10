'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  onFilesReady: (files: File[], context: string) => void
  loading: boolean
}

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'application/json': ['.json'],
}

export default function FileUpload({ onFilesReady, loading }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [context, setContext] = useState('')

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name))
      return [...prev, ...accepted.filter((f) => !names.has(f.name))]
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: 10 * 1024 * 1024,
  })

  const removeFile = (name: string) => setFiles((p) => p.filter((f) => f.name !== name))

  const fileIcon = (name: string) => {
    if (name.endsWith('.pdf')) return '📄'
    if (name.endsWith('.docx') || name.endsWith('.doc')) return '📝'
    if (name.endsWith('.json')) return '🗂️'
    return '📃'
  }

  const fmtSize = (b: number) =>
    b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)}MB` : `${Math.round(b / 1024)}KB`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border-strong)'}`,
          borderRadius: 16,
          padding: '48px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive ? 'var(--accent-glow)' : 'var(--bg3)',
          transition: 'all var(--transition)',
        }}
      >
        <input {...getInputProps()} />
        <div style={{ fontSize: 40, marginBottom: 12 }}>⬆</div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          {isDragActive ? 'Drop your files here' : 'Drop your documents here'}
        </p>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
          PDF, DOCX, TXT, MD, JSON · up to 10MB each
        </p>
        <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 6 }}>
          CV, cover letters, LinkedIn exports, transcripts — anything works
        </p>
      </div>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>
            {files.length} file{files.length > 1 ? 's' : ''} ready
          </p>
          {files.map((f) => (
            <div
              key={f.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 14px',
              }}
            >
              <span style={{ fontSize: 20 }}>{fileIcon(f.name)}</span>
              <span style={{ flex: 1, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.name}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0 }}>{fmtSize(f.size)}</span>
              <button
                onClick={() => removeFile(f.name)}
                style={{ color: 'var(--text-3)', fontSize: 16, background: 'none', padding: '2px 6px', borderRadius: 4 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <label style={{ fontSize: 13, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>
          Any extra context? (optional)
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. I am applying for a data analyst role in Germany, I speak Nepali natively, target role is senior level..."
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </div>

      <button
        onClick={() => onFilesReady(files, context)}
        disabled={files.length === 0 || loading}
        style={{
          background: 'var(--accent)',
          color: 'white',
          padding: '14px 32px',
          borderRadius: 10,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: '0.02em',
          opacity: files.length === 0 || loading ? 0.4 : 1,
          boxShadow: files.length > 0 && !loading ? '0 0 32px var(--accent-glow)' : 'none',
        }}
      >
        {loading ? '⟳ Analysing documents...' : '✦ Extract & Build Europass CV'}
      </button>
    </div>
  )
}

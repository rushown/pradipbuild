# PradipBuild — AI Document Builder

> Upload any documents. AI classifies them, understands them, then generates a **Europass CV**, **cover letter**, or **career analysis report**. 100% free. No subscriptions.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## What It Does

```
User uploads files (PDF, DOCX, TXT, JSON...)
         ↓
/api/parse    → pdf-parse / mammoth → raw text per file
         ↓
/api/analyse  → Groq classifies each document:
                passport | CV | degree | work cert | reference | LinkedIn | other
         ↓
User picks what to generate:
  ┌─ /api/generate      → Europass CV (JSON → rendered document)
  ├─ /api/cover-letter  → Targeted cover letter
  └─ /api/cv-summary    → Career analysis & strength report
         ↓
User edits inline → Download multi-page PDF
```

---

## Quick Start

### 1. Get a Free Groq API Key

[console.groq.com](https://console.groq.com) → Sign up → Create API Key → free, no credit card

### 2. Install

```bash
git clone <your-repo>
cd pradipbuild
npm install
cp .env.local.example .env.local
# Add your GROQ_API_KEY to .env.local
```

### 3. Run

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run type-check  # TypeScript check
```

### 4. Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel
```

Or import from GitHub at [vercel.com/new](https://vercel.com/new).

**Environment variables to set in Vercel dashboard:**
| Variable | Value | Required |
|----------|-------|----------|
| `GROQ_API_KEY` | Your Groq API key | ✅ Yes |

---

## Project Structure

```
pradipbuild/
├── app/
│   ├── page.tsx              # Main UI — full flow orchestration
│   ├── layout.tsx            # Root layout, fonts, metadata
│   ├── globals.css           # Design system CSS variables
│   └── api/
│       ├── parse/route.ts    # File → text extraction (PDF, DOCX, TXT, JSON)
│       ├── analyse/route.ts  # Document classification & intelligence report
│       ├── guide/route.ts
│       ├── generate/route.ts # Europass CV generation (JSON output)
│       ├── cover-letter/     # Cover letter generation
│       └── cv-summary/       # Career analysis report
├── components/
│   ├── FileUpload.tsx        # Drag-and-drop file upload
│   ├── IntelligencePanel.tsx # Document classification results display
│   ├── ModeSelector.tsx      # Generation mode picker (Europass / Cover / Summary)
│   ├── PhotoUpload.tsx  
│   ├── AIGuidePanel.tsx  
│   ├── CompletenessBar.tsx  
│   ├── CoverLetterBuilder.tsx
│   ├── IntegrationsPanel.tsx
│   ├── IntelligencePanel.tsx
│   ├── ModeSelector.tsx
│   ├── FileUpload.tsx
│   ├── EditorPanel.tsx       # Inline CV editor (tabbed sections)
│   ├── EuropassPreview.tsx   # Pixel-perfect Europass CV renderer
│   ├── CoverLetterPreview.tsx # Europass cover letter renderer
│   ├── CvSummaryView.tsx     # Career analysis report renderer
│   └── CEFRGrid.tsx          # EU language grid component
├── lib/
│   ├── groq.ts               # Groq client singleton
│   └── pdf-export.ts         # Multi-page PDF export utility
├── types/
│   └── europass.ts           # All TypeScript types
├── vercel.json               # Vercel deployment config
└── .env.local.example        # Environment variables template
```

---

## Supported Input Formats

| Format | Library | Notes |
|--------|---------|-------|
| PDF | `pdf-parse` | Text-based PDFs; image-only PDFs return a note |
| DOCX / DOC | `mammoth` | Full text extraction |
| TXT / Markdown | native | Direct UTF-8 read |
| JSON | native | Pretty-printed for AI |
| LinkedIn export | auto-detected | JSON or PDF both work |

**Max file size:** 10MB per file. You can upload multiple files at once.

---

## AI Model & Free Tier

**Groq Llama 3.3 70B** (`llama-3.3-70b-versatile`)
- ~14,400 requests/day free
- ~500 tokens/second (extremely fast)
- JSON mode enforced for reliable structured output

**Groq Llama 3.1 8B** (`llama-3.1-8b-instant`) — defined as `GROQ_MODEL_FAST` in `lib/groq.ts`
- Use for quick operations if you hit rate limits

---

## PDF Export

`lib/pdf-export.ts` uses `html2canvas` + `jsPDF` to render the live preview to a proper multi-page A4 PDF:
- Scale 2x for retina quality
- Slices long documents into A4-sized canvas chunks
- Each chunk becomes a new PDF page
- Exports at 92% JPEG quality (good balance of size/sharpness)

---

## Document Categories Detected

| Category | Examples |
|----------|---------|
| `cv_resume` | CV, resume, career profile |
| `cover_letter` | Cover letter, motivation letter |
| `passport_id` | Passport, national ID, birth cert |
| `degree_transcript` | University degree, diploma, transcript |
| `work_certificate` | Employer reference, work contract, payslip |
| `reference_letter` | Recommendation, professional reference |
| `linkedin_export` | LinkedIn data export (JSON or PDF) |
| `portfolio` | Portfolio, project list, publications |
| `other` | Anything unrecognised |

---

## What Can Be Added / Changed

### High Priority

- [ ] **Photo upload** — allow headshot upload, embed in Europass header
- [ ] **Europass XML export** — official `.xml` for direct upload to europass.eu
- [ ] **Gemini Flash fallback** — use `GEMINI_API_KEY` when Groq rate-limits
- [ ] **Ollama support** — local inference (zero API cost, full privacy)
- [ ] **Multiple output languages** — generate CV in French, German, Spanish etc.
- [ ] **Edit cover letter inline** — same tabbed editor as the CV editor
- [ ] **Edit career summary inline** — regenerate specific sections

### Medium Priority

- [ ] **Job description scoring** — "how well does your CV match this job?" percentage
- [ ] **ATS-friendly CV mode** — plain text export for Applicant Tracking Systems
- [ ] **LinkedIn import via URL** — scrape public profiles (requires proxy)
- [ ] **Multiple CV versions** — save and switch between different tailored versions
- [ ] **Dark/light preview toggle** — preview in white (print) vs. dark (screen)
- [ ] **Section reordering** — drag-and-drop CV sections
- [ ] **Custom colour themes** — change the EU blue accent to personal branding colour

### Infrastructure

- [ ] **Database (Supabase/Neon)** — save and retrieve CV sessions across devices
- [ ] **Auth (Clerk/Auth.js)** — user accounts, saved CVs
- [ ] **Storage (Cloudflare R2)** — store uploaded files and generated PDFs
- [ ] **Caching** — cache parsed text per file hash to avoid re-parsing
- [ ] **Rate limiting** — per-IP limits to protect your Groq quota
- [ ] **Streaming API responses** — stream AI output token by token for faster perceived speed
- [ ] **Webhooks** — trigger CV rebuild when a new document is uploaded

### Nice to Have

- [ ] **Email delivery** — send the generated PDF directly to user's email
- [ ] **Share link** — generate a public read-only link to the CV
- [ ] **QR code on CV** — embed a QR code linking to LinkedIn/portfolio
- [ ] **Interview prep mode** — AI suggests likely interview questions based on CV
- [ ] **Salary estimation** — estimate market salary range based on role/country/experience
- [ ] **Europass Cover Letter builder** — full cover letter with per-paragraph editing

---

## Changing the AI Model

Edit `lib/groq.ts`:

```typescript
// Fast (free, high rate limit)
export const GROQ_MODEL = 'llama-3.1-8b-instant'

// Smart (free, lower rate limit but better quality)
export const GROQ_MODEL = 'llama-3.3-70b-versatile'

// Also available on Groq free tier:
// 'mixtral-8x7b-32768'
// 'gemma2-9b-it'
```

To switch to **Gemini Flash** (also free), add to `.env.local`:
```
GEMINI_API_KEY=your_key_here
```
Then update the API routes to use `@google/generative-ai` with `gemini-1.5-flash`.

---

## Vercel Configuration

`vercel.json` sets:
- Regions: `cdg1` (Paris) and `lhr1` (London) for Europe-optimised latency
- Function timeout: 60 seconds (needed for AI + PDF parsing)
- Function memory: 1024MB (pdf-parse and mammoth need headroom)

---

## Contributing

PRs welcome. Key things to know:
- All API routes use `export const runtime = 'nodejs'` — do NOT use edge runtime (pdf-parse requires Node)
- AI responses use `response_format: { type: 'json_object' }` — always parse defensively
- PDF export must only run client-side (dynamic imports of `html2canvas` and `jspdf`)
- Types are in `types/europass.ts` — keep them updated when adding new API routes

---

## License

MIT — build freely.

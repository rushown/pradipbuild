export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  nationality: string
  dateOfBirth: string
  gender?: string
  linkedin?: string
  website?: string
  photo?: string
}

export interface WorkExperience {
  id: string
  jobTitle: string
  employer: string
  city: string
  country: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  activities: string[]
}

export interface Education {
  id: string
  title: string
  institution: string
  city: string
  country: string
  startDate: string
  endDate: string
  current: boolean
  eqfLevel?: string
  field?: string
  description?: string
}

export interface LanguageSkill {
  language: string
  listening: CEFRLevel
  reading: CEFRLevel
  spokenProduction: CEFRLevel
  spokenInteraction: CEFRLevel
  writing: CEFRLevel
  certificate?: string
  native?: boolean
}

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native'

export interface DigitalSkill {
  area: string
  level: 'Basic' | 'Intermediate' | 'Advanced'
  description?: string
}

export interface OtherSkill {
  category: string
  description: string
}

export interface EuropassCV {
  personalInfo: PersonalInfo
  personalStatement: string
  workExperience: WorkExperience[]
  education: Education[]
  languages: LanguageSkill[]
  digitalSkills: DigitalSkill[]
  otherSkills: OtherSkill[]
  drivingLicense?: string[]
  additionalInfo?: string
}

export interface ParsedDocument {
  filename: string
  text: string
  type: string
}

export interface ParseResponse {
  documents: ParsedDocument[]
  combinedText: string
}

// Document intelligence
export type DocumentCategory =
  | 'cv_resume'
  | 'cover_letter'
  | 'passport_id'
  | 'degree_transcript'
  | 'work_certificate'
  | 'reference_letter'
  | 'linkedin_export'
  | 'portfolio'
  | 'other'

export interface DocumentAnalysis {
  filename: string
  category: DocumentCategory
  categoryLabel: string
  confidence: number
  keyFindings: string[]
  summary: string
}

export interface IntelligenceReport {
  documents: DocumentAnalysis[]
  combinedInsights: string
  detectedLanguages: string[]
  detectedSkills: string[]
  detectedRoles: string[]
  recommendedMode: GenerationMode
  overallConfidence: number
}

export type GenerationMode = 'europass' | 'cover_letter' | 'cv_summary'

export interface GenerateResponse {
  cv: EuropassCV
  confidence: number
  notes: string[]
}

export interface CoverLetter {
  recipientName: string
  recipientTitle: string
  company: string
  companyAddress: string
  date: string
  subject: string
  salutation: string
  opening: string
  body: string[]
  closing: string
  signoff: string
  senderName: string
  senderTitle: string
  senderEmail: string
  senderPhone: string
}

export interface CoverLetterRequest {
  jobTitle: string
  company: string
  jobDescription?: string
  country?: string
  recipientName?: string
}

export interface CvSummary {
  headline: string
  professionalSummary: string
  topStrengths: string[]
  keyAchievements: string[]
  skillsOverview: string[]
  careerTrajectory: string
  recommendedRoles: string[]
  gaps: string[]
}

export type AppStep = 'upload' | 'analysing' | 'select_mode' | 'generating' | 'review'
export type ActiveTab = 'europass' | 'cover_letter' | 'cv_summary'

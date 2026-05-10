import Groq from 'groq-sdk'

let groqClient: Groq | null = null

export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error('GROQ_API_KEY is not set. Get a free key at https://console.groq.com')
    groqClient = new Groq({ apiKey })
  }
  return groqClient
}

export const GROQ_MODEL = 'llama-3.3-70b-versatile'
export const GROQ_MODEL_FAST = 'llama-3.1-8b-instant'

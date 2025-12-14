// Gemini configuration for client-side checks only.
// NOTE: Do NOT initialize the Gemini SDK in the browser. Use a server-side proxy (Netlify Function) for secure calls.
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
export const GEMINI_MODEL = 'gemini-2.5-flash'


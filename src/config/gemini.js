// Gemini API Configuration
// Get your API key from: https://makersuite.google.com/app/apikey
import { GoogleGenAI } from '@google/genai'

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

// Initialize the Gemini AI client
export const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null

// Using gemini-2.5-flash (faster) or gemini-2.5-pro (more capable)
export const GEMINI_MODEL = 'gemini-2.5-flash'


// Backend API base URL — update this to your deployed server
export const API_BASE = 'https://api.fitword.example.com'

/** Build the TTS endpoint URL */
export function ttsUrl(text: string, voice: string): string {
  return `${API_BASE}/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`
}

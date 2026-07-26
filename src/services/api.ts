// Backend API base URL — update this to your deployed server
// TODO: 有服务器后改成真实地址（如 https://api.fitword.example.com）
export const API_BASE = 'http://localhost:3000'

/** Build the TTS endpoint URL */
export function ttsUrl(text: string, voice: string): string {
  return `${API_BASE}/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`
}

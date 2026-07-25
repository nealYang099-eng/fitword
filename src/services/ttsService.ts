import * as FileSystem from 'expo-file-system/legacy'
import { ttsUrl } from './api'

const CACHE_DIR = `${FileSystem.cacheDirectory}tts/`

// Simple string hash for cache filename
function hash(text: string): string {
  let h = 0
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(16)
}

function cacheFilename(voice: string, text: string): string {
  const voicePart = voice.replace(/[^a-zA-Z0-9-]/g, '_')
  return `${voicePart}_${hash(text)}.mp3`
}

let cacheReady = false

async function ensureCacheDir() {
  if (cacheReady) return
  await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true })
  cacheReady = true
}

/**
 * Get local URI for TTS audio. Downloads from backend if not cached.
 * Returns the local file URI to play with expo-av.
 */
export async function getAudioUri(text: string, voice: string): Promise<string> {
  await ensureCacheDir()

  // Skip empty text — return empty string, caller should handle
  if (!text || !text.trim()) return ''

  const filename = cacheFilename(voice, text)
  const fileUri = `${CACHE_DIR}${filename}`

  // Check cache
  try {
    const info = await FileSystem.getInfoAsync(fileUri)
    if (info.exists && info.size && info.size > 0) {
      return fileUri
    }
  } catch {
    // proceed to download
  }

  // Download from backend
  const url = ttsUrl(text, voice)
  const result = await FileSystem.downloadAsync(url, fileUri)

  if (result.status !== 200) {
    await FileSystem.deleteAsync(fileUri, { idempotent: true })
    throw new Error(`TTS download failed: HTTP ${result.status}`)
  }

  return fileUri
}

/**
 * Prefetch multiple TTS audio segments in the background.
 * Errors are silently ignored — segments will be re-fetched when needed.
 */
export async function prefetchAudio(
  items: Array<{ text: string; voice: string }>,
) {
  await ensureCacheDir()
  for (const { text, voice } of items) {
    if (!text?.trim()) continue
    const filename = cacheFilename(voice, text)
    const fileUri = `${CACHE_DIR}${filename}`
    try {
      const info = await FileSystem.getInfoAsync(fileUri)
      if (info.exists && info.size && info.size > 0) continue
      FileSystem.downloadAsync(ttsUrl(text, voice), fileUri).catch(() => {})
    } catch {
      // skip
    }
  }
}

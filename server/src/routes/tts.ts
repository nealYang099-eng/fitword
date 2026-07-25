import { Router, type Request, type Response } from 'express'
import { synthesize } from '../services/azureTts.js'

const router = Router()

// Simple in-memory rate limiter (100 req/min per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 100
const RATE_WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

// Valid voices whitelist
const ALLOWED_VOICES = new Set([
  'zh-CN-XiaoxiaoNeural',
  'zh-CN-YunxiNeural',
  'zh-CN-YunyangNeural',
  'en-US-JennyNeural',
  'en-US-GuyNeural',
  'en-US-AriaNeural',
])

router.get('/', async (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    if (!checkRateLimit(ip)) {
      res.status(429).json({ error: 'Too many requests' })
      return
    }

    const text = req.query.text
    const voice = req.query.voice

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Missing parameter: text' })
      return
    }

    if (text.length > 1000) {
      res.status(400).json({ error: 'Text too long (max 1000 chars)' })
      return
    }

    if (!voice || typeof voice !== 'string' || !ALLOWED_VOICES.has(voice)) {
      res.status(400).json({
        error: `Invalid or missing voice. Allowed: ${[...ALLOWED_VOICES].join(', ')}`,
      })
      return
    }

    const audio = await synthesize(text.trim(), voice)

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audio.length.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    })
    res.send(audio)
  } catch (err: any) {
    console.error(`[tts] ${err.message}`)
    res.status(500).json({ error: 'TTS synthesis failed' })
  }
})

export default router

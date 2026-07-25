import express from 'express'
import cors from 'cors'
import compression from 'compression'
import { config } from './config.js'
import ttsRouter from './routes/tts.js'

const app = express()

app.use(cors())
app.use(compression())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// TTS endpoint
app.use('/api/tts', ttsRouter)

app.listen(config.port, () => {
  console.log(`FitWord server running on port ${config.port}`)
  if (!config.azure.key) {
    console.warn('[warn] AZURE_SPEECH_KEY not set — TTS endpoint will fail')
  }
})

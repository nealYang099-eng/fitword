import { spawn } from 'child_process'

/**
 * Synthesize text to speech using Microsoft Edge TTS (free, no API key needed).
 * Calls the Python `edge-tts` CLI, capturing MP3 audio from stdout.
 */
export async function synthesize(text: string, voiceName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let stderr = ''

    const proc = spawn('edge-tts', [
      '--text', text,
      '--voice', voiceName,
    ])

    proc.stdout.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    const timeout = setTimeout(() => {
      proc.kill()
      reject(new Error('Edge TTS synthesis timeout (30s)'))
    }, 30_000)

    proc.on('close', (code) => {
      clearTimeout(timeout)

      if (chunks.length > 0) {
        resolve(Buffer.concat(chunks))
      } else {
        reject(new Error(`Edge TTS failed (exit ${code}): ${stderr.slice(0, 200)}`))
      }
    })

    proc.on('error', (err) => {
      clearTimeout(timeout)
      reject(new Error(`Edge TTS spawn failed: ${err.message}. Is edge-tts installed? (pip install edge-tts)`))
    })
  })
}

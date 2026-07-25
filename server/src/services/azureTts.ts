import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { config } from '../config.js'

/**
 * Synthesize text to speech using Azure Cognitive Services.
 * Returns raw MP3 audio buffer (Audio16khz32kBitRateMonoMp3).
 */
export async function synthesize(text: string, voiceName: string): Promise<Buffer> {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    config.azure.key,
    config.azure.region,
  )
  speechConfig.speechSynthesisVoiceName = voiceName
  speechConfig.speechSynthesisOutputFormat =
    sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig)

  return new Promise<Buffer>((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        synthesizer.close()
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(Buffer.from(result.audioData))
        } else {
          reject(
            new Error(
              `Synthesis failed: ${result.reason} — ${result.errorDetails || 'unknown error'}`,
            ),
          )
        }
      },
      (error) => {
        synthesizer.close()
        reject(new Error(`Synthesis error: ${error}`))
      },
    )
  })
}

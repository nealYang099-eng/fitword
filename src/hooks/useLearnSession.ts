import { useState, useRef, useCallback, useEffect } from 'react'
import type { Word } from '../types/word'
import { getAudioUri, prefetchAudio } from '../services/ttsService'
import { audioPlayer } from '../services/audioPlayer'

// ── Step definitions ──

interface StepConfig {
  label: string
  voice: string
  /** Minimum wait time in ms (for very short audio or empty text) */
  minMs: number
  getText: (w: Word) => string
}

const STEPS: StepConfig[] = [
  {
    label: 'meaning',
    voice: 'zh-CN-XiaoxiaoNeural',
    minMs: 800,
    getText: (w) => w.meaning,
  },
  {
    label: 'word',
    voice: 'en-US-JennyNeural',
    minMs: 400,
    getText: (w) => w.word,
  },
  {
    label: 'spelling',
    voice: 'en-US-JennyNeural',
    minMs: 800,
    getText: (w) => w.word.split('').join(' '),
  },
  {
    label: 'word',
    voice: 'en-US-JennyNeural',
    minMs: 400,
    getText: (w) => w.word,
  },
  {
    label: 'sentence',
    voice: 'en-US-JennyNeural',
    minMs: 600,
    getText: (w) => w.sentence,
  },
  {
    label: 'sentZh',
    voice: 'zh-CN-XiaoxiaoNeural',
    minMs: 800,
    getText: (w) => w.sentence_meaning,
  },
]

const STEP_COUNT = STEPS.length

// ── Hook ──

export function useLearnSession(words: Word[]) {
  const [wordIdx, setWordIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState<number>(1.0)
  const [networkError, setNetworkError] = useState(false)

  const sessionRef = useRef(0)
  const speedRef = useRef(1.0)

  // Keep speedRef in sync
  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  // ── cancel + helpers ──

  const cancelAll = useCallback(() => {
    audioPlayer.stop()
    sessionRef.current += 1
  }, [])

  const trackedSleep = useCallback(
    (ms: number): Promise<void> => {
      return new Promise((resolve) => {
        setTimeout(resolve, ms)
      })
    },
    [],
  )

  // Play a single audio step
  const playAudioStep = useCallback(
    async (
      text: string,
      voice: string,
      minMs: number,
      sid: number,
      sp: number,
    ): Promise<void> => {
      const valid = () => sessionRef.current === sid

      // Empty text — just wait
      if (!text?.trim()) {
        await trackedSleep(Math.round(minMs / sp))
        return
      }

      try {
        const uri = await getAudioUri(text, voice)
        if (!valid()) return

        // Empty URI means empty text
        if (!uri) {
          await trackedSleep(Math.round(minMs / sp))
          return
        }

        setNetworkError(false)

        // Play audio + minimum wait — whichever is longer
        let audioDone = false
        let minTimeDone = false

        await audioPlayer.play(uri, sp, () => {
          audioDone = true
        })

        // Start min-time counter
        const minWait = trackedSleep(Math.round(minMs / sp)).then(() => {
          minTimeDone = true
        })

        // Wait for audio to end (it resolves via the onEnd callback)
        await new Promise<void>((resolve) => {
          const check = () => {
            if (audioDone) {
              resolve()
            } else {
              setTimeout(check, 50)
            }
          }
          check()
        })

        // Also ensure min time has passed
        if (!minTimeDone) {
          await minWait
        }
      } catch {
        // Network error — skip this step
        setNetworkError(true)
        await trackedSleep(Math.round(minMs / sp))
      }
    },
    [trackedSleep],
  )

  // ── Main playback sequencer ──

  const playSequence = useCallback(
    async (startWord: number, startStep: number) => {
      cancelAll()
      const sid = sessionRef.current
      setIsPaused(false)

      const valid = () => sessionRef.current === sid
      let wi = startWord
      let si = startStep

      while (true) {
        const word = words[wi]
        if (!word) break

        setWordIdx(wi)

        for (let s = si; s < STEP_COUNT; s++) {
          if (!valid()) return
          setStepIdx(s)

          const step = STEPS[s]
          const text = step.getText(word)
          const sp = speedRef.current

          await playAudioStep(text, step.voice, step.minMs, sid, sp)
          if (!valid()) return
        }

        // All steps done — mark as complete
        setStepIdx(STEP_COUNT)

        // Pause between words
        if (!valid()) return
        await trackedSleep(3000)

        if (!valid()) return
        wi = (wi + 1) % words.length
        si = 0
        setStepIdx(0)
      }
    },
    [cancelAll, playAudioStep, trackedSleep, words],
  )

  // ── Prefetch upcoming audio ──

  const prefetchWord = useCallback(
    (wi: number) => {
      const word = words[wi]
      if (!word) return
      const items = STEPS.map((s) => ({
        text: s.getText(word),
        voice: s.voice,
      })).filter((i) => i.text?.trim())
      prefetchAudio(items)
    },
    [words],
  )

  // ── Auto-start on mount ──

  useEffect(() => {
    if (words.length > 0) {
      playSequence(0, 0)
    }
    return () => {
      cancelAll()
    }
    // Only run on mount / words change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Exposed actions ──

  const handlePrev = useCallback(() => {
    const newIdx = (wordIdx - 1 + words.length) % words.length
    playSequence(newIdx, 0)
    prefetchWord((newIdx - 1 + words.length) % words.length)
  }, [wordIdx, playSequence, prefetchWord, words.length])

  const handleReplay = useCallback(() => {
    playSequence(wordIdx, 0)
  }, [wordIdx, playSequence])

  const handleNext = useCallback(() => {
    const newIdx = (wordIdx + 1) % words.length
    playSequence(newIdx, 0)
    prefetchWord((newIdx + 1) % words.length)
  }, [wordIdx, playSequence, prefetchWord, words.length])

  const handlePause = useCallback(() => {
    cancelAll()
    setIsPaused(true)
  }, [cancelAll])

  const handleResume = useCallback(() => {
    if (stepIdx >= STEP_COUNT) {
      // Was between words — advance to next
      playSequence((wordIdx + 1) % words.length, 0)
    } else {
      playSequence(wordIdx, stepIdx)
    }
  }, [stepIdx, wordIdx, playSequence, words.length])

  const handleTogglePause = useCallback(() => {
    if (isPaused) {
      handleResume()
    } else {
      handlePause()
    }
  }, [isPaused, handleResume, handlePause])

  const handleSpeedToggle = useCallback(() => {
    setSpeed((prev) => {
      const next = prev === 0.75 ? 1.0 : prev === 1.0 ? 1.5 : 0.75
      audioPlayer.adjustRate(next)
      return next
    })
  }, [])

  return {
    currentWord: words[wordIdx] ?? null,
    wordIdx,
    stepIdx,
    isPaused,
    speed,
    networkError,
    totalWords: words.length,
    handlePrev,
    handleReplay,
    handleNext,
    handleTogglePause,
    handleSpeedToggle,
  }
}

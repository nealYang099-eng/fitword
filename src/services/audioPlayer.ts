import { Audio, type AVPlaybackStatus } from 'expo-av'

export class AudioPlayer {
  private sound: Audio.Sound | null = null
  private onEndCallback: (() => void) | null = null

  async play(
    uri: string,
    rate: number = 1.0,
    onEnd?: () => void,
  ): Promise<void> {
    // Unload previous
    await this.stop()

    this.onEndCallback = onEnd ?? null

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      {
        shouldPlay: true,
        rate,
        shouldCorrectPitch: true,
        volume: 1.0,
      },
      this.onStatusUpdate,
    )

    this.sound = sound
  }

  private onStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish) {
      this.onEndCallback?.()
    }
  }

  async setRate(rate: number): Promise<void> {
    if (this.sound) {
      await this.sound.setRateAsync(rate, true)
    }
  }

  async pause(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync()
    }
  }

  async resume(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync()
    }
  }

  async stop(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.unloadAsync()
      } catch {
        // already unloaded
      }
      this.sound = null
    }
    this.onEndCallback = null
  }

  /** Adjust rate of currently playing sound without replacing it */
  async adjustRate(rate: number): Promise<void> {
    if (this.sound) {
      await this.sound.setRateAsync(rate, true)
    }
  }
}

/** Shared singleton player — only one sound plays at a time */
export const audioPlayer = new AudioPlayer()

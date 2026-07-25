export interface Word {
  id: number
  word: string
  phonetic: string
  meaning: string
  sentence: string
  sentence_meaning: string
}

export interface BookMeta {
  id: string
  name: string
  desc: string
  count: number
}

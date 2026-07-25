import type { Word } from '../types/word'
import { BOOK_LIST } from '../constants/books'

// Metro requires all require() paths to be string literals at build time.
// Each loader wraps require() in a function so the JSON is only parsed
// when the book is first accessed.
const BOOK_LOADERS: Record<string, () => Word[]> = {
  toefl:    () => require('../../assets/books/toefl.json'),
  ielts:    () => require('../../assets/books/ielts.json'),
  kaoyan1:  () => require('../../assets/books/kaoyan1.json'),
  kaoyan2:  () => require('../../assets/books/kaoyan2.json'),
  tem4:     () => require('../../assets/books/tem4.json'),
  tem8:     () => require('../../assets/books/tem8.json'),
  bec:      () => require('../../assets/books/bec.json'),
  gre:      () => require('../../assets/books/gre.json'),
}

// In-memory cache: words loaded once, reused across sessions
const cache = new Map<string, Word[]>()

/**
 * Load words for a book. Returns cached copy if already loaded.
 * Synchronous — all data is bundled in the app via require().
 */
export function loadBookWords(bookId: string): Word[] {
  const cached = cache.get(bookId)
  if (cached) return cached

  const loader = BOOK_LOADERS[bookId]
  if (!loader) throw new Error(`Unknown book: ${bookId}`)

  const words = loader()
  cache.set(bookId, words)
  return words
}

/** Get book metadata by ID */
export function getBookMeta(bookId: string) {
  return BOOK_LIST.find(b => b.id === bookId)
}

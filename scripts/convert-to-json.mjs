import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BOOKS_DIR = path.resolve(__dirname, '../../fitword-app/src/data/books')
const OUT_DIR = path.resolve(__dirname, '../assets/books')

// Ensure output directory
fs.mkdirSync(OUT_DIR, { recursive: true })

const bookFiles = ['toefl', 'ielts', 'kaoyan1', 'kaoyan2', 'tem4', 'tem8', 'bec', 'gre']

for (const id of bookFiles) {
  const tsPath = path.join(BOOKS_DIR, `${id}.ts`)
  if (!fs.existsSync(tsPath)) {
    console.error(`  ✗ Not found: ${tsPath}`)
    continue
  }

  const content = fs.readFileSync(tsPath, 'utf-8')

  // Find the array with regex: const words ... = [...]
  // Match "const words" followed by anything up to " = [" then capture until matching "]"
  const match = content.match(/const\s+words\b[^=]*=\s*(\[[\s\S]*\])\s*$/m)

  if (!match) {
    // Try multiline — the array spans many lines
    // Find position of "const words" and then match brackets
    const start = content.search(/const\s+words\b/)
    if (start === -1) {
      console.error(`  ✗ Could not find "const words" in ${id}.ts`)
      continue
    }

    // Find "= [" from start
    const eqBracket = content.indexOf('= [', start)
    if (eqBracket === -1) {
      console.error(`  ✗ Could not find "= [" after words in ${id}.ts`)
      continue
    }

    const bracketStart = content.indexOf('[', eqBracket)

    // Count brackets to find the matching closing bracket
    let depth = 0
    let bracketEnd = -1
    for (let i = bracketStart; i < content.length; i++) {
      if (content[i] === '[') depth++
      else if (content[i] === ']') {
        depth--
        if (depth === 0) {
          bracketEnd = i + 1
          break
        }
      }
    }

    if (bracketEnd === -1) {
      console.error(`  ✗ Could not find array end in ${id}.ts`)
      continue
    }

    const arrayStr = content.slice(bracketStart, bracketEnd)
    try {
      const words = JSON.parse(arrayStr)
      const outPath = path.join(OUT_DIR, `${id}.json`)
      fs.writeFileSync(outPath, JSON.stringify(words), 'utf-8')
      console.log(`  ✓ ${id}: ${words.length} words → ${id}.json`)
    } catch (err) {
      console.error(`  ✗ ${id}: JSON parse error at position ${err.message}`)
    }
    continue
  }

  // Regex matched — use captured group
  try {
    const words = JSON.parse(match[1])
    const outPath = path.join(OUT_DIR, `${id}.json`)
    fs.writeFileSync(outPath, JSON.stringify(words), 'utf-8')
    console.log(`  ✓ ${id}: ${words.length} words → ${id}.json`)
  } catch (err) {
    console.error(`  ✗ ${id}: JSON parse error (regex) - ${err.message}`)
  }
}

console.log('\n✓ Done!')

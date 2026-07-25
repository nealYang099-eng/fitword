import { StyleSheet, Text, View, ScrollView } from 'react-native'
import type { Word } from '../types/word'

interface Props {
  word: Word
}

export default function WordCard({ word }: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Word */}
      <Text style={styles.word}>{word.word}</Text>

      {/* Phonetic */}
      {word.phonetic ? (
        <Text style={styles.phonetic}>{word.phonetic}</Text>
      ) : null}

      {/* Meaning */}
      <Text style={styles.meaning}>{word.meaning}</Text>

      {/* Sentence */}
      {word.sentence ? (
        <View style={styles.sentenceBox}>
          <Text style={styles.sentenceEn}>{word.sentence}</Text>
          {word.sentence_meaning ? (
            <Text style={styles.sentenceZh}>{word.sentence_meaning}</Text>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  word: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 8,
  },
  phonetic: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 16,
  },
  meaning: {
    fontSize: 20,
    color: '#4f46e5',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  sentenceBox: {
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginTop: 8,
  },
  sentenceEn: {
    fontSize: 16,
    color: '#343a40',
    lineHeight: 24,
    marginBottom: 8,
  },
  sentenceZh: {
    fontSize: 14,
    color: '#868e96',
    lineHeight: 20,
  },
})

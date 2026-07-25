import { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'
import { BOOK_LIST } from '../constants/books'
import { loadBookWords } from '../data/wordLoader'
import type { BookMeta } from '../types/word'

type Props = NativeStackScreenProps<RootStackParamList, 'BookSelect'>

export default function BookSelectScreen({ navigation, route }: Props) {
  const { mode } = route.params
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const title = mode === 'review' ? '选择要复习的词书' : '选择词书'

  const handleSelect = (book: BookMeta) => {
    setLoadingId(book.id)
    setError(null)
    try {
      const words = loadBookWords(book.id)
      // Small delay to show loading state — actual load is sync but
      // for large books the JSON parse may take a frame
      requestAnimationFrame(() => {
        setLoadingId(null)
        navigation.navigate('Learn', { book, words })
      })
    } catch {
      setError('加载失败，请重试')
      setLoadingId(null)
    }
  }

  return (
    <View style={styles.container}>
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← 首页</Text>
        </Pressable>
        <Text style={styles.topTitle}>{title}</Text>
        <View style={styles.spacer} />
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ── Book grid ── */}
      <FlatList
        data={BOOK_LIST}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item: book }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() => handleSelect(book)}
            disabled={loadingId !== null}
          >
            <Text style={styles.cardName}>{book.name}</Text>
            <Text style={styles.cardCount}>{book.count.toLocaleString()} 词</Text>
            {loadingId === book.id && (
              <ActivityIndicator
                size="small"
                color="#4f46e5"
                style={styles.loading}
              />
            )}
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backText: {
    fontSize: 16,
    color: '#4f46e5',
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  spacer: {
    width: 50,
  },
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  grid: {
    padding: 12,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  cardCount: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 6,
  },
  loading: {
    marginTop: 10,
  },
})

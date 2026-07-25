import { StyleSheet, Text, View, Pressable } from 'react-native'
import { useKeepAwake } from 'expo-keep-awake'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'
import { useLearnSession } from '../hooks/useLearnSession'
import WordCard from '../components/WordCard'
import ProgressBar from '../components/ProgressBar'
import ControlButtons from '../components/ControlButtons'

type Props = NativeStackScreenProps<RootStackParamList, 'Learn'>

export default function LearnScreen({ navigation, route }: Props) {
  const { book, words } = route.params

  // Keep screen on while learning
  useKeepAwake()

  const {
    currentWord,
    wordIdx,
    isPaused,
    speed,
    networkError,
    totalWords,
    handlePrev,
    handleReplay,
    handleNext,
    handleTogglePause,
    handleSpeedToggle,
  } = useLearnSession(words)

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>加载中...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← 词书</Text>
        </Pressable>
        <Text style={styles.bookName} numberOfLines={1}>
          {book.name}
        </Text>
        <Text style={styles.counter}>
          {wordIdx + 1}/{totalWords}
        </Text>
      </View>

      {/* ── Network error banner ── */}
      {networkError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>无法连接语音服务，请检查网络</Text>
        </View>
      )}

      {/* ── Progress bar ── */}
      <ProgressBar current={wordIdx} total={totalWords} />

      {/* ── Word card ── */}
      <View style={styles.wordArea}>
        <WordCard word={currentWord} />
      </View>

      {/* ── Control buttons ── */}
      <ControlButtons
        isPaused={isPaused}
        speed={speed}
        onReplay={handleReplay}
        onPrev={handlePrev}
        onTogglePause={handleTogglePause}
        onNext={handleNext}
        onSpeedToggle={handleSpeedToggle}
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
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backText: {
    fontSize: 16,
    color: '#4f46e5',
  },
  bookName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  counter: {
    fontSize: 14,
    color: '#6c757d',
  },
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    textAlign: 'center',
  },
  wordArea: {
    flex: 1,
    justifyContent: 'center',
  },
  loading: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
})

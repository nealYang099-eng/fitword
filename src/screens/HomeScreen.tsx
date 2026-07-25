import { StyleSheet, Text, View, Pressable } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>FitWord</Text>
        <Text style={styles.subtitle}>极简英语单词学习</Text>
      </View>

      {/* ── Action buttons ── */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.btnLearn,
            pressed && styles.btnPressed,
          ]}
          onPress={() => navigation.navigate('BookSelect', { mode: 'learn' })}
        >
          <Text style={styles.btnIcon}>▶</Text>
          <Text style={styles.btnLabel}>开始学习</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.btnReview,
            pressed && styles.btnPressed,
          ]}
          onPress={() => navigation.navigate('BookSelect', { mode: 'review' })}
        >
          <Text style={styles.btnIcon}>⏱</Text>
          <Text style={styles.btnLabel}>复习</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
  },
  btn: {
    width: 150,
    height: 150,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  btnLearn: {
    backgroundColor: '#4f46e5',
  },
  btnReview: {
    backgroundColor: '#059669',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  btnIcon: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 12,
  },
  btnLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
})

import { StyleSheet, View, Pressable, Text } from 'react-native'

interface Props {
  isPaused: boolean
  speed: number
  onReplay: () => void
  onPrev: () => void
  onTogglePause: () => void
  onNext: () => void
  onSpeedToggle: () => void
}

export default function ControlButtons({
  isPaused,
  speed,
  onReplay,
  onPrev,
  onTogglePause,
  onNext,
  onSpeedToggle,
}: Props) {
  return (
    <View style={styles.row}>
      {/* Replay */}
      <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={onReplay}>
        <Text style={styles.btnText}>重播</Text>
      </Pressable>

      {/* Previous */}
      <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={onPrev}>
        <Text style={styles.btnText}>上一个</Text>
      </Pressable>

      {/* Play / Pause (circle) */}
      <Pressable style={({ pressed }) => [styles.circle, pressed && styles.pressed]} onPress={onTogglePause}>
        {isPaused ? (
          <Text style={styles.circleIcon}>▶</Text>
        ) : (
          <View style={styles.pauseBars}>
            <View style={styles.bar} />
            <View style={styles.bar} />
          </View>
        )}
      </Pressable>

      {/* Next */}
      <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={onNext}>
        <Text style={styles.btnText}>下一个</Text>
      </Pressable>

      {/* Speed toggle */}
      <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]} onPress={onSpeedToggle}>
        <Text style={styles.btnText}>{speed}x</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  btn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  circleIcon: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 2,
  },
  pauseBars: {
    flexDirection: 'row',
    gap: 3,
  },
  bar: {
    width: 4,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
})

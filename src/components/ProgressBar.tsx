import { StyleSheet, View } from 'react-native'

interface Props {
  current: number   // current word index (0-based)
  total: number     // total word count
}

export default function ProgressBar({ current, total }: Props) {
  const percent = ((current + 1) / Math.max(total, 1)) * 100

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${percent}%` }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 2,
  },
})

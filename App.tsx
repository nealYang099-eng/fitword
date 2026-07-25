import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from './src/screens/HomeScreen'
import BookSelectScreen from './src/screens/BookSelectScreen'
import LearnScreen from './src/screens/LearnScreen'
import type { BookMeta, Word } from './src/types/word'

export type RootStackParamList = {
  Home: undefined
  BookSelect: { mode: 'learn' | 'review' }
  Learn: { book: BookMeta; words: Word[] }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="BookSelect" component={BookSelectScreen} />
        <Stack.Screen name="Learn" component={LearnScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

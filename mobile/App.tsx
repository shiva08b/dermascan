import 'react-native-url-polyfill/auto'
import { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { Text } from 'react-native'

import LoginScreen from './screens/LoginScreen'
import SignupScreen from './screens/SignupScreen'
import ScanScreen from './screens/ScanScreen'
import ResultsScreen from './screens/ResultsScreen'
import HistoryScreen from './screens/HistoryScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#13131A',
          borderTopColor: '#2A2A3A',
          paddingBottom: 8, paddingTop: 8, height: 65
        },
        tabBarActiveTintColor: '#C8A97E',
        tabBarInactiveTintColor: '#6B6B7A',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' }
      }}
    >
      <Tab.Screen name="Scan" component={ScanScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🔬</Text> }} />
      <Tab.Screen name="History" component={HistoryScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text> }} />
    </Tab.Navigator>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) return null

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Results" component={ResultsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
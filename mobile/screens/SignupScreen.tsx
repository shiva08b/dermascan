import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert
} from 'react-native'
import { supabase } from '../lib/supabase'

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) Alert.alert('Error', error.message)
    else Alert.alert('Success', 'Account created! You can now sign in.', [
      { text: 'OK', onPress: () => navigation.navigate('Login') }
    ])
    setLoading(false)
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.card}>
        <Text style={s.brand}>DERMASCAN</Text>
        <Text style={s.title}>Create account</Text>
        <Text style={s.sub}>Start your skin journey today</Text>

        <Text style={s.label}>Email</Text>
        <TextInput style={s.input} value={email} onChangeText={setEmail}
          placeholder="you@example.com" placeholderTextColor="#6B6B7A"
          keyboardType="email-address" autoCapitalize="none" />

        <Text style={s.label}>Password</Text>
        <TextInput style={s.input} value={password} onChangeText={setPassword}
          placeholder="Min 6 characters" placeholderTextColor="#6B6B7A" secureTextEntry />

        <TouchableOpacity style={[s.btn, loading && s.btnDisabled]}
          onPress={handleSignup} disabled={loading}>
          <Text style={s.btnText}>{loading ? 'Creating...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={s.link}>Already have an account? <Text style={s.linkAccent}>Sign in</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#13131A', borderRadius: 20, padding: 28, borderWidth: 1, borderColor: '#2A2A3A' },
  brand: { color: '#C8A97E', fontSize: 16, fontWeight: '700', letterSpacing: 2, marginBottom: 20 },
  title: { color: '#F5F0E8', fontSize: 26, fontWeight: '800', marginBottom: 6 },
  sub: { color: '#6B6B7A', fontSize: 14, marginBottom: 24 },
  label: { color: '#6B6B7A', fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: '#1C1C27', borderWidth: 1, borderColor: '#2A2A3A', borderRadius: 10, padding: 14, color: '#F5F0E8', fontSize: 15, marginBottom: 16 },
  btn: { backgroundColor: '#C8A97E', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#0A0A0F', fontWeight: '700', fontSize: 16 },
  link: { color: '#6B6B7A', textAlign: 'center', marginTop: 20, fontSize: 14 },
  linkAccent: { color: '#C8A97E' }
})
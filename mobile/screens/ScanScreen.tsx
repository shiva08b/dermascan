import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Image, Alert, ActivityIndicator
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'
import { analyzeSkin } from '../lib/api'
import { AIProvider } from '../lib/types'

const PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: 'gemini',      label: 'Gemini' },
  { value: 'groq',        label: 'Groq' },
  { value: 'cohere',      label: 'Cohere' },
  { value: 'huggingface', label: 'HuggingFace' },
  { value: 'openrouter',  label: 'OpenRouter' },
  { value: 'combined',    label: 'Combined' },
  { value: 'consensus',   label: 'Consensus' },
]

export default function ScanScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [provider, setProvider] = useState<AIProvider>('groq')
  const [loading, setLoading] = useState(false)

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Permission needed'); return }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    })
    if (!result.canceled) setImageUri(result.assets[0].uri)
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Permission needed'); return }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 })
    if (!result.canceled) setImageUri(result.assets[0].uri)
  }

  async function handleAnalyze() {
    if (!imageUri) return
    setLoading(true)
    try {
      const result = await analyzeSkin(imageUri, provider)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('scans').insert({
          user_id: user.id,
          is_acne: result.is_acne,
          acne_type: result.acne_type,
          confidence: result.confidence,
          severity: result.severity,
          provider: result.skincare_routine.provider,
          routine: result.skincare_routine.routine,
          raw_scores: result.raw_scores,
        })
      }
      navigation.navigate('Results', { result })
    } catch (err) {
      Alert.alert('Error', 'Analysis failed. Please try again.')
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.brand}>DERMASCAN</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={s.logout}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.title}>Scan Your Skin</Text>
        <Text style={s.sub}>Upload or take a photo for AI analysis</Text>

        {/* Image area */}
        <View style={s.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={s.preview} />
          ) : (
            <Text style={s.imagePlaceholder}>📸{'\n'}No photo selected</Text>
          )}
        </View>

        {/* Buttons */}
        <View style={s.row}>
          <TouchableOpacity style={s.secondaryBtn} onPress={pickImage}>
            <Text style={s.secondaryBtnText}>📁 Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryBtn} onPress={takePhoto}>
            <Text style={s.secondaryBtnText}>📷 Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Provider */}
        <Text style={s.sectionLabel}>SELECT AI PROVIDER</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.providerScroll}>
          {PROVIDERS.map(p => (
            <TouchableOpacity key={p.value}
              onPress={() => setProvider(p.value)}
              style={[s.providerBtn, provider === p.value && s.providerBtnActive]}>
              <Text style={[s.providerText, provider === p.value && s.providerTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Analyze */}
        <TouchableOpacity
          style={[s.analyzeBtn, (!imageUri || loading) && s.analyzeBtnDisabled]}
          onPress={handleAnalyze} disabled={!imageUri || loading}>
          {loading
            ? <ActivityIndicator color="#0A0A0F" />
            : <Text style={s.analyzeBtnText}>✨ Analyze My Skin</Text>
          }
        </TouchableOpacity>

        {loading && (
          <Text style={s.loadingNote}>This may take 15–30 seconds...</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brand: { color: '#C8A97E', fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  logout: { color: '#6B6B7A', fontSize: 14 },
  title: { color: '#F5F0E8', fontSize: 26, fontWeight: '800', marginBottom: 6 },
  sub: { color: '#6B6B7A', fontSize: 14, marginBottom: 24 },
  imageBox: { backgroundColor: '#13131A', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A3A', borderStyle: 'dashed', height: 220, justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { color: '#6B6B7A', textAlign: 'center', fontSize: 16, lineHeight: 28 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  secondaryBtn: { flex: 1, backgroundColor: '#13131A', borderWidth: 1, borderColor: '#2A2A3A', borderRadius: 12, padding: 14, alignItems: 'center' },
  secondaryBtnText: { color: '#F5F0E8', fontWeight: '600' },
  sectionLabel: { color: '#6B6B7A', fontSize: 12, letterSpacing: 1, marginBottom: 12 },
  providerScroll: { marginBottom: 24 },
  providerBtn: { backgroundColor: '#13131A', borderWidth: 1, borderColor: '#2A2A3A', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  providerBtnActive: { borderColor: '#C8A97E', backgroundColor: '#C8A97E20' },
  providerText: { color: '#6B6B7A', fontWeight: '500' },
  providerTextActive: { color: '#C8A97E', fontWeight: '700' },
  analyzeBtn: { backgroundColor: '#C8A97E', borderRadius: 14, padding: 18, alignItems: 'center' },
  analyzeBtnDisabled: { backgroundColor: '#2A2A3A' },
  analyzeBtnText: { color: '#0A0A0F', fontWeight: '700', fontSize: 16 },
  loadingNote: { color: '#6B6B7A', textAlign: 'center', marginTop: 12, fontSize: 13 }
})
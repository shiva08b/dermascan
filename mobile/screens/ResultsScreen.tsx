import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView
} from 'react-native'
import { ScanResult, ACNE_LABELS, SEVERITY_COLORS } from '../lib/types'

export default function ResultsScreen({ route, navigation }: any) {
  const result: ScanResult = route.params.result
  const severityColor = SEVERITY_COLORS[result.severity ?? 'null']
  const acneLabel = ACNE_LABELS[result.acne_type ?? 'null']

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.brand}>DERMASCAN</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Result Card */}
        <View style={s.card}>
          {result.is_acne ? (
            <>
              <Text style={s.detectedLabel}>DETECTED</Text>
              <Text style={s.acneType}>{acneLabel}</Text>
              <View style={s.row}>
                <View style={[s.badge, { backgroundColor: severityColor + '20' }]}>
                  <Text style={[s.badgeText, { color: severityColor }]}>
                    {result.severity} severity
                  </Text>
                </View>
                <Text style={s.confidence}>
                  {(result.confidence * 100).toFixed(1)}% confidence
                </Text>
              </View>
              <View style={s.tags}>
                {result.recommendation_tags.map(tag => (
                  <View key={tag} style={s.tag}>
                    <Text style={s.tagText}>{tag.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={{ alignItems: 'center', padding: 16 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>✨</Text>
              <Text style={[s.acneType, { color: '#4ADE80' }]}>Clear Skin!</Text>
              <Text style={s.confidence}>No acne detected</Text>
            </View>
          )}
        </View>

        {/* Routine Card */}
        <View style={s.card}>
          <View style={s.routineHeader}>
            <Text style={s.routineTitle}>🧴 Your Routine</Text>
            <Text style={s.providerBadge}>via {result.skincare_routine.provider}</Text>
          </View>
          <Text style={s.routine}>{result.skincare_routine.routine}</Text>
        </View>

        {/* Actions */}
        <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={s.primaryBtnText}>Scan Again</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brand: { color: '#C8A97E', fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  back: { color: '#6B6B7A', fontSize: 14 },
  card: { backgroundColor: '#13131A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#2A2A3A', marginBottom: 16 },
  detectedLabel: { color: '#6B6B7A', fontSize: 11, letterSpacing: 1, marginBottom: 6 },
  acneType: { color: '#F5F0E8', fontSize: 24, fontWeight: '800', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  badgeText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  confidence: { color: '#6B6B7A', fontSize: 13 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#1C1C27', borderWidth: 1, borderColor: '#2A2A3A', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4 },
  tagText: { color: '#C8A97E', fontSize: 12 },
  routineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  routineTitle: { color: '#F5F0E8', fontSize: 16, fontWeight: '700' },
  providerBadge: { color: '#6B6B7A', fontSize: 12, backgroundColor: '#1C1C27', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  routine: { color: '#F5F0E8', lineHeight: 24, fontSize: 14 },
  primaryBtn: { backgroundColor: '#C8A97E', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#0A0A0F', fontWeight: '700', fontSize: 16 }
})
import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator
} from 'react-native'
import { supabase } from '../lib/supabase'
import { ScanRecord, ACNE_LABELS, SEVERITY_COLORS } from '../lib/types'

export default function HistoryScreen() {
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('scans').select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setScans(data || []); setLoading(false) })
  }, [])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.brand}>DERMASCAN</Text>
        <Text style={s.title}>Scan History</Text>
        <Text style={s.sub}>{scans.length} scan{scans.length !== 1 ? 's' : ''} total</Text>

        {loading ? (
          <ActivityIndicator color="#C8A97E" style={{ marginTop: 40 }} />
        ) : scans.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📸</Text>
            <Text style={s.emptyText}>No scans yet. Start scanning!</Text>
          </View>
        ) : (
          scans.map(scan => {
            const color = SEVERITY_COLORS[scan.severity ?? 'null']
            const label = scan.is_acne ? ACNE_LABELS[scan.acne_type ?? 'null'] : 'Clear Skin'
            const isExpanded = expanded === scan.id
            return (
              <TouchableOpacity key={scan.id}
                style={[s.card, isExpanded && s.cardActive]}
                onPress={() => setExpanded(isExpanded ? null : scan.id)}>
                <View style={s.cardRow}>
                  <View>
                    <Text style={s.cardTitle}>{label}</Text>
                    <Text style={s.cardDate}>{formatDate(scan.created_at)}</Text>
                  </View>
                  <View style={s.cardRight}>
                    {scan.severity && (
                      <View style={[s.badge, { backgroundColor: color + '20' }]}>
                        <Text style={[s.badgeText, { color }]}>{scan.severity}</Text>
                      </View>
                    )}
                    <Text style={s.conf}>{(scan.confidence * 100).toFixed(0)}%</Text>
                  </View>
                </View>
                {isExpanded && (
                  <View style={s.routineBox}>
                    <Text style={s.routineLabel}>SKINCARE ROUTINE</Text>
                    <Text style={s.routineText}>{scan.routine}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { padding: 24 },
  brand: { color: '#C8A97E', fontSize: 16, fontWeight: '700', letterSpacing: 2, marginBottom: 20 },
  title: { color: '#F5F0E8', fontSize: 26, fontWeight: '800', marginBottom: 4 },
  sub: { color: '#6B6B7A', fontSize: 14, marginBottom: 24 },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#6B6B7A', fontSize: 15 },
  card: { backgroundColor: '#13131A', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#2A2A3A', marginBottom: 12 },
  cardActive: { borderColor: '#C8A97E' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#F5F0E8', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardDate: { color: '#6B6B7A', fontSize: 13 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  conf: { color: '#6B6B7A', fontSize: 13 },
  routineBox: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#2A2A3A' },
  routineLabel: { color: '#6B6B7A', fontSize: 11, letterSpacing: 1, marginBottom: 8 },
  routineText: { color: '#F5F0E8', lineHeight: 22, fontSize: 13 }
})
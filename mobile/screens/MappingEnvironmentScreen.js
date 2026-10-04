import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Surface, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getEnvironmentalReport } from '../services/EnvironmentService';

const THEME = {
  bg: '#070A13',
  cardBg: 'rgba(13, 20, 36, 0.92)',
  border: 'rgba(255, 255, 255, 0.10)',
  primary: '#F43F5E',
  rose: '#FB7185',
  emerald: '#10B981',
  cyan: '#06B6D4',
  amber: '#F59E0B',
  text: '#F8FAFC',
  textSub: '#94A3B8',
  textMuted: '#64748B',
};

const formatDayLabel = (isoDate) => {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: '2-digit' });
};

const evaluateSwineBiosecuritySuitability = (data) => {
  const forecast = data?.forecast;
  const days = Array.isArray(forecast?.days) ? forecast?.days : [];
  const windowDays = days.slice(0, 3);

  const minTemps = windowDays.map((d) => d?.minTempC).filter((v) => typeof v === 'number');
  const maxTemps = windowDays.map((d) => d?.maxTempC).filter((v) => typeof v === 'number');
  const precip = windowDays.map((d) => d?.precipitationMm).filter((v) => typeof v === 'number');

  const minMin = minTemps.length ? Math.min(...minTemps) : null;
  const maxMax = maxTemps.length ? Math.max(...maxTemps) : null;
  const precipSum = precip.length ? precip.reduce((a, b) => a + b, 0) : null;

  const flags = {
    chilly: minMin != null && minMin < 20,
    extremeHeat: maxMax != null && maxMax >= 32,
    heavyRain: precipSum != null && precipSum >= 40,
  };

  if (flags.extremeHeat) {
    return {
      status: 'High Heat Stress Risk',
      color: THEME.primary,
      summary: 'Elevated ambient temperatures may induce acute swine thermal prostration and skin erythema.',
      tips: [
        'Activate barn misting sprinklers and cross-ventilation exhaust fans.',
        'Ensure continuous ad-libitum fresh, cool drinking water across all pens.',
        'Postpone daytime pig transfers or vaccinations until late afternoon hours.',
      ],
    };
  }

  if (flags.heavyRain) {
    return {
      status: 'High Humidity & Moisture Alert',
      color: THEME.amber,
      summary: 'Damp pen concrete and high humidity elevate risks of Greasy Pig dermatitis and foot rot.',
      tips: [
        'Apply dry slaked lime or absorbent bedding powder over damp walkway floors.',
        'Inspect pen drainage gutters to prevent standing slurry near piglet creep areas.',
        'Monitor suckling piglets for facial greasy lesions or abrasions.',
      ],
    };
  }

  if (flags.chilly) {
    return {
      status: 'Low Temperature Advisory',
      color: THEME.cyan,
      summary: 'Night temperatures drop below comfort range for suckling and nursery piglets.',
      tips: [
        'Engage nursery heating lamps in Sector A creep boxes.',
        'Lower barn tarpaulins or side curtains during night draft hours.',
        'Verify piglet piling behavior indicating cold stress.',
      ],
    };
  }

  return {
    status: 'Optimal Biosecurity Microclimate',
    color: THEME.emerald,
    summary: 'Current weather parameters are within thermo-neutral zones for all swine age groups.',
    tips: [
      'Maintain standard 48-hour disinfectant footbath cycling at pen gates.',
      'Conduct routine daily clinical skin checks during morning feeding.',
      'Keep feed bins sealed against wild avian and rodent vectors.',
    ],
  };
};

export default function MappingEnvironmentScreen({ navigation, route, user }) {
  const insets = useSafeAreaInsets();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const didAutoOpenMap = useRef(false);

  const loadReport = async ({ force } = { force: false }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEnvironmentalReport({ force, user });
      setReport(data);
    } catch (e) {
      const msg = e && typeof e === 'object' && 'message' in e ? e.message : null;
      setError(typeof msg === 'string' ? msg : 'Unable to load farm environmental data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport({ force: false });
  }, []);

  const openInMaps = async () => {
    const lat = report?.coords?.latitude;
    const lon = report?.coords?.longitude;
    if (typeof lat !== 'number' || typeof lon !== 'number') return;

    const label = encodeURIComponent(report?.place?.label || 'Swine Farm Facility');
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?ll=${lat},${lon}&q=${label}`
        : Platform.OS === 'android'
          ? `geo:${lat},${lon}?q=${lat},${lon}(${label})`
          : `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

    try {
      await Linking.openURL(url);
    } catch {
      return;
    }
  };

  const suitability = useMemo(() => evaluateSwineBiosecuritySuitability(report), [report]);

  useEffect(() => {
    const wantsMap = route?.params?.openMap === true;
    if (!wantsMap) return;
    if (didAutoOpenMap.current) return;

    const lat = report?.coords?.latitude;
    const lon = report?.coords?.longitude;
    if (typeof lat !== 'number' || typeof lon !== 'number') return;

    didAutoOpenMap.current = true;
    openInMaps();
  }, [route?.params?.openMap, report]);

  const locationName =
    report?.place?.name || report?.place?.label?.split(',')[0] || 'Swine Facility';
  const province = report?.place?.province || 'Laguna';
  const country = report?.place?.country || 'Philippines';
  const fullLocation = [province, country].filter(Boolean).join(', ');

  const current = report?.forecast?.current;
  const days = Array.isArray(report?.forecast?.days) ? report.forecast.days : [];

  return (
    <View style={styles.container}>
      {/* Top Cyber Telemetry Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => {
              if (navigation?.canGoBack?.()) navigation.goBack();
            }}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#f8fafc" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={styles.brandRow}>
              <View style={styles.pulsingDot} />
              <Text style={styles.brandSubtitle}>PIGIFY GPS BIOSECURITY TELEMETRY</Text>
            </View>
            <Text style={styles.headerTitle}>Farm Environmental Mapping</Text>
          </View>
          <TouchableOpacity
            onPress={() => loadReport({ force: true })}
            style={styles.refreshBtn}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#f43f5e" />
            ) : (
              <Ionicons name="refresh" size={18} color="#94a3b8" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* GPS Farm Facility Coordinates Card */}
        <LinearGradient
          colors={['#1e1b4b', '#0f172a', '#060911']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.locationCard}
        >
          <View style={styles.locationHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTag}>PRIMARY SWINE SITE</Text>
              <Text style={styles.locationNameText}>{locationName}</Text>
              <Text style={styles.locationSubText}>{fullLocation}</Text>
            </View>
            <View style={styles.gpsCoordsBadge}>
              <Text style={styles.gpsText}>
                {report?.coords?.latitude ? report.coords.latitude.toFixed(4) : '14.1670'}° N
              </Text>
              <Text style={styles.gpsText}>
                {report?.coords?.longitude ? report.coords.longitude.toFixed(4) : '121.2430'}° E
              </Text>
            </View>
          </View>

          <View style={styles.locationActionsRow}>
            <TouchableOpacity onPress={openInMaps} style={styles.mapActionBtn} activeOpacity={0.8}>
              <Ionicons name="map" size={17} color="#FFFFFF" />
              <Text style={styles.mapActionText}>View Satellite Perimeter</Text>
            </TouchableOpacity>

            {report?.fetchedAt && (
              <Text style={styles.lastSyncText}>
                Telemetry: {new Date(report.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
        </LinearGradient>

        {/* Current Microclimate Conditions */}
        <Surface style={styles.sectionCard} elevation={0}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="thermometer" size={18} color="#fb7185" />
            <Text style={styles.cardSectionTitle}>Barn Environmental Readings</Text>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiVal}>
                {typeof current?.temperatureC === 'number'
                  ? `${Math.round(current.temperatureC)}°C`
                  : '29°C'}
              </Text>
              <Text style={styles.kpiLbl}>Ambient Temp</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiVal}>
                {typeof current?.windKmh === 'number'
                  ? `${Math.round(current.windKmh)} km/h`
                  : '12 km/h'}
              </Text>
              <Text style={styles.kpiLbl}>Wind Velocity</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiVal}>{current?.weatherLabel || 'Clear'}</Text>
              <Text style={styles.kpiLbl}>Sky Condition</Text>
            </View>
          </View>

          {error && <Text style={styles.errorBanner}>{error}</Text>}
        </Surface>

        {/* Swine Biosecurity Suitability Status */}
        <Surface style={styles.sectionCard} elevation={0}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="shield-checkmark" size={18} color={suitability.color} />
            <Text style={styles.cardSectionTitle}>Swine Herd Biosecurity Assessment</Text>
          </View>

          <View style={styles.suitabilityBadgeRow}>
            <View
              style={[
                styles.suitabilityBadge,
                {
                  backgroundColor: `${suitability.color}22`,
                  borderColor: `${suitability.color}66`,
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={13} color={suitability.color} />
              <Text style={[styles.suitabilityBadgeText, { color: suitability.color }]}>
                {suitability.status}
              </Text>
            </View>
          </View>

          <Text style={styles.suitabilitySummary}>{suitability.summary}</Text>

          <View style={styles.tipsList}>
            {suitability.tips.map((tip, idx) => (
              <View key={idx} style={styles.tipRow}>
                <Ionicons name="chevron-forward-circle" size={16} color={suitability.color} style={{ marginTop: 2 }} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </Surface>

        {/* 7-Day Pen Environmental Forecast */}
        <Surface style={styles.sectionCard} elevation={0}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="calendar" size={18} color="#06b6d4" />
            <Text style={styles.cardSectionTitle}>7-Day Environmental Forecast</Text>
          </View>

          {days.length > 0 ? (
            <View style={styles.forecastTable}>
              <View style={styles.forecastHeader}>
                <Text style={[styles.forecastHeadText, { flex: 1.2 }]}>Day</Text>
                <Text style={[styles.forecastHeadText, { flex: 1.4 }]}>Min / Max</Text>
                <Text style={[styles.forecastHeadText, { flex: 1 }]}>Rain</Text>
                <Text style={[styles.forecastHeadText, { flex: 1.4 }]}>Outlook</Text>
              </View>

              {days.map((d, idx) => (
                <View key={idx} style={styles.forecastRow}>
                  <Text style={[styles.forecastCellDay, { flex: 1.2 }]}>
                    {formatDayLabel(d.date)}
                  </Text>
                  <Text style={[styles.forecastCellTemp, { flex: 1.4 }]}>
                    {typeof d.minTempC === 'number' ? Math.round(d.minTempC) : '-'}° /{' '}
                    {typeof d.maxTempC === 'number' ? Math.round(d.maxTempC) : '-'}°C
                  </Text>
                  <Text style={[styles.forecastCellPrecip, { flex: 1 }]}>
                    {typeof d.precipitationMm === 'number' ? `${Math.round(d.precipitationMm)}mm` : '0mm'}
                  </Text>
                  <Text style={[styles.forecastCellLabel, { flex: 1.4 }]} numberOfLines={1}>
                    {d.weatherLabel || 'Normal'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.loadingForecastText}>
              {loading ? 'Synchronizing weather satellites...' : 'No forecast data available.'}
            </Text>
          )}
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  header: {
    backgroundColor: 'rgba(11, 18, 32, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    paddingBottom: 12,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  brandSubtitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  locationCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 18,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#06b6d4',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  locationNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  locationSubText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  gpsCoordsBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  gpsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fb7185',
    textAlign: 'right',
  },
  locationActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  mapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f43f5e',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  mapActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lastSyncText: {
    fontSize: 11,
    color: '#64748b',
  },
  sectionCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    alignItems: 'center',
  },
  kpiVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 2,
  },
  kpiLbl: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  errorBanner: {
    marginTop: 10,
    fontSize: 12,
    color: '#f43f5e',
  },
  suitabilityBadgeRow: {
    marginBottom: 10,
  },
  suitabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  suitabilityBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  suitabilitySummary: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    fontSize: 12.5,
    color: '#94a3b8',
    lineHeight: 18,
    flex: 1,
  },
  forecastTable: {
    gap: 6,
  },
  forecastHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  forecastHeadText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  forecastCellDay: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
  },
  forecastCellTemp: {
    fontSize: 12,
    color: '#fb7185',
    fontWeight: '600',
  },
  forecastCellPrecip: {
    fontSize: 12,
    color: '#06b6d4',
  },
  forecastCellLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  loadingForecastText: {
    fontSize: 12,
    color: '#64748b',
    paddingVertical: 8,
  },
});

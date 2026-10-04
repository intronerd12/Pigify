import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../services/api';

const { width } = Dimensions.get('window');

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

const PEN_ZONES = [
  {
    id: 'nursery',
    name: 'Nursery & Piglet Pens',
    location: 'Sector A - East Shelter',
    swineCount: 14,
    targetTemp: '28°C - 32°C',
    targetHumidity: '60% - 70%',
    currentTemp: 29.4,
    currentHumidity: 64,
    ammoniaIndex: 'Low (0.04 ppm)',
    heatStressLevel: 'Optimal',
    status: 'Safe',
    riskCorrelation:
      'Low risk of dermatitis; dry warm bedding prevents chilling and piglet skin abrasions.',
  },
  {
    id: 'grower',
    name: 'Grower Herd Pens',
    location: 'Sector B - Main Outdoor Pen',
    swineCount: 16,
    targetTemp: '20°C - 25°C',
    targetHumidity: '55% - 70%',
    currentTemp: 28.2,
    currentHumidity: 78,
    ammoniaIndex: 'Elevated (0.12 ppm)',
    heatStressLevel: 'Mild Heat Stress',
    status: 'Warning',
    riskCorrelation:
      'High humidity (>75%) and damp concrete floor elevates greasy pig dermatitis and diamond skin risks.',
  },
  {
    id: 'finisher',
    name: 'Finisher Swine Pens',
    location: 'Sector C - South Shelter',
    swineCount: 12,
    targetTemp: '18°C - 24°C',
    targetHumidity: '50% - 65%',
    currentTemp: 26.5,
    currentHumidity: 62,
    ammoniaIndex: 'Normal (0.06 ppm)',
    heatStressLevel: 'Acceptable',
    status: 'Safe',
    riskCorrelation:
      'Good cross-ventilation maintains clear dermis; skin parasite proliferation is minimized.',
  },
  {
    id: 'gestation',
    name: 'Sow Breeding Stalls',
    location: 'Sector D - Central Barn',
    swineCount: 8,
    targetTemp: '18°C - 22°C',
    targetHumidity: '55% - 70%',
    currentTemp: 25.1,
    currentHumidity: 60,
    ammoniaIndex: 'Normal (0.05 ppm)',
    heatStressLevel: 'Optimal',
    status: 'Safe',
    riskCorrelation:
      'Shaded canopy and automated misting prevent heat-induced skin erythema.',
  },
  {
    id: 'isolation',
    name: 'Quarantine & Isolation Pen',
    location: 'Sector E - Perimeter Buffer',
    swineCount: 3,
    targetTemp: '22°C - 26°C',
    targetHumidity: '50% - 60%',
    currentTemp: 25.8,
    currentHumidity: 58,
    ammoniaIndex: 'Low (0.03 ppm)',
    heatStressLevel: 'Optimal',
    status: 'Quarantine Active',
    riskCorrelation:
      'Strict 10-meter perimeter buffer prevents airborne contagion spread to healthy pens.',
  },
];

const WEATHER_CACHE_KEY = '@pigify_cached_weather';

const DEFAULT_WEATHER = {
  province: 'Laguna, PH',
  temperature: 29,
  humidity: 68,
  condition: 'Partly Cloudy',
  windSpeed: 14,
  heatStress: {
    index: 78.4,
    status: 'Mild Heat Stress',
    color: '#f59e0b',
    recommendation:
      'Engage misting fans in Sector B and increase water trough flow to prevent heat rash.',
  },
  forecast: [
    { day: 'Today', temp: 29, condition: 'Partly Cloudy', humidity: 68 },
    { day: 'Tomorrow', temp: 31, condition: 'Sunny', humidity: 62 },
    { day: 'Day 3', temp: 28, condition: 'Light Rain', humidity: 82 },
  ],
};

export default function WeatherScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState(DEFAULT_WEATHER);
  const [selectedZoneId, setSelectedZoneId] = useState(PEN_ZONES[0].id);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    animateIn();
    // Instant cache read for zero-latency screen presentation
    AsyncStorage.getItem(WEATHER_CACHE_KEY).then((saved) => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            setWeatherData(parsed);
          }
        } catch {}
      }
    }).catch(() => {});

    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    try {
      let province = 'Laguna';
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // Fast path: use cached last-known position (< 10ms) or rapid balanced GPS
          const lastLoc = await Location.getLastKnownPositionAsync().catch(() => null);
          let coords = lastLoc?.coords;
          if (!coords) {
            const loc = await Promise.race([
              Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Location timeout')), 3500)),
            ]);
            coords = loc?.coords;
          }

          if (coords) {
            const address = await Location.reverseGeocodeAsync({
              latitude: coords.latitude,
              longitude: coords.longitude,
            });
            if (address && address.length > 0) {
              province = address[0].region || address[0].city || 'Laguna';
            }
          }
        }
      } catch (locErr) {
        console.log('Location fast fallback to Laguna:', locErr?.message);
      }

      await fetchWeatherData(province);
    } catch (error) {
      console.warn('Weather fetch fallback:', error?.message);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchWeatherData = async (province) => {
    const cleanProvince = province.replace(' Province', '');
    const response = await apiFetch(`/api/weather?province=${encodeURIComponent(cleanProvince)}`);
    if (!response.ok) throw new Error('Weather API error');

    const data = await response.json();
    const temp = Number(data.temperature || 28);
    const rh = Number(data.humidity || 65);

    // Calculate THI (Temperature-Humidity Index for Swine)
    // THI = (1.8 * T + 32) - (0.55 - 0.0055 * RH) * (1.8 * T - 26)
    const thi = (1.8 * temp + 32) - (0.55 - 0.0055 * rh) * (1.8 * temp - 26);
    let heatStatus = 'Optimal';
    let heatColor = '#10b981';
    let heatRec = 'Pen microclimate is in optimal thermo-neutral range. Dermatitis risks low.';

    if (thi >= 84) {
      heatStatus = 'Severe Heat Stress';
      heatColor = '#f43f5e';
      heatRec = 'Emergency cooling required! Activate cross-fans, mist sprinklers, and monitor for listlessness.';
    } else if (thi >= 78) {
      heatStatus = 'Moderate Heat Stress';
      heatColor = '#f59e0b';
      heatRec = 'High heat load. Ensure ad-libitum cool drinking water and elevate pen cross-ventilation.';
    } else if (thi >= 72) {
      heatStatus = 'Mild Heat Stress';
      heatColor = '#06b6d4';
      heatRec = 'Slightly elevated heat. Check piglet creeping areas and avoid pen over-crowding.';
    }

    const formattedData = {
      ...data,
      province: data.province || province,
      heatStress: {
        index: Math.round(thi * 10) / 10,
        status: heatStatus,
        color: heatColor,
        recommendation: heatRec,
      },
    };

    setWeatherData(formattedData);
    AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(formattedData)).catch(() => {});
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onRefresh = () => {
    setRefreshing(true);
    getLocationAndWeather();
  };

  const selectedZone = useMemo(
    () => PEN_ZONES.find((z) => z.id === selectedZoneId) || PEN_ZONES[0],
    [selectedZoneId]
  );

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Sunny':
        return 'sunny';
      case 'Partly Cloudy':
        return 'partly-sunny';
      case 'Cloudy':
        return 'cloudy';
      case 'Light Rain':
      case 'Rainy':
        return 'rainy';
      case 'Heavy Rain':
      case 'Thunderstorm':
        return 'thunderstorm';
      default:
        return 'partly-sunny';
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Cyber Telemetry Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#f8fafc" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <View style={styles.brandRow}>
              <View style={styles.pulsingDot} />
              <Text style={styles.brandSubtitle}>SWINE PEN TELEMETRY & MICROCLIMATE</Text>
            </View>
            <Text style={styles.headerTitle}>Environment Monitor</Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn} activeOpacity={0.7}>
            <Ionicons name="refresh" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f43f5e" />
        }
      >
        {weatherData && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Location & Real-Time Sync HUD */}
            <View style={styles.telemetryHUD}>
              <View style={styles.hudLeft}>
                <Ionicons name="location" size={15} color="#06b6d4" />
                <Text style={styles.hudLocText}>{weatherData.province}</Text>
              </View>
              <View style={styles.hudRight}>
                <View style={styles.hudLiveDot} />
                <Text style={styles.hudLiveText}>LIVE SENSOR FEED</Text>
              </View>
            </View>

            {/* Ambient Meteorological Card */}
            <LinearGradient
              colors={['#1e1b4b', '#0f172a', '#060911']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.weatherCard}
            >
              <View style={styles.weatherMainRow}>
                <View>
                  <Text style={styles.tempValue}>{weatherData.temperature}°C</Text>
                  <Text style={styles.conditionText}>{weatherData.condition}</Text>
                  <Text style={styles.subtext}>Ambient Barn Microclimate</Text>
                </View>
                <View style={styles.weatherIconCircle}>
                  <Ionicons
                    name={getWeatherIcon(weatherData.condition)}
                    size={48}
                    color="#fb7185"
                  />
                </View>
              </View>

              {/* 3 Metrics Row */}
              <View style={styles.metricsBar}>
                <View style={styles.metricItem}>
                  <Ionicons name="water" size={17} color="#06b6d4" />
                  <Text style={styles.metricLabel}>Humidity</Text>
                  <Text style={styles.metricVal}>{weatherData.humidity}%</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Ionicons name="speedometer" size={17} color="#10b981" />
                  <Text style={styles.metricLabel}>Wind</Text>
                  <Text style={styles.metricVal}>{weatherData.windSpeed} km/h</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Ionicons name="flame" size={17} color={weatherData.heatStress.color} />
                  <Text style={styles.metricLabel}>THI Index</Text>
                  <Text style={[styles.metricVal, { color: weatherData.heatStress.color }]}>
                    {weatherData.heatStress.index}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Swine Heat Stress & Dermatitis Advisory */}
            <Surface style={styles.advisoryCard} elevation={0}>
              <View style={styles.advisoryHeader}>
                <View
                  style={[
                    styles.advisoryPill,
                    {
                      backgroundColor: `${weatherData.heatStress.color}22`,
                      borderColor: `${weatherData.heatStress.color}66`,
                    },
                  ]}
                >
                  <Ionicons name="shield-alert" size={14} color={weatherData.heatStress.color} />
                  <Text
                    style={[styles.advisoryPillText, { color: weatherData.heatStress.color }]}
                  >
                    {weatherData.heatStress.status}
                  </Text>
                </View>
                <Text style={styles.advisoryTitle}>Swine Herd Advisory</Text>
              </View>
              <Text style={styles.advisoryBody}>{weatherData.heatStress.recommendation}</Text>
            </Surface>

            {/* Pen Zone Interactive Selector */}
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="layers" size={17} color="#fb7185" />
              <Text style={styles.sectionHeading}>Active Pen Sectors ({PEN_ZONES.length})</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.zoneScroll}
            >
              {PEN_ZONES.map((zone) => {
                const isSelected = zone.id === selectedZoneId;
                return (
                  <TouchableOpacity
                    key={zone.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedZoneId(zone.id)}
                    style={[
                      styles.zonePill,
                      isSelected && styles.zonePillActive,
                      isSelected && {
                        borderColor: zone.status === 'Warning' ? '#f59e0b' : '#f43f5e',
                      },
                    ]}
                  >
                    <Ionicons
                      name="home"
                      size={14}
                      color={isSelected ? '#fb7185' : THEME.textMuted}
                    />
                    <Text
                      style={[
                        styles.zonePillText,
                        isSelected && { color: '#f8fafc', fontWeight: '700' },
                      ]}
                    >
                      {zone.name.split(' ')[0]}
                    </Text>
                    <View
                      style={[
                        styles.zoneStatusDot,
                        {
                          backgroundColor:
                            zone.status === 'Warning'
                              ? '#f59e0b'
                              : zone.status === 'Quarantine Active'
                              ? '#f43f5e'
                              : '#10b981',
                        },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Selected Zone Deep Telemetry Card */}
            <Surface style={styles.zoneDetailCard} elevation={0}>
              <View style={styles.zoneDetailTop}>
                <View>
                  <Text style={styles.zoneDetailName}>{selectedZone.name}</Text>
                  <Text style={styles.zoneDetailLoc}>{selectedZone.location}</Text>
                </View>
                <View style={styles.swineCountBadge}>
                  <Text style={styles.swineCountText}>{selectedZone.swineCount} Pigs</Text>
                </View>
              </View>

              <View style={styles.zoneGrid}>
                <View style={styles.zoneGridItem}>
                  <Text style={styles.zoneGridLabel}>Pen Temp</Text>
                  <Text style={styles.zoneGridVal}>{selectedZone.currentTemp}°C</Text>
                  <Text style={styles.zoneGridTarget}>Target: {selectedZone.targetTemp}</Text>
                </View>
                <View style={styles.zoneGridItem}>
                  <Text style={styles.zoneGridLabel}>Pen Humidity</Text>
                  <Text style={styles.zoneGridVal}>{selectedZone.currentHumidity}%</Text>
                  <Text style={styles.zoneGridTarget}>Target: {selectedZone.targetHumidity}</Text>
                </View>
                <View style={styles.zoneGridItem}>
                  <Text style={styles.zoneGridLabel}>Ammonia (NH3)</Text>
                  <Text style={styles.zoneGridVal}>{selectedZone.ammoniaIndex.split(' ')[0]}</Text>
                  <Text style={styles.zoneGridTarget}>{selectedZone.ammoniaIndex.split(' ')[1] || ''}</Text>
                </View>
                <View style={styles.zoneGridItem}>
                  <Text style={styles.zoneGridLabel}>Heat State</Text>
                  <Text
                    style={[
                      styles.zoneGridVal,
                      {
                        color:
                          selectedZone.heatStressLevel === 'Optimal' ? '#10b981' : '#f59e0b',
                      },
                    ]}
                  >
                    {selectedZone.heatStressLevel}
                  </Text>
                  <Text style={styles.zoneGridTarget}>Condition</Text>
                </View>
              </View>

              <View style={styles.riskCorrelationBox}>
                <View style={styles.riskIconRow}>
                  <Ionicons name="information-circle" size={15} color="#06b6d4" />
                  <Text style={styles.riskLabel}>Dermatitis Risk Correlation</Text>
                </View>
                <Text style={styles.riskText}>{selectedZone.riskCorrelation}</Text>
              </View>
            </Surface>

            {/* 3-Day Forecast Section */}
            {Array.isArray(weatherData.forecast) && weatherData.forecast.length > 0 && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="calendar" size={17} color="#06b6d4" />
                  <Text style={styles.sectionHeading}>3-Day Pen Microclimate Forecast</Text>
                </View>

                <View style={styles.forecastRow}>
                  {weatherData.forecast.slice(0, 3).map((day, idx) => (
                    <Surface key={idx} style={styles.forecastItemCard} elevation={0}>
                      <Text style={styles.forecastDayText}>{day.day}</Text>
                      <Ionicons
                        name={getWeatherIcon(day.condition)}
                        size={28}
                        color="#fb7185"
                        style={{ marginVertical: 6 }}
                      />
                      <Text style={styles.forecastTempText}>{day.temp || day.temperature}°C</Text>
                      <Text style={styles.forecastConditionText}>{day.condition}</Text>
                    </Surface>
                  ))}
                </View>
              </>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 13,
    color: THEME.textSub,
    marginTop: 12,
    fontWeight: '600',
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
  },
  telemetryHUD: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  hudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hudLocText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
  },
  hudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hudLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  hudLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  weatherCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 18,
    marginBottom: 16,
  },
  weatherMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tempValue: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fb7185',
    marginBottom: 2,
  },
  subtext: {
    fontSize: 11,
    color: '#94a3b8',
  },
  weatherIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
  },
  advisoryCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
    marginBottom: 16,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  advisoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  advisoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  advisoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  advisoryBody: {
    fontSize: 12.5,
    color: '#94a3b8',
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  zoneScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 6,
  },
  zonePillActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  zonePillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  zoneStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  zoneDetailCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginBottom: 16,
  },
  zoneDetailTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  zoneDetailName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 2,
  },
  zoneDetailLoc: {
    fontSize: 12,
    color: '#06b6d4',
  },
  swineCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  swineCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fb7185',
  },
  zoneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  zoneGridItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
  },
  zoneGridLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  zoneGridVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  zoneGridTarget: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  riskCorrelationBox: {
    backgroundColor: 'rgba(6, 182, 212, 0.07)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    padding: 12,
  },
  riskIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  riskLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06b6d4',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  riskText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 17,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: 8,
  },
  forecastItemCard: {
    flex: 1,
    backgroundColor: THEME.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
    alignItems: 'center',
  },
  forecastDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  forecastTempText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },
  forecastConditionText: {
    fontSize: 10.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
});

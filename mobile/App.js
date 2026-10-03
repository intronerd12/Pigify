import React, { useState, useEffect, lazy, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Alert, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearEnvironmentCaches } from './services/EnvironmentService';
import { getUserNamespace, sanitizeForKey } from './services/storageScope';
import { getSessionStatus } from './services/api';
import { signOutSupabase } from './services/supabaseAuth';

// ── Lightweight Cyber Screen Loader for Lazy Suspense Fallbacks ─────────────
function ScreenLoader({ label = 'Initializing Module...' }) {
  return (
    <View style={styles.screenLoaderContainer}>
      <StatusBar style="light" />
      <View style={styles.screenLoaderCircle}>
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
      <Text style={styles.screenLoaderLabel}>{label}</Text>
      <Text style={styles.screenLoaderSub}>YOLOv11-VET Telemetry Ready</Text>
    </View>
  );
}

// Higher-order helper for lazy-loaded screens with Suspense
function lazyScreen(importFn, label) {
  const LazyComponent = lazy(importFn);
  return function LazyScreenWrapper(props) {
    return (
      <Suspense fallback={<ScreenLoader label={label} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// ── Lazy-loaded Screen Modules (Reduces initial bundle and startup lag) ──────
const AuthScreen = lazyScreen(() => import('./screens/AuthScreen'), 'Loading Pigify Portal...');
const HomeScreen = lazyScreen(() => import('./screens/HomeScreen'), 'Loading Swine Command...');
const ScanScreen = lazyScreen(() => import('./screens/ScanScreen'), 'Calibrating YOLOv11-VET...');
const SortingGradingScreen = lazyScreen(() => import('./screens/SortingGradingScreen'), 'Loading Triage Pipeline...');
const ChatbotScreen = lazyScreen(() => import('./screens/ChatbotScreen'), 'Loading Swine AI Vet...');
const UserScreen = lazyScreen(() => import('./screens/UserScreen'), 'Loading Operator Profile...');

// Secondary Stacks (Loaded on-demand only when tapped)
const GuideScreen = lazyScreen(() => import('./screens/GuideScreen'), 'Loading Swine Pathology Guide...');
const WeatherScreen = lazyScreen(() => import('./screens/WeatherScreen'), 'Synchronizing Pen Telemetry...');
const MappingEnvironmentScreen = lazyScreen(() => import('./screens/MappingEnvironmentScreen'), 'Loading Farm GIS Telemetry...');
const EditProfileScreen = lazyScreen(() => import('./screens/EditProfileScreen'), 'Loading Profile Editor...');
const NotificationsScreen = lazyScreen(() => import('./screens/NotificationsScreen'), 'Loading Alert Preferences...');
const CommunityForumScreen = lazyScreen(() => import('./screens/CommunityForumScreen'), 'Connecting Swine Community...');

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const NAV_THEME = {
  active: '#fb7185',
  inactive: '#64748b',
  barBg: 'rgba(11, 18, 32, 0.96)',
  centerBtn: '#f43f5e',
  centerBtnShadow: 'rgba(244, 63, 94, 0.45)',
};

function CenterScanButton({ onPress, accessibilityState }) {
  const focused = Boolean(accessibilityState?.selected);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="AI Swine Scanner"
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.scanBtnWrap}
    >
      <View style={[styles.scanBtn, focused && styles.scanBtnFocused]}>
        <Ionicons name={focused ? 'scan' : 'scan-outline'} size={28} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

function MainTabs({ user, handleLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'scan' : 'scan-outline';
          } else if (route.name === 'Sorting') {
            iconName = focused ? 'layers' : 'layers-outline';
          } else if (route.name === 'Chatbot') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'User') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={21} color={color} />;
        },
        tabBarActiveTintColor: NAV_THEME.active,
        tabBarInactiveTintColor: NAV_THEME.inactive,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        headerShown: false,
        lazy: true, // Only render tabs when first navigated to, avoiding background lag
        unmountOnBlur: false, // Keep tab memory intact after loading so switching is instantaneous
      })}
    >
      <Tab.Screen name="Home" options={{ tabBarLabel: 'Command' }}>
        {props => <HomeScreen {...props} user={user} onLogout={handleLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Sorting" options={{ tabBarLabel: 'Triage' }}>
        {props => <SortingGradingScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen
        name="Scan"
        options={{
          tabBarLabel: 'Scanner',
          tabBarButton: (props) => <CenterScanButton {...props} />,
          tabBarIcon: () => null,
        }}
      >
        {props => <ScanScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Chatbot" options={{ tabBarLabel: 'AI Vet' }}>
        {props => <ChatbotScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="User" options={{ tabBarLabel: 'Profile' }}>
        {props => <UserScreen {...props} user={user} onLogout={handleLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userKey = sanitizeForKey(getUserNamespace(user)) || 'anon';

  useEffect(() => {
    checkUser();
  }, []);

  // Idle background prefetch for core user tabs so clicking them is 0ms delay
  useEffect(() => {
    if (!user) return;
    const prefetchTimer = setTimeout(() => {
      import('./screens/ScanScreen').catch(() => {});
      import('./screens/SortingGradingScreen').catch(() => {});
      import('./screens/ChatbotScreen').catch(() => {});
    }, 1500);

    return () => clearTimeout(prefetchTimer);
  }, [user]);

  const checkUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    const prevUser = user;
    setUser(null);
    await AsyncStorage.removeItem('user');
    await signOutSupabase();
    await clearEnvironmentCaches({ user: prevUser });
  };

  const handleUpdateUser = async (updatedUser) => {
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  useEffect(() => {
    if (!user?.token) return undefined;

    let mounted = true;
    let checking = false;

    const validateSession = async () => {
      if (checking || !mounted) return;
      checking = true;
      try {
        await getSessionStatus(user.token);
      } catch (error) {
        if (!mounted) return;
        if (error?.status === 401 || error?.status === 403) {
          const message = error?.message || 'Your account status changed. Please contact support.';
          const previousUser = user;
          setUser(null);
          await AsyncStorage.removeItem('user');
          await clearEnvironmentCaches({ user: previousUser });
          Alert.alert('Session ended', message);
        }
      } finally {
        checking = false;
      }
    };

    validateSession();
    const intervalId = setInterval(validateSession, 30000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        {user ? (
          <Stack.Navigator
            key={`user:${userKey}`}
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#060911' },
              detachInactiveScreens: true,
            }}
          >
            <Stack.Screen name="MainTabs">
              {props => <MainTabs {...props} user={user} handleLogout={handleLogout} key={`tabs:${userKey}`} />}
            </Stack.Screen>
            <Stack.Screen name="Guide" component={GuideScreen} />
            <Stack.Screen name="Weather" component={WeatherScreen} />
            <Stack.Screen name="MappingEnvironment">
              {props => <MappingEnvironmentScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="EditProfile">
              {props => <EditProfileScreen {...props} onUpdateUser={handleUpdateUser} />}
            </Stack.Screen>
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="CommunityForum">
              {props => <CommunityForumScreen {...props} user={user} />}
            </Stack.Screen>
          </Stack.Navigator>
        ) : (
          <AuthScreen onLogin={handleLogin} />
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060911',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#060911',
  },
  screenLoaderContainer: {
    flex: 1,
    backgroundColor: '#060911',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  screenLoaderCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  screenLoaderLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  screenLoaderSub: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    height: 68,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 34,
    overflow: 'visible',
    backgroundColor: NAV_THEME.barBg,
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 6,
    elevation: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.65,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  tabBarItem: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  scanBtnWrap: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: NAV_THEME.centerBtn,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: NAV_THEME.centerBtnShadow,
    shadowOpacity: 0.7,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 3.5,
    borderColor: '#0b1220',
  },
  scanBtnFocused: {
    backgroundColor: '#be123c',
    transform: [{ scale: 1.05 }],
  },
});

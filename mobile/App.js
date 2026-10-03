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
  active: '#C71585',
  inactive: '#8EA19A',
  barBg: '#FFFFFF',
  centerBtn: '#C71585',
  centerBtnShadow: 'rgba(199, 21, 133, 0.38)',
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
        <Ionicons name={focused ? 'scan' : 'scan-outline'} size={30} color="#FFFFFF" />
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
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'scan' : 'scan-outline';
          } else if (route.name === 'Sorting') {
            iconName = focused ? 'layers' : 'layers-outline';
          } else if (route.name === 'Chatbot') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'User') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: NAV_THEME.active,
        tabBarInactiveTintColor: NAV_THEME.inactive,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        headerShown: false,
        lazy: true,
        unmountOnBlur: false,
      })}
    >
      <Tab.Screen name="Home" options={{ tabBarLabel: 'Home' }}>
        {props => <HomeScreen {...props} user={user} onLogout={handleLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Sorting" options={{ tabBarLabel: 'Triage' }}>
        {props => <SortingGradingScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen
        name="Scan"
        options={{
          tabBarLabel: 'Scan',
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
              cardStyle: { backgroundColor: '#F8F9FA' },
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
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  screenLoaderContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  screenLoaderCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(199, 21, 133, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(199, 21, 133, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  screenLoaderLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  screenLoaderSub: {
    fontSize: 12,
    color: '#64748B',
  },
  tabBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 14,
    height: 72,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 38,
    overflow: 'visible',
    backgroundColor: NAV_THEME.barBg,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
    elevation: 16,
    shadowColor: '#172B24',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
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
    top: -22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: NAV_THEME.centerBtn,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: NAV_THEME.centerBtnShadow,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  scanBtnFocused: {
    backgroundColor: '#8B008B',
    transform: [{ scale: 1.05 }],
  },
});

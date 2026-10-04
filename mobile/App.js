import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Alert, View, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

import { clearEnvironmentCaches } from './services/EnvironmentService';
import { getUserNamespace, sanitizeForKey } from './services/storageScope';
import { getSessionStatus } from './services/api';
import { signOutSupabase } from './services/supabaseAuth';

// Direct static screen imports: enables instant zero-latency page transitions without Suspense waterfall
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import SortingGradingScreen from './screens/SortingGradingScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import UserScreen from './screens/UserScreen';

// Secondary Stacks
import GuideScreen from './screens/GuideScreen';
import WeatherScreen from './screens/WeatherScreen';
import MappingEnvironmentScreen from './screens/MappingEnvironmentScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import CommunityForumScreen from './screens/CommunityForumScreen';

// Prevent splash flicker before auth state is read
SplashScreen.preventAutoHideAsync().catch(() => {});

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
        lazy: true,
        unmountOnBlur: false,
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
      SplashScreen.hideAsync().catch(() => {});
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
              cardStyle: { backgroundColor: '#070A13' },
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
    backgroundColor: '#070A13',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#070A13',
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

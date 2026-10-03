import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ChatbotService } from '../services/ChatbotService';
import { getUserNamespace, sanitizeForKey } from '../services/storageScope';

// ── Vibrant Signature Mobile Palette ──────────────────────────────────────────
const THEME = {
  primary: '#C71585',       // Deep Rose
  primaryDark: '#8B008B',   // Dark Magenta
  primaryLight: '#FF69B4',  // Hot Pink
  secondary: '#FFC0CB',    // Soft Pink
  accent: '#00B894',       // Emerald
  white: '#FFFFFF',
  textDark: '#1E293B',
  textLight: '#64748B',
  background: '#F6F7FB',
  surface: '#FFFFFF',
  userBubble: '#C71585',
  botBubble: '#FFFFFF',
  border: '#E2E8F0',
};

const STORAGE_KEY_BASE = 'chat_history_swine_v1';
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const TypingIndicator = () => {
  const d1 = useRef(new Animated.Value(0.2)).current;
  const d2 = useRef(new Animated.Value(0.2)).current;
  const d3 = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const mk = (v, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(v, {
            toValue: 0.2,
            duration: 350,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
        ])
      );

    const a1 = mk(d1, 0);
    const a2 = mk(d2, 120);
    const a3 = mk(d3, 240);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [d1, d2, d3]);

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, { opacity: d1 }]} />
      <Animated.View style={[styles.typingDot, { opacity: d2 }]} />
      <Animated.View style={[styles.typingDot, { opacity: d3 }]} />
    </View>
  );
};

const QUICK_PROMPTS = [
  'Swine skin rash treatment?',
  'Pen heat stress ventilation?',
  'Diamond skin disease (Erysipelas)?',
  'Piglet diarrhea clinical protocol?',
];

export default function ChatbotScreen({ user }) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const userKey = sanitizeForKey(getUserNamespace(user)) || 'anon';
  const storageKey = useMemo(() => `${STORAGE_KEY_BASE}:${userKey}`, [userKey]);

  useEffect(() => {
    loadChatHistory();
  }, [storageKey]);

  const loadChatHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem(storageKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        const welcomeMessage = {
          id: makeId(),
          sender: 'bot',
          text: `Hello ${user?.name ? user.name.split(' ')[0] : 'Operator'}! I am your Pigify Swine AI Vet Assistant. You can ask me about pig skin lesions, biosecurity protocols, fever signs, or pen climate management. How can I help your herd today?`,
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
        await AsyncStorage.setItem(storageKey, JSON.stringify([welcomeMessage]));
      }
    } catch {
      // Keep default
    }
  };

  const saveChatHistory = async (newMessages) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
    } catch {
      // Ignore
    }
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMessage = {
      id: makeId(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMessage];
    setMessages(updated);
    setInputText('');
    Keyboard.dismiss();
    setIsTyping(true);

    try {
      const response = await ChatbotService.sendMessage(text, { user });
      const botMessage = {
        id: makeId(),
        sender: 'bot',
        text: response.reply || 'I have reviewed your query regarding swine biosecurity. Maintain clean pen ventilation and isolate any pigs displaying progressive lesions.',
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...updated, botMessage];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
    } catch {
      const fallback = {
        id: makeId(),
        sender: 'bot',
        text: 'I could not reach the clinical veterinary server. For acute skin lesions or fever, isolate the animal immediately and inspect feed and water supply.',
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...updated, fallback];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    const resetMsg = [
      {
        id: makeId(),
        sender: 'bot',
        text: 'Chat history cleared. How can I assist with your swine herd telemetry today?',
        timestamp: new Date().toISOString(),
      },
    ];
    setMessages(resetMsg);
    await saveChatHistory(resetMsg);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Ionicons name="medkit" size={16} color="#FFFFFF" />
          </View>
        )}

        {isUser ? (
          <LinearGradient
            colors={[THEME.primary, THEME.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userBubble}
          >
            <Text style={styles.userMsgText}>{item.text}</Text>
          </LinearGradient>
        ) : (
          <Surface style={styles.botBubble} elevation={1}>
            <Text style={styles.botMsgText}>{item.text}</Text>
          </Surface>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Curved Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
        <LinearGradient
          colors={[THEME.primaryDark, THEME.primary]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.circle1} />

        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar}>
              <Ionicons name="medkit" size={20} color={THEME.primary} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.headerTitle}>Swine AI Vet Assistant</Text>
              <View style={styles.statusRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.statusText}>Clinical Consultation Active</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isTyping && (
          <View style={styles.typingRow}>
            <View style={styles.botAvatar}>
              <Ionicons name="medkit" size={14} color="#FFFFFF" />
            </View>
            <TypingIndicator />
          </View>
        )}

        {/* Quick Suggestion Pills */}
        <View style={styles.quickPromptsWrapper}>
          <FlatList
            horizontal
            data={QUICK_PROMPTS}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPromptsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickPromptChip}
                onPress={() => handleSend(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickPromptText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: tabBarHeight + 10 }]}>
          <Surface style={styles.inputCard} elevation={3}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about swine symptoms, dosage, or pen climate..."
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
              multiline
              maxLength={400}
            />

            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={inputText.trim() ? [THEME.primary, THEME.primaryDark] : ['#CBD5E1', '#94A3B8']}
                style={styles.sendGradient}
              >
                <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Surface>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  headerContainer: {
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  circle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.accent,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  clearBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  chatArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowBot: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  userBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    shadowColor: THEME.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  userMsgText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 19,
  },
  botBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1E293B',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  botMsgText: {
    fontSize: 14,
    color: THEME.textDark,
    lineHeight: 20,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 5,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.primary,
  },
  quickPromptsWrapper: {
    paddingVertical: 6,
  },
  quickPromptsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickPromptChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  quickPromptText: {
    fontSize: 12,
    color: THEME.textDark,
    fontWeight: '600',
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#1E293B',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.textDark,
    maxHeight: 80,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

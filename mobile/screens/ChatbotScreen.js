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
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ChatbotService } from '../services/ChatbotService';
import { getUserNamespace, sanitizeForKey } from '../services/storageScope';

// ── Web Design Tokens (Exact match with Home.css & AuthPro.css) ───────────────
const THEME = {
  bgDeep: '#070A13',
  bgCard: 'rgba(13, 20, 36, 0.92)',
  bgInput: 'rgba(20, 29, 48, 0.85)',
  borderCard: 'rgba(255, 255, 255, 0.10)',
  borderInput: 'rgba(255, 255, 255, 0.12)',

  primary: '#F43F5E',
  primaryHover: '#FB7185',
  primaryDark: '#BE123C',
  emerald: '#10B981',
  cyan: '#06B6D4',
  amber: '#F59E0B',

  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  textFaint: '#64748B',
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
            <Ionicons name="medkit" size={15} color="#FFFFFF" />
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
          <View style={styles.botBubble}>
            <Text style={styles.botMsgText}>{item.text}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Atmospheric Overlays */}
      <View style={styles.glowTopLeft} />

      {/* Header Bar matching Web AI Vet */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <Ionicons name="medkit" size={20} color={THEME.primaryHover} />
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
          <Ionicons name="trash-outline" size={17} color={THEME.textFaint} />
        </TouchableOpacity>
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
          <View style={styles.inputCard}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about swine symptoms, dosage, or pen climate..."
              placeholderTextColor={THEME.textFaint}
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
                colors={inputText.trim() ? [THEME.primary, THEME.primaryDark] : ['#334155', '#1E293B']}
                style={styles.sendGradient}
              >
                <Ionicons name="arrow-up" size={19} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgDeep,
  },
  glowTopLeft: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(244, 63, 94, 0.14)',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderCard,
    backgroundColor: 'rgba(7, 10, 19, 0.95)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.textMain,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.emerald,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '500',
  },
  clearBtn: {
    padding: 8,
    backgroundColor: THEME.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.borderCard,
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
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
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
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderCard,
  },
  botMsgText: {
    fontSize: 14,
    color: THEME.textMain,
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
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderCard,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 5,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.primaryHover,
  },
  quickPromptsWrapper: {
    paddingVertical: 6,
  },
  quickPromptsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickPromptChip: {
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderCard,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  quickPromptText: {
    fontSize: 12,
    color: THEME.textMuted,
    fontWeight: '600',
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderCard,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.textMain,
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

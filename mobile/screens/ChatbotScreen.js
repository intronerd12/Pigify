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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ChatbotService } from '../services/ChatbotService';
import { getUserNamespace, sanitizeForKey } from '../services/storageScope';

const THEME = {
  bgDeep: '#060911',
  bgCard: 'rgba(13, 20, 36, 0.94)',
  primary: '#f43f5e',
  emerald: '#10b981',
  userBubble: 'rgba(244, 63, 94, 0.22)',
  userBubbleBorder: 'rgba(244, 63, 94, 0.45)',
  botBubble: 'rgba(17, 26, 46, 0.88)',
  botBubbleBorder: 'rgba(255, 255, 255, 0.08)',
  textMain: '#f8fafc',
  textMuted: '#94a3b8',
  textFaint: '#64748b',
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
          Animated.timing(v, { toValue: 1, duration: 350, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
          Animated.timing(v, { toValue: 0.2, duration: 350, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
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
    <View style={styles.typingRow}>
      <Animated.View style={[styles.typingDot, { opacity: d1 }]} />
      <Animated.View style={[styles.typingDot, { opacity: d2 }]} />
      <Animated.View style={[styles.typingDot, { opacity: d3 }]} />
    </View>
  );
};

export default function ChatbotScreen({ navigation, user }) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const inputBottomOffset = Math.max(tabBarHeight - insets.bottom + 8, 14);

  const storageKey = useMemo(() => {
    const ns = sanitizeForKey(getUserNamespace(user));
    return ns ? `${STORAGE_KEY_BASE}:${ns}` : `${STORAGE_KEY_BASE}:anon`;
  }, [user]);

  const quickPrompts = useMemo(
    () => [
      { label: 'Erysipelas symptoms', text: 'How do I detect Erysipelas (Diamond Skin)?' },
      { label: 'Greasy pig treatment', text: 'What is the treatment for Greasy Pig Disease?' },
      { label: 'Pen biosecurity', text: 'What are the essential pen biosecurity protocols?' },
      { label: 'Lesion scan tips', text: 'Scan tips for lesion photos' },
      { label: 'Herd scan stats', text: 'Show my herd scan stats' },
    ],
    []
  );

  const listRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) {
            setMessages(parsed);
            return;
          }
        }
      } catch {
        // Fallback
      }

      setMessages([
        {
          id: makeId(),
          sender: 'bot',
          text: `Hello ${user?.name ? user.name.split(' ')[0] : 'Operator'}! I am the Pigify Clinical AI Vet Assistant.\n\nI can answer questions regarding swine skin diseases (Erysipelas, Greasy Pig, Sarcoptic Mange), lesion photography, and biosecurity quarantine measures. How can I help your herd today?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    })();
  }, [storageKey, user?.name]);

  const saveMessages = async (msgs) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(msgs.slice(-50)));
    } catch {
      // Ignored
    }
  };

  const handleSend = async (customText) => {
    const textToSend = String(customText || input || '').trim();
    if (!textToSend || sending) return;

    setInput('');
    const userMsg = {
      id: makeId(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    const next = [...messages, userMsg];
    setMessages(next);
    setSending(true);

    try {
      const reply = await ChatbotService.reply({ message: textToSend, user });
      const botMsg = {
        id: makeId(),
        sender: 'bot',
        text: reply.text || 'I processed your swine health query.',
        timestamp: new Date().toISOString(),
      };

      const finalMsgs = [...next, botMsg];
      setMessages(finalMsgs);
      saveMessages(finalMsgs);

      if (reply?.action?.type === 'navigate' && reply.action.screen) {
        navigation.navigate(reply.action.screen);
      }
    } catch {
      const errorMsg = {
        id: makeId(),
        sender: 'bot',
        text: 'Unable to reach veterinary AI server. Please check connection.',
        timestamp: new Date().toISOString(),
      };
      setMessages([...next, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    Alert.alert('Reset Chat', 'Clear all messages in this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          const fresh = [
            {
              id: makeId(),
              sender: 'bot',
              text: 'Conversation cleared. How can I assist with your herd diagnostics?',
              timestamp: new Date().toISOString(),
            },
          ];
          setMessages(fresh);
          await AsyncStorage.removeItem(storageKey);
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'ios' ? 10 : 14) }]}>
        <View style={styles.headerInfo}>
          <View style={styles.botAvatar}>
            <Ionicons name="chatbubbles" size={17} color="#fb7185" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>Pigify AI Vet</Text>
              <View style={styles.botBadge}>
                <Text style={styles.botBadgeText}>CLINICAL BOT</Text>
              </View>
            </View>
            <Text style={styles.subText}>24/7 Swine Disease Diagnostic Intelligence</Text>
          </View>
        </View>

        <TouchableOpacity onPress={clearChat} style={styles.resetBtn}>
          <Ionicons name="trash-outline" size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        {/* Messages List */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            return (
              <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
                {!isUser && (
                  <View style={styles.botSmallIcon}>
                    <Ionicons name="hardware-chip" size={14} color="#34d399" />
                  </View>
                )}
                <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
                  <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>
                    {item.text}
                  </Text>
                  <Text style={styles.bubbleTime}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListFooterComponent={sending ? <TypingIndicator /> : null}
        />

        {/* Quick Prompts */}
        <View style={styles.promptsBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsScroll}>
            {quickPrompts.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                onPress={() => handleSend(p.text)}
                style={styles.promptPill}
              >
                <Text style={styles.promptPillText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: inputBottomOffset }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about swine symptoms, dosage, biosecurity..."
            placeholderTextColor="#64748b"
            style={styles.inputField}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!input.trim() || sending}
            onPress={() => handleSend()}
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          >
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.bgDeep,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(11, 18, 32, 0.95)',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  botAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  botBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  botBadgeText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    color: '#34d399',
  },
  subText: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 1,
  },
  resetBtn: {
    padding: 8,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  botSmallIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: THEME.userBubble,
    borderColor: THEME.userBubbleBorder,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: THEME.botBubble,
    borderColor: THEME.botBubbleBorder,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userText: {
    color: '#ffffff',
  },
  botText: {
    color: '#e2e8f0',
  },
  bubbleTime: {
    fontSize: 9,
    color: THEME.textFaint,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  typingRow: {
    flexDirection: 'row',
    gap: 5,
    paddingLeft: 34,
    paddingVertical: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  promptsBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  promptsScroll: {
    gap: 8,
  },
  promptPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  promptPillText: {
    fontSize: 11,
    color: '#fb7185',
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: 'rgba(11, 18, 32, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  inputField: {
    flex: 1,
    backgroundColor: 'rgba(20, 29, 48, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    height: 42,
    color: '#ffffff',
    fontSize: 13,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f43f5e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});

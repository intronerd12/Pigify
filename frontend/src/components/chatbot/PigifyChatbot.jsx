import React, { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Trash2,
  ChevronDown,
  ShieldAlert,
  Bot,
  User,
  ExternalLink,
  Minimize2,
} from 'lucide-react'
import { API_BASE_URL } from '../../config/api'
import './PigifyChatbot.css'

// Default fallback key if env variable not directly available
const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyD6ye4nKVWPvRzOKsOdl3H4D81nG_iEmyQ'
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'

const STORAGE_KEY = 'pigify_web_chat_history_v1'

const SYSTEM_PROMPT = `You are Dr. Pigify AI, the official clinical and scientific AI research assistant for the Pigify research study:
"Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms".

STUDY CREDENTIALS & RESEARCH TEAM:
- Title: Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms
1. Axel Jillian Bumatay: Leader & Full-Stack/ML Architect
2. John Michael Danque: Dataset Verification & Evaluation
3. Davimher Landas: System Implementation & Device Testing
- Target Beneficiaries: Filipino backyard swine farmers, local agricultural technicians, and municipal veterinary officers.
- Study & Field Testing Site: Municipality of Luna, La Union, Philippines (16.8530°N, 120.3802°E), featuring BAI 1-7-10 km GIS disease mapping across Barangays Barrientos, Magallanes, Nalvo Norte, Ayaoan, Rimos No. 3, Oaqui No. 2, Darigayos, and Sto. Domingo Norte with MAO Luna and OPVet La Union.

THE 6 TARGET SWINE CONDITIONS MONITORED BY PIGIFY:
1. African Swine Fever (ASFV / Lagnat-Baboy Aprikano): Fatal viral hemorrhagic disease. High fever, red/cyanotic ear tips and abdomen, high mortality. Requires immediate quarantine and PVO/BAI reporting.
2. Swine Erysipelas (Diamond Skin Disease / Bulutong-Diyamante): Bacterial infection (Erysipelothrix rhusiopathiae) causing raised rhomboid/diamond-shaped skin plaques, high fever, and arthritis.
3. Sarcoptic Mange (Galis-Baboy / Kagid): Parasitic mite (Sarcoptes scabiei var. suis) causing severe itching, scratching, crusty ear lesions, and skin thickening.
4. Greasy Pig Disease (Langis-Balat / Exudative Epidermitis): Bacterial infection (Staphylococcus hyicus) causing greasy, brown-black exudate, non-itchy lesions in piglets and weaners.
5. Porcine Dermatitis and Nephropathy Syndrome (PDNS / Pamumantal ng Baboy): PCV2-associated systemic immune vasculitis with irregular dark-red/purple raised skin lesions and kidney compromise.
6. Healthy Swine (Malusog na Baboy): Normal pink/clean skin, vigorous feeding, alert posture, absence of cutaneous lesions.

TECHNICAL ARCHITECTURE:
- Computer Vision: YOLOv8 and YOLOv11 lesion detection models trained on real backyard swine conditions.
- Severity Triage: Mild, Moderate, Severe grading based on lesion count and body coverage.
- Microclimate Telemetry: Temperature-Humidity Index (THI) calculation to prevent heat stress.

CRITICAL FORMATTING MANDATE (ABSOLUTE REQUIREMENT):
- DO NOT USE ASTERISKS (*) ANYWHERE IN YOUR OUTPUT UNDER ANY CIRCUMSTANCES.
- DO NOT use markdown bold with asterisks (do NOT write **text** or *text*).
- DO NOT use asterisks for bullet points (do NOT write * item).
- For lists, use numbers (e.g. 1., 2., 3.) or standard bullet points (•).
- For headers or emphasis, use plain uppercase text or clear line breaks without asterisks.

STRICT DOMAIN BOUNDARY (CRITICAL RULE):
- You MUST answer questions related ONLY to the Pigify research study, its authors/team, the 6 swine conditions, lesion detection, severity triage, swine health, and backyard farm biosecurity.
- If the user asks about ANYTHING ELSE (general trivia, recipes, movies, programming unrelated to Pigify, math, sports, non-swine topics), you MUST POLITELY REFUSE:
  "I am Dr. Pigify AI, dedicated exclusively to the Pigify research study ('A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms'). I can only assist with questions about our research, authors (Axel, John Michael, Davimher), the 6 swine conditions, YOLO lesion detection, or backyard farm biosecurity. How can I help you with the Pigify study?"
- Respond concisely, professionally, and empathetically in English or Tagalog/Taglish.`

function cleanAsterisks(rawText) {
  if (!rawText) return ''
  let text = String(rawText)
  text = text.replace(/\*\*(.*?)\*\*/g, '$1')
  text = text.replace(/\*(.*?)\*/g, '$1')
  text = text.replace(/^\s*\*\s+/gm, '• ')
  text = text.replace(/\*/g, '')
  return text.trim()
}

const QUICK_PROMPTS = [
  'What is the Pigify study about?',
  'Who are the Pigify researchers?',
  'What 6 swine conditions are monitored?',
  'How does the YOLO lesion scanner work?',
  'Swine Erysipelas (Diamond Skin) signs?',
  'Sarcoptic Mange vs Greasy Pig Disease?',
  'Pen heat stress & THI telemetry?',
  'Backyard biosecurity & quarantine protocol?',
]

function getLocalPigifyKnowledge(query) {
  const q = (query || '').toLowerCase()

  if (q.includes('author') || q.includes('team') || q.includes('who made') || q.includes('researcher') || q.includes('axel') || q.includes('bumatay')) {
    return `Pigify Research Team & Authors:\n\n1. Axel Jillian Bumatay: Leader & Full-Stack/ML Architect\n2. John Michael Danque: Dataset Verification & Evaluation\n3. Davimher Landas: System Implementation & Device Testing\n\nThe team designed Pigify to empower backyard swine farmers through automated computer-vision disease triage.`
  }

  if (q.includes('what is pigify') || q.includes('study') || q.includes('about') || q.includes('objective')) {
    return `About the Pigify Study:\n\n"Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms"\n\nPigify is an end-to-end intelligent veterinary support system tailored for backyard piggeries. It combines YOLO deep learning lesion detection, multi-tier severity grading (Mild, Moderate, Severe), and THI (Temperature-Humidity Index) pen microclimate monitoring to provide early warning against devastating swine outbreaks.`
  }

  if (q.includes('6') || q.includes('condition') || q.includes('disease') || q.includes('classes') || q.includes('asf') || q.includes('erysipelas') || q.includes('mange')) {
    return `The 6 Swine Condition Classes Monitored by Pigify:\n\n1. African Swine Fever (ASF / Lagnat-Baboy Aprikano): Severe viral hemorrhagic fever, cyanosis of ears/snout. Requires emergency reporting.\n2. Swine Erysipelas (Diamond Skin / Bulutong-Diyamante): Raised rhomboid purple plaques, high fever.\n3. Sarcoptic Mange (Galis-Baboy / Kagid): Severe itching, crusty scabs around ears & neck from mites.\n4. Greasy Pig Disease (Langis-Balat / Exudative Epidermitis): Staphylococcus hyicus causing greasy dark exudate.\n5. PDNS (Porcine Dermatitis & Nephropathy Syndrome): Irregular dark purple skin lesions linked with PCV2.\n6. Healthy Swine (Malusog na Baboy): Normal uniform skin, alert and active behavior.`
  }

  if (q.includes('yolo') || q.includes('model') || q.includes('detection') || q.includes('scanner') || q.includes('deep learning')) {
    return `Pigify Deep Learning Architecture:\n\n• Vision Backbones: Trained and benchmarked on YOLOv8 and YOLOv11 architectures optimized for low-latency inference on edge and web.\n• Dataset: Curated and annotated specifically on backyard swine farm conditions with varying lighting and backgrounds.\n• Severity Grading: Automated triage pipeline scoring lesion surface coverage into Mild, Moderate, or Severe alerts.`
  }

  if (q.includes('biosecurity') || q.includes('quarantine') || q.includes('disinfect') || q.includes('prevention')) {
    return `Backyard Farm Biosecurity Protocol (Pigify Guidelines):\n\n1. Immediate Isolation: Quarantine symptomatic pigs in a separate pen at least 10 meters away from the main herd.\n2. Footbaths & Disinfection: Maintain 1:100 Virkon-S or 2% citric acid footbaths at pen entrances.\n3. Vehicle & Visitor Restriction: Disallow external traders or feed trucks near animal housing.\n4. No Swill Feeding: Never feed untreated kitchen scraps or swill (kanin-baboy) to prevent ASF introduction.\n5. Report to PVO: For suspected ASF or sudden mortalities, notify your municipal agriculturist immediately.`
  }

  // Refusal for off-topic query
  return `I am Dr. Pigify AI, an assistant dedicated exclusively to the Pigify research study ("A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms").\n\nI can only answer questions related to our research, authors (Axel, John Michael, Davimher), the 6 monitored swine conditions (ASF, Erysipelas, Mange, Greasy Pig, PDNS, Healthy), YOLO lesion detection, or backyard farm biosecurity.\n\nPlease ask a Pigify-related question!`
}

// Clean renderer for bullet points, numbers, and clean paragraphs (zero asterisks)
function formatMessageContent(content) {
  if (!content) return null
  const sanitized = cleanAsterisks(content)

  const lines = sanitized.split('\n')
  return lines.map((line, idx) => {
    // Empty line
    if (!line.trim()) {
      return <div key={idx} className="chatbot-empty-line" />
    }

    // Numbered line (e.g. 1. or 2.)
    const numberMatch = line.trim().match(/^(\d+[\.\)])\s*(.*)$/)
    if (numberMatch) {
      return (
        <div key={idx} className="chatbot-numbered-line">
          <span className="chatbot-number-badge">{numberMatch[1]}</span>
          <span className="chatbot-line-text">{numberMatch[2]}</span>
        </div>
      )
    }

    // Bullet line
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      const bulletText = line.trim().replace(/^[•\-]\s*/, '')
      return (
        <div key={idx} className="chatbot-bullet-line">
          <span className="chatbot-bullet-dot">•</span>
          <span className="chatbot-line-text">{bulletText}</span>
        </div>
      )
    }

    return (
      <p key={idx} className="chatbot-text-line">
        {line}
      </p>
    )
  })
}

export default function PigifyChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return [
      {
        id: 'welcome-1',
        sender: 'bot',
        text: `Hello! I am Dr. Pigify AI, the official research assistant for the study:\n\n"Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms".\n\nAsk me about our thesis research, authors (Axel, John Michael, Davimher), the 6 monitored swine conditions (ASF, Erysipelas, Mange, Greasy Pig, PDNS, Healthy), YOLO lesion detection, severity triage, or backyard biosecurity protocols!`,
        timestamp: new Date().toISOString(),
      },
    ]
  })

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {}
  }, [messages])

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  // Listen for global open chatbot trigger event
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
    window.addEventListener('pigify:open-chatbot', handleOpenChat)
    return () => window.removeEventListener('pigify:open-chatbot', handleOpenChat)
  }, [])

  // Call API with fallback cascade
  const callAiAssistant = async (promptText, conversationHistory) => {
    // 1. Try backend endpoint first
    try {
      const res = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          history: conversationHistory,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data?.reply) return cleanAsterisks(data.reply)
      }
    } catch {
      // Backend not running, proceed to direct Gemini call
    }

    // 2. Try direct Gemini API
    if (GEMINI_API_KEY) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
        
        const contents = [
          ...conversationHistory.slice(-6).map((h) => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.text }],
          })),
          {
            role: 'user',
            parts: [{ text: promptText }],
          },
        ]

        const geminiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 800,
            },
          }),
        })

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
          if (reply) return cleanAsterisks(reply)
        }
      } catch {
        // Fall to local engine
      }
    }

    // 3. Fallback to local Pigify study knowledge engine
    return cleanAsterisks(getLocalPigifyKnowledge(promptText))
  }

  const handleSend = async (customText = null) => {
    const text = (customText || inputText).trim()
    if (!text || isTyping) return

    const userMsg = {
      id: `${Date.now()}-u`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    }

    const updated = [...messages, userMsg]
    setMessages(updated)
    setInputText('')
    setIsTyping(true)

    const historyForAi = updated.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text,
    }))

    try {
      const reply = await callAiAssistant(text, historyForAi)
      const botMsg = {
        id: `${Date.now()}-b`,
        sender: 'bot',
        text: reply,
        timestamp: new Date().toISOString(),
      }
      setMessages([...updated, botMsg])
    } catch {
      const fallbackMsg = {
        id: `${Date.now()}-b`,
        sender: 'bot',
        text: getLocalPigifyKnowledge(text),
        timestamp: new Date().toISOString(),
      }
      setMessages([...updated, fallbackMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleClearHistory = () => {
    const reset = [
      {
        id: `reset-${Date.now()}`,
        sender: 'bot',
        text: `Chat cleared. I am Dr. Pigify AI. Ask me anything regarding the Pigify thesis study, authors, the 6 monitored swine diseases, or backyard farm biosecurity!`,
        timestamp: new Date().toISOString(),
      },
    ]
    setMessages(reset)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset))
    } catch {}
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="pigify-chatbot-container">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="pigify-chatbot-launcher"
          onClick={() => {
            setIsOpen(true)
            setTimeout(() => inputRef.current?.focus(), 150)
          }}
          aria-label="Open Dr. Pigify AI Chat"
          title="Ask Dr. Pigify AI (Pigify Study Assistant)"
        >
          <div className="launcher-pulse-ring" />
          <div className="launcher-icon-wrap">
            <Bot size={24} className="launcher-icon-bot" />
            <Sparkles size={14} className="launcher-icon-sparkle" />
          </div>
          <span className="launcher-label">Ask Dr. Pigify</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="pigify-chatbot-modal" role="dialog" aria-modal="true" aria-label="Dr. Pigify AI">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <Bot size={20} className="avatar-icon" />
                <span className="status-indicator-dot" />
              </div>
              <div className="chatbot-header-info">
                <div className="chatbot-title-row">
                  <span className="chatbot-title">Dr. Pigify AI</span>
                  <span className="chatbot-badge">Pigify Study Only</span>
                </div>
                <span className="chatbot-subtitle">Thesis & Swine Health Assistant</span>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button
                type="button"
                className="chatbot-action-btn"
                onClick={handleClearHistory}
                title="Clear chat history"
                aria-label="Clear chat history"
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                className="chatbot-action-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
              >
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          {/* Quick Study Prompts Carousel */}
          <div className="chatbot-prompts-bar">
            <div className="chatbot-prompts-track">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  className="chatbot-prompt-chip"
                  onClick={() => handleSend(prompt)}
                  disabled={isTyping}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Body */}
          <div className="chatbot-body">
            {messages.map((m) => {
              const isUser = m.sender === 'user'
              return (
                <div
                  key={m.id}
                  className={`chatbot-message-row ${isUser ? 'user-row' : 'bot-row'}`}
                >
                  {!isUser && (
                    <div className="bot-bubble-avatar">
                      <Bot size={14} />
                    </div>
                  )}
                  <div className={`chatbot-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
                    {formatMessageContent(m.text)}
                    <span className="chatbot-time">
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              )
            })}

            {isTyping && (
              <div className="chatbot-message-row bot-row">
                <div className="bot-bubble-avatar">
                  <Bot size={14} />
                </div>
                <div className="chatbot-bubble bot-bubble typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="chatbot-footer">
            <div className="chatbot-input-wrap">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Pigify study, 6 swine diseases, or YOLO..."
                rows={1}
                maxLength={450}
                className="chatbot-textarea"
              />
              <button
                type="button"
                className={`chatbot-send-btn ${!inputText.trim() || isTyping ? 'disabled' : ''}`}
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isTyping}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="chatbot-disclaimer">
              <ShieldAlert size={12} className="disclaimer-icon" />
              <span>Strictly constrained to the Pigify research study and swine biosecurity.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


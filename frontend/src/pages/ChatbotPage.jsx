import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Bot,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Users,
  Layers,
  ThermometerSnowflake,
  ExternalLink,
  Activity,
  ScanLine,
  SlidersHorizontal,
  MapPin,
  HelpCircle,
  Cpu,
} from 'lucide-react'
import UserHeader from '../components/user/UserHeader'
import { API_BASE_URL } from '../config/api'
import { BRAND_NAME } from '../config/brand'
import './Landing.css'
import './MarketingPages.css'
import './ChatbotPage.css'

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY || ''
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

const AUTHORS_LIST = [
  { name: 'Axel Jillian Bumatay', role: 'Leader & Full-Stack/ML Architect', badge: 'Leadership & AI' },
  { name: 'John Michael Danque', role: 'Dataset Verification & Evaluation', badge: 'Verification & QA' },
  { name: 'Davimher Landas', role: 'System Implementation & Device Testing', badge: 'Hardware & Edge' },
]

const SWINE_CONDITIONS_LIST = [
  { id: 'asf', name: 'African Swine Fever (ASF)', desc: 'High fever, cyanosis on ears & belly. Emergency PVO notification.' },
  { id: 'erysipelas', name: 'Swine Erysipelas (Diamond Skin)', desc: 'Rhomboid raised purple plaques, high fever, responsive to penicillin.' },
  { id: 'mange', name: 'Sarcoptic Mange (Galis-Baboy)', desc: 'Severe itching, ear crusts & skin thickening caused by mites.' },
  { id: 'greasy', name: 'Greasy Pig Disease', desc: 'Brown-black oily exudate in piglets without intense pruritus.' },
  { id: 'pdns', name: 'PDNS (Porcine Dermatitis)', desc: 'Dark red necrotizing macules on hindquarters linked to PCV2.' },
  { id: 'healthy', name: 'Healthy Swine', desc: 'Uniform pink skin, alert posture, normal appetite and respiration.' },
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

  return `I am Dr. Pigify AI, an assistant dedicated exclusively to the Pigify research study ("A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms").\n\nI can only answer questions related to our research, authors (Axel, John Michael, Davimher), the 6 monitored swine conditions (ASF, Erysipelas, Mange, Greasy Pig, PDNS, Healthy), YOLO lesion detection, or backyard farm biosecurity.\n\nPlease ask a Pigify-related question!`
}

function formatPageMessageContent(content) {
  if (!content) return null
  const sanitized = cleanAsterisks(content)

  const lines = sanitized.split('\n')
  return lines.map((line, idx) => {
    if (!line.trim()) {
      return <div key={idx} className="chatpage-empty-line" />
    }

    const numberMatch = line.trim().match(/^(\d+[\.\)])\s*(.*)$/)
    if (numberMatch) {
      return (
        <div key={idx} className="chatpage-numbered-line">
          <span className="chatpage-number-badge">{numberMatch[1]}</span>
          <span className="chatpage-line-text">{numberMatch[2]}</span>
        </div>
      )
    }

    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      const bulletText = line.trim().replace(/^[•\-]\s*/, '')
      return (
        <div key={idx} className="chatpage-bullet-line">
          <span className="chatpage-bullet-dot">•</span>
          <span className="chatpage-line-text">{bulletText}</span>
        </div>
      )
    }

    return (
      <p key={idx} className="chatpage-text-line">
        {line}
      </p>
    )
  })
}

export default function ChatbotPage() {
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return [
      {
        id: 'welcome-page-1',
        sender: 'bot',
        text: `Hello! I am Dr. Pigify AI, the official research assistant for the study:\n\n"Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms".\n\nAsk me about our thesis research, authors (Axel, John Michael, Davimher), the 6 monitored swine conditions (ASF, Erysipelas, Mange, Greasy Pig, PDNS, Healthy), YOLO lesion detection, severity triage, or backyard biosecurity protocols!`,
        timestamp: new Date().toISOString(),
      },
    ]
  })

  const messagesBodyRef = useRef(null)
  const inputRef = useRef(null)
  const isFirstScroll = useRef(true)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {}
  }, [messages])

  // Scroll only the chat box (not the whole page) to the newest message.
  useEffect(() => {
    const el = messagesBodyRef.current
    if (!el) return
    const behavior = isFirstScroll.current ? 'auto' : 'smooth'
    isFirstScroll.current = false
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [messages, isTyping])

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
      // Backend unavailable, fallback to direct Gemini
    }

    // 2. Direct Gemini API
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
        // Fallback to local engine
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
        text: cleanAsterisks(getLocalPigifyKnowledge(text)),
        timestamp: new Date().toISOString(),
      }
      setMessages([...updated, fallbackMsg])
    } finally {
      setIsTyping(false)
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 80)
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
    toast.success('Chat history cleared')
  }

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(cleanAsterisks(text))
    setCopiedId(id)
    toast.success('Response copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="pro-landing mk-page chatbot-page-wrapper">
      <UserHeader />

      <main className="mk-main">
        {/* ================================================================
            1. HERO COMMAND HEADER (Matching AiAnalysis, Overview, etc.)
            ================================================================ */}
        <section className="mk-hero" style={{ paddingBottom: '20px' }}>
          <div className="container-pro">
            <div className="mk-kicker">
              <span className="mk-kicker-dot" />
              <span>PIGIFY AI ASSISTANT • CLINICAL &amp; RESEARCH CONSULTATION</span>
            </div>

            <h1 className="mk-title">
              Dr. Pigify AI
              <span className="accent"> Research &amp; Swine Health Assistant</span>
            </h1>

            <p className="mk-subtitle">
              Interactive clinical intelligence interface for "Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms". Strictly focused on swine triage, the 6 monitored conditions, YOLO deep learning models, and backyard biosecurity.
            </p>

            {/* Quick Metrics / Status Badges Strip */}
            <div className="chatpage-badges-strip">
              <span className="chatpage-badge badge-emerald">
                <span className="chatpage-badge-dot" />
                Gemini 2.5 Flash Engine Active
              </span>
              <span className="chatpage-badge badge-cyan">
                <ShieldCheck size={13} />
                Strict Pigify Study Guardrails
              </span>
              <span className="chatpage-badge badge-rose">
                <Cpu size={13} />
                YOLOv8 &amp; YOLOv11 Lesion Triage
              </span>
              <span className="chatpage-badge badge-amber">
                <Users size={13} />
                Authors: Axel, John Michael, Davimher
              </span>
            </div>
          </div>
        </section>

        {/* ================================================================
            2. TWO-COLUMN INTERACTIVE SUITE
            ================================================================ */}
        <section className="container-pro chatpage-content-grid">
          {/* Main Column: Chat Console */}
          <div className="chatpage-main-console">
            {/* Console Header Bar */}
            <div className="chatpage-console-header">
              <div className="chatpage-console-identity">
                <div className="chatpage-avatar-wrap">
                  <Bot size={22} className="chatpage-avatar-icon" />
                  <span className="chatpage-avatar-status" />
                </div>
                <div>
                  <h3 className="chatpage-console-title">Dr. Pigify AI Console</h3>
                  <p className="chatpage-console-subtitle">Thesis Knowledge Base &bull; Zero-Asterisk Clean Output</p>
                </div>
              </div>

              <div className="chatpage-console-actions">
                <button
                  type="button"
                  className="chatpage-btn-action"
                  onClick={handleClearHistory}
                  title="Clear chat transcript"
                >
                  <Trash2 size={15} />
                  <span>Clear Chat</span>
                </button>
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="chatpage-suggestions-shelf">
              <span className="chatpage-shelf-label">Quick Inquiries:</span>
              <div className="chatpage-shelf-track">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    className="chatpage-prompt-pill"
                    onClick={() => handleSend(prompt)}
                    disabled={isTyping}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Body */}
            <div className="chatpage-messages-body" ref={messagesBodyRef}>
              {messages.map((m) => {
                const isUser = m.sender === 'user'
                return (
                  <div
                    key={m.id}
                    className={`chatpage-msg-row ${isUser ? 'user-msg-row' : 'bot-msg-row'}`}
                  >
                    {!isUser && (
                      <div className="chatpage-bot-icon">
                        <Bot size={16} />
                      </div>
                    )}
                    <div className={`chatpage-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
                      {!isUser && (
                        <div className="chatpage-bubble-header">
                          <span className="chatpage-bot-name">Dr. Pigify AI</span>
                          <button
                            type="button"
                            className="chatpage-copy-btn"
                            onClick={() => handleCopyMessage(m.id, m.text)}
                            title="Copy response"
                          >
                            {copiedId === m.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          </button>
                        </div>
                      )}
                      <div className="chatpage-bubble-text">{formatPageMessageContent(m.text)}</div>
                      <span className="chatpage-timestamp">
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
                <div className="chatpage-msg-row bot-msg-row">
                  <div className="chatpage-bot-icon">
                    <Bot size={16} />
                  </div>
                  <div className="chatpage-bubble bot-bubble chatpage-typing-bubble">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="chatpage-input-bar">
              <div className="chatpage-input-card">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Dr. Pigify about the research study, 6 swine conditions, YOLO, or biosecurity..."
                  rows={2}
                  maxLength={500}
                  className="chatpage-textarea"
                />
                <button
                  type="button"
                  className={`chatpage-send-btn ${!inputText.trim() || isTyping ? 'disabled' : ''}`}
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isTyping}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>

              <div className="chatpage-disclaimer-bar">
                <ShieldAlert size={13} className="chatpage-disclaimer-icon" />
                <span>
                  Dr. Pigify strictly answers questions related to the Pigify study, its 4 authors, the 6 monitored swine conditions, YOLO lesion scanner, and backyard biosecurity.
                </span>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Research Study Reference Cards */}
          <aside className="chatpage-sidebar">
            {/* Card 1: Authors & Team */}
            <div className="chatpage-info-card">
              <div className="chatpage-card-header">
                <Users size={18} className="chatpage-card-icon-rose" />
                <h4 className="chatpage-card-title">Research Team &amp; Authors</h4>
              </div>
              <p className="chatpage-card-sub">
                Official researchers behind the Pigify swine health monitoring system:
              </p>
              <div className="chatpage-authors-list">
                {AUTHORS_LIST.map((author, idx) => (
                  <div key={idx} className="chatpage-author-item">
                    <div className="chatpage-author-num">{idx + 1}</div>
                    <div className="chatpage-author-meta">
                      <span className="chatpage-author-name">{author.name}</span>
                      <span className="chatpage-author-role">{author.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: 6 Monitored Conditions */}
            <div className="chatpage-info-card">
              <div className="chatpage-card-header">
                <Layers size={18} className="chatpage-card-icon-cyan" />
                <h4 className="chatpage-card-title">The 6 Monitored Conditions</h4>
              </div>
              <p className="chatpage-card-sub">
                Click any condition to consult Dr. Pigify:
              </p>
              <div className="chatpage-conditions-grid">
                {SWINE_CONDITIONS_LIST.map((cond, idx) => (
                  <button
                    key={cond.id}
                    type="button"
                    className="chatpage-condition-chip"
                    onClick={() => handleSend(`Tell me about ${cond.name} in the Pigify study and its clinical signs.`)}
                  >
                    <span className="chatpage-cond-idx">{idx + 1}</span>
                    <div className="chatpage-cond-text">
                      <span className="chatpage-cond-name">{cond.name}</span>
                      <span className="chatpage-cond-desc">{cond.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Card 3: Deep Learning & Telemetry */}
            <div className="chatpage-info-card">
              <div className="chatpage-card-header">
                <Cpu size={18} className="chatpage-card-icon-emerald" />
                <h4 className="chatpage-card-title">AI Engine &amp; Architecture</h4>
              </div>
              <ul className="chatpage-tech-bullets">
                <li>
                  <strong>YOLOv8 &amp; YOLOv11:</strong> Bounding-box detection for swine dermatological lesions.
                </li>
                <li>
                  <strong>Dataset:</strong> 3,000 backyard swine images across 6 classes (500 images per class).
                </li>
                <li>
                  <strong>Severity Triage:</strong> Automated categorization into Mild, Moderate, or Severe urgency.
                </li>
                <li>
                  <strong>Microclimate Telemetry:</strong> Pen Temperature-Humidity Index (THI) for swine heat stress mitigation.
                </li>
              </ul>
            </div>

            {/* Card 4: Quick Navigation Hub */}
            <div className="chatpage-info-card chatpage-nav-hub">
              <h4 className="chatpage-card-title">Pigify Operational Hub</h4>
              <div className="chatpage-hub-links">
                <Link to="/ai-analysis" className="chatpage-hub-link">
                  <ScanLine size={15} />
                  <span>AI Symptom Scanner</span>
                </Link>
                <Link to="/overview" className="chatpage-hub-link">
                  <Activity size={15} />
                  <span>Herd Analytics</span>
                </Link>
                <Link to="/sorting-grading" className="chatpage-hub-link">
                  <SlidersHorizontal size={15} />
                  <span>Severity Grading</span>
                </Link>
                <Link to="/disease-map" className="chatpage-hub-link">
                  <MapPin size={15} />
                  <span>Disease Map &amp; PVO</span>
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}


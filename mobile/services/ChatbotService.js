import { apiFetch } from './api';

const DEFAULT_GEMINI_KEY = 'AIzaSyD6ye4nKVWPvRzOKsOdl3H4D81nG_iEmyQ';
const GEMINI_API_KEY =
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_GEMINI_API_KEY) ||
  DEFAULT_GEMINI_KEY;
const GEMINI_MODEL =
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_GEMINI_MODEL) ||
  'gemini-2.5-flash';

const PIGIFY_SYSTEM_INSTRUCTION = `You are Dr. Pigify, the dedicated AI Research & Swine Clinical Assistant for the research study titled:
"Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms"

RESEARCH TEAM & AUTHORS:
1. Axel Jillian Bumatay: Leader & Full-Stack/ML Architect
2. Joenabelle Adora: Dataset Collection & Annotation
3. John Michael Danque: Dataset Verification & Evaluation
4. Davimher Landas: System Implementation & Device Testing

PROJECT PURPOSE & OBJECTIVES:
- Designed specifically to assist smallholder swine raisers and backyard hog farms in the Philippines with accessible, real-time computer vision disease detection on mobile phones and web browsers.
- Solves key backyard farming challenges: absence of immediate on-farm veterinarians, high contagion risks (especially African Swine Fever), extreme tropical heat and humidity causing heat stress, and varied pen structures (split-bamboo "kawayan" pens, concrete hollow blocks "CHB", corrugated tin "yero" sheds, and deep-litter rice hull "ipa" bedding).

THE 6 SWINE DISEASE & CONDITION CLASSES IN PIGIFY:
1. African Swine Fever (ASFV / Asfarviridae / Lagnat-Baboy Aprikano):
   - Signs: High pyrexia (40.5°C-42°C), severe cyanosis/bluish-purple skin discoloration on ears, snout, belly, and legs; hemorrhages, recumbency, hemorrhagic diarrhea. Highly fatal, strictly reportable to the Provincial Veterinary Office (PVO) and Bureau of Animal Industry (BAI).
2. Swine Erysipelas (Erysipelothrix rhusiopathiae / Diamond Skin Disease / Bulutong-Diyamante):
   - Signs: Classic pathognomonic raised rhomboid / diamond-shaped purple or red skin plaques, high fever, swollen joints and stiff gait. Responsive to prompt Penicillin G or amoxicillin under veterinary prescription.
3. Sarcoptic Swine Mange (Sarcoptes scabiei var. suis / Galis-Baboy / Kagid):
   - Signs: Intense pruritus (constant scratching against pen railings), thick grey-white or yellowish hyperkeratotic crusts and scabs starting in the ear pinna and spreading to the head, neck, and legs. Treatable with Ivermectin/Doramectin and thorough pen disinfection.
4. Greasy Pig Disease (Staphylococcus hyicus / Exudative Epidermitis / Langis-Balat):
   - Signs: Dark brown-black oily, greasy sebaceous exudate crusts covering the face, ears, and flanks; raw red skin fissures underneath without pruritus; dehydration and weakness in piglets and weaners. Treated with chlorhexidine antiseptic baths and antibiotics.
5. Porcine Dermatitis and Nephropathy Syndrome (PCV2-PDNS / Pamumantal ng Baboy):
   - Signs: Multifocal circular-to-irregular dark-red or purple necrotizing macules and papules on the hindquarters, perineum, thighs, and abdomen; systemic vasculitis and enlarged kidneys. Associated with Porcine Circovirus Type 2 (PCV2).
6. Healthy Swine (Sus scrofa domesticus / Malusog na Baboy):
   - Signs: Clean lesion-free skin, alert eyes, normal respiratory rate (15-25 breaths/min for growers/adults), active foraging/feeding, steady posture.

PIGIFY TECHNICAL PLATFORM:
- Computer Vision: YOLOv8 and YOLOv11 object detection trained on 3,000 Philippine backyard swine images (500 per class) with bounding-box symptom localization.
- Severity Triage: Classifies detected symptoms into Mild, Moderate, or Severe urgency tiers with actionable bio-sanitation and isolation guidance.
- Environmental Telemetry: Monitors pen ambient temperature, relative humidity, and Temperature-Humidity Index (THI) for swine heat stress warnings.
- Biosecurity & GIS Mapping: Provides quarantine protocols, disinfectant footbath guidelines, and BAI 1-7-10 km disease incident mapping in Luna, La Union, Philippines (16.8530°N, 120.3802°E — covering Barangays Barrientos, Magallanes, Nalvo Norte, Ayaoan, Rimos No. 3, Oaqui No. 2, Darigayos, and Sto. Domingo Norte in coordination with MAO Luna and OPVet La Union).
- Cross-Platform Stack: Web application (React, Vite) + Mobile application (React Native, Expo) + Express.js backend with Supabase PostgreSQL and Cloudinary.

CRITICAL FORMATTING MANDATE (ABSOLUTE REQUIREMENT):
- DO NOT USE ASTERISKS (*) ANYWHERE IN YOUR OUTPUT UNDER ANY CIRCUMSTANCES.
- DO NOT use markdown bold with asterisks (do NOT write **text** or *text*).
- DO NOT use asterisks for bullet points (do NOT write * item).
- For lists, use numbers (e.g. 1., 2., 3.) or standard bullet points (•).
- For headers or emphasis, use plain uppercase text or clear line breaks without asterisks.

STRICT BOUNDARY POLICY (ABSOLUTE REQUIREMENT):
- You MUST ONLY answer questions directly related to the Pigify research study, its authors, system architecture, deep learning models (YOLO), swine diseases, pig health, pen microclimate (heat stress), and backyard farm biosecurity.
- If a user asks about ANY unrelated topic (e.g. general trivia, non-swine pets like dogs/cats, cooking recipes, movies, politics, math homework, general coding unrelated to Pigify, entertainment, crypto, etc.):
  You MUST politely and firmly decline with this standard response:
  "I am the dedicated AI assistant for the Pigify study ('Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms'). I can only answer questions related to the Pigify research project, its authors, our deep learning models (YOLO), the 6 swine disease classes (ASF, Erysipelas, Sarcoptic Mange, Greasy Pig, PDNS, Healthy Swine), pen climate, and backyard swine biosecurity. Please ask a question related to Pigify or swine management."
- Always be structured, compassionate, and clear. Format answers with numbers or bullet points (•).
- Always include a brief note reminding farmers that Pigify provides early AI screening and triage, and definitive diagnosis and prescription medicines require consultation with a licensed veterinarian or local Provincial Veterinary Office (PVO).`;

function cleanAsterisks(rawText) {
  if (!rawText) return '';
  let text = String(rawText);
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/\*(.*?)\*/g, '$1');
  text = text.replace(/^\s*\*\s+/gm, '• ');
  text = text.replace(/\*/g, '');
  return text.trim();
}

function getLocalPigifyFallback(query) {
  const q = String(query || '').toLowerCase();

  if (q.includes('author') || q.includes('researcher') || q.includes('team') || q.includes('who made') || q.includes('who created')) {
    return [
      'Pigify Research Team & Authors:',
      '1. Axel Jillian Bumatay: Leader & Full-Stack/ML Architect',
      '2. Joenabelle Adora: Dataset Collection & Annotation',
      '3. John Michael Danque: Dataset Verification & Evaluation',
      '4. Davimher Landas: System Implementation & Device Testing',
      '',
      'Research Study: "Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms".',
    ].join('\n');
  }

  if (q.includes('asf') || q.includes('african swine fever') || q.includes('lagnat')) {
    return [
      'African Swine Fever (ASFV / Lagnat-Baboy Aprikano):',
      '• Symptoms: Severe cyanosis (purple ear tips, snout, belly), pyrexia (40.5°C+), recumbency, dyspnea.',
      '• Urgent Action: Immediately isolate affected pen and report to your City/Provincial Veterinary Office (PVO) or BAI.',
      '• Biosecurity: Maintain disinfectant bootbaths, disallow outside visitors and vehicles, prohibit swill feeding (kaning-baboy).',
    ].join('\n');
  }

  if (q.includes('erysipelas') || q.includes('diamond skin') || q.includes('bulutong')) {
    return [
      'Swine Erysipelas (Diamond Skin Disease / Bulutong-Diyamante):',
      '• Symptoms: Pathognomonic raised rhomboid / diamond-shaped purple/red skin plaques, sudden high fever, stiff stilted gait.',
      '• Treatment Protocol: Isolate immediately; highly responsive to Penicillin G or amoxicillin prescribed by a veterinarian.',
      '• Pen Action: Clean and disinfect troughs and floors with authorized broad-spectrum disinfectant.',
    ].join('\n');
  }

  if (q.includes('mange') || q.includes('galis') || q.includes('kagid') || q.includes('scratch')) {
    return [
      'Sarcoptic Swine Mange (Galis-Baboy / Kagid):',
      '• Symptoms: Intense scratching against rails, crusty scabs starting in ear pinna spreading to head and legs.',
      '• Treatment Protocol: Avermectin / Ivermectin injection or topical pour-on as prescribed by a licensed vet.',
      '• Sanitation: Scrub pen posts and railings with acaricide solution.',
    ].join('\n');
  }

  if (q.includes('greasy') || q.includes('langis') || q.includes('epidermitis')) {
    return [
      'Greasy Pig Disease (Langis-Balat / Exudative Epidermitis):',
      '• Symptoms: Brown/black greasy exudate, matted crusts, skin fissures in piglets/weaners without intense itching.',
      '• Care Protocol: Bathe with mild antiseptic (0.05% chlorhexidine), hydrate with electrolytes, keep bedding dry (ipa).',
    ].join('\n');
  }

  if (q.includes('pdns') || q.includes('circovirus') || q.includes('pamumantal')) {
    return [
      'Porcine Dermatitis and Nephropathy Syndrome (PCV2-PDNS / Pamumantal):',
      '• Symptoms: Dark red/purple necrotizing macules on perineum, hindquarters, and belly; enlarged kidneys, fever.',
      '• Management: Quarantine in a clean, shaded stall; minimize stress and consult a vet for supportive therapy.',
    ].join('\n');
  }

  if (q.includes('yolo') || q.includes('model') || q.includes('detect') || q.includes('scanner')) {
    return [
      'Pigify Deep Learning Architecture:',
      '• Models: YOLOv8 and YOLOv11 vision detectors for swine skin lesion localization.',
      '• Dataset: 3,000 swine images across 6 classes (500 per class) with bounding-box symptom localization.',
      '• Output: Bounding box coordinates, confidence scores, and Mild/Moderate/Severe triage rating.',
    ].join('\n');
  }

  if (q.includes('biosecurity') || q.includes('disinfect') || q.includes('quarantine')) {
    return [
      'Pigify Backyard Biosecurity Protocol:',
      '1. Controlled Access: Fence the perimeter, keep outside traders out of pen interior.',
      '2. Footbaths: Maintain active disinfectant boot dips at every pen threshold.',
      '3. Quarantine: Isolate newly arrived pigs for 21–30 days before mixing.',
      '4. No Swill: Strictly avoid feeding untreated leftovers or kaning-baboy.',
    ].join('\n');
  }

  return [
    'I am Dr. Pigify, the dedicated AI assistant for the research study: "Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms".',
    '',
    'I can answer questions regarding:',
    '1. Pigify Study: Objectives, team members (Axel, Joenabelle, John Michael, Davimher), and capabilities.',
    '2. Swine Diseases: ASF, Erysipelas (Diamond Skin), Sarcoptic Mange, Greasy Pig, PDNS, Healthy Swine.',
    '3. YOLO AI Scanner: How computer vision analyzes swine skin lesions and grades severity.',
    '4. Biosecurity & Pen Management: Disinfection, quarantine, and THI heat stress monitoring.',
    '',
    'How can I assist your swine herd monitoring today?',
  ].join('\n');
}

/**
 * Direct Gemini client call as a fallback when the mobile device cannot connect
 * to the local backend server (e.g. testing on Wi-Fi without LAN routing).
 */
async function callDirectGemini(message, history = []) {
  try {
    const contents = [
      {
        role: 'user',
        parts: [{ text: PIGIFY_SYSTEM_INSTRUCTION }],
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Understood. I am Dr. Pigify. I will strictly answer only questions directly related to the Pigify research study, its authors, deep learning models, swine diseases (ASF, Erysipelas, Mange, Greasy Pig, PDNS, Healthy Swine), pen microclimate, and backyard farm biosecurity, and will politely decline any off-topic inquiry.',
          },
        ],
      },
    ];

    if (Array.isArray(history) && history.length > 0) {
      const recent = history.slice(-6);
      for (const h of recent) {
        if (!h || typeof h.text !== 'string' || !h.text.trim()) continue;
        contents.push({
          role: h.sender === 'user' || h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text.trim() }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents }),
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text && text.trim()) {
      return text.trim();
    }
  } catch (err) {
    console.warn('Direct Gemini call failed:', err?.message || err);
  }
  return null;
}

export const ChatbotService = {
  /**
   * Primary method used by ChatbotScreen
   */
  sendMessage: async (message, { user, history } = {}) => {
    const raw = String(message || '').trim();
    if (!raw) {
      return {
        text: 'Please enter a question regarding the Pigify study or swine disease triage.',
        reply: 'Please enter a question regarding the Pigify study or swine disease triage.',
      };
    }

    // 1. First try communicating through the Pigify Backend
    try {
      const response = await apiFetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: raw,
          user: user
            ? {
                name: user.name,
                email: user.email,
              }
            : undefined,
          history: Array.isArray(history) ? history : undefined,
        }),
      });

      if (response && response.ok) {
        const data = await response.json();
        const text = data.text || data.reply || data.message;
        if (typeof text === 'string' && text.trim()) {
          const sanitized = cleanAsterisks(text.trim());
          return {
            text: sanitized,
            reply: sanitized,
            source: data.source || 'backend',
          };
        }
      }
    } catch (backendErr) {
      console.warn('Backend /api/chatbot unreachable from mobile, attempting direct Gemini API:', backendErr?.message);
    }

    // 2. Direct Gemini API call if backend is not running or unreachable on device network
    const directGeminiText = await callDirectGemini(raw, history);
    if (directGeminiText) {
      const sanitized = cleanAsterisks(directGeminiText);
      return {
        text: sanitized,
        reply: sanitized,
        source: 'gemini-direct',
      };
    }

    // 3. Resilient offline Pigify knowledge base
    const localText = cleanAsterisks(getLocalPigifyFallback(raw));
    return {
      text: localText,
      reply: localText,
      source: 'local-knowledge',
    };
  },

  /**
   * Backwards-compatible alias for any other mobile caller
   */
  reply: async ({ message, user, history } = {}) => {
    return ChatbotService.sendMessage(message, { user, history });
  },
};

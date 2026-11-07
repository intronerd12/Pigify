const express = require('express');
const axios = require('axios');

const router = express.Router();

const DEFAULT_GEMINI_KEY = 'AIzaSyD6ye4nKVWPvRzOKsOdl3H4D81nG_iEmyQ';
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.PIGIFY_GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const CANDIDATE_MODELS = [PRIMARY_MODEL, 'gemini-2.5-flash', 'gemini-1.5-flash'].filter(
  (v, i, a) => a.indexOf(v) === i
);

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
  // Strip bold/italic markdown asterisks
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/\*(.*?)\*/g, '$1');
  // Convert any asterisk list items to bullets
  text = text.replace(/^\s*\*\s+/gm, '• ');
  // Remove any remaining stray asterisks
  text = text.replace(/\*/g, '');
  return text.trim();
}

// Local emergency rule-based fallback knowledge base in case external Gemini API is unreachable
function getLocalPigifyKnowledge(query) {
  const q = String(query || '').toLowerCase();

  if (q.includes('author') || q.includes('researcher') || q.includes('team') || q.includes('who made') || q.includes('who created')) {
    return [
      'Pigify Research Team & Authors:',
      '1. Axel Jillian Bumatay: Leader & Full-Stack/ML Architect',
      '2. Joenabelle Adora: Dataset Collection & Annotation',
      '3. John Michael Danque: Dataset Verification & Evaluation',
      '4. Davimher Landas: System Implementation & Device Testing',
      '',
      'The study is titled: "Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms".',
    ].join('\n');
  }

  if (q.includes('asf') || q.includes('african swine fever') || q.includes('lagnat')) {
    return [
      'African Swine Fever (ASFV / Lagnat-Baboy Aprikano):',
      '• Symptoms: High fever (40.5°C–42°C), cyanosis (blue/purple blotches on ears, snout, belly, legs), weakness, hemorrhagic diarrhea.',
      '• Emergency Action: IMMEDIATELY quarantine the pen and report to your local City/Provincial Veterinary Office (PVO) or Bureau of Animal Industry (BAI).',
      '• Biosecurity: Disallow external visitors, vehicles, and swill feed (kaning-baboy). Maintain strict disinfectant footbaths.',
      '',
      'Note: ASF is a high-mortality viral disease. Early notification to authorities is critical to prevent barangay-wide spread.',
    ].join('\n');
  }

  if (q.includes('erysipelas') || q.includes('diamond skin') || q.includes('bulutong')) {
    return [
      'Swine Erysipelas (Bulutong-Diyamante / Diamond Skin Disease):',
      '• Pathogen: Erysipelothrix rhusiopathiae',
      '• Symptoms: Characteristic raised rhomboid / diamond-shaped purple/red skin plaques, sudden high fever, stiff stilted gait.',
      '• Triage Protocol: Isolate pig to a clean quarantine stall immediately to prevent herd transmission.',
      '• Treatment: Injectable Penicillin G or amoxicillin prescribed by a licensed veterinarian. Disinfect pen troughs and floors.',
    ].join('\n');
  }

  if (q.includes('mange') || q.includes('galis') || q.includes('kagid') || q.includes('scratch')) {
    return [
      'Sarcoptic Swine Mange (Galis-Baboy / Kagid):',
      '• Parasite: Sarcoptes scabiei var. suis',
      '• Symptoms: Persistent rubbing against pen railings, thick dry grey-white crusts and scabs in ear canals and face.',
      '• Treatment: Injectable or topical Ivermectin / Doramectin under veterinary guidance. Treat sow prior to farrowing.',
      '• Sanitation: Thoroughly scrub pen walls and posts with authorized acaricide solution.',
    ].join('\n');
  }

  if (q.includes('greasy') || q.includes('langis') || q.includes('epidermitis')) {
    return [
      'Greasy Pig Disease (Langis-Balat / Exudative Epidermitis):',
      '• Bacterium: Staphylococcus hyicus',
      '• Symptoms: Dark brown-to-black greasy sebaceous crusts, oily matted bristles, raw fissures without itching (piglets/weaners).',
      '• Triage Protocol: Bathe affected pigs in mild antiseptic (0.05% chlorhexidine or dilute iodine wash). Provide electrolyte hydration.',
      '• Prevention: Smooth rough pen floors, ensure dry bedding (ipa / rice hull), clip sharp needle teeth.',
    ].join('\n');
  }

  if (q.includes('pdns') || q.includes('circovirus') || q.includes('pamumantal')) {
    return [
      'Porcine Dermatitis and Nephropathy Syndrome (PCV2-PDNS / Pamumantal):',
      '• Pathogen: Associated with Porcine Circovirus Type 2 (PCV2).',
      '• Symptoms: Irregular dark-red to purple necrotizing macules and papules centered on hindquarters and perineum, kidney inflammation.',
      '• Management: Quarantine pig in a low-stress stall, ensure hydration, treat secondary bacterial infections as directed by a vet.',
    ].join('\n');
  }

  if (q.includes('yolo') || q.includes('model') || q.includes('detect') || q.includes('accuracy') || q.includes('scanner')) {
    return [
      'Pigify Deep Learning Architecture:',
      '• Models: YOLOv8 and YOLOv11 real-time vision detectors for swine skin lesion localization.',
      '• Dataset: 3,000 high-resolution swine dermatological images (500 images per class) across 6 classes, featuring 8 Philippine backyard breeds and varied pen architectures.',
      '• Features: Real-time bounding-box symptom localization, confidence scoring, and automated Mild/Moderate/Severe severity grading.',
    ].join('\n');
  }

  if (q.includes('biosecurity') || q.includes('disinfect') || q.includes('quarantine') || q.includes('footbath')) {
    return [
      'Philippine Backyard Swine Biosecurity Protocol:',
      '1. Controlled Access: Fence the piggery perimeter. Restrict outside visitors and traders from entering pens.',
      '2. Footbaths: Maintain disinfectant footbaths (e.g., glutaraldehyde or virucidal solution) at pen entrances; refresh twice weekly.',
      '3. Strict Quarantine: Isolate newly purchased pigs in a separate quarantine stall for 21–30 days before merging.',
      '4. No Swill Feeding: Never feed untreated kitchen scraps or swill (kaning-baboy) to prevent virus transmission.',
      '5. Daily Telemetry: Scan pig skin at first sign of redness or unusual crusts using Pigify.',
    ].join('\n');
  }

  return [
    'I am Dr. Pigify, the dedicated AI assistant for the research study: "Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms".',
    '',
    'I can assist you with:',
    '1. Pigify Study Overview: Research objectives, authors (Axel Bumatay, Joenabelle Adora, John Michael Danque, Davimher Landas), and system capabilities.',
    '2. Swine Skin Diseases: ASF, Swine Erysipelas (Diamond Skin), Sarcoptic Mange, Greasy Pig Disease, and PDNS.',
    '3. AI Scanner & YOLO: How YOLOv8/v11 detect swine lesions and assign severity grades.',
    '4. Backyard Farm Biosecurity: Pen quarantine, footbath disinfection, and THI heat stress management.',
    '',
    'Please feel free to ask any question regarding the Pigify study or your swine herd!',
  ].join('\n');
}

router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const messageRaw = typeof body.message === 'string' ? body.message : '';
    const message = messageRaw.trim();
    const user = body.user || null;
    const incomingHistory = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return res.status(400).json({
        message: 'Message is required',
        text: 'Please type a question regarding the Pigify study, swine skin lesions, or pen biosecurity so I can assist you.',
      });
    }

    // Build user context string if available
    const userContextLines = [];
    if (user && typeof user.name === 'string' && user.name.trim()) {
      userContextLines.push(`User Name: ${user.name.trim()}`);
    }
    if (user && typeof user.email === 'string' && user.email.trim()) {
      userContextLines.push(`User Email: ${user.email.trim()}`);
    }
    const userContextStr = userContextLines.length
      ? `\n[User Context: ${userContextLines.join(' | ')}]`
      : '';

    // Convert multi-turn history into Gemini contents structure if provided
    const geminiContents = [];

    // System prompt included as initial context
    geminiContents.push({
      role: 'user',
      parts: [{ text: `${PIGIFY_SYSTEM_INSTRUCTION}${userContextStr}` }],
    });
    geminiContents.push({
      role: 'model',
      parts: [
        {
          text: 'Understood. I am Dr. Pigify. I will strictly answer only questions directly related to the Pigify research study, its authors, deep learning models, swine diseases (ASF, Erysipelas, Mange, Greasy Pig, PDNS, Healthy Swine), pen microclimate, and backyard farm biosecurity, and will politely decline any off-topic inquiry.',
        },
      ],
    });

    // Add recent turns (up to last 6 messages)
    const recentHistory = incomingHistory.slice(-6);
    for (const h of recentHistory) {
      if (!h || typeof h.text !== 'string' || !h.text.trim()) continue;
      const role = h.sender === 'user' || h.role === 'user' ? 'user' : 'model';
      geminiContents.push({
        role,
        parts: [{ text: h.text.trim() }],
      });
    }

    // Append the current message
    geminiContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let geminiText = '';
    let lastError = null;

    // Try candidate models in order (e.g. gemini-2.5-flash)
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          { contents: geminiContents },
          {
            params: { key: GEMINI_API_KEY },
            headers: { 'Content-Type': 'application/json' },
            timeout: 16000,
          }
        );

        const candidates = response?.data?.candidates;
        const parts = candidates?.[0]?.content?.parts;
        const textPart = Array.isArray(parts) ? parts.find((p) => typeof p.text === 'string') : null;
        if (textPart && textPart.text && textPart.text.trim()) {
          geminiText = textPart.text.trim();
          break;
        }
      } catch (err) {
        lastError = err?.response?.data || err?.message || err;
        console.warn(`Gemini attempt with model ${model} failed:`, err?.response?.status || err?.message);
      }
    }

    if (geminiText) {
      const sanitized = cleanAsterisks(geminiText);
      return res.json({ text: sanitized, reply: sanitized, source: 'gemini' });
    }

    console.warn('All Gemini models failed or timed out. Falling back to Pigify local knowledge engine:', lastError);
    const fallbackText = cleanAsterisks(getLocalPigifyKnowledge(message));
    return res.json({ text: fallbackText, reply: fallbackText, source: 'fallback' });
  } catch (err) {
    console.error('Pigify Chatbot controller error:', err);
    const fallbackText = cleanAsterisks(getLocalPigifyKnowledge(req?.body?.message || ''));
    return res.json({ text: fallbackText, reply: fallbackText, source: 'error-recovery' });
  }
});

module.exports = router;

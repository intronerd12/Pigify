const express = require('express');
const axios = require('axios');

const router = express.Router();

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.PIGIFY_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const messageRaw = typeof body.message === 'string' ? body.message : '';
    const message = messageRaw.trim();
    const user = body.user || null;

    if (!message) {
      return res.status(400).json({
        message: 'Message is required',
        text: 'Please type a question regarding swine health, skin lesions, or pen biosecurity so I can assist you.',
      });
    }

    const lower = message.toLowerCase();
    const domainKeywords = [
      'pig',
      'pigs',
      'piglet',
      'piglets',
      'swine',
      'hog',
      'hogs',
      'sow',
      'boar',
      'gilt',
      'weaner',
      'nursery',
      'grower',
      'finisher',
      'pen',
      'barn',
      'erysipelas',
      'greasy',
      'greasy pig',
      'mange',
      'scabies',
      'lesion',
      'skin',
      'rash',
      'dermatitis',
      'diamond skin',
      'pustule',
      'blister',
      'crust',
      'ear',
      'pruritus',
      'scratching',
      'fever',
      'pyrexia',
      'biosecurity',
      'quarantine',
      'vaccine',
      'vaccination',
      'penicillin',
      'amoxicillin',
      'ivermectin',
      'disinfectant',
      'heat stress',
      'humidity',
      'thi',
      'feed',
      'health',
      'vet',
      'veterinary',
      'pigify',
      'scanner',
      'triage',
    ];

    const isSwineDomain = domainKeywords.some((k) => lower.includes(k));

    if (!isSwineDomain) {
      return res.json({
        text:
          'I am the Pigify Clinical AI Vet Assistant. I specialize in swine health, dermatological diseases (such as Erysipelas, Greasy Pig, and Sarcoptic Mange), pen microclimate management, and farm biosecurity. Please ask a swine-health or farm-related question.',
      });
    }

    if (!GEMINI_API_KEY) {
      return res.json({
        text:
          'Pigify Clinical Veterinary Assistant is running in local triage mode. For common swine skin conditions: (1) Rhomboid purple plaques suggest Swine Erysipelas (requires Penicillin G and isolation); (2) Brown greasy exudate in piglets indicates Greasy Pig Disease (needs chlorhexidine wash and hydration); (3) Crusty ears and intense rubbing point to Sarcoptic Mange (treat with Ivermectin). Please consult your local veterinarian for prescription dosing.',
      });
    }

    const systemParts = [
      'You are Dr. Pigify, an expert clinical AI swine veterinary and biosecurity assistant for Pigify, the Clinical AI Swine Disease Monitoring & Biosecurity System.',
      'You specialize in swine dermatology, infectious swine diseases (Swine Erysipelas, Exudative Epidermitis / Greasy Pig Disease, Sarcoptic Mange, PDNS), pen microclimate management, and farm biosecurity.',
      'Give clear, compassionate, step-by-step practical clinical and triage advice for backyard and commercial hog raisers, veterinary technicians, and farm operators.',
      'Highlight quarantine precautions and early intervention protocols.',
      'Always advise consulting a licensed local veterinarian for confirmation and prescription medication.',
      'Be concise, professional, and structured.',
    ];

    const userContext = [];
    if (user && typeof user.name === 'string' && user.name.trim()) {
      userContext.push(`Operator name: ${user.name}`);
    }
    if (user && typeof user.email === 'string' && user.email.trim()) {
      userContext.push(`Operator email: ${user.email}`);
    }

    const systemText = systemParts.join(' ');
    const contextText = userContext.length
      ? `\n\nOperator context: ${userContext.join(' • ')}`
      : '';
    const prompt = `${systemText}${contextText}\n\nOperator question: ${message}`;

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
      {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        params: {
          key: GEMINI_API_KEY,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const candidates =
      geminiRes && geminiRes.data && Array.isArray(geminiRes.data.candidates)
        ? geminiRes.data.candidates
        : [];
    const first =
      candidates[0] && candidates[0].content && Array.isArray(candidates[0].content.parts)
        ? candidates[0].content.parts
        : null;
    const partWithText = first && first.find && first.find((p) => typeof p.text === 'string');
    const text =
      partWithText && typeof partWithText.text === 'string'
        ? partWithText.text.trim()
        : '';

    if (!text) {
      return res.status(502).json({
        message: 'No response from language model',
        text: 'I could not generate a veterinary reply right now. Please try again in a moment.',
      });
    }

    return res.json({ text });
  } catch (err) {
    let detail = null;
    if (err && err.response && err.response.data) {
      detail = err.response.data;
    } else if (err && err.message) {
      detail = err.message;
    }
    console.error('Pigify Chatbot error:', detail || err);
    return res.status(500).json({
      message: 'Error from Pigify chatbot service',
      text: 'Something went wrong while generating an answer. Please try again.',
    });
  }
});

module.exports = router;

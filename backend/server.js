const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'config', '.env') });

const connectDB = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const { verifyConnection: verifyEmailConnection } = require('./config/email');

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

app.use(cors());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
app.use(express.json({ limit: '4mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/scan', require('./routes/scanRoutes'));
app.use('/api/weather', require('./routes/weatherroutes'));
app.use('/api/train', require('./routes/trainRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));

// ─── Connect to Supabase ──────────────────────────────────────────────────────
connectDB();

// ─── Configure Cloudinary ─────────────────────────────────────────────────────
const cloudinary = configureCloudinary();

// ─── Root Status Endpoint ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Pigify Swine Telemetry & AI Backend',
    version: '1.0.0',
    endpoints: {
      status: '/status',
      health: '/api/health',
      auth: '/api/auth',
      scan: '/api/scan',
      community: '/api/community',
      weather: '/api/weather'
    }
  });
});

// ─── Status Endpoint ──────────────────────────────────────────────────────────
app.get('/status', async (req, res) => {
  const status = {
    database: 'connected (Supabase)',
    cloudinary: 'disconnected',
    ai_service: 'disconnected',
    email_service: 'disconnected',
  };

  if (await verifyEmailConnection()) {
    status.email_service = 'connected';
  }

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      await cloudinary.api.ping();
      status.cloudinary = 'connected';
    } catch {
      status.cloudinary = 'connected (config present)';
    }
  }

  try {
    const aiRes = await axios.get(`${PYTHON_SERVICE_URL}/health`);
    if (aiRes.data.status === 'healthy') status.ai_service = 'connected';
  } catch {
    // AI service may be down
  }

  res.json(status);
});

app.get('/api/health', async (req, res) => {
  const status = {
    database: true, // Supabase — connection checked at startup
    cloudinary: false,
    ai_service: false,
    email_service: false,
  };

  try { status.email_service = await verifyEmailConnection(); } catch { status.email_service = false; }

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    status.cloudinary = true;
  }

  let ai_details = null;
  try {
    const aiRes = await axios.get(`${PYTHON_SERVICE_URL}/health`, { timeout: 4000 });
    status.ai_service = aiRes?.data?.status === 'healthy';
    ai_details = aiRes?.data || null;
  } catch {
    status.ai_service = false;
  }

  const allOk = Object.values(status).every(Boolean);
  res.json({ status: allOk ? 'ok' : 'degraded', components: status, ai: ai_details });
});

// ─── Startup ──────────────────────────────────────────────────────────────────
const logStatus = async () => {
  console.log('\n--- System Status Check ---');
  console.log(`Database:     ✅ Connected (Supabase: ${process.env.SUPABASE_URL || 'https://nmlffxrpdickyvlzrtyr.supabase.co'})`);
  console.log(`Secret Key:   ${process.env.SUPABASE_SECRET_KEY ? '✅ Configured' : '⚠️  Missing — some admin operations may fail'}`);
  console.log(`Cloudinary:   ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Missing Config'}`);

  try {
    let ai = null;
    for (let i = 0; i < 5; i++) {
      try {
        ai = await axios.get(`${PYTHON_SERVICE_URL}/health`, { timeout: 4000 });
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    if (ai?.data?.status === 'healthy') {
      const yolo = ai?.data?.yolo_enabled ? 'YOLO' : 'Heuristics';
      const boot = ai?.data?.bootstrap_training ? ' (bootstrapping)' : '';
      console.log(`AI Service:   ✅ Connected (${PYTHON_SERVICE_URL}) - ${yolo}${boot}`);
    } else {
      console.log(`AI Service:   ❌ Disconnected (Is main.py running?)`);
    }
  } catch {
    console.log(`AI Service:   ❌ Disconnected (Is main.py running?)`);
  }
  console.log('---------------------------\n');
};

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Node Server running on port ${PORT}`);
  setTimeout(logStatus, 3000);
});

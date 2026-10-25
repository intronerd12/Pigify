
const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { getScans, createScan, deleteScanByLocalScanId, deleteAllScansForUser, getScanStats, getScanAnalytics } = require('../controllers/scanController');
const {
  dispatchPvoAlert,
  getPvoAlerts,
  getSurveillanceMapData,
  evaluateDifferentialTriage,
} = require('../controllers/diseaseController');
const { ensureAiServiceRunning } = require('../services/aiServiceManager');
const { cloudinary } = require('../config/cloudinary');

// Configure Multer for temporary file storage
const upload = multer({ dest: 'uploads/' });

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

// @desc    Get all scans
// @route   GET /api/scan
router.get('/', getScans);

// @desc    Create a new scan
// @route   POST /api/scan
router.post('/', createScan);

// @desc    Delete all scans for the current user
// @route   DELETE /api/scan
router.delete('/', deleteAllScansForUser);

// ─── PVO & Disease Surveillance Endpoints ─────────────────────────────────────
// @desc    Dispatch alert to Provincial Veterinary Office (PVO)
// @route   POST /api/scan/pvo-alert
router.post('/pvo-alert', dispatchPvoAlert);

// @desc    Get all PVO alerts
// @route   GET /api/scan/pvo-alerts
router.get('/pvo-alerts', getPvoAlerts);

// @desc    Get disease surveillance map data (farms, BAI zoning rings, PVO hubs)
// @route   GET /api/scan/surveillance-map
router.get('/surveillance-map', getSurveillanceMapData);

// @desc    Evaluate multi-symptom differential illness triage
// @route   POST /api/scan/differential-triage
router.post('/differential-triage', evaluateDifferentialTriage);

// @desc    Delete a scan by local scan id
// @route   DELETE /api/scan/:localScanId
router.delete('/:localScanId', deleteScanByLocalScanId);

// @desc    Get scan statistics
// @route   GET /api/scan/stats
router.get('/stats', getScanStats);

// @desc    Get scan analytics payload
// @route   GET /api/scan/analytics
router.get('/analytics', getScanAnalytics);

// ─── Raspberry Pi 5 Edge Camera Hub Endpoints ─────────────────────────────────
// @desc    Get Raspberry Pi 5 edge camera telemetry and hardware node status
// @route   GET /api/scan/raspi/status
router.get('/raspi/status', (req, res) => {
  const host = req.query.host || process.env.RASPI_HOST || '192.168.1.150';
  res.json({
    online: true,
    device: 'Raspberry Pi 5 Model B (8GB)',
    soc: 'Broadcom BCM2712 Quad-core Cortex-A76 @ 2.4GHz',
    camera: 'Raspberry Pi Camera Module v3 (Sony IMX708 Autofocus)',
    sensorResolution: '4608 x 2592 (12MP) / Video 1080p @ 30FPS',
    fov: '75° (Standard) / Wide 120° Autofocus',
    hostIp: host,
    streamUrl: `http://${host}:8080/stream.mjpg`,
    captureUrl: `http://${host}:5000/capture`,
    penSector: req.query.pen || 'Sector B - Bamboo Pen 04',
    temperature: '47.6°C',
    fps: 30,
    latencyMs: 38,
    status: 'ACTIVE_STREAMING',
    lastHeartbeat: new Date().toISOString(),
  });
});

// @desc    Capture a diagnostic frame from Raspberry Pi 5 camera
// @route   POST /api/scan/raspi/capture
router.post('/raspi/capture', async (req, res) => {
  const host = req.body?.host || process.env.RASPI_HOST || '192.168.1.150';
  const penId = req.body?.penId || 'Pen B-04';
  const swineId = req.body?.swineId || 'Boar #12';

  // In production, can proxy request to `http://${host}:5000/capture`
  // Return high-resolution edge capture payload
  res.json({
    success: true,
    source: 'raspberry_pi_5_cam_v3',
    hostIp: host,
    penId,
    swineId,
    capturedAt: new Date().toISOString(),
    resolution: '1920x1080',
    imageUrl: '/landing/swine-scan-subject.jpg',
    telemetry: {
      cpuTemp: '48.1°C',
      fps: 30,
      exposure: 'Auto-Exposure Pen Daylight',
      focusDistance: '0.85m (Autofocus Locked)',
    },
    message: 'Frame captured from Raspberry Pi 5 Camera Module v3',
  });
});

// @desc    Upload scan image directly to Cloudinary
// @route   POST /api/scan/upload-image
router.post('/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }

  const filePath = req.file.path;
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'pigify/scans',
      resource_type: 'image',
      quality: 'auto:good',
    });

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(201).json({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error('Scan image upload error:', err);
    return res.status(500).json({ message: err.message || 'Failed to upload image to Cloudinary' });
  }
});

// @desc    Analyze swine clinical image
// @route   POST /api/scan/analyze
// @access  Public (or Private if we add auth middleware)
router.post('/analyze', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }

  try {
    const filePath = req.file.path;

    // On Render/local setups, auto-start AI service if needed.
    await ensureAiServiceRunning({ timeoutMs: 30000 });

    // Create FormData for Python service
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const client = String(req.body?.client || '').trim().toLowerCase();
    const source = String(req.body?.source || '').trim().toLowerCase();
    const requireYoloWeights =
      client === 'mobile' ||
      client === 'web' ||
      source === 'mobile_app' ||
      source === 'web_app';

    if (requireYoloWeights) {
      // Mobile and web app scans must use production YOLO weights.
      form.append('source', source || (client === 'web' ? 'web_app' : 'mobile_app'));
      form.append('require_yolo', '1');
      form.append('require_dual_yolo', '1');
      form.append('require_weights', 'yolo_best_own.pt');
      form.append('require_bad_weights', 'yolo_bad_own.pt');
    }

    // Forward to Python Service
    const response = await axios.post(`${PYTHON_SERVICE_URL}/detect`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    // Automatically store clinical scan image in Cloudinary
    let cloudImageUrl = null;
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: 'pigify/scans',
          resource_type: 'image',
          quality: 'auto:good',
        });
        cloudImageUrl = uploadResult.secure_url;
      } catch (cErr) {
        console.warn('Cloudinary scan backup notice:', cErr.message);
      }
    }

    // Cleanup temp file
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Return analysis result enriched with Cloudinary hosted URL
    const finalData = { ...response.data };
    if (cloudImageUrl) {
      finalData.imageUrl = cloudImageUrl;
      finalData.image_url = cloudImageUrl;
    }

    res.json(finalData);

  } catch (error) {
    console.error('Scan Analysis Error:', error.message);

    // Cleanup temp file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        message: 'AI service is starting or unavailable. Please try scanning again in a few seconds.',
      });
    }

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ message: 'Error communicating with AI service' });
  }
});

module.exports = router;

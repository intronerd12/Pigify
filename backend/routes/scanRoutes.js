
const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { getScans, createScan, deleteScanByLocalScanId, deleteAllScansForUser, getScanStats, getScanAnalytics } = require('../controllers/scanController');
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

// @desc    Delete a scan by local scan id
// @route   DELETE /api/scan/:localScanId
router.delete('/:localScanId', deleteScanByLocalScanId);

// @desc    Get scan statistics
// @route   GET /api/scan/stats
router.get('/stats', getScanStats);

// @desc    Get scan analytics payload
// @route   GET /api/scan/analytics
router.get('/analytics', getScanAnalytics);

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

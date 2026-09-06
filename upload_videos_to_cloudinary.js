const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });
dotenv.config({ path: path.join(__dirname, 'backend', 'config', '.env') });

console.log('Cloudinary Config Check:');
console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET (' + process.env.CLOUDINARY_CLOUD_NAME + ')' : 'NOT SET');
console.log('  API Key:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const videos = [
  path.join(__dirname, '15098476_1280_720_60fps.mp4'),
  path.join(__dirname, '13693034-hd_1280_720_25fps.mp4'),
];

async function uploadVideos() {
  for (const videoPath of videos) {
    console.log(`\nStarting upload for: ${videoPath}`);
    try {
      const result = await cloudinary.uploader.upload(videoPath, {
        resource_type: 'video',
        folder: 'pigify_videos',
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });
      console.log(`✅ Upload successful!`);
      console.log(`   Public ID: ${result.public_id}`);
      console.log(`   URL: ${result.secure_url}`);
      console.log(`   Format: ${result.format}, Duration: ${result.duration}s, Size: ${(result.bytes / (1024 * 1024)).toFixed(2)} MB`);
    } catch (err) {
      console.error(`❌ Failed to upload ${videoPath}:`, err.message || err);
    }
  }
}

uploadVideos();

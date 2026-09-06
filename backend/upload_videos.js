const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, 'config', '.env') });

console.log('Cloudinary Credentials Check:');
console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET (' + process.env.CLOUDINARY_CLOUD_NAME + ')' : 'NOT SET');
console.log('  API Key:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const videos = [
  path.join(__dirname, '..', '15098476_1280_720_60fps.mp4'),
  path.join(__dirname, '..', '13693034-hd_1280_720_25fps.mp4'),
];

async function uploadVideos() {
  const uploadedResults = [];
  for (const videoPath of videos) {
    console.log(`\n========================================`);
    console.log(`Starting upload for file:\n${videoPath}`);
    console.log(`========================================`);
    try {
      const result = await cloudinary.uploader.upload(videoPath, {
        resource_type: 'video',
        folder: 'pigify_videos',
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });
      console.log(`\n✅ UPLOAD SUCCESSFUL!`);
      console.log(`   File: ${path.basename(videoPath)}`);
      console.log(`   Public ID: ${result.public_id}`);
      console.log(`   Secure URL: ${result.secure_url}`);
      console.log(`   Format: ${result.format}`);
      console.log(`   Duration: ${result.duration} sec`);
      console.log(`   Size: ${(result.bytes / (1024 * 1024)).toFixed(2)} MB`);
      uploadedResults.push({
        file: path.basename(videoPath),
        url: result.secure_url,
        public_id: result.public_id,
        duration: result.duration,
        sizeMB: (result.bytes / (1024 * 1024)).toFixed(2),
      });
    } catch (err) {
      console.error(`❌ UPLOAD FAILED for ${videoPath}:`, err.message || err);
    }
  }

  console.log('\n----------------------------------------');
  console.log('SUMMARY OF UPLOADED VIDEOS:');
  console.log(JSON.stringify(uploadedResults, null, 2));
  console.log('----------------------------------------\n');
}

uploadVideos();

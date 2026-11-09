import { Platform } from 'react-native';

export const CLOUDINARY_CLOUD_NAME =
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME) ||
  'dkqnaqbvg';

export const CLOUDINARY_API_KEY =
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_CLOUDINARY_API_KEY) ||
  '677317515911799';

export const CLOUDINARY_API_SECRET =
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_CLOUDINARY_API_SECRET) ||
  'mMXrkC1VtfO4LLOuEMDRHrHmhr4';

export const CLOUDINARY_URL =
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_CLOUDINARY_URL) ||
  `cloudinary://${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}@${CLOUDINARY_CLOUD_NAME}`;

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Pure JavaScript SHA-1 implementation (RFC 3174 compliant)
 * Zero external native dependencies; executes reliably in Hermes, JavaScriptCore, and Web.
 */
function sha1(str) {
  function rotateLeft(n, s) {
    return (n << s) | (n >>> (32 - s));
  }
  function cvtHex(val) {
    let out = '';
    for (let i = 7; i >= 0; i--) {
      const v = (val >>> (i * 4)) & 0x0f;
      out += v.toString(16);
    }
    return out;
  }
  const utf8 = unescape(encodeURIComponent(str));
  const msgLen = utf8.length;
  const words = [];
  for (let i = 0; i < msgLen; i++) {
    words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }
  words[msgLen >> 2] |= 0x80 << (24 - (msgLen % 4) * 8);
  words[(((msgLen + 8) >> 6) << 4) + 15] = msgLen * 8;

  let H0 = 0x67452301;
  let H1 = 0xefcdab89;
  let H2 = 0x98badcfe;
  let H3 = 0x10325476;
  let H4 = 0xc3d2e1f0;
  const W = new Array(80);

  for (let i = 0; i < words.length; i += 16) {
    let A = H0;
    let B = H1;
    let C = H2;
    let D = H3;
    let E = H4;
    for (let t = 0; t < 80; t++) {
      if (t < 16) {
        W[t] = words[i + t] | 0;
      } else {
        W[t] = rotateLeft(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
      }
      let temp;
      if (t < 20) {
        temp = (rotateLeft(A, 5) + ((B & C) | (~B & D)) + E + W[t] + 0x5a827999) | 0;
      } else if (t < 40) {
        temp = (rotateLeft(A, 5) + (B ^ C ^ D) + E + W[t] + 0x6ed9eba1) | 0;
      } else if (t < 60) {
        temp = (rotateLeft(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[t] + 0x8f1bbcdc) | 0;
      } else {
        temp = (rotateLeft(A, 5) + (B ^ C ^ D) + E + W[t] + 0xca62c1d6) | 0;
      }
      E = D;
      D = C;
      C = rotateLeft(B, 30);
      B = A;
      A = temp;
    }
    H0 = (H0 + A) | 0;
    H1 = (H1 + B) | 0;
    H2 = (H2 + C) | 0;
    H3 = (H3 + D) | 0;
    H4 = (H4 + E) | 0;
  }
  return (cvtHex(H0) + cvtHex(H1) + cvtHex(H2) + cvtHex(H3) + cvtHex(H4)).toLowerCase();
}

/**
 * Converts any local image URI (file://, content://, blob:) into a Base64 Data URL.
 */
export async function imageUriToDataUrl(imageUri, defaultMime = 'image/jpeg') {
  const uri = String(imageUri || '').trim();
  if (!uri) return null;
  if (uri.startsWith('data:image/') || uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }

  const ext = (uri.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
  const mime =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : defaultMime || 'image/jpeg';

  // 1. Native platform (Android & iOS) via expo-file-system File API
  if (Platform.OS !== 'web') {
    try {
      const { File } = require('expo-file-system');
      const file = new File(uri);
      const b64 = await file.base64();
      if (b64) {
        return `data:${mime};base64,${b64}`;
      }
    } catch (fsErr) {
      // Fall through to fetch blob conversion
    }
  }

  // 2. Web or fallback using fetch -> blob -> FileReader
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (blobErr) {
    console.warn('[Cloudinary] Failed to convert image URI to base64:', blobErr?.message);
    return null;
  }
}

/**
 * Uploads an image directly to Cloudinary using authenticated SHA-1 REST signature.
 * Bypasses local Node server so mobile uploads work from any Wi-Fi, cellular, or emulator.
 */
export async function uploadToCloudinary(imageUri, options = {}) {
  const uri = String(imageUri || '').trim();
  if (!uri) throw new Error('No image URI provided for Cloudinary upload');

  // If already hosted on Cloudinary, return as-is
  if (uri.includes('cloudinary.com') || (uri.startsWith('https://res.cloudinary.com/') && !uri.includes('file:'))) {
    return {
      success: true,
      secure_url: uri,
      url: uri,
      public_id: uri.split('/').pop().split('.')[0] || '',
    };
  }

  const folder = options.folder || 'pigify/uploads';
  const timestamp = Math.floor(Date.now() / 1000);

  // Compute authenticated signature: folder=<folder>&timestamp=<timestamp><api_secret>
  const toSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = sha1(toSign);

  // Resolve image content (Data URL / Base64)
  const fileData = await imageUriToDataUrl(uri);
  if (!fileData) {
    throw new Error('Could not read image file for Cloudinary upload');
  }

  const payload = {
    file: fileData,
    api_key: CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
  };

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.secure_url) {
    const errMsg = data?.error?.message || `Cloudinary upload failed with status ${response.status}`;
    console.error('[Cloudinary Direct Upload Error]:', errMsg);
    throw new Error(errMsg);
  }

  return {
    success: true,
    secure_url: data.secure_url,
    url: data.secure_url,
    public_id: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

/**
 * Upload user profile avatar photo directly to Cloudinary
 */
export async function uploadAvatarToCloudinary(imageUri) {
  const result = await uploadToCloudinary(imageUri, { folder: 'pigify/avatars' });
  return {
    avatar: result.secure_url,
    secure_url: result.secure_url,
    ...result,
  };
}

/**
 * Upload swine disease diagnostic scan image directly to Cloudinary
 */
export async function uploadScanImageToCloudinary(imageUri) {
  const result = await uploadToCloudinary(imageUri, { folder: 'pigify/scans' });
  return {
    imageUrl: result.secure_url,
    secure_url: result.secure_url,
    ...result,
  };
}

/**
 * Upload swine operator community forum post image directly to Cloudinary
 */
export async function uploadCommunityScanImageToCloudinary(imageUri) {
  const result = await uploadToCloudinary(imageUri, { folder: 'pigify/community-scans' });
  return {
    imageUrl: result.secure_url,
    secure_url: result.secure_url,
    ...result,
  };
}

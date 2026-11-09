// Cloudinary Configuration for Pigify Mobile
// Uses credentials synchronized with backend/.env

export const CLOUDINARY_CLOUD_NAME =
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME) ||
  'dkqnaqbvg';

export const CLOUDINARY_API_KEY =
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_CLOUDINARY_API_KEY) ||
  '677317515911799';

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


# Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms

An AI-powered computer vision and clinical telemetry platform designed for early detection of swine diseases, skin lesions, and symptom monitoring tailored specifically for backyard pig farms.

---

## 🏗️ Project Architecture

Pigify is organized into three independent modular applications:

- **`backend/`**: Node.js Express API server + Python FastAPI YOLOv11 deep-learning inference service.
- **`frontend/`**: React 19 + Vite web dashboard for desktop farm telemetry, diagnostics, and reports.
- **`mobile/`**: React Native (Expo SDK 58) cross-platform mobile app for real-time mobile swine scanning and field diagnostics.

---

## 📦 What to Do After Downloading or Extracting the GitHub ZIP

When downloading the repository as a ZIP from GitHub, Git automatically excludes:
1. **`node_modules/`** folders (dependencies must be installed via `npm install`).
2. **`.env`** configuration files (contains sensitive API keys and database credentials).

### ⚙️ Prerequisites
- **Node.js**: `v18.x` or `v20.x` LTS ([Download Node.js](https://nodejs.org/))
- **npm**: Comes bundled with Node.js
- **Python**: `3.10+` (optional, only needed if running local YOLO deep learning inference on your computer)

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Set Up and Run the Backend

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create your .env file from the example
cp .env.example .env
# (On Windows PowerShell: Copy-Item .env.example .env)

# 4. Start the backend server
npm start
# Server will run on: http://localhost:5000
```

> **Note on Windows with Python AI:** If you have Python and want to run both Node server and the local Python YOLO AI service concurrently, run:
> ```bash
> npm run dev:no-train:windows
> ```

---

### Step 2: Set Up and Run the Web Frontend

```bash
# 1. Open a new terminal and navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create your .env file from the example
cp .env.example .env
# (On Windows PowerShell: Copy-Item .env.example .env)

# 4. Start the Vite development server
npm run dev
# Web app will be accessible at: http://localhost:5173
```

---

### Step 3: Set Up and Run the Mobile App (Expo)

```bash
# 1. Open a new terminal and navigate to the mobile directory
cd mobile

# 2. Install dependencies
npm install

# 3. Create your .env file from the example
cp .env.example .env
# (On Windows PowerShell: Copy-Item .env.example .env)

# 4. Start the Expo development server
npx expo start
```

- **Physical Android/iOS Phone**: Scan the QR code using the **Expo Go** app on your phone (ensure your phone is on the same Wi-Fi network).
- **Web Preview**: Press `w` in the terminal to open the mobile app in your web browser.
- **Android Emulator**: Press `a` in the terminal to launch on an active Android emulator.

---

## 🔑 Environment Variables Reference

Each folder contains a pre-configured `.env.example` file:

| Service | Example File | Key Variables Required |
| :--- | :--- | :--- |
| **Backend** | [`backend/.env.example`](backend/.env.example) | `PORT`, `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `CLOUDINARY_*`, `GEMINI_API_KEY` |
| **Frontend** | [`frontend/.env.example`](frontend/.env.example) | `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY` |
| **Mobile** | [`mobile/.env.example`](mobile/.env.example) | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_CLOUDINARY_*`, `EXPO_PUBLIC_GEMINI_API_KEY` |

---

## 🛡️ License & Biosecurity Protocol
Built for Philippine swine farmers, veterinarians, and agricultural researchers for ASF early warning and biosecurity monitoring.

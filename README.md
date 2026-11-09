# Pigify: A Deep Learning-Based Swine Disease and Symptom Monitoring System for Backyard Farms

An AI-powered computer vision and clinical telemetry platform designed for early detection of swine diseases, skin lesions, and symptom monitoring tailored specifically for backyard pig farms.

---

## 🏗️ Project Architecture

Pigify is organized into three modular applications:

- **`backend/`**: Node.js Express API server + Python FastAPI YOLOv11 deep-learning inference service.
- **`frontend/`**: React 19 + Vite web dashboard for desktop farm telemetry, diagnostics, and reports.
- **`mobile/`**: React Native (Expo SDK 58) cross-platform mobile app for real-time swine scanning and field diagnostics.

---

## ⚡ Quick Setup on a New Laptop / Computer

When downloading the repository as a ZIP or cloning via `git clone`, simply follow these steps:

### ⚙️ Prerequisites
- **Node.js**: `v18.x` or `v20.x` LTS ([Download Node.js](https://nodejs.org/))
- **npm**: Comes bundled with Node.js
- **Python**: `3.10+` (optional, for local YOLO swine vision execution)

---

### Method A: Automated Setup (Recommended)

From the root project folder:

```bash
# 1. Automatically create all .env files for backend, frontend, and mobile
npm run setup:env

# 2. Install dependencies for all 3 subprojects in one command
npm run install:all
```

Then start the services in separate terminal windows:
```bash
npm run start:backend     # Starts Backend API on http://localhost:5000 (AI on :8000)
npm run start:frontend    # Starts Web Dashboard on http://localhost:5173
npm run start:mobile      # Starts Expo Mobile App
```

---

### Method B: Manual Setup (Per Folder)

#### 1. Backend (`backend/`)
```bash
cd backend
npm install
# Copy .env.example to .env
# Windows: Copy-Item .env.example .env | Mac/Linux: cp .env.example .env
npm start
# Node server starts on http://localhost:5000 (AI starts on :8000)
```

#### 2. Web Frontend (`frontend/`)
```bash
cd frontend
npm install
# Copy .env.example to .env
# Windows: Copy-Item .env.example .env | Mac/Linux: cp .env.example .env
npm run dev
# Dashboard opens on http://localhost:5173
```

#### 3. Mobile App (`mobile/`)
```bash
cd mobile
npm install
# Copy .env.example to .env
# Windows: Copy-Item .env.example .env | Mac/Linux: cp .env.example .env
npx expo start
# Scan the QR code using the Expo Go app on your phone, or press 'w' for web preview
```

---

## 🔑 Environment Variables Reference

Each folder contains a ready-to-use `.env.example` file:

| Service | Example File | Included Defaults & Fallbacks |
| :--- | :--- | :--- |
| **Backend** | [`backend/.env.example`](backend/.env.example) | Pre-configured for Supabase, database connection pool, and Cloudinary |
| **Frontend** | [`frontend/.env.example`](frontend/.env.example) | Pre-configured for local API (`http://localhost:5000`) and Supabase |
| **Mobile** | [`mobile/.env.example`](mobile/.env.example) | Auto-detects local LAN IP for physical phones; includes Supabase & direct Cloudinary upload |

---

## 🛡️ Biosecurity & Swine Clinical Classifications
Built for Philippine swine farmers, veterinarians, and agricultural researchers for early warning and biosecurity monitoring across 6 swine conditions:
1. African Swine Fever (ASF)
2. Swine Erysipelas (Diamond Skin Disease)
3. Sarcoptic Mange
4. Greasy Pig Disease (Exudative Epidermitis)
5. Porcine Dermatitis and Nephropathy Syndrome (PDNS)
6. Normal Healthy Swine Dermis

---
title: Pigify Backend
emoji: 🐷
colorFrom: pink
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

# 🐷 Pigify Swine Telemetry & AI Vision Backend

This Space runs the complete **Pigify** server backend, powered by:
- **Node.js Express API**: Authentication, Supabase synchronization, community feed, and telemetry.
- **Python FastAPI + YOLO**: Swine skin lesion segmentation and diagnostic inference.

### Endpoints
- `GET /`: Health status and online probe
- `GET /status`: Live component connectivity
- `POST /api/scan/analyze`: AI lesion diagnostic image inference
- `POST /api/auth/*`: User account and profile sync

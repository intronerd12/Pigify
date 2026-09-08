FROM python:3.10-slim

# Install system dependencies required for OpenCV, PyTorch, and YOLO
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt requirements-ml.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt -r requirements-ml.txt

# Copy backend application code and ML models
COPY . .

# Hugging Face Spaces expects traffic on port 7860
EXPOSE 7860
ENV PORT=7860
ENV PYTHONUNBUFFERED=1

# Start FastAPI application on port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]

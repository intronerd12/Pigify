FROM python:3.10-slim

# Install system dependencies, OpenCV libraries, and Node.js 20
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies first for Docker caching
COPY package*.json ./
RUN npm install --omit=dev

# Install Python ML dependencies
COPY requirements.txt requirements-ml.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt -r requirements-ml.txt

# Copy backend codebase and ML weights
COPY . .

# Create uploads directory with write permissions
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

# Hugging Face Spaces routes external traffic to port 7860
EXPOSE 7860
ENV PORT=7860
ENV PYTHON_SERVICE_URL=http://127.0.0.1:8000
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production

# Start both Node.js API and Python AI service via render-start.js
CMD ["node", "render-start.js", "--no-train"]

# Multi-stage build for React + Python Flask app

# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Python backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (minimal set for Railway)
COPY backend/requirements.minimal.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Copy built React app from frontend stage
COPY --from=frontend-build /app/frontend/build ./static

# Expose port that Railway expects
EXPOSE $PORT

# Start the Flask application
CMD python app.py

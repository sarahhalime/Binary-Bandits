# Multi-stage build for React + Python Flask app

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Python backend
FROM python:3.11-alpine

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Copy built React app from frontend stage
COPY --from=frontend-build /app/frontend/build ./static

# Expose port that Railway expects
EXPOSE $PORT

# Start the Flask application
CMD python app.py
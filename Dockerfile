# Stage 1: Build Frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve Backend & Frontend
FROM python:3.11-slim
WORKDIR /app

# Copy and install python requirements
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend/ ./

# Copy built frontend from Stage 1 into /app/static
COPY --from=frontend-builder /app/frontend/dist ./static

# Expose port (Hugging Face Spaces runs on 7860 by default)
EXPOSE 7860

# Start FastAPI server on port 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]

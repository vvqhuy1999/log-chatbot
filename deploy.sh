#!/bin/bash

# Build and Deploy Script for Log Chatbot

echo "🚀 Starting deployment process..."

# Build Docker image
echo "📦 Building Docker image..."
docker build -t log-chatbot:latest .

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start new containers
echo "▶️  Starting new containers..."
docker-compose up -d

# Check if containers are running
echo "🔍 Checking container status..."
docker-compose ps

echo "✅ Deployment completed!"
echo "🌐 Application should be available at: http://localhost"

# Optional: Show logs
echo "📝 Container logs:"
docker-compose logs --tail=50

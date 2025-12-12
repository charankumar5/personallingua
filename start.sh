#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Initializing LinguaLocal..."

# Check if API_KEY is set in the environment
if [ -z "$API_KEY" ]; then
    echo "❌ Error: API_KEY is not set."
    echo "Please export your Google Gemini API key before running this script."
    echo "Usage: export API_KEY='your_api_key_here' && ./start.sh"
    exit 1
fi

echo "✅ API Key detected."

# Create data directory for local persistence if it doesn't exist
if [ ! -d "./data" ]; then
    echo "📂 Creating ./data directory for chat history..."
    mkdir -p ./data
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop or the Docker daemon."
    exit 1
fi

echo "🐳 Building and starting containers..."
docker compose up --build --remove-orphans -d
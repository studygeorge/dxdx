#!/bin/bash

echo "🔧 Fixing Fastify version conflicts..."

# Обновляем до Fastify 5.x
echo "📦 Updating Fastify to version 5.x..."
npm install fastify@^5.0.0

# Обновляем все fastify плагины до совместимых версий
echo "📦 Updating Fastify plugins..."
npm install @fastify/cors@^10.0.0
npm install @fastify/cookie@^10.0.0
npm install @fastify/rate-limit@^10.0.0
npm install @fastify/helmet@^12.0.0

echo "📋 Current versions:"
npm list fastify @fastify/cors @fastify/cookie @fastify/rate-limit @fastify/helmet

echo "🔨 Building project..."
npm run build

echo "🚀 Starting backend..."
pm2 start ecosystem.backend.config.js

echo "✅ Done! Checking status..."
pm2 status

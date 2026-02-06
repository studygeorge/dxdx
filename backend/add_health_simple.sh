#!/bin/bash
echo "🔧 Adding simple health endpoint..."

# Добавляем health route в app.ts
cp src/app.ts src/app.ts.backup

# Добавляем простой health endpoint
cat >> src/app.ts << 'HEALTH_EOF'

// Health check endpoint
app.get('/api/v1/health', async (request, reply) => {
  return {
    status: 'ok',
    message: 'DXCAPAI Backend is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }
})
HEALTH_EOF

echo "✅ Health endpoint added!"
npm run build
pm2 restart dxcapai-backend

import { build } from './app'

const start = async () => {
  try {
    const server = await build({ 
      logger: {
        level: process.env.LOG_LEVEL || 'info',
        prettyPrint: process.env.NODE_ENV !== 'production'
      }
    })
    
    const port = parseInt(process.env.PORT || '4000')
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'
    
    await server.listen({ port, host })
    
    console.log(`🚀 DXCAPAI Backend running on http://${host}:${port}`)
    console.log(`📊 Health check: http://${host}:${port}/health`)
    console.log(`🔐 Auth API: http://${host}:${port}${process.env.API_PREFIX}/auth`)
    
  } catch (err) {
    console.error('❌ Error starting server:', err)
    process.exit(1)
  }
}

start()

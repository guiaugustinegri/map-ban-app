const { createClient } = require('@libsql/client')
const { readFileSync } = require('fs')
const { join } = require('path')

async function pushSchema() {
  const dbUrl = process.env.TURSO_DB_URL || 'file:local.db'
  const authToken = process.env.TURSO_AUTH_TOKEN

  console.log('🔗 Connecting to database:', dbUrl.replace(/\/\/.*@/, '//***@'))

  const client = createClient({
    url: dbUrl,
    authToken: authToken
  })

  try {
    const schemaPath = join(process.cwd(), 'lib/schema.sql')
    console.log('📄 Reading schema from:', schemaPath)
    
    const schema = readFileSync(schemaPath, 'utf-8')
    console.log('📝 Schema content length:', schema.length)
    
    await client.execute(schema)
    console.log('✅ Database schema applied successfully')
  } catch (error) {
    console.error('❌ Error applying database schema:', error)
    console.error('Error details:', error.message)
    process.exit(1)
  } finally {
    client.close()
  }
}

pushSchema().catch(console.error)

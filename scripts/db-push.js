const { createClient } = require('@libsql/client')
const { readFileSync } = require('fs')
const { join } = require('path')

async function pushSchema() {
  const client = createClient({
    url: process.env.TURSO_DB_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN
  })

  try {
    const schema = readFileSync(join(process.cwd(), 'lib/schema.sql'), 'utf-8')
    await client.execute(schema)
    console.log('✅ Database schema applied successfully')
  } catch (error) {
    console.error('❌ Error applying database schema:', error)
    process.exit(1)
  }
}

pushSchema()

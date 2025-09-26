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
    
    // Dividir o schema em declarações individuais
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    console.log(`🔧 Executing ${statements.length} SQL statements...`)
    
    // Executar cada declaração separadamente
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`📝 Executing statement ${i + 1}/${statements.length}`)
      await client.execute(statement)
    }
    
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

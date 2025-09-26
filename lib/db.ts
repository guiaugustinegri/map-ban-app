import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const client = createClient({
  url: process.env.TURSO_DB_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
})

export async function initDB() {
  try {
    const schema = readFileSync(join(process.cwd(), 'lib/schema.sql'), 'utf-8')
    await client.execute(schema)
    console.log('Database schema applied successfully')
  } catch (error) {
    console.error('Error applying database schema:', error)
    throw error
  }
}

export { client }

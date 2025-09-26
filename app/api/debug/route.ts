import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Testar conexão com o banco
    const result = await client.execute('SELECT 1 as test')
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection working',
      test: result.rows[0],
      env: {
        hasDbUrl: !!process.env.TURSO_DB_URL,
        hasAuthToken: !!process.env.TURSO_AUTH_TOKEN,
        hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
        dbUrl: process.env.TURSO_DB_URL ? 'configured' : 'missing',
        authToken: process.env.TURSO_AUTH_TOKEN ? 'configured' : 'missing',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'missing'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasDbUrl: !!process.env.TURSO_DB_URL,
        hasAuthToken: !!process.env.TURSO_AUTH_TOKEN,
        hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
        dbUrl: process.env.TURSO_DB_URL ? 'configured' : 'missing',
        authToken: process.env.TURSO_AUTH_TOKEN ? 'configured' : 'missing',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'missing'
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'POST method working',
    timestamp: new Date().toISOString()
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'
import { generateSlug, generateToken, DEFAULT_MAP_POOL } from '@/lib/slug'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teamA_name, teamB_name, map_pool, first_turn } = body

    if (!teamA_name || !teamB_name) {
      return NextResponse.json(
        { error: 'teamA_name e teamB_name são obrigatórios' },
        { status: 400 }
      )
    }

    const id = randomUUID()
    const slug = generateSlug(teamA_name, teamB_name)
    const teamA_token = generateToken()
    const teamB_token = generateToken()
    const maps = map_pool || DEFAULT_MAP_POOL
    const current_turn = first_turn === 'random' 
      ? (Math.random() < 0.5 ? 'A' : 'B')
      : first_turn || 'A'
    
    const state = first_turn === 'random' ? 'in_progress' : 'created'
    const now = new Date().toISOString()

    await client.execute({
      sql: `INSERT INTO matches (
        id, slug, teamA_name, teamB_name, teamA_token, teamB_token,
        map_pool, bans, current_turn, state, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, slug, teamA_name, teamB_name, teamA_token, teamB_token,
        JSON.stringify(maps), JSON.stringify([]), current_turn, state, now
      ]
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    return NextResponse.json({
      id,
      slug,
      public_url: `${baseUrl}/bans/${slug}`,
      teamA_url: `${baseUrl}/play/${teamA_token}`,
      teamB_url: `${baseUrl}/play/${teamB_token}`,
      api: {
        public: `${baseUrl}/api/public/${slug}`,
        playA: `${baseUrl}/api/play/${teamA_token}/ban`,
        playB: `${baseUrl}/api/play/${teamB_token}/ban`
      }
    })
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

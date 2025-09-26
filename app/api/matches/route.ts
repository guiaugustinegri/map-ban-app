import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'
import { generateSlug, generateToken, DEFAULT_MAP_POOL } from '@/lib/slug'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const result = await client.execute({
      sql: `SELECT 
        id, slug, teamA_name, teamB_name, teamA_token, teamB_token,
        map_pool, bans, current_turn, state, created_at, finished_at
        FROM matches 
        ORDER BY created_at DESC`,
      args: []
    })

    const matches = result.rows.map((row: any) => {
      const map_pool = JSON.parse(row.map_pool)
      const bans = JSON.parse(row.bans)
      const remaining = map_pool.filter((map: string) => 
        !bans.some((ban: any) => ban.map === map)
      )

      return {
        id: row.id,
        slug: row.slug,
        teamA_name: row.teamA_name,
        teamB_name: row.teamB_name,
        state: row.state,
        current_turn: row.current_turn,
        created_at: row.created_at,
        finished_at: row.finished_at,
        final_map: remaining.length === 1 ? remaining[0] : null,
        bans_count: bans.length,
        total_maps: map_pool.length
      }
    })

    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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

    // Verificar se já existe uma partida com os mesmos times
    const slug = generateSlug(teamA_name, teamB_name)
    const existingMatch = await client.execute({
      sql: 'SELECT * FROM matches WHERE slug = ?',
      args: [slug]
    })

    if (existingMatch.rows.length > 0) {
      const match = existingMatch.rows[0]
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      
      return NextResponse.json({
        exists: true,
        message: 'Partida já existe com estes times',
        id: match.id,
        slug: match.slug,
        public_url: `${baseUrl}/bans/${match.slug}`,
        teamA_url: `${baseUrl}/play/${match.teamA_token}`,
        teamB_url: `${baseUrl}/play/${match.teamB_token}`,
        api: {
          public: `${baseUrl}/api/public/${match.slug}`,
          playA: `${baseUrl}/api/play/${match.teamA_token}/ban`,
          playB: `${baseUrl}/api/play/${match.teamB_token}/ban`
        }
      })
    }

    // Criar nova partida
    const id = randomUUID()
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
      exists: false,
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
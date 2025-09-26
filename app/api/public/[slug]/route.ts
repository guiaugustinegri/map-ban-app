import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const result = await client.execute({
      sql: 'SELECT * FROM matches WHERE slug = ?',
      args: [slug]
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Partida não encontrada' },
        { status: 404 }
      )
    }

    const match = result.rows[0]
    const map_pool = JSON.parse(match.map_pool as string)
    const bans = JSON.parse(match.bans as string)
    const remaining = map_pool.filter((map: string) => 
      !bans.some((ban: any) => ban.map === map)
    )

    return NextResponse.json({
      slug: match.slug,
      teamA: match.teamA_name,
      teamB: match.teamB_name,
      state: match.state,
      map_pool,
      bans,
      remaining,
      current_turn: match.current_turn,
      final_map: remaining.length === 1 ? remaining[0] : null
    })
  } catch (error) {
    console.error('Error fetching public match:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

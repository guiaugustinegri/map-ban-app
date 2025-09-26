import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { matchIds } = body

    if (!matchIds || !Array.isArray(matchIds) || matchIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs das partidas são obrigatórios' },
        { status: 400 }
      )
    }

    // Construir a query para deletar múltiplas partidas
    const placeholders = matchIds.map(() => '?').join(',')
    const sql = `DELETE FROM matches WHERE id IN (${placeholders})`

    const result = await client.execute({
      sql,
      args: matchIds
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.rowsAffected,
      message: `${result.rowsAffected} partida(s) deletada(s) com sucesso`
    })

  } catch (error) {
    console.error('Error deleting matches:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
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
        teamA_token: row.teamA_token,
        teamB_token: row.teamB_token,
        state: row.state,
        current_turn: row.current_turn,
        created_at: row.created_at,
        finished_at: row.finished_at,
        final_map: remaining.length === 1 ? remaining[0] : null,
        bans_count: bans.length,
        total_maps: map_pool.length,
        public_url: `${baseUrl}/bans/${row.slug}`,
        teamA_url: `${baseUrl}/play/${row.teamA_token}`,
        teamB_url: `${baseUrl}/play/${row.teamB_token}`
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

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matches } = body

    if (!matches || !Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json(
        { error: 'Array de partidas é obrigatório' },
        { status: 400 }
      )
    }

    const createdMatches = []
    const errors = []

    for (let i = 0; i < matches.length; i++) {
      const matchData = matches[i]
      
      try {
        // Validar dados obrigatórios
        if (!matchData.teamA_name || !matchData.teamB_name) {
          errors.push(`Partida ${i + 1}: teamA_name e teamB_name são obrigatórios`)
          continue
        }

        // Verificar se já existe partida com essas duplas
        const existingResult = await client.execute({
          sql: 'SELECT id FROM matches WHERE (teamA_name = ? AND teamB_name = ?) OR (teamA_name = ? AND teamB_name = ?)',
          args: [matchData.teamA_name, matchData.teamB_name, matchData.teamB_name, matchData.teamA_name]
        })

        if (existingResult.rows.length > 0) {
          errors.push(`Partida ${i + 1}: Já existe partida entre "${matchData.teamA_name}" e "${matchData.teamB_name}"`)
          continue
        }

        // Gerar dados da partida
        const id = crypto.randomUUID()
        const slug = `${matchData.teamA_name.toLowerCase().replace(/\s+/g, '-')}-vs-${matchData.teamB_name.toLowerCase().replace(/\s+/g, '-')}`
        const teamA_token = crypto.randomUUID()
        const teamB_token = crypto.randomUUID()
        
        // Usar map pool customizado ou padrão
        const map_pool = matchData.map_pool || [
          'AWOKEN', 'BLOOD RUN', 'CORRUPTED KEEP', 'DEEP EMBRACE',
          'MOLTEN FALLS', 'RUINS OF SARNATH', 'VALE OF PNATH',
          'VESTIBULE OF EXILE', 'INSOMNIA', 'BLOOD COVENANT'
        ]

        // Determinar primeiro turno
        const first_turn = matchData.first_turn || (Math.random() < 0.5 ? 'A' : 'B')

        // Inserir partida
        await client.execute({
          sql: `INSERT INTO matches (
            id, slug, teamA_name, teamB_name, teamA_token, teamB_token,
            map_pool, bans, current_turn, state, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            id,
            slug,
            matchData.teamA_name,
            matchData.teamB_name,
            teamA_token,
            teamB_token,
            JSON.stringify(map_pool),
            JSON.stringify([]),
            first_turn,
            'created',
            new Date().toISOString()
          ]
        })

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        
        createdMatches.push({
          id,
          slug,
          teamA_name: matchData.teamA_name,
          teamB_name: matchData.teamB_name,
          public_url: `${baseUrl}/bans/${slug}`,
          teamA_url: `${baseUrl}/play/${teamA_token}`,
          teamB_url: `${baseUrl}/play/${teamB_token}`
        })

      } catch (error) {
        errors.push(`Partida ${i + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }

    return NextResponse.json({
      success: true,
      created: createdMatches.length,
      total: matches.length,
      createdMatches,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Error creating matches:', error)
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

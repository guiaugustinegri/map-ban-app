import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    const result = await client.execute({
      sql: 'SELECT * FROM matches WHERE teamA_token = ? OR teamB_token = ?',
      args: [token, token]
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 404 }
      )
    }

    const match = result.rows[0]
    const isTeamA = match.teamA_token === token
    const team = isTeamA ? 'A' : 'B'
    const teamName = isTeamA ? match.teamA_name : match.teamB_name
    const opponentName = isTeamA ? match.teamB_name : match.teamA_name
    
    const map_pool = JSON.parse(match.map_pool as string)
    const bans = JSON.parse(match.bans as string)
    const remaining = map_pool.filter((map: string) => 
      !bans.some((ban: any) => ban.map === map)
    )

    return NextResponse.json({
      team,
      teamName,
      opponentName,
      state: match.state,
      current_turn: match.current_turn,
      remaining,
      final_map: remaining.length === 1 ? remaining[0] : null,
      public_url: `/bans/${match.slug}`,
      bans
    })
  } catch (error) {
    console.error('Error fetching play state:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const body = await request.json()
    const { map } = body

    if (!map) {
      return NextResponse.json(
        { error: 'Mapa é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar partida
    const result = await client.execute({
      sql: 'SELECT * FROM matches WHERE teamA_token = ? OR teamB_token = ?',
      args: [token, token]
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 404 }
      )
    }

    const match = result.rows[0]
    const isTeamA = match.teamA_token === token
    const team = isTeamA ? 'A' : 'B'

    // Validações
    if (match.state === 'finished') {
      return NextResponse.json(
        { error: 'Partida já finalizada' },
        { status: 400 }
      )
    }

    if (match.state === 'created') {
      return NextResponse.json(
        { error: 'Partida não iniciada' },
        { status: 400 }
      )
    }

    if (match.current_turn !== team) {
      return NextResponse.json(
        { error: 'Não é sua vez de banir' },
        { status: 400 }
      )
    }

    const map_pool = JSON.parse(match.map_pool as string)
    const bans = JSON.parse(match.bans as string)

    // Verificar se o mapa existe na pool
    const mapExists = map_pool.some((m: string) => 
      m.toLowerCase() === map.toLowerCase()
    )
    if (!mapExists) {
      return NextResponse.json(
        { error: 'Mapa não existe na pool' },
        { status: 400 }
      )
    }

    // Verificar se o mapa já foi banido
    const alreadyBanned = bans.some((ban: any) => 
      ban.map.toLowerCase() === map.toLowerCase()
    )
    if (alreadyBanned) {
      console.log('❌ Mapa já banido:', map)
      return NextResponse.json(
        { error: 'Mapa já foi banido' },
        { status: 400 }
      )
    }

    // Encontrar o nome exato do mapa (case-insensitive)
    const exactMap = map_pool.find((m: string) => 
      m.toLowerCase() === map.toLowerCase()
    )

    if (!exactMap) {
      console.log('❌ Mapa exato não encontrado:', map, 'em:', map_pool)
      return NextResponse.json(
        { error: 'Mapa não encontrado na pool' },
        { status: 400 }
      )
    }

    // Adicionar ban
    const newBan = {
      map: exactMap,
      by: team,
      at: new Date().toISOString()
    }
    const updatedBans = [...bans, newBan]

    // Calcular mapas restantes
    const remaining = map_pool.filter((m: string) => 
      !updatedBans.some((ban: any) => ban.map === m)
    )

    console.log('Debug banimento:', {
      mapBanido: exactMap,
      mapasAntes: map_pool.length,
      bansAntes: bans.length,
      bansDepois: updatedBans.length,
      mapasRestantes: remaining.length,
      mapasRestantesLista: remaining
    })

    // Determinar próximo turno e estado
    let nextTurn: string | null = team === 'A' ? 'B' : 'A'
    let newState = match.state
    let finishedAt: string | null = null

    // Se restar apenas 1 mapa após este ban, finalizar a partida
    // (quando alguém bane o penúltimo mapa, o último fica como escolhido)
    if (remaining.length === 1) {
      console.log('🎯 FINALIZANDO PARTIDA - Mapa escolhido:', remaining[0])
      newState = 'finished'
      finishedAt = new Date().toISOString()
      nextTurn = null
    } else {
      console.log('⏳ Partida continua - Próximo turno:', nextTurn)
    }

    // Atualizar banco
    console.log('Atualizando partida:', {
      id: match.id,
      newState,
      nextTurn,
      finishedAt,
      remainingCount: remaining.length,
      updatedBansCount: updatedBans.length
    })
    
    try {
      if (newState === 'finished') {
        // Quando finaliza, atualizar com finished_at
        await client.execute({
          sql: `UPDATE matches SET 
            bans = ?, 
            current_turn = ?, 
            state = ?, 
            finished_at = ?
            WHERE id = ?`,
          args: [
            JSON.stringify(updatedBans),
            null, // current_turn NULL quando finaliza
            newState,
            finishedAt,
            match.id
          ]
        })
      } else {
        // Quando não finaliza, não atualizar finished_at
        await client.execute({
          sql: `UPDATE matches SET 
            bans = ?, 
            current_turn = ?, 
            state = ?
            WHERE id = ?`,
          args: [
            JSON.stringify(updatedBans),
            nextTurn,
            newState,
            match.id
          ]
        })
      }
      console.log('Partida atualizada com sucesso')
    } catch (dbError) {
      console.error('Erro ao atualizar banco:', dbError)
      throw dbError
    }

    return NextResponse.json({
      ok: true,
      state: newState,
      current_turn: nextTurn,
      remaining,
      final_map: remaining.length === 1 ? remaining[0] : null
    })
  } catch (error) {
    console.error('Error processing ban:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

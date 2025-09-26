import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar se a partida existe
    const result = await client.execute({
      sql: 'SELECT * FROM matches WHERE id = ?',
      args: [id]
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Partida não encontrada' },
        { status: 404 }
      )
    }

    // Deletar a partida
    await client.execute({
      sql: 'DELETE FROM matches WHERE id = ?',
      args: [id]
    })

    return NextResponse.json({
      success: true,
      message: 'Partida deletada com sucesso'
    })
  } catch (error) {
    console.error('Error deleting match:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

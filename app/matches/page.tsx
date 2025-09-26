'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Match {
  id: string
  slug: string
  teamA_name: string
  teamB_name: string
  state: 'created' | 'in_progress' | 'finished'
  current_turn: 'A' | 'B' | null
  created_at: string
  finished_at: string | null
  final_map: string | null
  bans_count: number
  total_maps: number
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      if (!response.ok) {
        throw new Error('Erro ao carregar partidas')
      }
      const data = await response.json()
      setMatches(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar partidas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
    
    // Atualizar a cada 10 segundos
    const interval = setInterval(fetchMatches, 10000)
    return () => clearInterval(interval)
  }, [])

  const getStateText = (state: string) => {
    switch (state) {
      case 'created': return 'Criada'
      case 'in_progress': return 'Em Andamento'
      case 'finished': return 'Finalizada'
      default: return state
    }
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'created': return '#f39c12'
      case 'in_progress': return '#3498db'
      case 'finished': return '#27ae60'
      default: return '#95a5a6'
    }
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Carregando partidas...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Todas as Partidas</h1>
        <Link href="/" style={{ 
          textDecoration: 'none',
          backgroundColor: '#3498db',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '4px',
          fontWeight: '600'
        }}>
          + Nova Partida
        </Link>
      </div>

      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
          <h3>Nenhuma partida encontrada</h3>
          <p>Crie sua primeira partida para começar!</p>
          <Link href="/" style={{ 
            textDecoration: 'none',
            backgroundColor: '#3498db',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            fontWeight: '600',
            display: 'inline-block',
            marginTop: '20px'
          }}>
            Criar Partida
          </Link>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-header">
                <h3>{match.teamA_name} vs {match.teamB_name}</h3>
                <div 
                  className="match-status"
                  style={{ backgroundColor: getStateColor(match.state) }}
                >
                  {getStateText(match.state)}
                </div>
              </div>

              <div className="match-info">
                <p><strong>Criada em:</strong> {formatDate(match.created_at)}</p>
                
                {match.state === 'in_progress' && (
                  <p><strong>Vez de:</strong> {match.current_turn === 'A' ? match.teamA_name : match.teamB_name}</p>
                )}
                
                {match.state === 'finished' && match.finished_at && (
                  <p><strong>Finalizada em:</strong> {formatDate(match.finished_at)}</p>
                )}

                <p><strong>Progresso:</strong> {match.bans_count}/{match.total_maps} mapas banidos</p>
                
                {match.state === 'finished' && match.final_map && (
                  <div className="final-map">
                    <strong>🏆 Mapa Final:</strong> {match.final_map}
                  </div>
                )}
              </div>

              <div className="match-actions">
                <Link 
                  href={`/bans/${match.slug}`}
                  style={{
                    textDecoration: 'none',
                    backgroundColor: '#3498db',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Ver Partida
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#7f8c8d' }}>
        <p>Atualização automática a cada 10 segundos</p>
      </div>
    </div>
  )
}

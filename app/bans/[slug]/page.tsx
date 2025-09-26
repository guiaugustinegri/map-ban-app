'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface MatchData {
  slug: string
  teamA: string
  teamB: string
  state: 'created' | 'in_progress' | 'finished'
  map_pool: string[]
  bans: Array<{
    map: string
    by: 'A' | 'B'
    at: string
  }>
  remaining: string[]
  current_turn: 'A' | 'B' | null
  final_map: string | null
}

export default function PublicMatchPage() {
  const params = useParams()
  const slug = params.slug as string
  const [match, setMatch] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMatch = async () => {
    try {
      const response = await fetch(`/api/public/${slug}`)
      if (!response.ok) {
        throw new Error('Partida não encontrada')
      }
      const data = await response.json()
      setMatch(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar partida')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatch()
    
    // Polling a cada 2 segundos
    const interval = setInterval(fetchMatch, 2000)
    return () => clearInterval(interval)
  }, [slug])

  const getStateText = (state: string) => {
    switch (state) {
      case 'created': return 'Criada'
      case 'in_progress': return 'Em Andamento'
      case 'finished': return 'Finalizada'
      default: return state
    }
  }

  const getTurnText = (turn: string | null) => {
    if (!turn) return 'Finalizada'
    return turn === 'A' ? match?.teamA : match?.teamB
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('pt-BR')
  }

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Carregando...
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="container">
        <div className="error">
          {error || 'Partida não encontrada'}
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>{match.teamA} vs {match.teamB}</h1>
      
      <div className={`status ${match.state}`}>
        Status: {getStateText(match.state)}
      </div>

      {match.state === 'in_progress' && (
        <div className={`turn-indicator ${match.current_turn ? 'current' : ''}`}>
          Vez de: {getTurnText(match.current_turn)}
        </div>
      )}

      {match.state === 'finished' && match.final_map && (
        <div className="turn-indicator" style={{ backgroundColor: '#27ae60', color: 'white' }}>
          🏆 Mapa Final: {match.final_map}
        </div>
      )}

      {match.bans.length > 0 && (
        <div>
          <h2>Banimentos</h2>
          <div className="bans-list">
            {match.bans.map((ban, index) => (
              <div key={index} className="ban-item">
                <div>
                  <div className="ban-map">{ban.map}</div>
                  <div className="ban-by">Banido por: {ban.by === 'A' ? match.teamA : match.teamB}</div>
                </div>
                <div className="ban-time">{formatTime(ban.at)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2>Mapas Restantes</h2>
        <div className="maps-grid">
          {match.remaining.map((map, index) => (
            <div 
              key={index} 
              className={`map-card ${match.state === 'finished' && match.remaining.length === 1 ? 'final' : ''}`}
            >
              <div className="map-name">{map}</div>
              {match.state === 'finished' && match.remaining.length === 1 && (
                <div className="map-info">🏆 MAPA FINAL</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#7f8c8d' }}>
        <p>Atualização automática a cada 2 segundos</p>
      </div>
    </div>
  )
}

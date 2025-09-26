'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface MatchData {
  id: string
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const handleDeleteMatch = async () => {
    if (!match) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/matches/${match.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao deletar partida')
      }

      // Redirecionar para a página de partidas
      window.location.href = '/matches'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar partida')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{match.teamA} vs {match.teamB}</h1>
        <button 
          className="btn-danger"
          onClick={() => setShowDeleteConfirm(true)}
          style={{ width: 'auto', padding: '8px 16px' }}
        >
          🗑️ Deletar Partida
        </button>
      </div>
      
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

        {match.bans.length > 0 && (
          <div>
            <h2>Mapas Banidos</h2>
            <div className="maps-grid">
              {match.bans.map((ban, index) => (
                <div key={index} className="map-card banned">
                  <div className="map-name" style={{ position: 'relative' }}>
                    {ban.map}
                    <div style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ✕
                    </div>
                  </div>
                  <div className="map-info">
                    Banido por: {ban.by === 'A' ? match.teamA : match.teamB}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#7f8c8d' }}>
        <p>Atualização automática a cada 2 segundos</p>
      </div>

      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja deletar esta partida?</p>
            <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>
              Esta ação não pode ser desfeita!
            </p>
            <div style={{ marginTop: '20px' }}>
              <button 
                className="btn-danger"
                onClick={handleDeleteMatch}
                disabled={deleting}
                style={{ marginRight: '10px', width: 'auto', padding: '10px 20px' }}
              >
                {deleting ? 'Deletando...' : 'Sim, Deletar'}
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                style={{ width: 'auto', padding: '10px 20px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

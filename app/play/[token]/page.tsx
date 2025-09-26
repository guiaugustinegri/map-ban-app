'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface PlayData {
  team: 'A' | 'B'
  opponent: string
  state: 'in_progress' | 'finished'
  current_turn: 'A' | 'B' | null
  remaining: string[]
  final_map: string | null
  public_url: string
}

export default function PlayPage() {
  const params = useParams()
  const token = params.token as string
  const [playData, setPlayData] = useState<PlayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [banning, setBanning] = useState<string | null>(null)

  const fetchPlayData = async () => {
    try {
      const response = await fetch(`/api/play/${token}/ban`)
      if (!response.ok) {
        throw new Error('Token inválido')
      }
      const data = await response.json()
      setPlayData(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayData()
    
    // Polling a cada 2 segundos
    const interval = setInterval(fetchPlayData, 2000)
    return () => clearInterval(interval)
  }, [token])

  const handleBan = async (map: string) => {
    setBanning(map)
    try {
      const response = await fetch(`/api/play/${token}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ map }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao banir mapa')
      }

      // Atualizar dados após banimento
      await fetchPlayData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao banir mapa')
    } finally {
      setBanning(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(window.location.origin + text)
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

  if (error || !playData) {
    return (
      <div className="container">
        <div className="error">
          {error || 'Dados não encontrados'}
        </div>
      </div>
    )
  }

  const isMyTurn = playData.current_turn === playData.team
  const canBan = playData.state === 'in_progress' && isMyTurn

  return (
    <div className="container">
      <h1>Ação do Time {playData.team}</h1>
      
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <p><strong>Adversário:</strong> {playData.opponent}</p>
      </div>

      {playData.state === 'finished' && playData.final_map ? (
        <div>
          <div className="status finished">
            🏆 Mapa Final: {playData.final_map}
          </div>
          
          <div className="waiting">
            Partida finalizada! O mapa escolhido foi <strong>{playData.final_map}</strong>.
          </div>
        </div>
      ) : (
        <div>
          <div className={`status ${playData.state}`}>
            Status: {playData.state === 'in_progress' ? 'Em Andamento' : 'Finalizada'}
          </div>

          {playData.state === 'in_progress' && (
            <div className={`turn-indicator ${isMyTurn ? 'current' : ''}`}>
              Vez de: {playData.current_turn === 'A' ? 'Time A' : 'Time B'}
            </div>
          )}

          {canBan ? (
            <div>
              <h2>Banir um mapa</h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Clique em um mapa para banir:
              </p>
              
              <div className="maps-grid">
                {playData.remaining.map((map, index) => (
                  <button
                    key={index}
                    className="map-card"
                    onClick={() => handleBan(map)}
                    disabled={banning === map}
                    style={{
                      cursor: banning === map ? 'not-allowed' : 'pointer',
                      opacity: banning === map ? 0.6 : 1
                    }}
                  >
                    <div className="map-name">{map}</div>
                    {banning === map && (
                      <div className="map-info">Banindo...</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="waiting">
              {playData.state === 'in_progress' 
                ? 'Aguarde o oponente banir um mapa...'
                : 'Partida finalizada'
              }
            </div>
          )}
        </div>
      )}

      <div className="links-section">
        <h3>Link Público</h3>
        <div className="link-item">
          <div className="link-label">Página de acompanhamento:</div>
          <div className="link-url">
            {playData.public_url}
            <button 
              className="copy-btn" 
              onClick={() => copyToClipboard(playData.public_url)}
            >
              Copiar
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#7f8c8d' }}>
        <p>Atualização automática a cada 2 segundos</p>
      </div>
    </div>
  )
}

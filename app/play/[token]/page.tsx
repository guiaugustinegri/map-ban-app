'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface PlayData {
  team: 'A' | 'B'
  opponent: string
  teamName: string
  opponentName: string
  state: 'in_progress' | 'finished'
  current_turn: 'A' | 'B' | null
  remaining: string[]
  final_map: string | null
  bans: Array<{
    map: string
    by: 'A' | 'B'
    at: string
  }>
}

export default function PlayPage() {
  const params = useParams()
  const token = params.token as string
  const [playData, setPlayData] = useState<PlayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [banning, setBanning] = useState<string | null>(null)
  const [selectedMap, setSelectedMap] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

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

  const handleMapSelect = (map: string) => {
    setSelectedMap(map)
    setShowConfirm(true)
  }

  const handleConfirmBan = async () => {
    if (!selectedMap) return
    
    setBanning(selectedMap)
    setShowConfirm(false)
    
    try {
      const response = await fetch(`/api/play/${token}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ map: selectedMap }),
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
      setSelectedMap(null)
    }
  }

  const handleCancelBan = () => {
    setShowConfirm(false)
    setSelectedMap(null)
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
      <h1>Ação do {playData.teamName}</h1>
      
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <p><strong>Adversário:</strong> {playData.opponentName}</p>
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
              {isMyTurn ? '🎯 SUA VEZ' : '⏳ ESPERE'}
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
                    onClick={() => handleMapSelect(map)}
                    disabled={banning === map || showConfirm}
                    style={{
                      cursor: banning === map || showConfirm ? 'not-allowed' : 'pointer',
                      opacity: banning === map || showConfirm ? 0.6 : 1,
                      backgroundColor: selectedMap === map ? '#e74c3c' : undefined,
                      color: selectedMap === map ? 'white' : undefined,
                      borderColor: selectedMap === map ? '#c0392b' : undefined
                    }}
                  >
                    <div className="map-name">{map}</div>
                    {banning === map && (
                      <div className="map-info">Banindo...</div>
                    )}
                    {selectedMap === map && !banning && (
                      <div className="map-info">Selecionado</div>
                    )}
                  </button>
                ))}
              </div>

              {showConfirm && selectedMap && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '20px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h3>Confirmar Banimento</h3>
                  <p>Você tem certeza que quer banir o mapa <strong>{selectedMap}</strong>?</p>
                  <div style={{ marginTop: '15px' }}>
                    <button 
                      className="btn-danger" 
                      onClick={handleConfirmBan}
                      disabled={banning === selectedMap}
                      style={{ marginRight: '10px', width: 'auto', padding: '10px 20px' }}
                    >
                      {banning === selectedMap ? 'Banindo...' : 'Sim, Banir'}
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={handleCancelBan}
                      disabled={banning === selectedMap}
                      style={{ width: 'auto', padding: '10px 20px' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
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

      {/* Seção de Mapas Banidos */}
      {playData.bans && playData.bans.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2>Mapas Banidos</h2>
          <div className="maps-grid">
            {playData.bans.map((ban, index) => (
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
                  Banido por: {ban.by === 'A' ? playData.teamName : playData.opponentName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      <div style={{ marginTop: '20px', textAlign: 'center', color: '#7f8c8d' }}>
        <p>Atualização automática a cada 2 segundos</p>
      </div>
    </div>
  )
}

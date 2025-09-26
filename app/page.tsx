'use client'

import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({
    teamA_name: '',
    teamB_name: '',
    first_turn: 'random',
    map_pool_type: 'default',
    map_pool: ''
  })

  const rageconTeams = [
    'Blizzard + Subzero',
    'Doob + Voidpointer', 
    'Fear + Kingwitcher',
    'Gaia + Reload',
    'Kolt + Coxudo',
    'Potato + Kinghead',
    'Rage + Ruddah',
    'Talisman + Kenzo'
  ]
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      let mapPool = undefined
      
      if (formData.map_pool_type === 'custom' && formData.map_pool) {
        mapPool = formData.map_pool.split('\n').map(m => m.trim()).filter(m => m)
      }

      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamA_name: formData.teamA_name,
          teamB_name: formData.teamB_name,
          first_turn: formData.first_turn,
          map_pool: mapPool
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar partida')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container">
      <h1>Banimento de Mapas</h1>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {result ? (
        <div>
          <div className="success">
            Partida criada com sucesso!
          </div>
          
          <h2>Links da Partida</h2>
          <div className="links-section">
            <div className="link-item">
              <div className="link-label">Página Pública (Acompanhamento):</div>
              <a 
                href={result.public_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'block',
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: '#3498db',
                  border: '1px solid #bdc3c7',
                  wordBreak: 'break-all'
                }}
              >
                {result.public_url}
              </a>
            </div>
            
            <div className="link-item">
              <div className="link-label">{formData.teamA_name} (Ação):</div>
              <a 
                href={result.teamA_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'block',
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: '#3498db',
                  border: '1px solid #bdc3c7',
                  wordBreak: 'break-all'
                }}
              >
                {result.teamA_url}
              </a>
            </div>
            
            <div className="link-item">
              <div className="link-label">{formData.teamB_name} (Ação):</div>
              <a 
                href={result.teamB_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'block',
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: '#3498db',
                  border: '1px solid #bdc3c7',
                  wordBreak: 'break-all'
                }}
              >
                {result.teamB_url}
              </a>
            </div>
          </div>

          <button 
            className="btn-secondary" 
            onClick={() => {
              setResult(null)
              setFormData({
                teamA_name: '',
                teamB_name: '',
                first_turn: 'random',
                map_pool_type: 'default',
                map_pool: ''
              })
            }}
          >
            Criar Nova Partida
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="teamA_name">Time A:</label>
            <select
              id="teamA_name"
              value={formData.teamA_name}
              onChange={(e) => setFormData({...formData, teamA_name: e.target.value})}
              required
            >
              <option value="">Selecione um time...</option>
              <optgroup label="RageCon #5">
                {rageconTeams.map((team, index) => (
                  <option key={index} value={team}>{team}</option>
                ))}
              </optgroup>
              <option value="custom">Custom (escrever nome)</option>
            </select>
            {formData.teamA_name === 'custom' && (
              <input
                type="text"
                placeholder="Digite o nome do Time A"
                value={formData.teamA_name === 'custom' ? '' : formData.teamA_name}
                onChange={(e) => setFormData({...formData, teamA_name: e.target.value})}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="teamB_name">Time B:</label>
            <select
              id="teamB_name"
              value={formData.teamB_name}
              onChange={(e) => setFormData({...formData, teamB_name: e.target.value})}
              required
            >
              <option value="">Selecione um time...</option>
              <optgroup label="RageCon #5">
                {rageconTeams.map((team, index) => (
                  <option key={index} value={team}>{team}</option>
                ))}
              </optgroup>
              <option value="custom">Custom (escrever nome)</option>
            </select>
            {formData.teamB_name === 'custom' && (
              <input
                type="text"
                placeholder="Digite o nome do Time B"
                value={formData.teamB_name === 'custom' ? '' : formData.teamB_name}
                onChange={(e) => setFormData({...formData, teamB_name: e.target.value})}
                style={{ marginTop: '10px' }}
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="first_turn">Quem começa:</label>
            <select
              id="first_turn"
              value={formData.first_turn}
              onChange={(e) => setFormData({...formData, first_turn: e.target.value})}
            >
              <option value="random">Sortear</option>
              <option value="A">Time A</option>
              <option value="B">Time B</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="map_pool_type">Pool de Mapas:</label>
            <select
              id="map_pool_type"
              value={formData.map_pool_type}
              onChange={(e) => setFormData({...formData, map_pool_type: e.target.value})}
            >
              <option value="default">Mapas Padrão</option>
              <option value="custom">Custom (escrever lista)</option>
            </select>
            {formData.map_pool_type === 'custom' && (
              <textarea
                id="map_pool"
                value={formData.map_pool}
                onChange={(e) => setFormData({...formData, map_pool: e.target.value})}
                placeholder="AWOKEN&#10;BLOOD COVENANT&#10;BLOOD RUN&#10;...&#10;&#10;Um mapa por linha"
                style={{ marginTop: '10px' }}
              />
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Partida'}
          </button>
        </form>
      )}

      <div style={{ marginTop: '40px', textAlign: 'center', color: '#7f8c8d' }}>
        <p>Exemplo de página pública: <a href="/bans/exemplo-vs-teste" target="_blank">/bans/exemplo-vs-teste</a></p>
      </div>
    </div>
  )
}

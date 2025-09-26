'use client'

import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({
    teamA_name: '',
    teamB_name: '',
    first_turn: 'random',
    map_pool: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const mapPool = formData.map_pool
        ? formData.map_pool.split('\n').map(m => m.trim()).filter(m => m)
        : undefined

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
              <div className="link-url">
                {result.public_url}
                <button 
                  className="copy-btn" 
                  onClick={() => copyToClipboard(result.public_url)}
                >
                  Copiar
                </button>
              </div>
            </div>
            
            <div className="link-item">
              <div className="link-label">Time A (Ação):</div>
              <div className="link-url">
                {result.teamA_url}
                <button 
                  className="copy-btn" 
                  onClick={() => copyToClipboard(result.teamA_url)}
                >
                  Copiar
                </button>
              </div>
            </div>
            
            <div className="link-item">
              <div className="link-label">Time B (Ação):</div>
              <div className="link-url">
                {result.teamB_url}
                <button 
                  className="copy-btn" 
                  onClick={() => copyToClipboard(result.teamB_url)}
                >
                  Copiar
                </button>
              </div>
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
            <label htmlFor="teamA_name">Nome do Time A:</label>
            <input
              type="text"
              id="teamA_name"
              value={formData.teamA_name}
              onChange={(e) => setFormData({...formData, teamA_name: e.target.value})}
              required
              placeholder="Ex: Time Alpha"
            />
          </div>

          <div className="form-group">
            <label htmlFor="teamB_name">Nome do Time B:</label>
            <input
              type="text"
              id="teamB_name"
              value={formData.teamB_name}
              onChange={(e) => setFormData({...formData, teamB_name: e.target.value})}
              required
              placeholder="Ex: Time Beta"
            />
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
            <label htmlFor="map_pool">Pool de Mapas (opcional, um por linha):</label>
            <textarea
              id="map_pool"
              value={formData.map_pool}
              onChange={(e) => setFormData({...formData, map_pool: e.target.value})}
              placeholder="AWOKEN&#10;BLOOD COVENANT&#10;BLOOD RUN&#10;...&#10;&#10;Deixe vazio para usar pool padrão"
            />
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

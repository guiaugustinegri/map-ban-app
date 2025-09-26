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

    // Validar se os times são diferentes
    if (formData.teamA_name === formData.teamB_name) {
      setError('Os times devem ser diferentes!')
      setLoading(false)
      return
    }

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
      
      if (data.exists) {
        // Partida já existe
        setResult({
          ...data,
          isExisting: true
        })
      } else {
        // Nova partida criada
        setResult({
          ...data,
          isExisting: false
        })
      }
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
      <h1>Criar Nova Partida</h1>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {result ? (
        <div>
          <div className={result.isExisting ? "status created" : "success"}>
            {result.isExisting ? 'Partida já existe!' : 'Partida criada com sucesso!'}
          </div>
          
          {result.isExisting && (
            <div style={{ 
              backgroundColor: '#f39c12', 
              color: 'white', 
              padding: '15px', 
              borderRadius: '4px', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {result.message}
            </div>
          )}

          {/* Mapa Final Grande */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '28px' }}>🎮 Partida Configurada</h2>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              marginBottom: '10px'
            }}>
              {formData.teamA_name} vs {formData.teamB_name}
            </div>
            <div style={{ 
              fontSize: '16px', 
              opacity: 0.9
            }}>
              Pronto para começar o banimento de mapas!
            </div>
          </div>
          
          <h2>🔗 Links da Partida</h2>
          <div style={{ 
            display: 'grid', 
            gap: '20px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #e9ecef'
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '10px',
                color: '#495057'
              }}>
                📺 Página Pública
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#6c757d', 
                marginBottom: '15px' 
              }}>
                Para acompanhar o progresso
              </div>
              <a 
                href={result.public_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'block',
                  padding: '12px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
              >
                Abrir Página Pública
              </a>
            </div>
            
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #e9ecef'
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '10px',
                color: '#495057'
              }}>
                ⚔️ {formData.teamA_name}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#6c757d', 
                marginBottom: '15px' 
              }}>
                Link de ação para banir mapas
              </div>
              <a 
                href={result.teamA_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'block',
                  padding: '12px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
              >
                Acessar {formData.teamA_name}
              </a>
            </div>
            
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #e9ecef'
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '10px',
                color: '#495057'
              }}>
                ⚔️ {formData.teamB_name}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#6c757d', 
                marginBottom: '15px' 
              }}>
                Link de ação para banir mapas
              </div>
              <a 
                href={result.teamB_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'block',
                  padding: '12px',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#229954'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
              >
                Acessar {formData.teamB_name}
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
                {rageconTeams
                  .filter(team => team !== formData.teamB_name)
                  .map((team, index) => (
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
                {rageconTeams
                  .filter(team => team !== formData.teamA_name)
                  .map((team, index) => (
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

    </div>
  )
}

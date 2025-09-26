'use client'

import { useState, useEffect } from 'react'

interface Match {
  id: string
  slug: string
  teamA_name: string
  teamB_name: string
  teamA_token: string
  teamB_token: string
  state: 'created' | 'in_progress' | 'finished'
  current_turn: 'A' | 'B' | null
  created_at: string
  finished_at: string | null
  final_map: string | null
  bans_count: number
  total_maps: number
  public_url: string
  teamA_url: string
  teamB_url: string
}

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteMode, setDeleteMode] = useState<'selected' | 'all' | null>(null)
  const [showBulkCreate, setShowBulkCreate] = useState(false)
  const [bulkJson, setBulkJson] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/admin/matches')
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
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchMatches, 30000)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const handleSelectMatch = (matchId: string) => {
    const newSelected = new Set(selectedMatches)
    if (newSelected.has(matchId)) {
      newSelected.delete(matchId)
    } else {
      newSelected.add(matchId)
    }
    setSelectedMatches(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedMatches.size === matches.length) {
      setSelectedMatches(new Set())
    } else {
      setSelectedMatches(new Set(matches.map(match => match.id)))
    }
  }

  const handleDeleteSelected = () => {
    if (selectedMatches.size === 0) return
    setDeleteMode('selected')
    setShowDeleteConfirm(true)
  }

  const handleDeleteAll = () => {
    if (matches.length === 0) return
    setDeleteMode('all')
    setShowDeleteConfirm(true)
  }

  const handleBulkCreate = async () => {
    if (!bulkJson.trim()) {
      alert('Por favor, insira o JSON das partidas')
      return
    }

    setCreating(true)
    try {
      const matchesData = JSON.parse(bulkJson)
      
      if (!Array.isArray(matchesData)) {
        throw new Error('JSON deve ser um array de partidas')
      }

      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches: matchesData })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar partidas')
      }

      const result = await response.json()
      
      // Atualizar a lista
      await fetchMatches()
      setBulkJson('')
      setShowBulkCreate(false)
      
      let message = `${result.created} partida(s) criada(s) com sucesso!`
      if (result.errors && result.errors.length > 0) {
        message += `\n\nErros:\n${result.errors.join('\n')}`
      }
      
      alert(message)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar partidas')
    } finally {
      setCreating(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      let matchIds: string[]
      
      if (deleteMode === 'all') {
        matchIds = matches.map(match => match.id)
      } else {
        matchIds = Array.from(selectedMatches)
      }

      const response = await fetch('/api/admin/matches', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchIds })
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar partidas')
      }

      const result = await response.json()
      
      // Atualizar a lista
      await fetchMatches()
      setSelectedMatches(new Set())
      setShowDeleteConfirm(false)
      setDeleteMode(null)
      
      alert(result.message)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao deletar partidas')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <h1>Admin - Gerenciar Partidas</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Carregando partidas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <h1>Admin - Gerenciar Partidas</h1>
        <div className="error">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Admin - Gerenciar Partidas</h1>
      
      {/* Controles de Admin */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '2px solid #e74c3c'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#e74c3c' }}>⚠️ Ações de Administração</h3>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '15px' }}>
          <button
            onClick={() => setShowBulkCreate(!showBulkCreate)}
            style={{
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {showBulkCreate ? 'Cancelar' : '➕ Criar Partidas em Massa'}
          </button>
          
          <button
            onClick={handleSelectAll}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {selectedMatches.size === matches.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
          </button>
          
          <span style={{ color: '#666', fontSize: '14px' }}>
            {selectedMatches.size} de {matches.length} selecionadas
          </span>
          
          <button
            onClick={handleDeleteSelected}
            disabled={selectedMatches.size === 0 || deleting}
            style={{
              backgroundColor: selectedMatches.size === 0 ? '#bdc3c7' : '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: selectedMatches.size === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Deletar Selecionadas ({selectedMatches.size})
          </button>
          
          <button
            onClick={handleDeleteAll}
            disabled={matches.length === 0 || deleting}
            style={{
              backgroundColor: matches.length === 0 ? '#bdc3c7' : '#c0392b',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: matches.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Deletar TODAS ({matches.length})
          </button>
        </div>

        {/* Interface de Criação em Massa */}
        {showBulkCreate && (
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '15px', 
            borderRadius: '6px',
            border: '1px solid #27ae60'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#27ae60' }}>📝 Criar Partidas em Massa</h4>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
              Cole o JSON com as partidas. Formato:
            </p>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '4px', 
              fontSize: '12px',
              margin: '0 0 10px 0',
              overflow: 'auto'
            }}>
{`[
  {
    "teamA_name": "Rage + Ruddah",
    "teamB_name": "Potato + Kinghead"
  },
  {
    "teamA_name": "Gaia + Reload",
    "teamB_name": "Fear + Kingwitcher",
    "map_pool": ["AWOKEN", "BLOOD RUN", "CORRUPTED KEEP"],
    "first_turn": "A"
  }
]`}
            </pre>
            <textarea
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
              placeholder="Cole o JSON das partidas aqui..."
              style={{
                width: '100%',
                height: '150px',
                padding: '10px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                marginBottom: '10px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleBulkCreate}
                disabled={creating || !bulkJson.trim()}
                style={{
                  backgroundColor: creating ? '#bdc3c7' : '#27ae60',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {creating ? 'Criando...' : 'Criar Partidas'}
              </button>
              <button
                onClick={() => {
                  setBulkJson('')
                  setShowBulkCreate(false)
                }}
                style={{
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação */}
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
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#e74c3c', marginBottom: '20px' }}>
              ⚠️ Confirmar Exclusão
            </h3>
            <p style={{ marginBottom: '20px' }}>
              {deleteMode === 'all' 
                ? `Tem certeza que deseja deletar TODAS as ${matches.length} partidas?`
                : `Tem certeza que deseja deletar as ${selectedMatches.size} partidas selecionadas?`
              }
            </p>
            <p style={{ color: '#e74c3c', fontWeight: 'bold', marginBottom: '20px' }}>
              Esta ação não pode ser desfeita!
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteMode(null)
                }}
                style={{
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: deleting ? 'not-allowed' : 'pointer'
                }}
              >
                {deleting ? 'Deletando...' : 'Sim, Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Partidas */}
      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
          <h3>Nenhuma partida encontrada</h3>
          <p>Não há partidas para gerenciar no momento.</p>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <table className="matches-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedMatches.size === matches.length && matches.length > 0}
                    onChange={handleSelectAll}
                    style={{ transform: 'scale(1.2)' }}
                  />
                </th>
                <th>Partida</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Progresso</th>
                <th style={{ textAlign: 'center' }}>Criada em</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match, index) => (
                <tr key={match.id}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedMatches.has(match.id)}
                      onChange={() => handleSelectMatch(match.id)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {/* Time A */}
                      <div style={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        minWidth: '120px',
                        textAlign: 'center'
                      }}>
                        {match.teamA_name}
                      </div>
                      
                      {/* VS */}
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#7f8c8d',
                        minWidth: '30px',
                        textAlign: 'center'
                      }}>
                        VS
                      </div>
                      
                      {/* Time B */}
                      <div style={{
                        backgroundColor: '#27ae60',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        minWidth: '120px',
                        textAlign: 'center'
                      }}>
                        {match.teamB_name}
                      </div>
                    </div>
                    
                    {match.state === 'finished' && match.final_map && (
                      <div style={{ 
                        marginTop: '8px', 
                        fontSize: '14px', 
                        color: '#27ae60',
                        fontWeight: '600',
                        textAlign: 'center',
                        backgroundColor: '#d5f4e6',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        🏆 {match.final_map}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span 
                      style={{ 
                        backgroundColor: getStateColor(match.state),
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}
                    >
                      {getStateText(match.state)}
                    </span>
                    {match.state === 'in_progress' && (
                      <div style={{ 
                        marginTop: '4px', 
                        fontSize: '11px', 
                        color: '#666' 
                      }}>
                        Vez: {match.current_turn === 'A' ? match.teamA_name : match.teamB_name}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>
                      {match.bans_count}/{match.total_maps}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      mapas banidos
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '14px' }}>
                    {formatDate(match.created_at)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-buttons">
                      <a 
                        href={match.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-button observe"
                      >
                        📺 Observar
                      </a>
                      <a 
                        href={match.teamA_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-button team-a"
                      >
                        ⚔️ {match.teamA_name.split(' ')[0]}
                      </a>
                      <a 
                        href={match.teamB_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-button team-b"
                      >
                        ⚔️ {match.teamB_name.split(' ')[0]}
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#7f8c8d' }}>
        <p>Atualização automática a cada 30 segundos</p>
      </div>
    </div>
  )
}

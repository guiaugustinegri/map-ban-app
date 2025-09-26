'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      if (!response.ok) {
        throw new Error('Erro ao carregar partidas')
      }
      const data = await response.json()
      setMatches(data)
      setFilteredMatches(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar partidas')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar partidas baseado no termo de busca
  const filterMatches = (term: string) => {
    if (!term.trim()) {
      setFilteredMatches(matches)
      return
    }

    const filtered = matches.filter(match => 
      match.teamA_name.toLowerCase().includes(term.toLowerCase()) ||
      match.teamB_name.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredMatches(filtered)
  }

  // Atualizar filtro quando o termo de busca muda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    filterMatches(term)
  }

  useEffect(() => {
    fetchMatches()
    
    // Atualizar a cada 10 segundos
    const interval = setInterval(fetchMatches, 10000)
    return () => clearInterval(interval)
  }, [])

  // Atualizar filtro quando matches mudam
  useEffect(() => {
    filterMatches(searchTerm)
  }, [matches, searchTerm])

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
      <h1>Todas as Partidas</h1>
      
      {/* Campo de busca */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Buscar por dupla (ex: Rage, Potato, etc.)"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            backgroundColor: '#f8f9fa'
          }}
        />
      </div>

      {filteredMatches.length === 0 ? (
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
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <table className="matches-table">
            <thead>
              <tr>
                <th>Partida</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Progresso</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((match, index) => (
                <tr key={match.id}>
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
        <p>Atualização automática a cada 10 segundos</p>
      </div>
    </div>
  )
}

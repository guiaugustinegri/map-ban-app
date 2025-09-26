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
  const [statusFilter, setStatusFilter] = useState('all')

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

  // Extrair lista única de duplas dos matches
  const getUniqueTeams = () => {
    const teams = new Set<string>()
    matches.forEach(match => {
      teams.add(match.teamA_name)
      teams.add(match.teamB_name)
    })
    return Array.from(teams).sort()
  }

  // Filtrar partidas baseado na dupla e status selecionados
  const filterMatches = (selectedTeam: string, selectedStatus: string) => {
    let filtered = matches

    // Filtro por dupla
    if (selectedTeam && selectedTeam !== 'all') {
      filtered = filtered.filter(match => 
        match.teamA_name === selectedTeam || match.teamB_name === selectedTeam
      )
    }

    // Filtro por status
    if (selectedStatus && selectedStatus !== 'all') {
      if (selectedStatus === 'open') {
        // Abertas: criadas ou em andamento
        filtered = filtered.filter(match => 
          match.state === 'created' || match.state === 'in_progress'
        )
      } else if (selectedStatus === 'finished') {
        // Finalizadas
        filtered = filtered.filter(match => match.state === 'finished')
      }
    }

    setFilteredMatches(filtered)
  }

  // Atualizar filtro quando a dupla selecionada muda
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTeam = e.target.value
    setSearchTerm(selectedTeam)
    filterMatches(selectedTeam, statusFilter)
  }

  // Atualizar filtro quando o status selecionado muda
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStatus = e.target.value
    setStatusFilter(selectedStatus)
    filterMatches(searchTerm, selectedStatus)
  }

  useEffect(() => {
    fetchMatches()
    
    // Atualizar a cada 10 segundos
    const interval = setInterval(fetchMatches, 10000)
    return () => clearInterval(interval)
  }, [])

  // Atualizar filtro quando matches mudam
  useEffect(() => {
    filterMatches(searchTerm, statusFilter)
  }, [matches, searchTerm, statusFilter])

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
      
      {/* Filtros */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        marginBottom: '20px' 
      }}>
        {/* Filtro por status */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600', 
            color: '#555' 
          }}>
            📊 Status:
          </label>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: '#f8f9fa',
              cursor: 'pointer'
            }}
          >
            <option value="all">Todas as partidas</option>
            <option value="open">Abertas (não finalizadas)</option>
            <option value="finished">Finalizadas</option>
          </select>
        </div>

        {/* Filtro por dupla */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600', 
            color: '#555' 
          }}>
            🔍 Dupla:
          </label>
          <select
            value={searchTerm}
            onChange={handleTeamChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: '#f8f9fa',
              cursor: 'pointer'
            }}
          >
            <option value="all">Todas as duplas</option>
            {getUniqueTeams().map(team => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contador de resultados */}
      {(searchTerm !== 'all' || statusFilter !== 'all') && (
        <div style={{ 
          marginBottom: '20px', 
          fontSize: '14px', 
          color: '#666',
          textAlign: 'center',
          backgroundColor: '#e8f4f8',
          padding: '10px',
          borderRadius: '6px'
        }}>
          {filteredMatches.length} partida(s) encontrada(s)
          {searchTerm !== 'all' && ` para "${searchTerm}"`}
          {statusFilter !== 'all' && (
            statusFilter === 'open' ? ' (abertas)' : ' (finalizadas)'
          )}
        </div>
      )}

      {filteredMatches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
          {(searchTerm !== 'all' || statusFilter !== 'all') ? (
            <>
              <h3>Nenhuma partida encontrada</h3>
              <p>
                {searchTerm !== 'all' && `para a dupla "${searchTerm}"`}
                {searchTerm !== 'all' && statusFilter !== 'all' && ' e '}
                {statusFilter !== 'all' && (
                  statusFilter === 'open' ? 'que estejam abertas' : 'que estejam finalizadas'
                )}
              </p>
              <p>Tente ajustar os filtros acima</p>
            </>
          ) : (
            <>
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
            </>
          )}
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

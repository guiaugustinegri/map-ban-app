'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav style={{
      backgroundColor: '#2c3e50',
      padding: '15px 0',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link 
          href="/" 
          style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontSize: '20px',
            fontWeight: 'bold'
          }}
        >
          🎮 Banimento de Mapas
        </Link>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link 
            href="/" 
            style={{ 
              color: pathname === '/' ? '#3498db' : 'white', 
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              backgroundColor: pathname === '/' ? 'rgba(52, 152, 219, 0.2)' : 'transparent',
              transition: 'all 0.3s'
            }}
          >
            Criar Partida
          </Link>
          <Link 
            href="/matches" 
            style={{ 
              color: pathname === '/matches' ? '#3498db' : 'white', 
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              backgroundColor: pathname === '/matches' ? 'rgba(52, 152, 219, 0.2)' : 'transparent',
              transition: 'all 0.3s'
            }}
          >
            Partidas Criadas
          </Link>
        </div>
      </div>
    </nav>
  )
}

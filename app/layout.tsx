import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Banimento de Mapas',
  description: 'Aplicativo para gerenciar banimento de mapas entre dois times',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

export function generateSlug(teamA: string, teamB: string): string {
  const normalize = (str: string) => 
    str.toLowerCase()
       .replace(/[^a-z0-9]/g, '-')
       .replace(/-+/g, '-')
       .replace(/^-|-$/g, '')
  
  return `${normalize(teamA)}-vs-${normalize(teamB)}`
}

export function generateToken(): string {
  const chars = '0123456789abcdef'
  let result = ''
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const DEFAULT_MAP_POOL = [
  'AWOKEN',
  'BLOOD COVENANT', 
  'BLOOD RUN',
  'CORRUPTED KEEP',
  'DEEP EMBRACE',
  'MOLTEN FALLS',
  'RUINS OF SARNATH',
  'VALE OF PNATH',
  'VESTIBULE OF EXILE',
  'INSOMNIA'
]

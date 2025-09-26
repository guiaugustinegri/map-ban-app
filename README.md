# Aplicativo de Banimento de Mapas

Um aplicativo web mínimo para gerenciar banimento de mapas entre dois times até restar um único mapa para a partida.

## Características

- ✅ Zero autenticação - sem login necessário
- ✅ Interface simples e intuitiva em português
- ✅ URLs públicas para acompanhamento e privadas para ação
- ✅ Atualização em tempo real via polling
- ✅ Banco de dados SQLite compatível com serverless (Turso/libSQL)
- ✅ Deploy simples na Vercel

## Stack Tecnológica

- **Framework**: Next.js 14 com App Router
- **Banco de Dados**: SQLite via Turso/libSQL
- **Deploy**: Vercel
- **Estilização**: CSS puro (sem dependências de UI)

## Configuração Local

### 1. Instalar dependências

```bash
npm install
# ou
pnpm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp env.example .env.local
```

Edite `.env.local`:

```env
# Para desenvolvimento local
TURSO_DB_URL=file:local.db
TURSO_AUTH_TOKEN=

# URL base da aplicação
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Aplicar schema do banco

```bash
npm run db:push
```

### 4. Executar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Deploy na Vercel

### 1. Configurar Turso (banco de dados)

1. Crie uma conta em [turso.tech](https://turso.tech)
2. Crie um novo banco de dados
3. Obtenha a URL do banco e o token de autenticação

### 2. Deploy na Vercel

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente:

```
TURSO_DB_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=seu-token-aqui
NEXT_PUBLIC_BASE_URL=https://seu-app.vercel.app
```

3. Faça o deploy

### 3. Aplicar schema no banco de produção

Após o deploy, execute o comando para aplicar o schema:

```bash
npm run db:push
```

## Como Usar

### 1. Criar uma Partida

1. Acesse a página inicial
2. Preencha os nomes dos times
3. Escolha quem começa (A, B ou Sortear)
4. Opcionalmente, defina uma pool de mapas personalizada
5. Clique em "Criar Partida"

### 2. Gerenciar a Partida

O sistema gera três URLs:

- **Página Pública**: Para acompanhar o progresso
- **URL do Time A**: Para o Time A banir mapas
- **URL do Time B**: Para o Time B banir mapas

### 3. Banir Mapas

1. Cada time acessa sua URL privada
2. Quando for sua vez, clica no mapa que quer banir
3. O sistema alterna automaticamente entre os times
4. Quando restar apenas um mapa, a partida é finalizada

## API Endpoints

### Criar Partida
```
POST /api/matches
```

### Dados Públicos
```
GET /api/public/:slug
```

### Estado da Partida (Time)
```
GET /api/play/:token/ban
```

### Banir Mapa
```
POST /api/play/:token/ban
```

## Pool de Mapas Padrão

Se nenhuma pool for fornecida, o sistema usa:

- AWOKEN
- BLOOD COVENANT
- BLOOD RUN
- CORRUPTED KEEP
- DEEP EMBRACE
- MOLTEN FALLS
- RUINS OF SARNATH
- VALE OF PNATH
- VESTIBULE OF EXILE
- INSOMNIA

## Estrutura do Projeto

```
├── app/
│   ├── api/
│   │   ├── matches/route.ts          # Criar partidas
│   │   ├── public/[slug]/route.ts    # Dados públicos
│   │   └── play/[token]/ban/route.ts # Ações dos times
│   ├── bans/[slug]/page.tsx          # Página pública
│   ├── play/[token]/page.tsx         # Página privada
│   ├── globals.css                   # Estilos
│   ├── layout.tsx                    # Layout principal
│   └── page.tsx                      # Página inicial
├── lib/
│   ├── db.ts                         # Configuração do banco
│   ├── schema.sql                    # Schema do banco
│   └── slug.ts                       # Utilitários
├── scripts/
│   └── db-push.js                    # Script para aplicar schema
└── README.md
```

## Testes Manuais

1. ✅ Criar partida com pool padrão e first_turn random
2. ✅ Verificar URLs retornadas
3. ✅ Abrir página pública e ambas privadas
4. ✅ Verificar vez inicial correta
5. ✅ Banir mapa pelo time correto
6. ✅ Verificar alternância de turno
7. ✅ Tentar banir fora do turno (erro 400)
8. ✅ Tentar banir mapa inexistente (erro 400)
9. ✅ Completar até restar 1 mapa
10. ✅ Verificar finalização e mapa final
11. ✅ Verificar persistência após refresh

## Segurança

- Tokens são gerados aleatoriamente e não são expostos publicamente
- Validação de turnos impede ações fora de ordem
- Rate limiting básico via estado do servidor
- Transações garantem consistência dos dados

## Performance

- Consultas otimizadas com índices
- Respostas JSON pequenas
- Polling de 2 segundos para atualizações
- Sem dependências pesadas de UI

## Licença

MIT

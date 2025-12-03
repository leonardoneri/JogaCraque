# Backend do JogaCraque

Backend do jogo MMO de gerenciamento de futebol.

## Estrutura

```
backend/
├── src/
│   ├── index.ts          # Entry point do servidor
│   ├── routes/           # Rotas da API (TODO)
│   ├── controllers/      # Controllers (TODO)
│   ├── services/         # Lógica de negócio (TODO)
│   ├── models/           # Modelos de dados (TODO)
│   └── types/            # Definições de tipos (TODO)
├── package.json
├── tsconfig.json
└── .env.example
```

## Instalação

```bash
npm install
```

## Configuração

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

## Execução

### Desenvolvimento
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Produção
```bash
npm start
```

## Endpoints

- `GET /health` - Health check do servidor

## WebSocket Events (TODO)

- `matchmaking:search` - Buscar partida
- `match:action` - Ações durante a partida
- `market:buy` - Comprar jogador no mercado

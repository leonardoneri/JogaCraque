# Frontend do JogaCraque

Aplicação frontend do jogo MMO de gerenciamento de futebol.

## Estrutura

```
frontend/
├── src/
│   ├── components/       # Componentes React
│   ├── pages/           # Páginas da aplicação
│   ├── context/         # Context API
│   ├── services/        # Serviços e lógica de jogo
│   ├── types.ts         # Definições de tipos
│   ├── App.tsx          # Componente principal
│   └── index.tsx        # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Instalação

```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do frontend com:

```
GEMINI_API_KEY=sua_chave_api_aqui
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

### Preview
```bash
npm run preview
```

## Páginas

- `/` - Dashboard
- `/squad` - Gerenciamento do elenco
- `/market` - Mercado de jogadores
- `/match` - Partidas
- `/admin` - Painel administrativo

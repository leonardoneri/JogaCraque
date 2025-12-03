# JogaCraque MMO

Um jogo MMO de gerenciamento de futebol desenvolvido com React e Node.js.

## 📁 Estrutura do Projeto

```
JogaCraque/
├── frontend/           # Aplicação React
│   ├── src/
│   │   ├── components/ # Componentes reutilizáveis
│   │   ├── pages/      # Páginas da aplicação
│   │   ├── context/    # Context API
│   │   ├── services/   # Serviços e lógica
│   │   ├── types.ts    # Definições de tipos
│   │   ├── App.tsx     # Componente principal
│   │   └── index.tsx   # Entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── backend/            # Servidor Node.js
    ├── src/
    │   └── index.ts    # Entry point do servidor
    ├── package.json
    ├── tsconfig.json
    └── .env.example
```

## 🚀 Como Executar

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure suas variáveis de ambiente no arquivo .env
npm run dev
```

O backend estará disponível em `http://localhost:3001`

## 🛠️ Tecnologias

### Frontend
- React 19
- TypeScript
- Vite
- React Router DOM
- Lucide React (ícones)
- Google Gemini AI

### Backend
- Node.js
- TypeScript
- Express
- Socket.IO
- CORS

## 📝 Próximos Passos

- [ ] Implementar WebSocket real (substituir mock)
- [ ] Criar rotas de API REST
- [ ] Implementar autenticação
- [ ] Adicionar banco de dados
- [ ] Sistema de matchmaking real
- [ ] Deploy da aplicação


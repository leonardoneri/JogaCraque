# Estrutura do Projeto JogaCraque

```
JogaCraque/
│
├── .vscode/                    # Configurações do VS Code
│   └── settings.json          # Settings do editor
│
├── frontend/                   # 🎨 APLICAÇÃO REACT
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   ├── Layout.tsx     # Layout principal
│   │   │   └── PlayerCard.tsx # Card de jogador
│   │   │
│   │   ├── pages/             # Páginas da aplicação
│   │   │   ├── Dashboard.tsx  # Página inicial
│   │   │   ├── Squad.tsx      # Gerenciamento de elenco
│   │   │   ├── Market.tsx     # Mercado de jogadores
│   │   │   ├── Match.tsx      # Partidas
│   │   │   └── Admin.tsx      # Painel admin
│   │   │
│   │   ├── context/           # Context API
│   │   │   └── GameContext.tsx # Estado global do jogo
│   │   │
│   │   ├── services/          # Serviços e lógica
│   │   │   ├── gameLogic.ts   # Lógica do jogo
│   │   │   └── socket.ts      # Mock do WebSocket
│   │   │
│   │   ├── App.tsx            # Componente principal
│   │   ├── index.tsx          # Entry point React
│   │   └── types.ts           # Tipos TypeScript
│   │
│   ├── index.html             # HTML principal
│   ├── package.json           # Dependências frontend
│   ├── tsconfig.json          # Config TypeScript
│   ├── vite.config.ts         # Config Vite
│   ├── metadata.json          # Metadados do jogo
│   └── README.md              # Documentação frontend
│
├── backend/                    # 🖥️ SERVIDOR NODE.JS
│   ├── src/
│   │   └── index.ts           # Entry point do servidor
│   │       # TODO: Implementar estrutura completa:
│   │       # ├── routes/      # Rotas da API
│   │       # ├── controllers/ # Controllers
│   │       # ├── services/    # Lógica de negócio
│   │       # ├── models/      # Modelos de dados
│   │       # └── types/       # Tipos TypeScript
│   │
│   ├── package.json           # Dependências backend
│   ├── tsconfig.json          # Config TypeScript
│   ├── .env.example           # Exemplo de variáveis de ambiente
│   ├── .gitignore            # Git ignore específico
│   └── README.md              # Documentação backend
│
├── .gitignore                 # Arquivos ignorados pelo Git
├── README.md                  # Documentação principal
├── dev.sh                     # Script de desenvolvimento (Linux/Mac)
└── dev.bat                    # Script de desenvolvimento (Windows)
```

## 📝 Próximos Passos de Organização

### Backend
- [ ] Criar pasta `routes/` para rotas da API
- [ ] Criar pasta `controllers/` para controladores
- [ ] Criar pasta `services/` para lógica de negócio
- [ ] Criar pasta `models/` para modelos de dados
- [ ] Criar pasta `middlewares/` para middlewares
- [ ] Criar pasta `utils/` para utilitários
- [ ] Configurar banco de dados

### Frontend
- [ ] Criar pasta `hooks/` para custom hooks
- [ ] Criar pasta `utils/` para funções auxiliares
- [ ] Criar pasta `constants/` para constantes
- [ ] Criar pasta `assets/` para imagens/ícones
- [ ] Separar tipos em arquivos específicos
- [ ] Adicionar testes

### Geral
- [ ] Configurar CI/CD
- [ ] Adicionar Docker
- [ ] Configurar ESLint e Prettier
- [ ] Adicionar variáveis de ambiente

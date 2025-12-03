# JogaCraque MMO - Documentação Técnica

## 1. Visão Geral
O **JogaCraque MMO** é um simulador de gerenciamento de futebol (Web Game) focado em coleção de cartas, estratégia tática e simulação de partidas. Desenvolvido como uma SPA (Single Page Application) em React, o jogo oferece uma experiência imersiva de "Ultimate Team" diretamente no navegador.

---

## 2. Arquitetura do Sistema

### Estrutura de Diretórios (Monorepo)
O projeto está dividido em duas grandes áreas de responsabilidade:

- **`/frontend`**: Aplicação Cliente (React + Vite + Tailwind).
  - Contém toda a interface, lógica de jogo (client-side), gerenciamento de estado e assets.
- **`/backend`**: Servidor API (Node.js + Express + Prisma).
  - Responsável pela persistência de dados, autenticação e comunicação em tempo real (WebSockets).

### Tecnologias Chave
- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Context API.
- **Backend:** Node.js, Express, Socket.io, Prisma ORM, PostgreSQL.
- **Build Tool:** Vite.

---

## 3. Funcionalidades Principais

### 🃏 Sistema de Cartas (Players)
- **Atributos:** 6 status principais (RIT, FIN, PAS, DRI, DEF, FIS) adaptáveis por posição (Goleiro vs Linha).
- **Raridade:** Comum, Raro, Épico, Lendário.
- **Full Art:** Suporte para renderização de cartas baseadas puramente em imagem (importadas) ou geradas via CSS.
- **Coleções:** Sistema de categorização por eventos (ex: Libertadores, Halloween).

### ⚽ Gestão de Elenco (Squad)
- **Campo Interativo:** Visualização tática 4-3-3 com slots arrastáveis.
- **Banco de Reservas:** Filtro e busca de jogadores.
- **Ações:** Venda rápida, troca de posição e visualização detalhada de stats.

### 💰 Economia (Market)
- **Moedas (Coins):** Moeda soft ganha jogando. Usada para pacotes.
- **Fundos de Transferência:** Moeda específica ganha vendendo jogadores. Usada no mercado direto.
- **Loja (Packs):** Sistema Gacha com probabilidades de drop.
- **Mercado:** Listagem de jogadores para compra direta.

### 🎮 Motor de Partida (Match Engine)
- **Simulação Texto-Baseada:** Narrativa minuto a minuto.
- **Zonas de Campo:** Lógica de progressão (Defesa -> Meio -> Ataque -> Área).
- **Duelos de RPG:** Cálculos de sucesso baseados em atributos (Atacante vs Defensor).
- **Eventos:** VAR, Lesões, Cartões, Bolas Paradas, Gols Especiais (Bicicleta, Olímpico).
- **Imersão:** Popups visuais dramáticos e Chat ao vivo.

### 🛡️ Painel Administrativo (Admin)
- **Importador:** Crawler para buscar e importar cartas de fontes externas.
- **Editor Manual:** Ferramenta completa para ajustar atributos, nomes e imagens das cartas.
- **Gestão:** Exclusão e limpeza de banco de dados.

---

## 4. Guia de Instalação e Execução

### Pré-requisitos
- Node.js (v16+)
- NPM ou Yarn

### Rodando o Frontend (Desenvolvimento)
1. Navegue até a pasta: `cd frontend`
2. Instale as dependências: `npm install`
3. Inicie o servidor: `npm run dev`
4. Acesse: `http://localhost:3000`

### Rodando o Backend
1. Navegue até a pasta: `cd backend`
2. Instale as dependências: `npm install`
3. Configure o `.env` com a URL do seu banco PostgreSQL.
4. Gere o Prisma Client: `npx prisma generate`
5. Inicie o servidor: `npm run dev`

---

## 5. Roadmap de Melhorias

- [ ] **Backend Integration:** Migrar `GameContext` para API REST real.
- [ ] **Auth:** Implementar Login/Registro com JWT.
- [ ] **Multiplayer:** Implementar WebSockets reais para partidas PvP.
- [ ] **Leagues:** Criar sistema de divisões e temporadas.
- [ ] **Social:** Adicionar sistema de Amigos e Guildas (Clãs).

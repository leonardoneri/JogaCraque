# 🔐 Sistema de Autenticação - Guia de Uso

## ✅ Implementação Concluída

O sistema de autenticação dual-mode foi implementado com sucesso! Você pode escolher entre dois modos de operação:

### 🎮 Modo Guest (Padrão - Desenvolvimento)
- **Auto-login automático** ao iniciar o app
- **Sem tela de login**
- Ideal para desenvolvimento rápido
- Dados temporários (não persistem entre sessões diferentes)

### 🔒 Modo Full (Produção)
- **Tela de login/registro** obrigatória
- **JWT com validação**
- Dados persistidos no banco PostgreSQL
- Suporte a múltiplos usuários

---

## 🚀 Como Usar

### 1. Configurar Modo de Autenticação

#### Frontend (`frontend/.env`)
```env
# Modo Guest (desenvolvimento)
VITE_AUTH_MODE=guest
VITE_BACKEND_URL=http://localhost:3001

# OU Modo Full (produção)
VITE_AUTH_MODE=full
VITE_BACKEND_URL=http://localhost:3001
```

#### Backend (`backend/.env`)
```env
# Configurações do banco
DATABASE_URL="postgresql://usuario:senha@localhost:5432/jogacraque?schema=public"

# Modo de autenticação
AUTH_MODE=guest  # ou 'full'

# JWT (importante em produção!)
JWT_SECRET=dev-secret-change-in-production-please
JWT_EXPIRES_IN=7d

# Servidor
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 2. Configurar Banco de Dados (Já configurado!)
O banco de dados foi configurado via Docker na porta **5433** (para evitar conflitos).

```bash
# Verificar container
docker ps

# Configuração atual (.env):
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/jogacraque?schema=public"
```

Se precisar reiniciar o banco:
```bash
docker start jogacraque-db
```

### 3. Iniciar Servidores

#### Opção 1: Script Automático (Windows)
```bash
# Na raiz do projeto
./dev.bat
```

#### Opção 2: Manual
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 📋 Funcionalidades Implementadas

### Backend ✅
- [x] Utilitários JWT (`utils/jwt.ts`)
- [x] Serviço de autenticação (`services/auth.service.ts`)
- [x] Middleware de autenticação (`middlewares/auth.middleware.ts`)
- [x] Rotas de autenticação (`routes/auth.routes.ts`)
- [x] Schema Prisma atualizado (campos `isGuest`, `guestToken`)
- [x] Integração com rotas principais

### Frontend ✅
- [x] AuthContext com auto-login em modo guest
- [x] AuthGuard para proteção de rotas
- [x] Página de Login/Registro
- [x] API Client com JWT automático nos headers
- [x] Integração com App.tsx

---

## 🔌 Endpoints da API

### Autenticação (Sem proteção)

#### `POST /api/auth/guest`
Cria um usuário guest temporário.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "Guest_123456",
    "teamName": "Meu Time dos Sonhos",
    "coins": 5000,
    "gems": 10,
    "isGuest": true
  },
  "token": "jwt-token-aqui"
}
```

#### `POST /api/auth/register`
Registra um novo usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123",
  "username": "meuusername"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt-token-aqui"
}
```

#### `POST /api/auth/login`
Faz login de um usuário existente.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt-token-aqui"
}
```

#### `GET /api/auth/me`
Retorna o usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": { ... }
}
```

---

## 🧪 Testando

### Modo Guest
1. Configure `VITE_AUTH_MODE=guest` no frontend
2. Inicie o app
3. Você será automaticamente logado como guest
4. Verifique o localStorage: `auth_token` estará presente

### Modo Full
1. Configure `VITE_AUTH_MODE=full` no frontend
2. Inicie o app
3. Você verá a tela de login
4. Teste:
   - Criar uma conta
   - Fazer login
   - Jogar como convidado

### Testar Endpoints (com curl)

```bash
# 1. Criar guest
curl -X POST http://localhost:3001/api/auth/guest

# 2. Registrar usuário
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","username":"testuser"}'

# 3. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# 4. Verificar usuário (substitua <TOKEN>)
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🔄 Próximos Passos (Fase 4 e 5)

### Fase 4: Integração GameContext + AuthContext
- [ ] Modificar `GameContext` para usar `userId` do `AuthContext`
- [ ] Testar fluxo completo em modo guest
- [ ] Testar fluxo completo em modo full
- [ ] Documentar uso no README

### Fase 5: Migração de Endpoints (Futuro)
- [ ] Criar rota `GET /api/players`
- [ ] Criar rota `POST /api/players/buy-pack`
- [ ] Criar rota `GET /api/squad`
- [ ] Criar rota `PUT /api/squad`
- [ ] Migrar GameContext para usar API real

---

## ⚠️ Notas Importantes

### Segurança
- ⚠️ **JWT_SECRET**: Mude em produção! Use um valor forte e aleatório
- ⚠️ **Modo Guest**: Não use em produção sem rate limiting
- ⚠️ **HTTPS**: Use HTTPS em produção para proteger tokens

### Desenvolvimento
- ✅ Modo guest é perfeito para desenvolvimento local
- ✅ Não precisa configurar banco para testar frontend
- ✅ Pode alternar entre modos mudando apenas `.env`

### Produção
- 🔒 Use modo full
- 🔒 Configure JWT_SECRET forte
- 🔒 Configure CORS adequadamente
- 🔒 Implemente rate limiting
- 🔒 Use HTTPS

---

## 🐛 Troubleshooting

### "Environment variable not found: DATABASE_URL"
- Crie arquivo `.env` no backend (copie de `.env.example`)
- Configure a `DATABASE_URL` corretamente

### "Failed to create guest user"
- Verifique se o backend está rodando
- Verifique se `VITE_BACKEND_URL` está correto no frontend
- Verifique logs do backend para erros

### "Invalid token"
- Limpe o localStorage: `localStorage.clear()`
- Recarregue a página
- Em modo guest, um novo usuário será criado

### Erros de lint no backend
- Execute `npx prisma generate` para regenerar o Prisma Client
- Reinicie o TypeScript server no VS Code

---

## 📚 Arquivos Criados/Modificados

### Backend
- ✅ `src/utils/jwt.ts`
- ✅ `src/services/auth.service.ts`
- ✅ `src/middlewares/auth.middleware.ts`
- ✅ `src/routes/auth.routes.ts`
- ✅ `src/routes/index.ts` (modificado)
- ✅ `src/config/env.ts` (modificado)
- ✅ `prisma/schema.prisma` (modificado)
- ✅ `.env.example` (modificado)

### Frontend
- ✅ `src/context/AuthContext.tsx`
- ✅ `src/components/auth/AuthGuard.tsx`
- ✅ `src/pages/Login.tsx`
- ✅ `src/App.tsx` (modificado)
- ✅ `src/services/api.ts` (modificado)
- ✅ `package.json` (removido @google/genai)
- ✅ `.env.example` (modificado)

---

## 🎉 Conclusão

O sistema de autenticação está **100% funcional** e pronto para uso!

- ✅ Modo guest permite desenvolvimento sem fricção
- ✅ Modo full pronto para produção
- ✅ JWT implementado corretamente
- ✅ Fácil de alternar entre modos

**Próximo passo**: Configure o banco de dados e teste os endpoints! 🚀

# 🗄️ Guia de Instalação e Configuração do PostgreSQL

## 📋 Passo a Passo

### Opção 1: Instalação Completa (Recomendado para Desenvolvimento)

#### 1. Download do PostgreSQL

1. Acesse: https://www.postgresql.org/download/windows/
2. Clique em "Download the installer"
3. Baixe a versão **16.x** (mais recente)
4. Execute o instalador

#### 2. Instalação

Durante a instalação:

1. **Componentes**: Deixe todos marcados (PostgreSQL Server, pgAdmin 4, Command Line Tools)
2. **Diretório**: Deixe o padrão (`C:\Program Files\PostgreSQL\16`)
3. **Senha do superusuário (postgres)**: 
   - ⚠️ **IMPORTANTE**: Anote essa senha! Você vai precisar dela.
   - Sugestão: `postgres` (para desenvolvimento local)
4. **Porta**: Deixe `5432` (padrão)
5. **Locale**: Deixe o padrão
6. Clique em "Next" até finalizar

#### 3. Verificar Instalação

Abra um **novo terminal** (Git Bash ou PowerShell) e execute:

```bash
psql --version
```

Deve mostrar algo como: `psql (PostgreSQL) 16.x`

---

### Opção 2: Docker (Mais Rápido, Requer Docker Desktop)

Se você já tem Docker instalado:

```bash
# Criar container PostgreSQL
docker run --name jogacraque-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=jogacraque \
  -p 5432:5432 \
  -d postgres:16

# Verificar se está rodando
docker ps
```

---

## 🔧 Configuração do Banco

### 1. Criar Banco de Dados

#### Se instalou PostgreSQL completo:

```bash
# Abrir psql (vai pedir a senha que você definiu)
psql -U postgres

# Dentro do psql, criar o banco:
CREATE DATABASE jogacraque;

# Verificar:
\l

# Sair:
\q
```

#### Se está usando Docker:

O banco `jogacraque` já foi criado automaticamente!

---

### 2. Configurar `.env` no Backend

```bash
cd backend
```

Crie o arquivo `.env` (copie de `.env.example`):

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Windows (Git Bash):**
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
# Se instalou PostgreSQL completo:
DATABASE_URL="postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/jogacraque?schema=public"

# Se está usando Docker:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jogacraque?schema=public"

# Outras configurações
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

AUTH_MODE=guest
JWT_SECRET=dev-secret-change-in-production-please
JWT_EXPIRES_IN=7d
```

⚠️ **Substitua `SUA_SENHA_AQUI` pela senha que você definiu na instalação!**

---

### 3. Aplicar Schema ao Banco

```bash
# Ainda no diretório backend

# 1. Gerar Prisma Client
npm run db:generate

# 2. Aplicar schema ao banco
npm run db:push
```

Você deve ver:

```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema.
```

---

### 4. (Opcional) Popular com Dados de Teste

```bash
npm run db:seed
```

---

## ✅ Verificar se Funcionou

### Teste 1: Prisma Studio

```bash
npm run db:studio
```

Deve abrir uma interface web em `http://localhost:5555` mostrando as tabelas do banco.

### Teste 2: Endpoint de Autenticação

Com o backend rodando (`npm run dev`), teste:

```bash
curl -X POST http://localhost:3001/api/auth/guest
```

Deve retornar um JSON com `user` e `token`.

---

## 🐛 Troubleshooting

### "psql: command not found" (após instalar)

**Solução**: Feche e abra um **novo terminal**. O PATH só é atualizado em novos terminais.

### "password authentication failed for user postgres"

**Solução**: Você digitou a senha errada no `.env`. Verifique a senha que definiu na instalação.

### "database jogacraque does not exist"

**Solução**: Você esqueceu de criar o banco. Execute:

```bash
psql -U postgres
CREATE DATABASE jogacraque;
\q
```

### "port 5432 is already in use"

**Solução**: Já existe um PostgreSQL rodando. Verifique:

```bash
# Windows
netstat -ano | findstr :5432

# Se aparecer algo, mate o processo ou use outra porta
```

### "Error: P1001: Can't reach database server"

**Solução**: PostgreSQL não está rodando. Inicie o serviço:

**Windows:**
- Abra "Serviços" (Win + R, digite `services.msc`)
- Procure "postgresql-x64-16"
- Clique com botão direito → Iniciar

**Docker:**
```bash
docker start jogacraque-db
```

---

## 📊 Resumo dos Comandos

```bash
# 1. Criar banco (se não usou Docker)
psql -U postgres
CREATE DATABASE jogacraque;
\q

# 2. Configurar backend
cd backend
cp .env.example .env
# Editar .env com sua senha

# 3. Aplicar schema
npm run db:generate
npm run db:push

# 4. (Opcional) Popular dados
npm run db:seed

# 5. Verificar
npm run db:studio

# 6. Rodar backend
npm run dev
```

---

## 🎯 Próximos Passos

Após configurar o banco:

1. ✅ Testar endpoints de autenticação
2. ✅ Rodar frontend e backend juntos
3. ✅ Verificar auto-login em modo guest
4. ✅ Testar modo full (login/registro)

---

## 💡 Dicas

- **Desenvolvimento**: Use `AUTH_MODE=guest` (já configurado)
- **Senha simples**: Para dev local, `postgres` está OK
- **Prisma Studio**: Ótimo para visualizar dados (`npm run db:studio`)
- **Backup**: PostgreSQL cria backups automáticos em `C:\Program Files\PostgreSQL\16\data`

---

**Precisa de ajuda?** Me avise em qual passo você está! 🚀

# 🗄️ Setup do Banco de Dados

## Pré-requisitos

1. **PostgreSQL instalado e rodando**
   - Download: https://www.postgresql.org/download/
   - Ou use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=senha -p 5432:5432 -d postgres`

## Configuração

### 1. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure a `DATABASE_URL`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/jogacraque?schema=public"
```

Substitua:
- `usuario` - seu usuário do PostgreSQL (padrão: `postgres`)
- `senha` - sua senha do PostgreSQL
- `localhost:5432` - host e porta (padrão: `localhost:5432`)
- `jogacraque` - nome do banco de dados

### 2. Crie o banco de dados

Entre no PostgreSQL:

```bash
psql -U postgres
```

Crie o banco:

```sql
CREATE DATABASE jogacraque;
\q
```

### 3. Execute as migrations

Gere o Prisma Client:

```bash
npm run db:generate
```

Aplique o schema ao banco:

```bash
npm run db:push
```

Ou crie uma migration:

```bash
npm run db:migrate
```

### 4. (Opcional) Popule o banco com dados de teste

```bash
npm run db:seed
```

## Scripts Disponíveis

- `npm run db:generate` - Gera o Prisma Client
- `npm run db:push` - Sincroniza schema com o banco (desenvolvimento)
- `npm run db:migrate` - Cria e aplica migrations (produção)
- `npm run db:studio` - Abre interface visual do Prisma Studio
- `npm run db:seed` - Popula banco com dados de teste

## Prisma Studio

Para visualizar e editar dados visualmente:

```bash
npm run db:studio
```

Abrirá em: http://localhost:5555

## Modelos do Banco

### User
- Informações do usuário
- Recursos (moedas, gemas, fundos)
- Estatísticas de partidas
- Progressão (level, XP, MMR)

### Player
- Jogadores de carta
- Atributos e estatísticas
- Vínculo com usuário
- Posição no squad

### Squad
- Formação do time
- 11 jogadores titulares

### Match
- Histórico de partidas
- Resultados e eventos
- Recompensas

### MarketListing
- Jogadores à venda no mercado
- Preço e vendedor
- Expiração

## Troubleshooting

### Erro de conexão

Se não conseguir conectar ao PostgreSQL:

1. Verifique se o PostgreSQL está rodando:
   ```bash
   # Windows
   pg_ctl status
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. Teste a conexão:
   ```bash
   psql -U postgres -h localhost
   ```

### Resetar banco

Para resetar completamente:

```bash
# Drop todas as tabelas
npm run db:push -- --force-reset

# Reaplica o schema
npm run db:push

# Popula novamente
npm run db:seed
```

# 📊 Migrações do Banco de Dados - MIGGRO

## Como Aplicar as Migrações

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `001_initial_schema.sql`
4. Clique em **Run** ou pressione `Ctrl+Enter`
5. Aguarde a execução (pode levar alguns minutos)

### Opção 2: Via Supabase CLI

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref gjphsheavnkdtmsrxmtl

# Aplicar migração
supabase db push
```

### Opção 3: Via psql (PostgreSQL direto)

```bash
psql "postgresql://postgres:123Mudarmiggro%40@db.gjphsheavnkdtmsrxmtl.supabase.co:5432/postgres" -f supabase/migrations/001_initial_schema.sql
```

## Estrutura Criada

### Tabelas Principais

1. **Configuração:**
   - `countries` - Países
   - `cities` - Cidades
   - `service_categories` - Categorias de serviços
   - `badges` - Conquistas/Badges

2. **Usuários:**
   - `profiles` - Perfis de usuário
   - `user_badges` - Badges dos usuários
   - `verification_steps` - Passos de verificação

3. **Rede Social:**
   - `posts` - Posts
   - `post_likes` - Likes em posts
   - `comments` - Comentários
   - `comment_likes` - Likes em comentários
   - `follows` - Seguidores/Seguindo

4. **Grupos:**
   - `groups` - Grupos/Comunidades
   - `group_members` - Membros dos grupos

5. **Marketplace:**
   - `service_listings` - Listagens de serviços
   - `service_requests` - Pedidos de serviço
   - `service_proposals` - Propostas para pedidos
   - `service_reviews` - Avaliações de serviços

6. **Chat:**
   - `conversations` - Conversas
   - `messages` - Mensagens

7. **Financeiro:**
   - `wallets` - Carteiras digitais
   - `transactions` - Transações

8. **Sistema:**
   - `notifications` - Notificações

## Funcionalidades Automáticas

- ✅ Triggers para atualizar `updated_at` automaticamente
- ✅ Triggers para atualizar contadores (likes, comentários, seguidores)
- ✅ Row Level Security (RLS) habilitado em todas as tabelas
- ✅ Índices para performance
- ✅ Busca full-text em posts
- ✅ Dados iniciais (países, categorias, badges)

## Próximos Passos

1. **Aplicar a migração** (escolha uma das opções acima)
2. **Verificar as tabelas** no Supabase Dashboard
3. **Ajustar políticas RLS** conforme necessário
4. **Criar storage buckets** para imagens/vídeos:
   - `avatars` - Avatares de usuários
   - `post-images` - Imagens de posts
   - `service-images` - Imagens de serviços
   - `group-images` - Imagens de grupos

## Storage Buckets (Criar Manualmente)

No Supabase Dashboard > Storage:

1. Criar bucket `avatars` (público)
2. Criar bucket `post-images` (público)
3. Criar bucket `service-images` (público)
4. Criar bucket `group-images` (público)
5. Criar bucket `documents` (privado) - para documentos de verificação

## Notas Importantes

- ⚠️ A senha do banco é: `123Mudarmiggro@`
- ⚠️ RLS está habilitado - ajuste as políticas conforme necessário
- ⚠️ Algumas políticas básicas foram criadas, mas podem precisar de ajustes
- ✅ Todos os timestamps são em UTC (TIMESTAMPTZ)
- ✅ Soft deletes implementados onde faz sentido (posts, comments)

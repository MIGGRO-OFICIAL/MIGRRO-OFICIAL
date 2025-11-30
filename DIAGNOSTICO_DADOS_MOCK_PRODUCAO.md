# 🔍 Diagnóstico: Dados Mock Não Aparecem em Produção

## 📋 Resumo da Verificação

**Data:** 2025-11-30  
**URL:** https://migrrooficial.vercel.app/

### ✅ O Que Funciona
- ✅ Aplicação carrega
- ✅ Autenticação funciona (refresh token OK)
- ✅ Navegação funciona

### ❌ O Que Não Funciona
- ❌ Feed não mostra posts
- ❌ Marketplace não mostra serviços
- ❌ Grupos ficam em "Carregando..."

---

## 🔍 Análise do Código

### **1. Frontend Está Fazendo Queries Corretamente**

**CommunityView.tsx (Feed):**
```typescript
const { data: postsData, error } = await postsService.list({ limit: 20 });
```

**MarketplaceView.tsx:**
```typescript
const { data, error } = await servicesService.listServices({ limit: 50 });
```

**Conclusão:** O código está correto e fazendo queries.

---

## 🚨 Possíveis Causas

### **Causa 1: Row Level Security (RLS) Bloqueando** ⚠️ **MAIS PROVÁVEL**

As políticas RLS podem estar bloqueando o acesso aos dados. Verificar:

1. **Acesse:** https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl/database/policies
2. **Verifique políticas de:**
   - `posts` - Deve permitir SELECT para `authenticated`
   - `service_listings` - Deve permitir SELECT para `authenticated`
   - `groups` - Deve permitir SELECT para `authenticated`
   - `profiles` - Deve permitir SELECT para `authenticated`

**Solução:** Criar políticas que permitam leitura pública ou para usuários autenticados.

### **Causa 2: Dados Mock Não Têm Relacionamentos Válidos**

Os dados mock podem ter sido criados com:
- `author_id` que não existe em `profiles`
- `provider_id` que não existe em `profiles`
- Foreign keys quebradas

**Solução:** Verificar com `VERIFICAR_RLS_E_DADOS.sql`

### **Causa 3: Filtros nas Queries**

**Problema identificado no código:**

1. **Posts:** A query filtra por `group_id IS NULL` (apenas posts gerais)
   - Se os posts mock tiverem `group_id`, não aparecerão no feed

2. **Service Requests:** A query filtra por `author_id = user.id` por padrão
   - Só mostra pedidos do próprio usuário

**Solução:** Ajustar filtros ou criar dados mock sem esses filtros.

---

## 🛠️ Soluções

### **Solução 1: Verificar e Ajustar RLS (RECOMENDADO)**

Execute no SQL Editor:

```sql
-- Verificar políticas atuais
SELECT * FROM pg_policies 
WHERE tablename IN ('posts', 'service_listings', 'groups');

-- Se não houver políticas de SELECT, criar:

-- Posts: Permitir leitura para autenticados
CREATE POLICY "Posts são públicos para leitura"
ON posts FOR SELECT
TO authenticated
USING (true);

-- Service Listings: Permitir leitura para autenticados
CREATE POLICY "Serviços são públicos para leitura"
ON service_listings FOR SELECT
TO authenticated
USING (true);

-- Groups: Permitir leitura para autenticados
CREATE POLICY "Grupos são públicos para leitura"
ON groups FOR SELECT
TO authenticated
USING (true);

-- Profiles: Permitir leitura para autenticados
CREATE POLICY "Perfis são públicos para leitura"
ON profiles FOR SELECT
TO authenticated
USING (true);
```

### **Solução 2: Verificar Dados Mock**

Execute `VERIFICAR_RLS_E_DADOS.sql` para verificar:
- Se os dados existem
- Se há problemas de foreign keys
- Se RLS está habilitado

### **Solução 3: Verificar Console do Navegador**

Na produção, abra F12 e verifique:
- Erros de RLS (permission denied)
- Erros de CORS
- Requisições que estão falhando

---

## 📊 Checklist de Diagnóstico

Execute na ordem:

1. [ ] **Verificar se dados existem:**
   ```sql
   SELECT COUNT(*) FROM posts;
   SELECT COUNT(*) FROM service_listings;
   SELECT COUNT(*) FROM groups;
   ```

2. [ ] **Verificar RLS:**
   - Acesse: https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl/database/policies
   - Veja se há políticas de SELECT para `posts`, `service_listings`, `groups`

3. [ ] **Verificar Console (F12):**
   - Abra produção
   - Veja erros no console
   - Veja requisições que falham

4. [ ] **Testar Query Diretamente:**
   ```sql
   SELECT * FROM posts 
   WHERE is_deleted = false 
     AND group_id IS NULL
   LIMIT 10;
   ```

---

## 🎯 Próximo Passo Imediato

**Execute `VERIFICAR_RLS_E_DADOS.sql` no SQL Editor do Supabase para diagnosticar o problema!**

---

**⚠️ CONCLUSÃO:** O código frontend está correto. O problema provavelmente é RLS bloqueando ou dados mock com foreign keys inválidas.

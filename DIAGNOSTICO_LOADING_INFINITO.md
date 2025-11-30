# 🔍 Diagnóstico: Loading Infinito - Dados Mock Não Aparecem

## 🔴 Problema

**Sintoma:** Aplicação fica em estado de "carregando" e os dados mock não aparecem.

---

## 🔍 Possíveis Causas

### 1. Usuário Não Autenticado (Mais Provável)

**RLS requer autenticação!** Se o usuário não estiver logado:
- Queries ao Supabase são bloqueadas pelo RLS
- Retornam `{ data: [], error: null }` (vazio mas sem erro explícito)
- O código não trata array vazio como erro
- Loading pode ficar infinito se a query nunca completar

**Solução:** Verificar se o usuário está autenticado.

### 2. Query Travando

A query pode estar travando se:
- RLS está bloqueando silenciosamente
- Timeout da requisição
- Problema de rede

### 3. Erro Silencioso

O código tem fallback para mock data, mas pode não estar sendo acionado se:
- A query retorna vazio `[]` sem erro
- O erro não está sendo capturado corretamente

---

## 🛠️ Como Diagnosticar

### 1. Verificar Autenticação

No console do navegador (F12), execute:

```javascript
// Verificar se está autenticado
const { data: { user } } = await supabase.auth.getUser();
console.log('Usuário:', user ? user.email : 'NÃO AUTENTICADO');
```

**Se `user` for `null`:** Você não está autenticado! Faça login primeiro.

### 2. Verificar Requisições ao Supabase

No Network tab (F12):
1. Filtrar por "Fetch/XHR"
2. Navegar para Feed
3. Procurar por requisições para `supabase.co/rest/v1/posts`

**Se não houver requisições:**
- Componente não está fazendo queries
- Erro antes da query ser executada

**Se houver requisições:**
- Verificar status code (200, 401, 403, 500)
- Verificar response (dados ou erro)

### 3. Verificar Console para Erros

Procure no console por:
- `Erro ao carregar posts:`
- `Erro:`
- Qualquer mensagem de erro relacionada a Supabase

---

## ✅ Soluções

### Solução 1: Fazer Login

Se não estiver autenticado:

1. **Fazer login** com:
   - Email: `rafaelmilfont@gmail.com`
   - Senha: `123Mudar`

2. **Depois testar novamente** o Feed e Marketplace

### Solução 2: Verificar RLS

Se estiver autenticado mas ainda não funcionar:

1. **Verificar se as políticas RLS foram aplicadas:**
   - Execute `CORRIGIR_RLS_DADOS_MOCK.sql` no Supabase SQL Editor
   - Verifique se as políticas existem

2. **Testar query manualmente:**
   ```sql
   -- No Supabase SQL Editor, logado como rafaelmilfont@gmail.com
   SELECT COUNT(*) FROM posts WHERE is_deleted = false AND group_id IS NULL;
   ```

### Solução 3: Adicionar Timeout e Melhor Tratamento de Erro

Modificar o código para:
- Adicionar timeout nas queries
- Tratar array vazio como "sem dados" (não como erro)
- Mostrar mensagem quando não há dados

---

## 🎯 Ação Imediata

**Execute no console do navegador (F12):**

```javascript
(async function() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  document.head.appendChild(script);
  await new Promise(r => script.onload = r);
  const { createClient } = supabase;
  const client = createClient('https://gjphsheavnkdtmsrxmtl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcGhzaGVhdm5rZHRtc3J4bXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyODE1NzMsImV4cCI6MjA3OTg1NzU3M30.GH8_htMszSrylCd6rMXNXioZUKNE303T6QeTBrevAbs');
  
  // 1. Verificar autenticação
  const { data: { user }, error: authError } = await client.auth.getUser();
  console.log('=== DIAGNOSTICO ===');
  console.log('1. Usuario autenticado:', user ? user.email : 'NAO AUTENTICADO');
  if (authError) console.log('   Erro de auth:', authError);
  
  // 2. Testar query de posts
  console.log('2. Testando query de posts...');
  const { data, error } = await client.from('posts').select('*').eq('is_deleted', false).is('group_id', null).limit(5);
  console.log('   Posts encontrados:', data ? data.length : 0);
  console.log('   Dados:', data);
  if (error) {
    console.log('   ERRO:', error);
    console.log('   Mensagem:', error.message);
    console.log('   Detalhes:', error.details);
  }
  console.log('=== FIM DIAGNOSTICO ===');
})();
```

**Envie os resultados!**

---

## 📊 Resultado Esperado

### Se Tudo Estiver OK:
- ✅ Usuário autenticado
- ✅ Posts retornando dados
- ✅ Sem erros

### Se Houver Problema:
- ❌ Usuário não autenticado → Fazer login
- ❌ Erro de RLS → Verificar políticas
- ❌ Query retorna vazio → Verificar dados no banco

---

**🎯 Execute o diagnóstico acima e me envie os resultados!**

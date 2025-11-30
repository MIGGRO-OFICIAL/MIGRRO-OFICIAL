# 🔧 Limpar Sessão e Testar Dados do Supabase

## 🔴 Problema Identificado

O sistema está entrando automaticamente logado porque o Supabase mantém sessões persistentes no `localStorage`. Isso pode estar interferindo no carregamento dos dados mock do Supabase.

---

## ✅ Soluções

### 1. Botão de Logout Adicionado

Adicionei um botão de logout mais acessível:
- **No header:** Clique no avatar do usuário → Menu dropdown → "Sair"
- **No perfil:** Botão "Sair" na parte inferior (já existia)

---

### 2. Limpar Sessão Manualmente

**Opção A - Via Console do Navegador:**

Abra o console (F12) e execute:

```javascript
// Limpar sessão do Supabase
localStorage.removeItem('sb-gjphsheavnkdtmsrxmtl-auth-token');
localStorage.removeItem('supabase.auth.token');
sessionStorage.clear();
location.reload();
```

**Opção B - Via Botão de Logout:**

1. Clique no avatar no header (canto superior direito)
2. Clique em "Sair" no menu dropdown
3. Ou vá em Perfil → Botão "Sair" (parte inferior)

---

### 3. Verificar se Dados Estão Sendo Carregados do Supabase

Após fazer logout e login novamente, verifique:

1. **Console do navegador (F12):**
   - Veja se há erros de RLS (Row Level Security)
   - Veja se as queries estão retornando dados

2. **Network Tab:**
   - Verifique se as requisições ao Supabase estão sendo feitas
   - Veja se retornam dados ou arrays vazios

3. **Teste de dados:**
   - Acesse a view de Feed (CommunityView)
   - Acesse a view de Marketplace
   - Verifique se os dados mock aparecem

---

## 🔍 Verificar Problema de Sessão

Se o problema persistir, pode ser que:

1. **Sessão persistente:** O Supabase mantém a sessão mesmo após fechar o navegador
2. **RLS bloqueando:** As políticas de Row Level Security podem estar bloqueando os dados
3. **Queries incorretas:** As queries podem estar filtrando incorretamente

---

## 🚀 Próximos Passos

1. **Faça logout** usando o botão no header ou no perfil
2. **Limpe o localStorage** se necessário (console)
3. **Faça login novamente** com o admin:
   - Email: rafaelmilfont@gmail.com
   - Senha: (a que você configurou)
4. **Verifique se os dados aparecem** nas views

---

**🎯 Use o botão de logout no header (avatar) ou no perfil para limpar a sessão!**

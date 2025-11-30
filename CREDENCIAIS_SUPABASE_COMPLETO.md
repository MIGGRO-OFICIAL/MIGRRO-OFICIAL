# 🔐 Credenciais e Tokens Supabase - MIGGRO

## 📧 Email de Acesso
- **Email:** `mrockgarage@gmail.com`
- **Projeto:** MIGGRO

---

## 🌐 Informações do Projeto Supabase

### Project Reference
```
gjphsheavnkdtmsrxmtl
```

### URLs
- **Dashboard:** https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl
- **API URL:** https://gjphsheavnkdtmsrxmtl.supabase.co
- **Database URL:** `postgresql://postgres:123Mudarmiggro%40@db.gjphsheavnkdtmsrxmtl.supabase.co:5432/postgres`

---

## 🔑 Chaves e Tokens

### 1. Supabase Anon Key (Pública - Frontend)
```
VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcGhzaGVhdm5rZHRtc3J4bXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyODE1NzMsImV4cCI6MjA3OTg1NzU3M30.GH8_htMszSrylCd6rMXNXioZUKNE303T6QeTBrevAbs
```

### 2. Supabase Service Role Key (Privada - Backend/Edge Functions)
```
VITE_SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqcGhzaGVhdm5rZHRtc3J4bXRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI4MTU3MywiZXhwIjoyMDc5ODU3NTczfQ.nhcQUX2WpUnz3ho_PhL3qc_flhd1BgAD01n_W0P2FTo
```

⚠️ **ATENÇÃO:** Service Role Key NUNCA deve ser exposta no frontend!

---

## 🔒 Senha do Banco de Dados

```
123Mudarmiggro@
```

**⚠️ IMPORTANTE:** A senha inclui o símbolo `@` no final!

**Usada para:**
- Conexão direta via `psql`
- Link do Supabase CLI (`supabase link`)
- Acesso direto ao PostgreSQL

**Fonte:** Documento `ligando_miggro.md` linha 37

---

## 📋 Configuração para Supabase CLI

### Comandos de Configuração

```powershell
# 1. Instalar CLI
npm install -g supabase

# 2. Fazer login (abre navegador)
supabase login

# 3. Linkar ao projeto
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase link --project-ref gjphsheavnkdtmsrxmtl
# Quando pedir senha: 123Mudarmiggro@ (com @ no final!)

# 4. Verificar status
supabase status

# 5. Fazer push das migrations
supabase db push
```

---

## 🔍 Verificação de Dados Encontrados

### ✅ Dados Confirmados

- [x] **Project Reference:** `gjphsheavnkdtmsrxmtl`
- [x] **Supabase URL:** `https://gjphsheavnkdtmsrxmtl.supabase.co`
- [x] **Anon Key:** Encontrada e configurada
- [x] **Service Role Key:** Encontrada e configurada
- [x] **Database Password:** `123Mudarmiggro@` (confirmado em `ligando_miggro.md`)
- [x] **Email de acesso:** `mrockgarage@gmail.com`

### ⚠️ Dados que Precisam de Verificação

- [ ] **Supabase CLI Access Token:** (gerado após `supabase login`)
- [ ] **GitHub Personal Access Token:** (se necessário para deploy)
- [ ] **Vercel Access Token:** (se necessário para deploy)
- [ ] **GEMINI_API_KEY:** (se usar assistente de IA)

---

## 🚀 Próximos Passos

1. **Fazer login no Supabase CLI:**
   ```powershell
   supabase login
   ```
   - Isso abrirá o navegador
   - Faça login com `mrockgarage@gmail.com`
   - Autorize o CLI

2. **Linkar o projeto:**
   ```powershell
   supabase link --project-ref gjphsheavnkdtmsrxmtl
   ```
   - Senha do banco: `123Mudarmiggro@`

3. **Verificar configuração:**
   ```powershell
   supabase status
   ```

4. **Fazer push das migrations:**
   ```powershell
   supabase db push
   ```

---

## 📝 Arquivos com Credenciais

As credenciais estão configuradas nos seguintes arquivos:

1. `lib/supabase.ts` - Cliente Supabase com fallbacks
2. `supabase.ts` - Cliente alternativo
3. `VARIAVEIS_AMBIENTE_VERCEL.md` - Documentação para Vercel
4. `VARIAVEIS_VERCEL_COPIAR.txt` - Formato para copiar/colar
5. `README_MIGRATIONS.md` - Instruções de migrations

---

## 🔒 Segurança

- ✅ Anon Key é segura para frontend (tem RLS)
- ⚠️ Service Role Key NUNCA deve ir para frontend
- ✅ Todas as variáveis devem estar em `.env.local` (não commitado)
- ✅ `.env.local` está no `.gitignore`

---

## 📞 Suporte

Se precisar de mais tokens ou credenciais:
1. Acesse: https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl
2. Vá em **Settings** > **API**
3. Lá você encontrará todas as chaves

---

**✅ Todas as credenciais principais estão documentadas!**

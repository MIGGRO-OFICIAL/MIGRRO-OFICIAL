# 🚀 Instalar e Configurar Supabase CLI para MIGGRO

## 📋 Passo a Passo Completo

### Passo 1: Instalar Supabase CLI

**Opção A: Via npm (Recomendado)**

```powershell
npm install -g supabase
```

**Opção B: Via Scoop (se tiver instalado)**

```powershell
scoop install supabase
```

**⚠️ IMPORTANTE:** Após instalar, **feche e reabra o terminal** para que o PATH seja atualizado.

---

### Passo 2: Verificar Instalação

**Feche e reabra o PowerShell, depois execute:**

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase --version
```

**Deve mostrar algo como:** `supabase 1.x.x`

**Se não funcionar:**
- Verifique se Node.js está instalado: `node --version`
- Tente instalar novamente: `npm install -g supabase`
- Verifique o PATH: `$env:PATH`

---

### Passo 3: Fazer Login no Supabase

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase login
```

**O que acontece:**
- Abrirá o navegador automaticamente
- Faça login com sua conta Supabase
- Autorize o CLI

**Verificar se está logado:**
```powershell
supabase projects list
```

**Deve mostrar seus projetos, incluindo:**
- MIGGRO: `gjphsheavnkdtmsrxmtl`
- Rendizy (se existir)

---

### Passo 4: Verificar Link Atual

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase status
```

**Possíveis resultados:**

**A) Projeto não linkado:**
```
Error: Project not linked
```
→ Continue para o Passo 5

**B) Projeto linkado ao MIGGRO:**
```
Project ID: gjphsheavnkdtmsrxmtl
API URL: https://gjphsheavnkdtmsrxmtl.supabase.co
```
→ ✅ Já está configurado corretamente!

**C) Projeto linkado ao Rendizy ou outro:**
```
Project ID: [outro-id]
```
→ Deslinke primeiro (Passo 4.1)

---

### Passo 4.1: Deslinkar Projeto Atual (se necessário)

**Se o projeto estiver linkado ao Rendizy ou projeto errado:**

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase unlink
```

**Confirme que deslinkou:**
```powershell
supabase status
```

**Deve mostrar erro:** `Error: Project not linked`

---

### Passo 5: Linkar Projeto MIGGRO

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase link --project-ref gjphsheavnkdtmsrxmtl
```

**Quando pedir a senha do banco de dados:**
```
123Mudarmiggro@
```

**Saída esperada:**
```
Finished supabase link.
```

---

### Passo 6: Verificar Link Bem-Sucedido

```powershell
supabase status
```

**Deve mostrar:**
```
Project ID: gjphsheavnkdtmsrxmtl
API URL: https://gjphsheavnkdtmsrxmtl.supabase.co
DB URL: postgresql://postgres:[YOUR-PASSWORD]@db.gjphsheavnkdtmsrxmtl.supabase.co:5432/postgres
Studio URL: http://localhost:54323
```

---

### Passo 7: Verificar Migrations

```powershell
supabase migration list
```

**Deve mostrar as migrations do MIGGRO:**
```
20240101000000_001_initial_schema.sql
20240101000001_002_admin_tables.sql
20240101000002_003_add_group_posts.sql
...
```

**⚠️ Se mostrar migrations do Rendizy:**
- O projeto está linkado errado
- Deslinke e relinke (Passos 4.1 e 5)

---

## 🎯 Scripts Automáticos

### Verificar Status

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
powershell -ExecutionPolicy Bypass -File "verificar-supabase-link.ps1"
```

### Linkar Automaticamente

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
powershell -ExecutionPolicy Bypass -File "linkar-supabase-miggro.ps1"
```

---

## ⚠️ Troubleshooting

### Erro: "supabase: command not found"

**Causa:** CLI não está no PATH ou terminal não foi reiniciado.

**Solução:**
1. Feche e reabra o PowerShell
2. Verifique instalação: `npm list -g supabase`
3. Se não estiver instalado: `npm install -g supabase`
4. Verifique PATH: `$env:PATH | Select-String "npm"`

---

### Erro: "Project not found"

**Causa:** Project reference está errado ou não tem acesso.

**Solução:**
1. Verifique o project-ref: `gjphsheavnkdtmsrxmtl`
2. Verifique se está logado: `supabase projects list`
3. Verifique se o projeto aparece na lista

---

### Erro: "Database password incorrect"

**Causa:** Senha do banco está errada.

**Solução:**
- **Senha do MIGGRO:** `123Mudarmiggro@`
- Se não funcionar, verifique no dashboard do Supabase:
  - https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl
  - Settings → Database → Reset database password

---

### Erro: "Migrations from different project"

**Causa:** Tentando aplicar migrations do Rendizy no MIGGRO.

**Solução:**
1. Verifique diretório: `pwd` (deve ser MIGGRO)
2. Verifique link: `supabase status`
3. Se estiver errado: deslinke e relinke

---

## 📋 Checklist Completo

Antes de fazer deploy, verifique:

- [ ] Supabase CLI instalado: `supabase --version`
- [ ] Está logado: `supabase projects list` mostra projetos
- [ ] No diretório correto: `C:\Users\rafae\OneDrive\Documentos\MIGGRO`
- [ ] Projeto linkado: `supabase status` mostra `gjphsheavnkdtmsrxmtl`
- [ ] Migrations corretas: `supabase migration list` mostra migrations do MIGGRO
- [ ] Não há conflito: Verificar que não está linkado ao Rendizy

---

## 🚀 Próximos Passos Após Configuração

### 1. Verificar Diferenças (antes de fazer push)

```powershell
supabase db diff
```

**Mostra diferenças entre local e remoto.**

### 2. Fazer Push de Migrations (se necessário)

**⚠️ CUIDADO:** Só faça push se tiver certeza!

```powershell
supabase db push
```

### 3. Deploy de Edge Functions (se houver)

```powershell
supabase functions deploy [function-name]
```

---

## 📝 Informações do Projeto MIGGRO

- **Project Reference:** `gjphsheavnkdtmsrxmtl`
- **URL:** https://gjphsheavnkdtmsrxmtl.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl
- **Senha do Banco:** `123Mudarmiggro@`

---

## 🎯 Comandos Rápidos de Referência

```powershell
# Verificar versão
supabase --version

# Login
supabase login

# Listar projetos
supabase projects list

# Verificar status
supabase status

# Linkar projeto
supabase link --project-ref gjphsheavnkdtmsrxmtl

# Deslinkar
supabase unlink

# Listar migrations
supabase migration list

# Ver diferenças
supabase db diff

# Push migrations (cuidado!)
supabase db push
```

---

**🎯 Siga estes passos na ordem para configurar o Supabase CLI corretamente!**

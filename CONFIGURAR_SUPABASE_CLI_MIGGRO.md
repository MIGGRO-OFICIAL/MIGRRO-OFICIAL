# 🔧 Configurar Supabase CLI para MIGGRO

## 🚨 Problema Identificado

O Supabase CLI pode estar linkado ao projeto **Rendizy**, impedindo o deploy do **MIGGRO**. Este guia ajuda a verificar e corrigir isso.

---

## 📋 Passo 1: Verificar Status Atual

### 1.1 Verificar se CLI está instalado

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase --version
```

**Se não estiver instalado:**
```powershell
npm install -g supabase
```

### 1.2 Verificar se está logado

```powershell
supabase login
```

**Se não estiver logado:**
- O comando abrirá o navegador
- Faça login com sua conta Supabase
- Autorize o CLI

### 1.3 Verificar projetos disponíveis

```powershell
supabase projects list
```

**Deve mostrar:**
- Projeto MIGGRO: `gjphsheavnkdtmsrxmtl`
- Projeto Rendizy (se existir)

---

## 🔍 Passo 2: Verificar Link Atual

### 2.1 Verificar status do link

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase status
```

**Se mostrar erro ou projeto diferente:**
- O projeto pode estar linkado ao Rendizy
- Precisa deslinkar e relinkar

### 2.2 Verificar arquivo de configuração

```powershell
# Verificar se existe .supabase/config.toml
dir .supabase
```

**Se não existir:**
- O projeto não está linkado
- Precisa fazer o link

---

## ✅ Passo 3: Configurar MIGGRO Corretamente

### 3.1 Deslinkar projeto atual (se necessário)

**⚠️ ATENÇÃO:** Se o projeto estiver linkado ao Rendizy, deslinke primeiro:

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase unlink
```

**Ou se estiver no diretório do Rendizy:**
```powershell
cd "C:\Users\rafae\OneDrive\Documentos\Rendizy"  # ou caminho do Rendizy
supabase unlink
```

### 3.2 Linkar projeto MIGGRO

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"

# Linkar ao projeto MIGGRO
supabase link --project-ref gjphsheavnkdtmsrxmtl
```

**Quando pedir a senha do banco:**
```
123Mudarmiggro@
```

### 3.3 Verificar link bem-sucedido

```powershell
supabase status
```

**Deve mostrar:**
- Project ID: `gjphsheavnkdtmsrxmtl`
- API URL: `https://gjphsheavnkdtmsrxmtl.supabase.co`
- DB URL: `postgresql://postgres:[YOUR-PASSWORD]@db.gjphsheavnkdtmsrxmtl.supabase.co:5432/postgres`

---

## 🚀 Passo 4: Verificar Migrations

### 4.1 Listar migrations locais

```powershell
supabase migration list
```

**Deve mostrar as migrations do MIGGRO:**
- `001_initial_schema.sql`
- `002_admin_tables.sql`
- `003_add_group_posts.sql`
- etc.

**⚠️ Se mostrar migrations do Rendizy:**
- O projeto está linkado errado
- Deslinke e relinke (Passo 3)

### 4.2 Verificar migrations remotas

```powershell
supabase db remote list
```

**Deve mostrar as migrations aplicadas no Supabase.**

---

## 🔧 Passo 5: Deploy (se necessário)

### 5.1 Deploy de migrations

**⚠️ CUIDADO:** Só faça deploy se tiver certeza que está no projeto correto!

```powershell
# Verificar diferenças primeiro
supabase db diff

# Se estiver tudo certo, fazer push
supabase db push
```

### 5.2 Deploy de Edge Functions (se houver)

```powershell
# Listar functions
supabase functions list

# Deploy de uma function específica
supabase functions deploy [function-name]
```

---

## 🛡️ Passo 6: Prevenir Conflitos Futuros

### 6.1 Criar script de verificação

Crie um arquivo `verificar-supabase-link.ps1`:

```powershell
# verificar-supabase-link.ps1
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"

Write-Host "=== Verificando Link Supabase CLI ===" -ForegroundColor Cyan

# Verificar se está no diretório correto
$currentDir = Get-Location
Write-Host "Diretório atual: $currentDir" -ForegroundColor Yellow

# Verificar status
Write-Host "`nVerificando status do link..." -ForegroundColor Yellow
supabase status

# Verificar projeto linkado
Write-Host "`nVerificando projeto linkado..." -ForegroundColor Yellow
$config = Get-Content ".supabase\config.toml" -ErrorAction SilentlyContinue
if ($config) {
    $projectRef = ($config | Select-String "project_id").Line
    Write-Host "Projeto linkado: $projectRef" -ForegroundColor Green
} else {
    Write-Host "AVISO: Projeto não está linkado!" -ForegroundColor Red
}

Write-Host "`n=== Verificação Completa ===" -ForegroundColor Cyan
```

### 6.2 Sempre verificar antes de fazer deploy

**Antes de qualquer deploy:**
1. Execute `verificar-supabase-link.ps1`
2. Confirme que o projeto é `gjphsheavnkdtmsrxmtl`
3. Só então faça o deploy

---

## ⚠️ Troubleshooting

### Erro: "Project not found"

**Causa:** Projeto não está linkado ou linkado ao projeto errado.

**Solução:**
```powershell
supabase unlink
supabase link --project-ref gjphsheavnkdtmsrxmtl
```

### Erro: "Migrations from different project"

**Causa:** Tentando aplicar migrations do Rendizy no MIGGRO.

**Solução:**
1. Verificar se está no diretório correto
2. Verificar link: `supabase status`
3. Se estiver errado, deslinkar e relinkar

### Erro: "Database password incorrect"

**Causa:** Senha do banco está errada.

**Solução:**
- Senha do MIGGRO: `123Mudarmiggro@`
- Se não funcionar, verificar no dashboard do Supabase

### CLI não encontrado

**Causa:** Supabase CLI não está instalado ou não está no PATH.

**Solução:**
```powershell
npm install -g supabase
```

Ou instalar via Scoop:
```powershell
scoop install supabase
```

---

## 📋 Checklist de Verificação

Antes de fazer qualquer deploy, verifique:

- [ ] Estou no diretório correto: `C:\Users\rafae\OneDrive\Documentos\MIGGRO`
- [ ] CLI está logado: `supabase login`
- [ ] Projeto linkado: `supabase status` mostra `gjphsheavnkdtmsrxmtl`
- [ ] Migrations corretas: `supabase migration list` mostra migrations do MIGGRO
- [ ] Não há conflito com Rendizy: Verificar que não está linkado ao Rendizy

---

## 🎯 Comandos Rápidos

```powershell
# Verificar status
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase status

# Linkar projeto MIGGRO
supabase link --project-ref gjphsheavnkdtmsrxmtl

# Deslinkar (se necessário)
supabase unlink

# Listar migrations
supabase migration list

# Ver diferenças
supabase db diff
```

---

## 📝 Informações do Projeto MIGGRO

- **Project Reference:** `gjphsheavnkdtmsrxmtl`
- **URL:** https://gjphsheavnkdtmsrxmtl.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl
- **Senha do Banco:** `123Mudarmiggro@`

---

**🎯 Use este guia sempre que precisar trabalhar com o Supabase CLI no MIGGRO!**

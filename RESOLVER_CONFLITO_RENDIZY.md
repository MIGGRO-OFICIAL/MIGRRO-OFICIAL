# 🔧 Resolver Conflito Supabase CLI: Rendizy vs MIGGRO

## 🚨 Problema

O Supabase CLI pode estar linkado ao projeto **Rendizy**, impedindo o deploy do **MIGGRO**. Este documento explica como resolver.

---

## 📋 Solução Passo a Passo

### Passo 1: Verificar Status Atual

Execute o script de verificação:

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
powershell -ExecutionPolicy Bypass -File "verificar-supabase-link.ps1"
```

**O que verificar:**
- ✅ CLI está instalado?
- ✅ Está logado no Supabase?
- ✅ Qual projeto está linkado?
- ✅ É o projeto MIGGRO (`gjphsheavnkdtmsrxmtl`) ou Rendizy?

---

### Passo 2: Deslinkar Projeto Atual (se necessário)

**Se o script mostrar que está linkado ao Rendizy ou projeto errado:**

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"

# Deslinkar projeto atual
supabase unlink
```

**Ou se estiver no diretório do Rendizy:**

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\Rendizy"  # ou caminho do Rendizy
supabase unlink
```

---

### Passo 3: Linkar Projeto MIGGRO

Execute o script automático:

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
powershell -ExecutionPolicy Bypass -File "linkar-supabase-miggro.ps1"
```

**Ou manualmente:**

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"

# 1. Login (se necessário)
supabase login

# 2. Linkar ao projeto MIGGRO
supabase link --project-ref gjphsheavnkdtmsrxmtl

# Quando pedir a senha do banco:
# 123Mudarmiggro@
```

---

### Passo 4: Verificar Link Correto

```powershell
supabase status
```

**Deve mostrar:**
- Project ID: `gjphsheavnkdtmsrxmtl`
- API URL: `https://gjphsheavnkdtmsrxmtl.supabase.co`

---

## 🛡️ Prevenir Conflitos Futuros

### 1. Sempre verificar antes de fazer deploy

**Antes de qualquer comando de deploy:**

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
powershell -ExecutionPolicy Bypass -File "verificar-supabase-link.ps1"
```

**Confirme que:**
- ✅ Diretório atual é MIGGRO
- ✅ Projeto linkado é `gjphsheavnkdtmsrxmtl`
- ✅ Migrations são do MIGGRO

---

### 2. Usar scripts específicos por projeto

**Para MIGGRO:**
- Sempre trabalhar em: `C:\Users\rafae\OneDrive\Documentos\MIGGRO`
- Usar: `linkar-supabase-miggro.ps1`
- Verificar: `verificar-supabase-link.ps1`

**Para Rendizy:**
- Trabalhar em: `C:\Users\rafae\OneDrive\Documentos\Rendizy` (ou caminho do Rendizy)
- Criar scripts similares para Rendizy
- **NUNCA misturar os dois projetos**

---

### 3. Verificar migrations antes de push

```powershell
# Listar migrations locais
supabase migration list

# Verificar se são migrations do MIGGRO
# Deve mostrar: 001_initial_schema.sql, 002_admin_tables.sql, etc.
# NÃO deve mostrar migrations do Rendizy!
```

---

## ⚠️ Troubleshooting

### Erro: "Project not found"

**Causa:** Projeto não está linkado ou linkado ao projeto errado.

**Solução:**
```powershell
supabase unlink
supabase link --project-ref gjphsheavnkdtmsrxmtl
```

---

### Erro: "Migrations from different project"

**Causa:** Tentando aplicar migrations do Rendizy no MIGGRO.

**Solução:**
1. Verificar diretório: `pwd` (deve ser MIGGRO)
2. Verificar link: `supabase status`
3. Se estiver errado: deslinkar e relinkar

---

### Erro: "Database password incorrect"

**Causa:** Senha do banco está errada.

**Solução:**
- **MIGGRO:** `123Mudarmiggro@`
- Se não funcionar, verificar no dashboard do Supabase

---

### CLI não encontrado

**Causa:** Supabase CLI não está instalado.

**Solução:**
```powershell
npm install -g supabase
```

Ou via Scoop:
```powershell
scoop install supabase
```

---

## 📋 Checklist Antes de Deploy

Antes de fazer qualquer deploy, verifique:

- [ ] Estou no diretório correto: `C:\Users\rafae\OneDrive\Documentos\MIGGRO`
- [ ] CLI está logado: `supabase login`
- [ ] Projeto linkado: `supabase status` mostra `gjphsheavnkdtmsrxmtl`
- [ ] Migrations corretas: `supabase migration list` mostra migrations do MIGGRO
- [ ] Não há conflito: Verificar que não está linkado ao Rendizy

---

## 🎯 Comandos Rápidos

### Verificar Status
```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
powershell -ExecutionPolicy Bypass -File "verificar-supabase-link.ps1"
```

### Linkar MIGGRO
```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
powershell -ExecutionPolicy Bypass -File "linkar-supabase-miggro.ps1"
```

### Verificar Link Manualmente
```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase status
```

### Deslinkar (se necessário)
```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase unlink
```

---

## 📝 Informações do Projeto MIGGRO

- **Project Reference:** `gjphsheavnkdtmsrxmtl`
- **URL:** https://gjphsheavnkdtmsrxmtl.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl
- **Senha do Banco:** `123Mudarmiggro@`

---

## 🚀 Próximos Passos

1. **Execute o script de verificação:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File "verificar-supabase-link.ps1"
   ```

2. **Se estiver linkado ao Rendizy:**
   - Execute `linkar-supabase-miggro.ps1`
   - Ou deslinke manualmente e relinke

3. **Verifique novamente:**
   ```powershell
   supabase status
   ```

4. **Agora pode fazer deploy:**
   ```powershell
   supabase db push  # Cuidado: só se tiver certeza!
   ```

---

**🎯 Use os scripts criados para evitar conflitos entre Rendizy e MIGGRO!**

# 🔧 Usar Supabase CLI Instalado Localmente

## 📋 Situação

Você instalou o Supabase CLI como dependência de desenvolvimento (`npm i supabase --save-dev`).

Isso significa que o CLI está disponível **apenas no projeto**, não globalmente.

---

## ✅ Como Usar

### Opção 1: Via npx (Recomendado)

Use `npx` antes de cada comando:

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"

# Verificar versão
npx supabase --version

# Fazer login
npx supabase login

# Listar projetos
npx supabase projects list

# Verificar status
npx supabase status

# Linkar projeto
npx supabase link --project-ref gjphsheavnkdtmsrxmtl
```

---

### Opção 2: Adicionar Scripts no package.json

Adicione scripts no `package.json` para facilitar:

```json
{
  "scripts": {
    "supabase:version": "supabase --version",
    "supabase:login": "supabase login",
    "supabase:status": "supabase status",
    "supabase:link": "supabase link --project-ref gjphsheavnkdtmsrxmtl",
    "supabase:unlink": "supabase unlink",
    "supabase:projects": "supabase projects list"
  }
}
```

**Depois use:**
```powershell
npm run supabase:version
npm run supabase:login
npm run supabase:link
```

---

## 🎯 Linkar Projeto MIGGRO

### Passo 1: Fazer Login

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
npx supabase login
```

**O que acontece:**
- Abrirá o navegador automaticamente
- Faça login com sua conta Supabase
- Autorize o CLI

---

### Passo 2: Verificar Projetos

```powershell
npx supabase projects list
```

**Deve mostrar seus projetos, incluindo:**
- MIGGRO: `gjphsheavnkdtmsrxmtl`

---

### Passo 3: Verificar Link Atual

```powershell
npx supabase status
```

**Possíveis resultados:**

**A) Projeto não linkado:**
```
Error: Project not linked
```
→ Continue para o Passo 4

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
→ Deslinke primeiro:
```powershell
npx supabase unlink
```

---

### Passo 4: Linkar Projeto MIGGRO

```powershell
npx supabase link --project-ref gjphsheavnkdtmsrxmtl
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

### Passo 5: Verificar Link Bem-Sucedido

```powershell
npx supabase status
```

**Deve mostrar:**
```
Project ID: gjphsheavnkdtmsrxmtl
API URL: https://gjphsheavnkdtmsrxmtl.supabase.co
DB URL: postgresql://postgres:[YOUR-PASSWORD]@db.gjphsheavnkdtmsrxmtl.supabase.co:5432/postgres
Studio URL: http://localhost:54323
```

---

## ⚠️ Alternativa: Instalar Globalmente

Se preferir usar `supabase` diretamente (sem `npx`), instale globalmente:

### Via Winget:
```powershell
winget install --id Supabase.CLI
```

### Via PowerShell Script:
```powershell
irm https://supabase.com/install.ps1 | iex
```

**Depois feche e reabra o terminal.**

---

## 📝 Informações do Projeto MIGGRO

- **Project Reference:** `gjphsheavnkdtmsrxmtl`
- **URL:** https://gjphsheavnkdtmsrxmtl.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl
- **Senha do Banco:** `123Mudarmiggro@`

---

## 🚀 Comandos Rápidos com npx

```powershell
# Verificar versão
npx supabase --version

# Login
npx supabase login

# Listar projetos
npx supabase projects list

# Verificar status
npx supabase status

# Linkar projeto
npx supabase link --project-ref gjphsheavnkdtmsrxmtl

# Deslinkar (se necessário)
npx supabase unlink
```

---

**🎯 Use `npx supabase` antes de cada comando para usar o CLI instalado localmente!**

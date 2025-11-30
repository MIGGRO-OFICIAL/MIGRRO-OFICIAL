# 🚀 Instalar Supabase CLI Corretamente no Windows

## 🚨 Problema

O Supabase CLI **não pode ser instalado via `npm install -g`**. Use um dos métodos suportados abaixo.

---

## ✅ Método 1: Via Scoop (Recomendado para Windows)

### Passo 1: Instalar Scoop (se não tiver)

```powershell
# Abra o PowerShell como Administrador
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### Passo 2: Instalar Supabase CLI

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Passo 3: Verificar Instalação

```powershell
supabase --version
```

---

## ✅ Método 2: Via Winget (Windows Package Manager)

### Verificar se tem Winget

```powershell
winget --version
```

### Instalar Supabase CLI

```powershell
winget install --id Supabase.CLI
```

### Verificar Instalação

```powershell
supabase --version
```

---

## ✅ Método 3: Via Chocolatey (se tiver instalado)

```powershell
choco install supabase
```

---

## ✅ Método 4: Download Manual (MSI Installer)

### Passo 1: Baixar o Instalador

**URL:** https://github.com/supabase/cli/releases/latest

**Ou diretamente:**
- Procure por: `supabase_X.X.X_windows_amd64.msi`
- Baixe o arquivo `.msi`

### Passo 2: Instalar

1. Execute o arquivo `.msi` baixado
2. Siga o assistente de instalação
3. O CLI será instalado em: `C:\Program Files\Supabase\`

### Passo 3: Adicionar ao PATH (se necessário)

```powershell
# Adicionar ao PATH do sistema
$path = [Environment]::GetEnvironmentVariable("Path", "Machine")
$newPath = "$path;C:\Program Files\Supabase"
[Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")

# Atualizar PATH na sessão atual
$env:Path += ";C:\Program Files\Supabase"
```

### Passo 4: Verificar Instalação

**Feche e reabra o terminal, depois:**

```powershell
supabase --version
```

---

## ✅ Método 5: Via npx (Temporário - Não Recomendado)

Se precisar usar rapidamente sem instalar:

```powershell
npx supabase@latest --version
```

**⚠️ Nota:** Isso baixa o CLI toda vez que usar. Não é ideal para uso contínuo.

---

## 🎯 Recomendação

**Use o Método 1 (Scoop)** ou **Método 2 (Winget)** - São os mais simples e mantidos atualizados automaticamente.

---

## 📋 Após Instalar

### 1. Verificar Instalação

```powershell
supabase --version
```

**Deve mostrar:** `supabase X.X.X`

### 2. Fazer Login

```powershell
supabase login
```

### 3. Linkar Projeto MIGGRO

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase link --project-ref gjphsheavnkdtmsrxmtl
```

**Senha:** `123Mudarmiggro@`

---

## ⚠️ Troubleshooting

### Erro: "scoop: command not found"

**Solução:** Instale o Scoop primeiro (veja Método 1)

---

### Erro: "winget: command not found"

**Solução:** 
- Windows 10: Instale o App Installer da Microsoft Store
- Windows 11: Já vem instalado

---

### Erro: "supabase: command not found" após instalar

**Solução:**
1. Feche e reabra o terminal
2. Verifique o PATH: `$env:PATH`
3. Se necessário, adicione manualmente ao PATH

---

## 📝 Links Úteis

- **Documentação Oficial:** https://github.com/supabase/cli#install-the-cli
- **Releases:** https://github.com/supabase/cli/releases
- **Scoop Bucket:** https://github.com/supabase/scoop-bucket

---

**🎯 Escolha um método e instale o Supabase CLI corretamente!**

# 🚀 Instalar PowerShell 7.5.4

## 📋 Situação Atual

Você tem os arquivos do PowerShell 7.5.4 em:
```
C:\Users\rafae\Downloads\PowerShell-7.5.4-win-x64
```

Este diretório contém os **arquivos extraídos**, não o instalador.

---

## 🎯 Opção 1: Baixar o Instalador MSI (Recomendado)

### Download do Instalador Oficial

**URL:** https://aka.ms/powershell-release?tag=stable

**Ou diretamente:**
- **MSI (Instalador):** https://github.com/PowerShell/PowerShell/releases/download/v7.5.4/PowerShell-7.5.4-win-x64.msi

### Instalação

1. **Baixe o arquivo `.msi`**
2. **Execute o instalador:**
   ```powershell
   # Navegue até o arquivo baixado e clique duas vezes
   # Ou execute via linha de comando:
   msiexec /i "C:\Users\rafae\Downloads\PowerShell-7.5.4-win-x64.msi" /quiet
   ```

3. **Verificar instalação:**
   ```powershell
   pwsh --version
   ```

---

## 🎯 Opção 2: Usar os Arquivos Extraídos (Instalação Manual)

Se você já tem os arquivos extraídos, pode instalar manualmente:

### Passo 1: Escolher Local de Instalação

**Local padrão do PowerShell 7:**
```
C:\Program Files\PowerShell\7
```

### Passo 2: Copiar Arquivos

```powershell
# Criar diretório de instalação
New-Item -ItemType Directory -Force -Path "C:\Program Files\PowerShell\7"

# Copiar todos os arquivos
Copy-Item -Path "C:\Users\rafae\Downloads\PowerShell-7.5.4-win-x64\*" -Destination "C:\Program Files\PowerShell\7" -Recurse -Force
```

### Passo 3: Adicionar ao PATH

```powershell
# Adicionar ao PATH do sistema
$path = [Environment]::GetEnvironmentVariable("Path", "Machine")
$newPath = "$path;C:\Program Files\PowerShell\7"
[Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")

# Atualizar PATH na sessão atual
$env:Path += ";C:\Program Files\PowerShell\7"
```

### Passo 4: Verificar Instalação

**Feche e reabra o terminal, depois:**

```powershell
pwsh --version
```

**Deve mostrar:** `PowerShell 7.5.4`

---

## 🎯 Opção 3: Instalar via Winget (Mais Fácil)

Se você tem o Windows Package Manager (winget):

```powershell
winget install --id Microsoft.PowerShell --source winget
```

---

## 🎯 Opção 4: Instalar via Chocolatey

Se você tem Chocolatey instalado:

```powershell
choco install powershell-core
```

---

## ✅ Verificar Instalação

Após instalar, **feche e reabra o terminal**, depois:

```powershell
# Verificar versão
pwsh --version

# Deve mostrar: PowerShell 7.5.4
```

---

## 🔧 Usar PowerShell 7

### Abrir PowerShell 7

**Opção A: Menu Iniciar**
- Digite "PowerShell 7" no menu Iniciar
- Clique em "PowerShell 7"

**Opção B: Linha de Comando**
```cmd
pwsh
```

**Opção C: Criar Atalho**
```powershell
# Criar atalho na área de trabalho
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\PowerShell 7.lnk")
$Shortcut.TargetPath = "C:\Program Files\PowerShell\7\pwsh.exe"
$Shortcut.Save()
```

---

## 📝 Diferença entre PowerShell 5.1 e PowerShell 7

- **PowerShell 5.1:** `powershell.exe` (Windows PowerShell - versão antiga)
- **PowerShell 7:** `pwsh.exe` (PowerShell Core - versão moderna, cross-platform)

**Para usar PowerShell 7:**
```powershell
pwsh
```

**Para usar PowerShell 5.1 (antigo):**
```powershell
powershell
```

---

## ⚠️ Importante

Após instalar o PowerShell 7:

1. **Feche e reabra o terminal** para atualizar o PATH
2. Use `pwsh` para abrir PowerShell 7
3. Os scripts criados (`verificar-supabase-link.ps1`, `linkar-supabase-miggro.ps1`) funcionam em ambos

---

## 🎯 Recomendação

**Use a Opção 1 (MSI)** - É a forma mais simples e confiável:

1. Baixe: https://aka.ms/powershell-release?tag=stable
2. Execute o `.msi`
3. Siga o assistente de instalação
4. Pronto!

---

**🎯 Após instalar, você terá acesso ao PowerShell 7 mais recente com todos os recursos!**

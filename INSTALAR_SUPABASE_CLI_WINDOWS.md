# 🔧 Como Instalar Supabase CLI no Windows

## ⚠️ IMPORTANTE

**O Supabase CLI NÃO pode ser instalado via `npm install -g` mais!**

Você precisa usar uma das opções abaixo.

---

## 🎯 Opção 1: Via Scoop (Recomendado)

### Passo 1: Instalar Scoop (se não tiver)

Abra o PowerShell **como Administrador** e execute:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### Passo 2: Adicionar bucket do Supabase

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
```

### Passo 3: Instalar Supabase CLI

```powershell
scoop install supabase
```

### Passo 4: Verificar instalação

```powershell
supabase --version
```

**✅ Pronto!** Agora você pode usar `supabase login`

---

## 🎯 Opção 2: Download Manual (Alternativa)

Se não quiser usar Scoop:

1. **Baixe o executável:**
   - Acesse: https://github.com/supabase/cli/releases
   - Baixe a versão mais recente para Windows (`.exe`)

2. **Adicione ao PATH:**
   - Coloque o arquivo em uma pasta (ex: `C:\Tools\supabase\`)
   - Adicione essa pasta ao PATH do Windows
   - Ou use diretamente: `C:\Tools\supabase\supabase.exe login`

---

## 🎯 Opção 3: Via npx (Temporário)

Se precisar usar rapidamente sem instalar:

```powershell
npx supabase login
npx supabase link --project-ref gjphsheavnkdtmsrxmtl
npx supabase db push
```

**⚠️ Nota:** Isso baixa o CLI toda vez, mas funciona.

---

## 🚀 Após Instalar

### 1. Fazer Login

```powershell
supabase login
```

Isso abre o navegador. Faça login com `mrockgarage@gmail.com`

### 2. Linkar ao Projeto

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
supabase link --project-ref gjphsheavnkdtmsrxmtl
```

**Senha do banco:** `123Mudarmiggro@`

### 3. Fazer Deploy

```powershell
supabase db push
```

---

## ⚠️ Troubleshooting

### Erro: "scoop: command not found"

**Solução:** Instale o Scoop primeiro (veja Opção 1, Passo 1)

### Erro: "ExecutionPolicy"

**Solução:** Execute como Administrador:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro: "supabase: command not found" após instalar

**Solução:**
1. Feche e abra o terminal novamente
2. Ou adicione ao PATH manualmente:
   ```powershell
   $env:PATH += ";$env:USERPROFILE\scoop\apps\supabase\current"
   ```

---

## 📝 Script Automatizado

Execute o script que criei:

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
powershell -ExecutionPolicy Bypass -File "instalar-supabase-cli-windows.ps1"
```

---

**🎉 Depois de instalar, você pode fazer login e deploy!**

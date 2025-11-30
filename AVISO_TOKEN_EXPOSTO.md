<<<<<<< HEAD
# ⚠️ URGENTE: Token GitHub Exposto!

## 🚨 AÇÃO NECESSÁRIA IMEDIATA

Um token GitHub apareceu **EXPOSTO** nos logs do script `PUSH_DEFINITIVO_VERIFICAR.bat`.

**⚠️ O token foi removido por segurança.**

---

## ✅ O QUE FAZER AGORA

### 1. Revogar o Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Encontre o token exposto (procure por tokens recentes)
3. Clique em **"Revoke"** (Revogar)
4. Confirme a revogação

### 2. Criar um Novo Token

1. Acesse: https://github.com/settings/tokens/new
2. Dê um nome descritivo (ex: "MIGGRO Deploy Token")
3. Selecione as permissões necessárias:
   - ✅ `repo` (acesso completo ao repositório)
4. Clique em **"Generate token"**
5. **COPIE O TOKEN IMEDIATAMENTE** (ele só aparece uma vez!)

### 3. Atualizar o Script

Substitua o token antigo no script `PUSH_DEFINITIVO_VERIFICAR.bat`:

```batch
git remote set-url origin https://<NOVO_TOKEN>@github.com/MIGGRO-OFICIAL/MIGRRO-OFICIAL.git
```

---

## 🔒 Boas Práticas

1. **NUNCA** commite tokens em arquivos
2. Use variáveis de ambiente quando possível
3. Adicione arquivos com tokens ao `.gitignore`
4. Revogue tokens expostos imediatamente

---

## 📝 Arquivos que Precisam Atualização

- `PUSH_DEFINITIVO_VERIFICAR.bat` (linha com `git remote set-url`)
- `push_gitbash_com_token.sh` (se existir)
- Qualquer outro script que contenha o token

---

**⚠️ FAÇA ISSO AGORA ANTES DE CONTINUAR!**


=======
# ⚠️ URGENTE: Token GitHub Exposto!

## 🚨 AÇÃO NECESSÁRIA IMEDIATA

Um token GitHub apareceu **EXPOSTO** nos logs do script `PUSH_DEFINITIVO_VERIFICAR.bat`.

**⚠️ O token foi removido por segurança.**

---

## ✅ O QUE FAZER AGORA

### 1. Revogar o Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Encontre o token exposto (procure por tokens recentes)
3. Clique em **"Revoke"** (Revogar)
4. Confirme a revogação

### 2. Criar um Novo Token

1. Acesse: https://github.com/settings/tokens/new
2. Dê um nome descritivo (ex: "MIGGRO Deploy Token")
3. Selecione as permissões necessárias:
   - ✅ `repo` (acesso completo ao repositório)
4. Clique em **"Generate token"**
5. **COPIE O TOKEN IMEDIATAMENTE** (ele só aparece uma vez!)

### 3. Atualizar o Script

Substitua o token antigo no script `PUSH_DEFINITIVO_VERIFICAR.bat`:

```batch
git remote set-url origin https://<NOVO_TOKEN>@github.com/MIGGRO-OFICIAL/MIGRRO-OFICIAL.git
```

---

## 🔒 Boas Práticas

1. **NUNCA** commite tokens em arquivos
2. Use variáveis de ambiente quando possível
3. Adicione arquivos com tokens ao `.gitignore`
4. Revogue tokens expostos imediatamente

---

## 📝 Arquivos que Precisam Atualização

- `PUSH_DEFINITIVO_VERIFICAR.bat` (linha com `git remote set-url`)
- `push_gitbash_com_token.sh` (se existir)
- Qualquer outro script que contenha o token

---

**⚠️ FAÇA ISSO AGORA ANTES DE CONTINUAR!**

>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2

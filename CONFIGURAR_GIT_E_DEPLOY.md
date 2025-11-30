# 🔧 Configurar Git e Fazer Deploy para Produção

## ⚠️ Situação Atual

O projeto **não está configurado como repositório Git** ainda. Vamos configurar agora!

---

## 📋 PASSO 1: Inicializar Repositório Git

Execute no PowerShell (no diretório do projeto):

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"

# Inicializar Git
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "feat: projeto MIGGRO completo com dados mock"
```

---

## 📋 PASSO 2: Conectar ao GitHub

### Opção A: Se já existe repositório no GitHub

```powershell
# Adicionar remote (substitua SEU_USUARIO pelo seu username)
git remote add origin https://github.com/SEU_USUARIO/MIGRRO-OFICIAL.git

# Verificar
git remote -v

# Fazer push
git branch -M main
git push -u origin main
```

### Opção B: Criar novo repositório no GitHub

1. **Acesse:** https://github.com/new
2. **Nome do repositório:** `MIGRRO-OFICIAL` (ou outro nome)
3. **NÃO marque** "Add a README file"
4. **Clique em "Create repository"**
5. **Depois execute:**

```powershell
git remote add origin https://github.com/SEU_USUARIO/MIGRRO-OFICIAL.git
git branch -M main
git push -u origin main
```

---

## 📋 PASSO 3: Verificar Deploy no Vercel

Após fazer push no GitHub:

1. **Acesse:** https://vercel.com/dashboard
2. **Encontre o projeto:** `migrrooficial`
3. **Verifique se o deploy automático iniciou**
4. **Aguarde a conclusão**
5. **Teste:** https://migrrooficial.vercel.app/

---

## 🔍 Verificar Edge Functions no Supabase

Como o projeto não usa edge functions ainda, você só precisa verificar manualmente:

1. **Acesse:** https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl/functions
2. **Se não houver functions, está OK!**

---

## ✅ Checklist Completo

### Git e GitHub:
- [ ] Git inicializado (`git init`)
- [ ] Arquivos adicionados (`git add .`)
- [ ] Primeiro commit feito (`git commit`)
- [ ] Remote configurado (`git remote add origin`)
- [ ] Push feito (`git push -u origin main`)

### Vercel:
- [ ] Projeto conectado ao GitHub
- [ ] Deploy automático funcionando
- [ ] URL de produção acessível: https://migrrooficial.vercel.app/

### Supabase:
- [ ] Edge Functions verificadas (não há, está OK)
- [ ] Migrations aplicadas (já feito)
- [ ] Dados mock aplicados (já feito)

---

## 🚀 Comandos Rápidos

```powershell
# Navegar até o projeto
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"

# Inicializar Git
git init

# Adicionar tudo
git add .

# Commit
git commit -m "feat: projeto MIGGRO completo"

# Conectar ao GitHub (substitua a URL)
git remote add origin https://github.com/SEU_USUARIO/MIGRRO-OFICIAL.git

# Push
git branch -M main
git push -u origin main
```

---

## ⚠️ Se der erro de autenticação no GitHub

Você precisará usar um **Personal Access Token**:

1. **Acesse:** https://github.com/settings/tokens
2. **Clique em "Generate new token"**
3. **Marque as permissões:** `repo` (acesso completo aos repositórios)
4. **Copie o token**
5. **Use no lugar da senha** quando o Git pedir

---

## 📝 Próximos Passos Após Configurar

1. **Fazer push regularmente:**
   ```powershell
   git add .
   git commit -m "sua mensagem"
   git push origin main
   ```

2. **Vercel fará deploy automático** a cada push

3. **Verificar produção:**
   - https://migrrooficial.vercel.app/

---

**🎯 Pronto! Siga os passos acima para configurar Git e fazer deploy!**

# 🚀 Executar Deploy via Supabase CLI - Passo a Passo

## ⚠️ IMPORTANTE
Execute estes comandos **manualmente no terminal PowerShell**, pois alguns requerem interação (login no navegador).

---

## 📋 Passo a Passo Completo

### 1️⃣ Abrir PowerShell
Abra o PowerShell como Administrador (opcional, mas recomendado).

### 2️⃣ Navegar até o projeto
```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
```

### 3️⃣ Verificar se Supabase CLI está instalado
```powershell
supabase --version
```

**Se não estiver instalado:**
```powershell
npm install -g supabase
```

### 4️⃣ Fazer Login no Supabase
```powershell
supabase login
```

**O que acontece:**
- Abre seu navegador automaticamente
- Faça login com: `mrockgarage@gmail.com`
- Autorize o CLI
- Volte ao terminal e verifique se apareceu: `Logged in as: mrockgarage@gmail.com`

### 5️⃣ Linkar ao Projeto
```powershell
supabase link --project-ref gjphsheavnkdtmsrxmtl
```

**Quando pedir a senha do banco, digite:**
```
123Mudarmiggro@
```

**✅ Quando linkado, você verá:** `Linked to project gjphsheavnkdtmsrxmtl`

### 6️⃣ Verificar Status
```powershell
supabase status
```

Isso mostra informações sobre o projeto linkado.

### 7️⃣ Ver Migrations Locais
```powershell
supabase migration list
```

Isso lista todas as migrations que serão aplicadas.

### 8️⃣ Fazer Push das Migrations
```powershell
supabase db push
```

**⚠️ ATENÇÃO:** Isso vai aplicar TODAS as migrations no banco de dados!

**O que acontece:**
- O CLI compara as migrations locais com as do servidor
- Aplica apenas as que ainda não foram aplicadas
- Mostra o progresso de cada migration
- Pode levar alguns minutos dependendo da quantidade

**✅ Quando concluído, você verá:** `Finished supabase db push`

---

## 🔍 Verificar se Deu Certo

### No Terminal:
```powershell
supabase migration list
```

Deve mostrar todas as migrations com status `Applied`.

### No Dashboard:
1. Acesse: https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl
2. Vá em **Database** > **Migrations**
3. Verifique se todas as migrations aparecem como aplicadas

### Verificar Tabelas:
1. No Dashboard, vá em **Database** > **Tables**
2. Verifique se as tabelas foram criadas:
   - `profiles`
   - `posts`
   - `service_listings`
   - `groups`
   - etc.

---

## ⚠️ Troubleshooting

### Erro: "command not found: supabase"
**Solução:**
```powershell
npm install -g supabase
# Depois feche e abra o terminal novamente
```

### Erro: "not logged in"
**Solução:**
```powershell
supabase login
```

### Erro: "project not found"
**Solução:**
```powershell
supabase link --project-ref gjphsheavnkdtmsrxmtl
```

### Erro: "database password incorrect"
**Solução:**
- Verifique se a senha está correta: `123Mudarmiggro@`
- Se não funcionar, você pode resetar a senha no dashboard:
  1. Acesse: https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl/settings/database
  2. Role até "Database Password"
  3. Clique em "Reset Database Password"
  4. Copie a nova senha
  5. Use a nova senha no `supabase link`

### Erro: "migration already applied"
**Solução:**
- Isso é normal! Significa que a migration já foi aplicada antes
- O CLI só aplica migrations novas

### Erro: "syntax error" ou "relation already exists"
**Solução:**
- Alguma migration pode ter erro de SQL
- Verifique os logs de erro
- Corrija o arquivo SQL e tente novamente
- Ou marque a migration como aplicada manualmente no dashboard

---

## 📝 Ordem das Migrations

As migrations serão aplicadas na ordem numérica:

1. `001_initial_schema.sql` - Schema inicial (tabelas principais)
2. `002_admin_tables.sql` - Tabelas admin
3. `003_add_group_posts.sql` - Posts em grupos
4. `004_notifications.sql` - Sistema de notificações
5. `005_add_rating_columns.sql` - Colunas de rating
6. `006_provider_analytics.sql` - Analytics de providers
7. `007_payments_badges_moderation.sql` - Pagamentos, badges, moderação
8. `998_01_paises_cidades.sql` até `998_15_final.sql` - Dados mock (opcional)
9. `999_create_admin_master.sql` - Criar admin master (opcional)

---

## ✅ Checklist de Deploy

- [ ] Supabase CLI instalado (`supabase --version`)
- [ ] Login realizado (`supabase login`)
- [ ] Projeto linkado (`supabase link`)
- [ ] Migrations verificadas (`supabase migration list`)
- [ ] Push executado (`supabase db push`)
- [ ] Migrations aplicadas verificadas no dashboard
- [ ] Tabelas criadas verificadas no dashboard

---

## 🎯 Após o Deploy

1. **Aplicar dados mock (opcional):**
   - Execute as migrations `998_01` até `998_15` manualmente no SQL Editor
   - Ou execute: `supabase db push` novamente (só aplica as novas)

2. **Criar admin master:**
   - Execute `999_create_admin_master.sql` no SQL Editor
   - Ou via CLI se necessário

3. **Verificar tudo funcionando:**
   - Acesse o app: https://migrrooficial.vercel.app/
   - Teste login com: `rafaelmilfont@gmail.com` / `123Mudar`

---

**🚀 Pronto para fazer o deploy! Execute os comandos acima no terminal.**

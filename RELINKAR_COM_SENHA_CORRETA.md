# 🔗 Relinkar Projeto com Senha Correta

## ✅ Senha Confirmada

**Senha do Banco de Dados:**
```
123Mudarmiggro@
```

**⚠️ IMPORTANTE:** A senha inclui o símbolo `@` no final!  
**Fonte:** Documento `ligando_miggro.md` linha 37

---

## 🔧 Passos para Relinkar

### 1. Deslinkar (se necessário)

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
npx supabase unlink
```

### 2. Linkar com Senha Correta

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\MIGGRO"
npx supabase link --project-ref gjphsheavnkdtmsrxmtl
```

**Quando pedir a senha do banco de dados:**
```
123Mudarmiggro@
```

**⚠️ Digite exatamente:** `123Mudarmiggro@` (com o @ no final!)

### 3. Verificar Link

```powershell
npx supabase projects list
```

**Deve mostrar:**
```
LINKED | REFERENCE ID         | NAME
  ●    | gjphsheavnkdtmsrxmtl | MIGGRO-OFICIAL's Project
```

### 4. Verificar Workdir

```powershell
npx supabase migration list
```

**Deve mostrar:**
```
Using workdir C:\Users\rafae\OneDrive\Documentos\MIGGRO
```

**E listar apenas migrations do MIGGRO:**
- ✅ `001_initial_schema.sql`
- ✅ `002_admin_tables.sql`
- ✅ `003_add_group_posts.sql`
- etc.

**NÃO deve mostrar migrations do Rendizy!**

---

## 📝 Informações do Projeto

- **Project Reference:** `gjphsheavnkdtmsrxmtl`
- **Senha do Banco:** `123Mudarmiggro@` (com @ no final!)
- **URL:** https://gjphsheavnkdtmsrxmtl.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/gjphsheavnkdtmsrxmtl

---

**🎯 Execute os comandos acima para relinkar com a senha correta!**

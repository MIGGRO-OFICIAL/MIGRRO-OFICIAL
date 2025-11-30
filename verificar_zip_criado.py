#!/usr/bin/env python3
"""Verificar se o ZIP criado está correto e contém todas as correções"""

import zipfile
from pathlib import Path
import re

ZIP_PATH = Path(r"C:\Users\rafae\Downloads\MIGGRO_PUSH_MANUAL.zip")

print("=" * 70)
print("VERIFICAÇÃO DO ZIP CRIADO")
print("=" * 70)
print(f"\nZIP: {ZIP_PATH}")
print(f"Existe: {ZIP_PATH.exists()}\n")

if not ZIP_PATH.exists():
    print("ERRO: ZIP não encontrado!")
    exit(1)

# Informações básicas
zip_size_mb = ZIP_PATH.stat().st_size / (1024 * 1024)
print(f"Tamanho: {zip_size_mb:.2f} MB\n")

# Abrir ZIP
with zipfile.ZipFile(ZIP_PATH, 'r') as z:
    all_files = sorted(z.namelist())
    print(f"Total de arquivos: {len(all_files)}\n")
    
    # 1. Verificar arquivos críticos que corrigimos
    print("=" * 70)
    print("1. ARQUIVOS CRÍTICOS CORRIGIDOS")
    print("=" * 70)
    
    critical_files = {
        'components/CreateReviewModal.tsx': 'Componente de reviews',
        'components/ReportModal.tsx': 'Componente de denúncias',
        'components/ShareButton.tsx': 'Componente de compartilhamento',
        'components/CreateServiceModal.tsx': 'Componente de criação de serviços',
        'lib/supabase/chat.ts': 'Serviço de chat',
        'lib/supabase/search.ts': 'Serviço de busca',
        'lib/supabase/notifications.ts': 'Serviço de notificações',
        'lib/supabase/moderation.ts': 'Serviço de moderação',
        'lib/supabase/admin.ts': 'Serviço admin',
        'lib/supabase/badges.ts': 'Serviço de badges',
        'lib/supabase/payments.ts': 'Serviço de pagamentos',
        'supabase/migrations/001_initial_schema.sql': 'Migration inicial',
        'supabase/migrations/002_admin_tables.sql': 'Migration admin',
        'supabase/migrations/003_add_group_posts.sql': 'Migration grupos',
        'supabase/migrations/004_notifications.sql': 'Migration notificações',
        'supabase/migrations/005_add_rating_columns.sql': 'Migration ratings',
        'supabase/migrations/006_provider_analytics.sql': 'Migration analytics',
        'supabase/migrations/007_payments_badges_moderation.sql': 'Migration pagamentos',
        'README.md': 'README principal',
        'index.css': 'CSS global',
    }
    
    missing = []
    present = []
    
    for file_path, description in critical_files.items():
        # Tentar diferentes variações do caminho
        found = False
        for entry in all_files:
            if entry.replace('\\', '/').endswith(file_path.replace('\\', '/')):
                present.append((entry, description))
                found = True
                break
        
        if not found:
            missing.append((file_path, description))
    
    print(f"\n✅ Arquivos presentes: {len(present)}")
    for f, d in present:
        print(f"  [OK] {f} - {d}")
    
    if missing:
        print(f"\n❌ Arquivos faltando: {len(missing)}")
        for f, d in missing:
            print(f"  [FALTANDO] {f} - {d}")
    else:
        print("\n✅ Todos os arquivos críticos estão presentes!")
    
    # 2. Verificar conflitos de merge
    print("\n" + "=" * 70)
    print("2. VERIFICAÇÃO DE CONFLITOS DE MERGE")
    print("=" * 70)
    
    files_with_conflicts = []
    
    for entry in all_files:
        if any(entry.endswith(ext) for ext in ['.tsx', '.ts', '.jsx', '.js', '.sql', '.md', '.txt', '.css']):
            try:
                content = z.read(entry).decode('utf-8', errors='ignore')
                if re.search(r'<<<<<<< HEAD|=======|>>>>>>> origin/main', content):
                    files_with_conflicts.append(entry)
            except:
                pass
    
    if files_with_conflicts:
        print(f"\n❌ ARQUIVOS COM CONFLITOS ENCONTRADOS: {len(files_with_conflicts)}")
        for f in files_with_conflicts[:20]:
            print(f"  [CONFLITO] {f}")
        if len(files_with_conflicts) > 20:
            print(f"  ... e mais {len(files_with_conflicts) - 20} arquivos com conflitos")
    else:
        print("\n✅ NENHUM CONFLITO ENCONTRADO! Todos os arquivos estão limpos.")
    
    # 3. Verificar migrations SQL
    print("\n" + "=" * 70)
    print("3. VERIFICAÇÃO DAS MIGRATIONS SQL")
    print("=" * 70)
    
    migrations = [f for f in all_files if 'migrations' in f and f.endswith('.sql')]
    print(f"\nMigrations encontradas: {len(migrations)}")
    
    migrations_with_conflicts = []
    for m in migrations:
        try:
            content = z.read(m).decode('utf-8', errors='ignore')
            if re.search(r'<<<<<<< HEAD|=======|>>>>>>> origin/main', content):
                migrations_with_conflicts.append(m)
        except:
            pass
    
    if migrations_with_conflicts:
        print(f"\n❌ Migrations com conflitos: {len(migrations_with_conflicts)}")
        for m in migrations_with_conflicts:
            print(f"  [CONFLITO] {m}")
    else:
        print("\n✅ Todas as migrations estão limpas!")
    
    # 4. Verificar documentação
    print("\n" + "=" * 70)
    print("4. VERIFICAÇÃO DA DOCUMENTAÇÃO")
    print("=" * 70)
    
    docs = [f for f in all_files if f.endswith('.md') or f.endswith('.txt')]
    print(f"\nArquivos de documentação: {len(docs)}")
    
    docs_with_conflicts = []
    for d in docs:
        try:
            content = z.read(d).decode('utf-8', errors='ignore')
            if re.search(r'<<<<<<< HEAD|=======|>>>>>>> origin/main', content):
                docs_with_conflicts.append(d)
        except:
            pass
    
    if docs_with_conflicts:
        print(f"\n❌ Documentação com conflitos: {len(docs_with_conflicts)}")
        for d in docs_with_conflicts[:10]:
            print(f"  [CONFLITO] {d}")
    else:
        print("\n✅ Toda documentação está limpa!")
    
    # 5. Verificar estrutura de diretórios
    print("\n" + "=" * 70)
    print("5. ESTRUTURA DE DIRETÓRIOS")
    print("=" * 70)
    
    dirs_to_check = ['components', 'lib', 'views', 'contexts', 'assets', 'supabase/migrations']
    for dir_name in dirs_to_check:
        dir_files = [f for f in all_files if dir_name.replace('/', '\\') in f.replace('/', '\\')]
        print(f"  {dir_name}/: {len(dir_files)} arquivos")
    
    # Resumo final
    print("\n" + "=" * 70)
    print("RESUMO FINAL")
    print("=" * 70)
    
    total_issues = len(missing) + len(files_with_conflicts)
    
    if total_issues == 0:
        print("\n✅✅✅ ZIP ESTÁ PERFEITO! ✅✅✅")
        print("   - Todos os arquivos críticos presentes")
        print("   - Nenhum conflito de merge encontrado")
        print("   - Pronto para push no GitHub!")
    else:
        print(f"\n⚠️  ATENÇÃO: {total_issues} problema(s) encontrado(s):")
        if missing:
            print(f"   - {len(missing)} arquivo(s) crítico(s) faltando")
        if files_with_conflicts:
            print(f"   - {len(files_with_conflicts)} arquivo(s) com conflitos de merge")
        print("\n   O ZIP precisa ser corrigido antes do push.")
    
    print("=" * 70)

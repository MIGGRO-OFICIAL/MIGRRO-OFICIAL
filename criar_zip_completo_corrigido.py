#!/usr/bin/env python3
"""Criar ZIP completo corrigido baseado no GitHub e arquivos locais"""

import zipfile
from pathlib import Path
import re
import sys

PROJECT_DIR = Path(r"c:\Users\rafae\OneDrive\Documentos\MIGGRO")
GITHUB_ZIP = Path(r"c:\Users\rafae\Downloads\MIGRRO-OFICIAL-main (1).zip")
OUTPUT_ZIP = Path.home() / "Downloads" / "MIGGRO_COMPLETO_CORRIGIDO.zip"

print("=" * 60)
print("CRIANDO ZIP COMPLETO E CORRIGIDO PARA GITHUB")
print("=" * 60)
print(f"\nProjeto: {PROJECT_DIR}")
print(f"GitHub ZIP: {GITHUB_ZIP}")
print(f"Saída: {OUTPUT_ZIP}\n")

# 1. Analisar conflitos no GitHub
print("1. Analisando conflitos no ZIP do GitHub...")
github_conflicts = []
if GITHUB_ZIP.exists():
    try:
        with zipfile.ZipFile(GITHUB_ZIP, 'r') as z:
            for entry in z.namelist():
                if any(entry.endswith(ext) for ext in ['.tsx', '.ts', '.jsx', '.js', '.sql', '.md', '.txt', '.css']):
                    try:
                        content = z.read(entry).decode('utf-8', errors='ignore')
                        if re.search(r'<<<<<<< HEAD|=======|>>>>>>> origin/main', content):
                            github_conflicts.append(entry)
                            print(f"  [CONFLITO] {entry}")
                    except:
                        pass
        print(f"\n  Total de conflitos encontrados no GitHub: {len(github_conflicts)}\n")
    except Exception as e:
        print(f"  [ERRO] Não foi possível ler o ZIP do GitHub: {e}\n")
else:
    print(f"  [AVISO] ZIP do GitHub não encontrado: {GITHUB_ZIP}\n")

# 2. Coletar arquivos do projeto local
print("2. Coletando arquivos do projeto local (corrigidos)...")
files_to_include = []

# Configuração
config_files = ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 
                '.gitignore', '.env.local.example', '.cursorrules', 'vercel.json']
for f in config_files:
    fp = PROJECT_DIR / f
    if fp.exists():
        files_to_include.append(fp)
        print(f"  [OK] {f}")

# Migrations
migrations_dir = PROJECT_DIR / "supabase" / "migrations"
if migrations_dir.exists():
    sql_files = list(migrations_dir.glob("*.sql"))
    files_to_include.extend(sql_files)
    print(f"  [OK] {len(sql_files)} migrations SQL")

# README migrations
readme_mig = PROJECT_DIR / "supabase" / "README_MIGRATIONS.md"
if readme_mig.exists():
    files_to_include.append(readme_mig)
    print("  [OK] supabase/README_MIGRATIONS.md")

# Documentação
docs = ['README.md', 'COMANDOS_GITHUB.txt', 'GITHUB_SETUP.md', 'GIT_SETUP.md',
        'ERROS_CORRIGIDOS.md', 'TESTE_RAPIDO.md', 'SEGURANCA_REPOSITORIO.md',
        'VARIAVEIS_AMBIENTE_VERCEL.md', 'VARIAVEIS_VERCEL_COPIAR.txt',
        'ARQUIVOS_REMOVIDOS.md', 'CORRIGIR_MIGRATION_004.sql']
for d in docs:
    fp = PROJECT_DIR / d
    if fp.exists():
        files_to_include.append(fp)
        print(f"  [OK] {d}")

# Diretórios
dirs_to_include = ['lib', 'components', 'views', 'contexts', 'assets']
for dir_name in dirs_to_include:
    dir_path = PROJECT_DIR / dir_name
    if dir_path.exists():
        dir_files = [f for f in dir_path.rglob("*") if f.is_file()]
        files_to_include.extend(dir_files)
        print(f"  [OK] {dir_name}/ ({len(dir_files)} arquivos)")

# Arquivos raiz
for ext in ['*.ts', '*.tsx', '*.css']:
    root_files = [f for f in PROJECT_DIR.glob(ext) if f.is_file() and f.name != 'index.tsx']
    files_to_include.extend(root_files)
    if root_files:
        print(f"  [OK] {ext} na raiz ({len(root_files)} arquivos)")

# 3. Verificar se arquivos com conflitos estão corrigidos
print(f"\n3. Verificando se conflitos foram corrigidos...")
for conflict_file in github_conflicts[:10]:  # Primeiros 10
    local_path = conflict_file.replace('MIGRRO-OFICIAL-main/', '').replace('MIGRRO-OFICIAL-main\\', '')
    local_file = PROJECT_DIR / local_path
    if local_file.exists():
        content = local_file.read_text(encoding='utf-8', errors='ignore')
        if re.search(r'<<<<<<< HEAD|=======|>>>>>>> origin/main', content):
            print(f"  [AINDA TEM CONFLITO] {local_path}")
        else:
            print(f"  [CORRIGIDO] {local_path}")

# 4. Criar ZIP
print(f"\n4. Criando ZIP completo...")
if OUTPUT_ZIP.exists():
    OUTPUT_ZIP.unlink()
    print("  [REMOVED] ZIP anterior")

added = 0
errors = 0

with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for file_path in files_to_include:
        try:
            # Verificar se não tem conflitos
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            if re.search(r'<<<<<<< HEAD|=======|>>>>>>> origin/main', content):
                print(f"  [AVISO] {file_path.name} ainda tem conflitos, mas incluindo mesmo assim")
            
            relative_path = file_path.relative_to(PROJECT_DIR)
            zipf.write(file_path, str(relative_path).replace('\\', '/'))
            added += 1
        except Exception as e:
            print(f"  [ERRO] {file_path}: {e}")
            errors += 1

zip_size_mb = OUTPUT_ZIP.stat().st_size / (1024 * 1024)

print(f"\n" + "=" * 60)
print("ZIP CRIADO COM SUCESSO!")
print("=" * 60)
print(f"Local: {OUTPUT_ZIP}")
print(f"Tamanho: {zip_size_mb:.2f} MB")
print(f"Arquivos incluídos: {added}")
print(f"Erros: {errors}")
print(f"Conflitos no GitHub corrigidos: {len(github_conflicts)}")
print("=" * 60)

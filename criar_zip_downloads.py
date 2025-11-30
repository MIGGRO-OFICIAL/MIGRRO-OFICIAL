#!/usr/bin/env python3
"""Script para criar ZIP com arquivos para push manual no GitHub"""

import os
import zipfile
from pathlib import Path

# Diretório do projeto
PROJECT_DIR = Path(r"c:\Users\rafae\OneDrive\Documentos\MIGGRO")
DOWNLOADS_DIR = Path.home() / "Downloads"
ZIP_PATH = DOWNLOADS_DIR / "MIGGRO_PUSH_MANUAL.zip"

print("=== CRIANDO ZIP PARA PUSH MANUAL ===")
print(f"Destino: {ZIP_PATH}\n")

# Lista de arquivos para incluir
files_to_include = []

# 1. Arquivos de configuração
print("1. Coletando arquivos de configuração...")
config_files = [
    'package.json', 'tsconfig.json', 'vite.config.ts', 'index.html',
    '.gitignore', '.env.local.example', '.cursorrules', 'vercel.json'
]
for f in config_files:
    file_path = PROJECT_DIR / f
    if file_path.exists():
        files_to_include.append(file_path)
        print(f"  [OK] {f}")

# 2. Migrations SQL
print("\n2. Coletando migrations SQL...")
migrations_dir = PROJECT_DIR / "supabase" / "migrations"
if migrations_dir.exists():
    sql_files = list(migrations_dir.glob("*.sql"))
    files_to_include.extend(sql_files)
    print(f"  [OK] {len(sql_files)} arquivos SQL")

# 3. README de migrations
print("\n3. Coletando documentação...")
readme_migrations = PROJECT_DIR / "supabase" / "README_MIGRATIONS.md"
if readme_migrations.exists():
    files_to_include.append(readme_migrations)
    print("  [OK] supabase/README_MIGRATIONS.md")

# 4. Documentação corrigida
print("\n4. Coletando documentação corrigida...")
docs = [
    'README.md', 'COMANDOS_GITHUB.txt', 'GITHUB_SETUP.md', 'GIT_SETUP.md',
    'ERROS_CORRIGIDOS.md', 'TESTE_RAPIDO.md', 'SEGURANCA_REPOSITORIO.md',
    'VARIAVEIS_AMBIENTE_VERCEL.md', 'VARIAVEIS_VERCEL_COPIAR.txt',
    'ARQUIVOS_REMOVIDOS.md', 'CORRIGIR_MIGRATION_004.sql'
]
for d in docs:
    file_path = PROJECT_DIR / d
    if file_path.exists():
        files_to_include.append(file_path)
        print(f"  [OK] {d}")

# 5. Código fonte - lib/
print("\n5. Coletando código fonte (lib/)...")
lib_dir = PROJECT_DIR / "lib"
if lib_dir.exists():
    lib_files = list(lib_dir.rglob("*"))
    lib_files = [f for f in lib_files if f.is_file()]
    files_to_include.extend(lib_files)
    print(f"  [OK] {len(lib_files)} arquivos")

# 6. Código fonte - components/
print("\n6. Coletando componentes...")
components_dir = PROJECT_DIR / "components"
if components_dir.exists():
    comp_files = list(components_dir.rglob("*"))
    comp_files = [f for f in comp_files if f.is_file()]
    files_to_include.extend(comp_files)
    print(f"  [OK] {len(comp_files)} arquivos")

# 7. Código fonte - views/
print("\n7. Coletando views...")
views_dir = PROJECT_DIR / "views"
if views_dir.exists():
    view_files = list(views_dir.rglob("*"))
    view_files = [f for f in view_files if f.is_file()]
    files_to_include.extend(view_files)
    print(f"  [OK] {len(view_files)} arquivos")

# 8. Código fonte - contexts/
print("\n8. Coletando contexts...")
contexts_dir = PROJECT_DIR / "contexts"
if contexts_dir.exists():
    ctx_files = list(contexts_dir.rglob("*"))
    ctx_files = [f for f in ctx_files if f.is_file()]
    files_to_include.extend(ctx_files)
    print(f"  [OK] {len(ctx_files)} arquivos")

# 9. Assets
print("\n9. Coletando assets...")
assets_dir = PROJECT_DIR / "assets"
if assets_dir.exists():
    asset_files = list(assets_dir.rglob("*"))
    asset_files = [f for f in asset_files if f.is_file()]
    files_to_include.extend(asset_files)
    print(f"  [OK] {len(asset_files)} arquivos")

# 10. Arquivos TypeScript/CSS na raiz
print("\n10. Coletando arquivos na raiz...")
root_files = []
for ext in ['*.ts', '*.tsx', '*.css']:
    root_files.extend(PROJECT_DIR.glob(ext))
root_files = [f for f in root_files if f.is_file() and f.name != 'index.tsx']
files_to_include.extend(root_files)
print(f"  [OK] {len(root_files)} arquivos")

# Criar ZIP
print("\n=== CRIANDO ZIP ===")
if ZIP_PATH.exists():
    ZIP_PATH.unlink()
    print("  [REMOVED] ZIP anterior")

with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for file_path in files_to_include:
        # Calcular caminho relativo
        try:
            relative_path = file_path.relative_to(PROJECT_DIR)
            zipf.write(file_path, relative_path)
        except Exception as e:
            print(f"  [ERRO] {file_path}: {e}")

zip_size = ZIP_PATH.stat().st_size / (1024 * 1024)  # MB

print("\n=== ZIP CRIADO COM SUCESSO! ===")
print(f"Local: {ZIP_PATH}")
print(f"Tamanho: {zip_size:.2f} MB")
print(f"Total de arquivos: {len(files_to_include)}")
print()

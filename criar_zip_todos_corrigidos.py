#!/usr/bin/env python3
"""Criar ZIP completo com TODOS os arquivos corrigidos e limpos"""

import zipfile
from pathlib import Path
import re

PROJECT_DIR = Path(r"c:\Users\rafae\OneDrive\Documentos\MIGGRO")
OUTPUT_ZIP = Path.home() / "Downloads" / "MIGGRO_TODOS_CORRIGIDOS.zip"

print("=" * 70)
print("CRIANDO ZIP COM TODOS OS ARQUIVOS CORRIGIDOS")
print("=" * 70)
print(f"\nProjeto: {PROJECT_DIR}")
print(f"Destino: {OUTPUT_ZIP}\n")

# Lista de arquivos para incluir
files_to_include = []

# 1. Arquivos de configuração
print("1. Coletando arquivos de configuração...")
config_files = [
    'package.json', 'tsconfig.json', 'vite.config.ts', 'index.html',
    '.gitignore', '.env.local.example', '.cursorrules', 'vercel.json'
]
for f in config_files:
    fp = PROJECT_DIR / f
    if fp.exists():
        files_to_include.append(fp)
        print(f"  [OK] {f}")

# 2. Migrations SQL
print("\n2. Coletando migrations SQL...")
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

# 3. Documentação (opcional, mas incluindo)
print("\n3. Coletando documentação...")
docs = [
    'README.md', 'COMANDOS_GITHUB.txt', 'GITHUB_SETUP.md', 'GIT_SETUP.md',
    'ERROS_CORRIGIDOS.md', 'TESTE_RAPIDO.md', 'SEGURANCA_REPOSITORIO.md',
    'VARIAVEIS_AMBIENTE_VERCEL.md', 'VARIAVEIS_VERCEL_COPIAR.txt',
    'ARQUIVOS_REMOVIDOS.md', 'CORRIGIR_MIGRATION_004.sql', 'CORRIGIR_ERROS_VERCEL.md'
]
for d in docs:
    fp = PROJECT_DIR / d
    if fp.exists():
        files_to_include.append(fp)
        print(f"  [OK] {d}")

# 4. Diretórios de código (TODOS os arquivos)
print("\n4. Coletando código fonte...")
dirs_to_include = ['lib', 'components', 'views', 'contexts', 'assets']
for dir_name in dirs_to_include:
    dir_path = PROJECT_DIR / dir_name
    if dir_path.exists():
        dir_files = [f for f in dir_path.rglob("*") if f.is_file()]
        files_to_include.extend(dir_files)
        print(f"  [OK] {dir_name}/ ({len(dir_files)} arquivos)")

# 5. Arquivos raiz TypeScript/CSS
print("\n5. Coletando arquivos na raiz...")
for ext in ['*.ts', '*.tsx', '*.css']:
    root_files = [f for f in PROJECT_DIR.glob(ext) if f.is_file()]
    files_to_include.extend(root_files)
    if root_files:
        print(f"  [OK] {ext} na raiz ({len(root_files)} arquivos)")

# 6. Verificar se há conflitos antes de incluir
print("\n6. Verificando conflitos nos arquivos...")
files_with_conflicts = []
clean_files = []

for file_path in files_to_include:
    try:
        if any(file_path.suffix == ext for ext in ['.ts', '.tsx', '.js', '.jsx', '.sql', '.md', '.txt', '.css']):
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            if re.search(r'<<<<<<< HEAD|<<<<<<< CABEÇALHO|=======|>>>>>>> origin/main', content):
                files_with_conflicts.append(file_path)
                print(f"  [CONFLITO ENCONTRADO] {file_path.relative_to(PROJECT_DIR)}")
            else:
                clean_files.append(file_path)
        else:
            clean_files.append(file_path)
    except Exception as e:
        print(f"  [ERRO ao ler] {file_path.relative_to(PROJECT_DIR)}: {e}")

if files_with_conflicts:
    print(f"\n⚠️  ATENÇÃO: {len(files_with_conflicts)} arquivo(s) com conflitos encontrados!")
    print("   Estes arquivos NÃO serão incluídos no ZIP.")
    print("\n   Arquivos com conflitos:")
    for f in files_with_conflicts:
        print(f"     - {f.relative_to(PROJECT_DIR)}")
    print("\n   Corrija estes arquivos primeiro!")
else:
    print(f"\n✅ Todos os arquivos estão limpos! ({len(clean_files)} arquivos)")

# 7. Criar ZIP apenas com arquivos limpos
print(f"\n7. Criando ZIP com arquivos limpos...")
if OUTPUT_ZIP.exists():
    OUTPUT_ZIP.unlink()
    print("  [REMOVED] ZIP anterior")

added = 0
errors = 0

with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for file_path in clean_files:
        try:
            relative_path = file_path.relative_to(PROJECT_DIR)
            zipf.write(file_path, str(relative_path).replace('\\', '/'))
            added += 1
        except Exception as e:
            print(f"  [ERRO] {file_path.relative_to(PROJECT_DIR)}: {e}")
            errors += 1

zip_size_mb = OUTPUT_ZIP.stat().st_size / (1024 * 1024)

print(f"\n" + "=" * 70)
print("ZIP CRIADO COM SUCESSO!")
print("=" * 70)
print(f"Local: {OUTPUT_ZIP}")
print(f"Tamanho: {zip_size_mb:.2f} MB")
print(f"Arquivos incluídos: {added}")
if errors > 0:
    print(f"Erros: {errors}")
if files_with_conflicts:
    print(f"Arquivos excluídos (com conflitos): {len(files_with_conflicts)}")
print("=" * 70)

if not files_with_conflicts:
    print("\n✅✅✅ ZIP PRONTO PARA SUBSTITUIR NO GITHUB! ✅✅✅")
    print("\n📋 Instruções:")
    print("   1. Extraia o ZIP em uma pasta temporária")
    print("   2. No GitHub, substitua os arquivos pelos do ZIP")
    print("   3. Faça commit das mudanças")
    print("   4. O Vercel deve compilar sem erros!")
else:
    print("\n⚠️  CORRIJA OS ARQUIVOS COM CONFLITOS ANTES DE USAR O ZIP!")

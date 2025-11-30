#!/usr/bin/env python3
import zipfile
from pathlib import Path
import sys

PROJECT_DIR = Path(r"c:\Users\rafae\OneDrive\Documentos\MIGGRO")
DOWNLOADS_DIR = Path.home() / "Downloads"
ZIP_PATH = DOWNLOADS_DIR / "MIGGRO_PUSH_MANUAL.zip"

print("=== CRIANDO ZIP PARA PUSH MANUAL ===")
print(f"Projeto: {PROJECT_DIR}")
print(f"Destino: {ZIP_PATH}\n")

if not PROJECT_DIR.exists():
    print(f"ERRO: Diretório do projeto não encontrado: {PROJECT_DIR}")
    sys.exit(1)

files_to_include = []

# Configuração
config_files = ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 
                '.gitignore', '.env.local.example', '.cursorrules', 'vercel.json']
for f in config_files:
    file_path = PROJECT_DIR / f
    if file_path.exists():
        files_to_include.append(file_path)
        print(f"[OK] {f}")

# Migrations
migrations_dir = PROJECT_DIR / "supabase" / "migrations"
if migrations_dir.exists():
    sql_files = list(migrations_dir.glob("*.sql"))
    files_to_include.extend(sql_files)
    print(f"[OK] {len(sql_files)} migrations SQL")

# README migrations
readme_mig = PROJECT_DIR / "supabase" / "README_MIGRATIONS.md"
if readme_mig.exists():
    files_to_include.append(readme_mig)
    print("[OK] supabase/README_MIGRATIONS.md")

# Documentação
docs = ['README.md', 'COMANDOS_GITHUB.txt', 'GITHUB_SETUP.md', 'GIT_SETUP.md',
        'ERROS_CORRIGIDOS.md', 'TESTE_RAPIDO.md', 'SEGURANCA_REPOSITORIO.md',
        'VARIAVEIS_AMBIENTE_VERCEL.md', 'VARIAVEIS_VERCEL_COPIAR.txt',
        'ARQUIVOS_REMOVIDOS.md', 'CORRIGIR_MIGRATION_004.sql']
for d in docs:
    file_path = PROJECT_DIR / d
    if file_path.exists():
        files_to_include.append(file_path)
        print(f"[OK] {d}")

# Diretórios
dirs_to_include = ['lib', 'components', 'views', 'contexts', 'assets']
for dir_name in dirs_to_include:
    dir_path = PROJECT_DIR / dir_name
    if dir_path.exists():
        dir_files = [f for f in dir_path.rglob("*") if f.is_file()]
        files_to_include.extend(dir_files)
        print(f"[OK] {dir_name}/ ({len(dir_files)} arquivos)")

# Arquivos raiz
root_exts = ['*.ts', '*.tsx', '*.css']
for ext in root_exts:
    root_files = [f for f in PROJECT_DIR.glob(ext) if f.is_file() and f.name != 'index.tsx']
    files_to_include.extend(root_files)
    print(f"[OK] {ext} na raiz ({len(root_files)} arquivos)")

print(f"\nTotal: {len(files_to_include)} arquivos")

# Criar ZIP
print(f"\nCriando ZIP...")
if ZIP_PATH.exists():
    ZIP_PATH.unlink()
    print("[REMOVED] ZIP anterior")

with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for file_path in files_to_include:
        try:
            relative_path = file_path.relative_to(PROJECT_DIR)
            zipf.write(file_path, str(relative_path).replace('\\', '/'))
        except Exception as e:
            print(f"[ERRO] {file_path}: {e}")

zip_size_mb = ZIP_PATH.stat().st_size / (1024 * 1024)

print(f"\n=== ZIP CRIADO COM SUCESSO! ===")
print(f"Local: {ZIP_PATH}")
print(f"Tamanho: {zip_size_mb:.2f} MB")
print(f"Arquivos: {len(files_to_include)}")

#!/usr/bin/env python3
"""
Script para:
1. Analisar o ZIP do GitHub e encontrar arquivos com conflitos
2. Comparar com arquivos locais corrigidos
3. Criar ZIP completo e correto para substituir no GitHub
"""

import zipfile
from pathlib import Path
import re

# Caminhos
PROJECT_DIR = Path(r"c:\Users\rafae\OneDrive\Documentos\MIGGRO")
GITHUB_ZIP = Path(r"c:\Users\rafae\Downloads\MIGRRO-OFICIAL-main (1).zip")
DOWNLOADS_DIR = Path.home() / "Downloads"
OUTPUT_ZIP = DOWNLOADS_DIR / "MIGGRO_COMPLETO_CORRIGIDO.zip"

print("=== ANALISANDO ZIP DO GITHUB ===")
print(f"GitHub ZIP: {GITHUB_ZIP}")
print(f"Projeto Local: {PROJECT_DIR}")
print(f"ZIP de Saída: {OUTPUT_ZIP}\n")

# 1. Analisar arquivos com conflitos no ZIP do GitHub
print("1. Procurando conflitos no ZIP do GitHub...")
conflicts_in_github = []
if GITHUB_ZIP.exists():
    with zipfile.ZipFile(GITHUB_ZIP, 'r') as zip_ref:
        for entry in zip_ref.namelist():
            if any(entry.endswith(ext) for ext in ['.tsx', '.ts', '.jsx', '.js', '.sql', '.md', '.txt', '.css']):
                try:
                    content = zip_ref.read(entry).decode('utf-8', errors='ignore')
                    if re.search(r'^<<<<<<< HEAD|^=======|^>>>>>>> origin/main', content, re.MULTILINE):
                        conflicts_in_github.append(entry)
                        print(f"  [CONFLITO] {entry}")
                except:
                    pass
    print(f"\nTotal de arquivos com conflitos no GitHub: {len(conflicts_in_github)}\n")
else:
    print(f"  [AVISO] ZIP do GitHub não encontrado: {GITHUB_ZIP}\n")

# 2. Coletar todos os arquivos do projeto local (corrigidos)
print("2. Coletando arquivos do projeto local (corrigidos)...")
files_to_include = []

# Configuração
config_files = ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 
                '.gitignore', '.env.local.example', '.cursorrules', 'vercel.json']
for f in config_files:
    file_path = PROJECT_DIR / f
    if file_path.exists():
        files_to_include.append(file_path)
        print(f"  [OK] {f}")

# Migrations SQL
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
    file_path = PROJECT_DIR / d
    if file_path.exists():
        files_to_include.append(file_path)
        print(f"  [OK] {d}")

# Diretórios de código
dirs_to_include = ['lib', 'components', 'views', 'contexts', 'assets']
for dir_name in dirs_to_include:
    dir_path = PROJECT_DIR / dir_name
    if dir_path.exists():
        dir_files = [f for f in dir_path.rglob("*") if f.is_file()]
        files_to_include.extend(dir_files)
        print(f"  [OK] {dir_name}/ ({len(dir_files)} arquivos)")

# Arquivos raiz
root_exts = ['*.ts', '*.tsx', '*.css']
for ext in root_exts:
    root_files = [f for f in PROJECT_DIR.glob(ext) if f.is_file() and f.name != 'index.tsx']
    files_to_include.extend(root_files)
    print(f"  [OK] {ext} na raiz ({len(root_files)} arquivos)")

# 3. Verificar se arquivos com conflitos no GitHub estão corrigidos localmente
print(f"\n3. Verificando correções...")
for conflict_file in conflicts_in_github:
    # Remover prefixo MIGRRO-OFICIAL-main/ se existir
    local_path = conflict_file.replace('MIGRRO-OFICIAL-main/', '').replace('MIGRRO-OFICIAL-main\\', '')
    local_file = PROJECT_DIR / local_path
    
    if local_file.exists():
        content = local_file.read_text(encoding='utf-8', errors='ignore')
        if re.search(r'^<<<<<<< HEAD|^=======|^>>>>>>> origin/main', content, re.MULTILINE):
            print(f"  [ERRO] {local_path} ainda tem conflitos!")
        else:
            print(f"  [CORRIGIDO] {local_path}")

# 4. Criar ZIP completo
print(f"\n4. Criando ZIP completo e corrigido...")
if OUTPUT_ZIP.exists():
    OUTPUT_ZIP.unlink()
    print("  [REMOVED] ZIP anterior")

with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for file_path in files_to_include:
        try:
            relative_path = file_path.relative_to(PROJECT_DIR)
            zipf.write(file_path, str(relative_path).replace('\\', '/'))
        except Exception as e:
            print(f"  [ERRO] {file_path}: {e}")

zip_size_mb = OUTPUT_ZIP.stat().st_size / (1024 * 1024)

print(f"\n=== ZIP CRIADO COM SUCESSO! ===")
print(f"Local: {OUTPUT_ZIP}")
print(f"Tamanho: {zip_size_mb:.2f} MB")
print(f"Total de arquivos: {len(files_to_include)}")
print(f"\nArquivos com conflitos no GitHub que foram corrigidos: {len(conflicts_in_github)}")

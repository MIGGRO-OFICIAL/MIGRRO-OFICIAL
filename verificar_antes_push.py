#!/usr/bin/env python3
"""Verificar todos os arquivos antes do push para garantir que não há conflitos"""

import re
from pathlib import Path

PROJECT_DIR = Path(r"c:\Users\rafae\OneDrive\Documentos\MIGGRO")

print("=" * 70)
print("VERIFICAÇÃO FINAL ANTES DO PUSH")
print("=" * 70)
print(f"\nProjeto: {PROJECT_DIR}\n")

# Extensões de arquivos a verificar
extensions = ['.ts', '.tsx', '.js', '.jsx', '.sql', '.md', '.txt', '.css']

files_with_conflicts = []

# Verificar todos os arquivos
for ext in extensions:
    for file_path in PROJECT_DIR.rglob(f"*{ext}"):
        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            
            # Verificar conflitos
            if re.search(r'^<<<<<<<|^=======|^>>>>>>>', content, re.MULTILINE):
                files_with_conflicts.append(file_path)
                print(f"❌ [CONFLITO] {file_path.relative_to(PROJECT_DIR)}")
        except Exception as e:
            print(f"⚠️  [ERRO ao ler] {file_path.relative_to(PROJECT_DIR)}: {e}")

print("\n" + "=" * 70)
print("RESUMO")
print("=" * 70)

if files_with_conflicts:
    print(f"\n❌ ATENÇÃO: {len(files_with_conflicts)} arquivo(s) com conflitos encontrados!")
    print("\nArquivos com conflitos:")
    for f in files_with_conflicts:
        print(f"  - {f.relative_to(PROJECT_DIR)}")
    print("\n⚠️  CORRIJA ESTES ARQUIVOS ANTES DE FAZER PUSH!")
else:
    print("\n✅✅✅ PERFEITO! Nenhum conflito encontrado!")
    print("   Todos os arquivos estão limpos e prontos para push.")
    print("\n📋 Próximos passos:")
    print("   1. git add .")
    print("   2. git commit -m 'fix: Resolver conflitos de merge'")
    print("   3. git push origin main")

print("=" * 70)

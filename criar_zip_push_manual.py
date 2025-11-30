#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para criar ZIP com arquivos corrigidos para push manual
"""

import os
import zipfile
from pathlib import Path
from datetime import datetime

# Diretório do projeto
PROJECT_DIR = Path(r"C:\Users\rafae\OneDrive\Documentos\MIGGRO")
OUTPUT_DIR = Path(r"C:\Users\rafae\Downloads")
OUTPUT_FILE = OUTPUT_DIR / f"MIGGRO_PUSH_MANUAL_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"

# Arquivos e diretórios importantes para incluir
FILES_TO_INCLUDE = [
    # Arquivo corrigido
    "views/MarketplaceView.tsx",
    
    # Estrutura do projeto
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tsconfig.json",
    "index.html",
    "index.tsx",
    "index.css",
    "vercel.json",
    
    # App principal
    "App.tsx",
    
    # Views
    "views/",
    
    # Components
    "components/",
    
    # Lib/Supabase
    "lib/",
    
    # Contexts
    "contexts/",
    
    # Types
    "types.ts",
    
    # Assets
    "assets/",
    
    # Supabase migrations (se necessário)
    "supabase/migrations/",
    
    # Configurações
    ".gitignore",
    ".env.local.example",
]

def create_zip():
    """Cria ZIP com arquivos do projeto"""
    
    # Criar diretório de saída se não existir
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    print(f"📦 Criando ZIP: {OUTPUT_FILE}")
    print(f"📁 Diretório do projeto: {PROJECT_DIR}")
    print()
    
    with zipfile.ZipFile(OUTPUT_FILE, 'w', zipfile.ZIP_DEFLATED) as zipf:
        files_added = 0
        
        for item in FILES_TO_INCLUDE:
            source_path = PROJECT_DIR / item
            
            if not source_path.exists():
                print(f"⚠️  Não encontrado: {item}")
                continue
            
            if source_path.is_file():
                # Adicionar arquivo
                arcname = item
                zipf.write(source_path, arcname)
                files_added += 1
                print(f"✅ Adicionado: {item}")
            
            elif source_path.is_dir():
                # Adicionar diretório recursivamente
                for root, dirs, files in os.walk(source_path):
                    # Ignorar node_modules e outros diretórios desnecessários
                    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', '.next', '__pycache__']]
                    
                    for file in files:
                        # Ignorar arquivos desnecessários
                        if file.endswith(('.pyc', '.pyo', '.log', '.tmp')):
                            continue
                        
                        file_path = Path(root) / file
                        arcname = file_path.relative_to(PROJECT_DIR)
                        zipf.write(file_path, arcname)
                        files_added += 1
                
                print(f"✅ Adicionado diretório: {item}/ ({files_added} arquivos até agora)")
    
    print()
    print(f"✅ ZIP criado com sucesso!")
    print(f"📁 Localização: {OUTPUT_FILE}")
    print(f"📊 Total de arquivos: {files_added}")
    print(f"💾 Tamanho: {OUTPUT_FILE.stat().st_size / 1024 / 1024:.2f} MB")
    print()
    print("🎯 Próximos passos:")
    print("1. Extrair o ZIP")
    print("2. Fazer push manual no GitHub")
    print("3. Aguardar deploy no Vercel")

if __name__ == "__main__":
    try:
        create_zip()
    except Exception as e:
        print(f"❌ Erro ao criar ZIP: {e}")
        import traceback
        traceback.print_exc()

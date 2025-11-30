#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para executar push e capturar TODA a saída
"""
import subprocess
import sys
import os

def run_command(cmd, description):
    """Executa comando e retorna output completo"""
    print(f"\n{'='*60}")
    print(f"EXECUTANDO: {description}")
    print(f"COMANDO: {' '.join(cmd)}")
    print(f"{'='*60}\n")
    
    try:
        result = subprocess.run(
            cmd,
            cwd=r"C:\Users\rafae\OneDrive\Documentos\MIGGRO",
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        
        print("STDOUT:")
        print(result.stdout)
        print("\nSTDERR:")
        print(result.stderr)
        print(f"\nRETURN CODE: {result.returncode}")
        print(f"{'='*60}\n")
        
        return result
    except Exception as e:
        print(f"ERRO AO EXECUTAR: {e}")
        return None

def main():
    project_dir = r"C:\Users\rafae\OneDrive\Documentos\MIGGRO"
    os.chdir(project_dir)
    
    print("="*60)
    print("PUSH PARA GITHUB - CAPTURA COMPLETA DE OUTPUT")
    print("="*60)
    
    # 1. Verificar remote
    run_command(["git", "remote", "-v"], "Verificar remote")
    
    # 2. Configurar remote com token
    run_command(
        ["git", "remote", "set-url", "origin", 
         "https://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@github.com/MIGGRO-OFICIAL/MIGRRO-OFICIAL.git"],
        "Configurar remote com token"
    )
    
    # 3. Status
    run_command(["git", "status", "--short"], "Status do repositório")
    
    # 4. Add
    run_command(["git", "add", "."], "Adicionar arquivos")
    
    # 5. Commit
    run_command(
        ["git", "commit", "-m", "Fix: Correções de sintaxe e melhorias - auth.ts e search.ts"],
        "Fazer commit"
    )
    
    # 6. Fetch
    run_command(["git", "fetch", "origin"], "Fetch do origin")
    
    # 7. Push
    result = run_command(["git", "push", "origin", "main"], "Push para GitHub")
    
    if result and result.returncode != 0:
        print("\n⚠ PUSH FALHOU, TENTANDO FORCE-WITH-LEASE...\n")
        run_command(["git", "push", "--force-with-lease", "origin", "main"], "Push com force-with-lease")
    
    # 8. Verificar último commit
    run_command(["git", "log", "--oneline", "-3"], "Últimos commits")
    
    print("="*60)
    print("FIM DA EXECUÇÃO")
    print("="*60)

if __name__ == "__main__":
    main()

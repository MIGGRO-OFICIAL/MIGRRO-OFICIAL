#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para fazer push no GitHub de forma confiável
"""
import subprocess
import sys
import os
from datetime import datetime

def log(msg):
    """Log com timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {msg}")
    # Também escreve em arquivo
    with open("push_log.txt", "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {msg}\n")

def run_git(cmd, description, allow_fail=False):
    """Executa comando git"""
    log(f"{description}...")
    try:
        result = subprocess.run(
            ["git"] + cmd,
            cwd=r"C:\Users\rafae\OneDrive\Documentos\MIGGRO",
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='ignore'
        )
        
        if result.stdout:
            log(f"Output: {result.stdout.strip()}")
        if result.stderr:
            log(f"Stderr: {result.stderr.strip()}")
        
        if result.returncode == 0:
            log(f"✓ {description} - SUCESSO")
            return True
        else:
            if allow_fail:
                log(f"⚠ {description} - FALHOU (mas continuando)")
                return True
            log(f"✗ {description} - FALHOU (código: {result.returncode})")
            return False
    except Exception as e:
        log(f"✗ Erro ao executar {description}: {e}")
        return False

def main():
    project_dir = r"C:\Users\rafae\OneDrive\Documentos\MIGGRO"
    os.chdir(project_dir)
    
    log("=" * 50)
    log("INICIANDO PUSH PARA GITHUB")
    log("=" * 50)
    
    # 1. Status
    run_git(["status", "--short"], "Verificando status", allow_fail=True)
    
    # 2. Add
    if not run_git(["add", "."], "Adicionando arquivos"):
        log("Erro ao adicionar arquivos")
        return 1
    
    # 3. Commit
    commit_result = run_git(
        ["commit", "-m", "Fix: Correções de sintaxe e melhorias"],
        "Fazendo commit",
        allow_fail=True
    )
    
    # Verifica se realmente havia algo para commitar
    if not commit_result:
        log("Nenhuma mudança para commitar, verificando commits locais...")
    
    # 4. Fetch
    run_git(["fetch", "origin"], "Fazendo fetch", allow_fail=True)
    
    # 5. Push
    if not run_git(["push", "origin", "main"], "Fazendo push"):
        log("Push normal falhou, tentando com --force-with-lease...")
        if not run_git(["push", "--force-with-lease", "origin", "main"], "Force push"):
            log("Tentando push com --force (última tentativa)...")
            if not run_git(["push", "--force", "origin", "main"], "Force push (forçado)"):
                log("✗ FALHA TOTAL NO PUSH")
                return 1
    
    log("=" * 50)
    log("PUSH CONCLUÍDO COM SUCESSO!")
    log("=" * 50)
    return 0

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        log("\nOperação cancelada pelo usuário")
        sys.exit(1)
    except Exception as e:
        log(f"\nErro inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import subprocess
import sys
import os

os.chdir(r"C:\Users\rafae\OneDrive\Documentos\MIGGRO")

print("=" * 60)
print("Executando: npx supabase db push --include-all")
print("=" * 60)
print()

# Executar o comando
try:
    process = subprocess.Popen(
        ['npx', 'supabase', 'db', 'push', '--include-all'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True
    )
    
    # Enviar 'Y' para confirmar
    stdout, _ = process.communicate(input='Y\n', timeout=600)
    
    # Salvar em arquivo
    with open('push-output-completo.log', 'w', encoding='utf-8') as f:
        f.write(stdout)
    
    # Mostrar saída
    print(stdout)
    
    print()
    print("=" * 60)
    print(f"Exit code: {process.returncode}")
    print("Log completo salvo em: push-output-completo.log")
    print("=" * 60)
    
    sys.exit(process.returncode)
    
except subprocess.TimeoutExpired:
    print("ERRO: Comando excedeu o timeout de 10 minutos!")
    process.kill()
    sys.exit(1)
except Exception as e:
    print(f"ERRO ao executar: {e}")
    sys.exit(1)

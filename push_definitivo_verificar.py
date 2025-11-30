<<<<<<< HEAD
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import subprocess
import sys
import os
import time

os.chdir(r"C:\Users\rafae\OneDrive\Documentos\MIGGRO")

print("="*60)
print("PUSH DEFINITIVO PARA GITHUB")
print("="*60)
print()

# 1. Configurar remote
print("[1] Configurando remote com token...")
result = subprocess.run(
    ["git", "remote", "set-url", "origin", 
     "https://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@github.com/MIGGRO-OFICIAL/MIGRRO-OFICIAL.git"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
print(f"  ✓ Remote configurado (code: {result.returncode})")
print()

# 2. Add
print("[2] Adicionando arquivos...")
result = subprocess.run(["git", "add", "-A"], capture_output=True, text=True, encoding='utf-8', errors='replace')
print(f"  ✓ Arquivos adicionados (code: {result.returncode})")
print()

# 3. Commit
print("[3] Fazendo commit...")
commit_msg = "Fix: Correções de sintaxe - auth.ts e search.ts, configuração de push"
result = subprocess.run(
    ["git", "commit", "-m", commit_msg],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
print(result.stdout)
if result.stderr and "nothing to commit" not in result.stderr:
    print(f"  Stderr: {result.stderr}")
print(f"  Code: {result.returncode}")
print()

# 4. Obter hash do commit local
print("[4] Obtendo hash do commit local...")
result = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, encoding='utf-8', errors='replace')
local_hash = result.stdout.strip()
print(f"  Hash local: {local_hash}")
print()

# 5. Push
print("[5] Fazendo push...")
result = subprocess.run(
    ["git", "push", "origin", "main"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
print("STDOUT:")
print(result.stdout)
print("STDERR:")
print(result.stderr)
print(f"RETURN CODE: {result.returncode}")
print()

if result.returncode != 0:
    print("[6] Tentando push com --force-with-lease...")
    result2 = subprocess.run(
        ["git", "push", "--force-with-lease", "origin", "main"],
        capture_output=True, text=True, encoding='utf-8', errors='replace'
    )
    print("STDOUT:")
    print(result2.stdout)
    print("STDERR:")
    print(result2.stderr)
    print(f"RETURN CODE: {result2.returncode}")
    print()

# 6. Verificar hash remoto
print("[7] Verificando hash remoto...")
time.sleep(2)  # Aguardar um pouco
result = subprocess.run(["git", "ls-remote", "origin", "main"], capture_output=True, text=True, encoding='utf-8', errors='replace')
if result.stdout:
    remote_hash = result.stdout.split()[0]
    print(f"  Hash remoto: {remote_hash}")
    print(f"  Hash local:  {local_hash}")
    if remote_hash == local_hash:
        print("  ✓ PUSH CONFIRMADO! Hash local e remoto coincidem!")
    else:
        print("  ⚠ Hashes diferentes - push pode não ter funcionado")
else:
    print("  ⚠ Não foi possível verificar hash remoto")
print()

print("="*60)
print("FIM")
print("="*60)


=======
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import subprocess
import sys
import os
import time

os.chdir(r"C:\Users\rafae\OneDrive\Documentos\MIGGRO")

print("="*60)
print("PUSH DEFINITIVO PARA GITHUB")
print("="*60)
print()

# 1. Configurar remote
print("[1] Configurando remote com token...")
result = subprocess.run(
    ["git", "remote", "set-url", "origin", 
     "https://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@github.com/MIGGRO-OFICIAL/MIGRRO-OFICIAL.git"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
print(f"  ✓ Remote configurado (code: {result.returncode})")
print()

# 2. Add
print("[2] Adicionando arquivos...")
result = subprocess.run(["git", "add", "-A"], capture_output=True, text=True, encoding='utf-8', errors='replace')
print(f"  ✓ Arquivos adicionados (code: {result.returncode})")
print()

# 3. Commit
print("[3] Fazendo commit...")
commit_msg = "Fix: Correções de sintaxe - auth.ts e search.ts, configuração de push"
result = subprocess.run(
    ["git", "commit", "-m", commit_msg],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
print(result.stdout)
if result.stderr and "nothing to commit" not in result.stderr:
    print(f"  Stderr: {result.stderr}")
print(f"  Code: {result.returncode}")
print()

# 4. Obter hash do commit local
print("[4] Obtendo hash do commit local...")
result = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, encoding='utf-8', errors='replace')
local_hash = result.stdout.strip()
print(f"  Hash local: {local_hash}")
print()

# 5. Push
print("[5] Fazendo push...")
result = subprocess.run(
    ["git", "push", "origin", "main"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
print("STDOUT:")
print(result.stdout)
print("STDERR:")
print(result.stderr)
print(f"RETURN CODE: {result.returncode}")
print()

if result.returncode != 0:
    print("[6] Tentando push com --force-with-lease...")
    result2 = subprocess.run(
        ["git", "push", "--force-with-lease", "origin", "main"],
        capture_output=True, text=True, encoding='utf-8', errors='replace'
    )
    print("STDOUT:")
    print(result2.stdout)
    print("STDERR:")
    print(result2.stderr)
    print(f"RETURN CODE: {result2.returncode}")
    print()

# 6. Verificar hash remoto
print("[7] Verificando hash remoto...")
time.sleep(2)  # Aguardar um pouco
result = subprocess.run(["git", "ls-remote", "origin", "main"], capture_output=True, text=True, encoding='utf-8', errors='replace')
if result.stdout:
    remote_hash = result.stdout.split()[0]
    print(f"  Hash remoto: {remote_hash}")
    print(f"  Hash local:  {local_hash}")
    if remote_hash == local_hash:
        print("  ✓ PUSH CONFIRMADO! Hash local e remoto coincidem!")
    else:
        print("  ⚠ Hashes diferentes - push pode não ter funcionado")
else:
    print("  ⚠ Não foi possível verificar hash remoto")
print()

print("="*60)
print("FIM")
print("="*60)

>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2

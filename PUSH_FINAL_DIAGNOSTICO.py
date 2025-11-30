<<<<<<< HEAD
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import subprocess
import sys
import os
from datetime import datetime

os.chdir(r"C:\Users\rafae\OneDrive\Documentos\MIGGRO")

log_file = open("push_diagnostico_final.txt", "w", encoding="utf-8")

def log(msg):
    timestamp = datetime.now().strftime("%H:%M:%S")
    line = f"[{timestamp}] {msg}\n"
    print(line, end="")
    log_file.write(line)
    log_file.flush()

log("="*60)
log("DIAGNÓSTICO E PUSH FINAL")
log("="*60)
log("")

# 1. Verificar Git
log("[1] Verificando Git...")
result = subprocess.run(["git", "--version"], capture_output=True, text=True, encoding='utf-8')
log(f"  {result.stdout.strip()}")
log("")

# 2. Verificar remote
log("[2] Verificando remote...")
result = subprocess.run(["git", "remote", "-v"], capture_output=True, text=True, encoding='utf-8')
log(result.stdout)
if result.stderr:
    log(f"  Stderr: {result.stderr}")
log("")

# 3. Configurar remote com token
log("[3] Configurando remote com token...")
remote_url = "https://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@github.com/MIGGRO-OFICIAL/MIGRRO-OFICIAL.git"
result = subprocess.run(
    ["git", "remote", "set-url", "origin", remote_url],
    capture_output=True, text=True, encoding='utf-8'
)
log(f"  Return: {result.returncode}")
log("")

# 4. Verificar remote novamente
log("[4] Verificando remote após configuração...")
result = subprocess.run(["git", "remote", "-v"], capture_output=True, text=True, encoding='utf-8')
log(result.stdout)
log("")

# 5. Testar conexão
log("[5] Testando conexão (ls-remote)...")
result = subprocess.run(
    ["git", "ls-remote", "origin", "main"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
log(f"  Return: {result.returncode}")
log(f"  Stdout: {result.stdout}")
if result.stderr:
    log(f"  Stderr: {result.stderr}")
log("")

# 6. Status
log("[6] Status do repositório...")
result = subprocess.run(["git", "status", "--short"], capture_output=True, text=True, encoding='utf-8')
log(result.stdout if result.stdout else "  (nenhuma mudança)")
log("")

# 7. Add e Commit
log("[7] Adicionando e fazendo commit...")
subprocess.run(["git", "add", "-A"], capture_output=True)
result = subprocess.run(
    ["git", "commit", "-m", "fix(auth): corrige sintaxe em lib/supabase/auth.ts"],
    capture_output=True, text=True, encoding='utf-8'
)
log(result.stdout)
if result.stderr and "nothing to commit" not in result.stderr:
    log(f"  Stderr: {result.stderr}")
log(f"  Return: {result.returncode}")
log("")

# 8. Hash local
log("[8] Obtendo hash local...")
result = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, encoding='utf-8')
local_hash = result.stdout.strip()
log(f"  Hash local: {local_hash}")
log("")

# 9. PUSH
log("[9] EXECUTANDO PUSH...")
log("  Comando: git push origin main")
result = subprocess.run(
    ["git", "push", "origin", "main"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
log("  STDOUT:")
log(result.stdout)
log("  STDERR:")
log(result.stderr)
log(f"  RETURN CODE: {result.returncode}")
log("")

# 10. Verificar hash remoto
log("[10] Verificando hash remoto após push...")
import time
time.sleep(2)
result = subprocess.run(
    ["git", "ls-remote", "origin", "main"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
if result.stdout:
    remote_hash = result.stdout.split()[0]
    log(f"  Hash remoto: {remote_hash}")
    log(f"  Hash local:  {local_hash}")
    if remote_hash == local_hash:
        log("  ✅ PUSH CONFIRMADO! Hashes coincidem!")
    else:
        log("  ⚠️ Hashes diferentes")
else:
    log("  ⚠️ Não foi possível obter hash remoto")
log("")

log("="*60)
log("FIM DO DIAGNÓSTICO")
log("="*60)

log_file.close()
print("\nArquivo salvo em: push_diagnostico_final.txt")


=======
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import subprocess
import sys
import os
from datetime import datetime

os.chdir(r"C:\Users\rafae\OneDrive\Documentos\MIGGRO")

log_file = open("push_diagnostico_final.txt", "w", encoding="utf-8")

def log(msg):
    timestamp = datetime.now().strftime("%H:%M:%S")
    line = f"[{timestamp}] {msg}\n"
    print(line, end="")
    log_file.write(line)
    log_file.flush()

log("="*60)
log("DIAGNÓSTICO E PUSH FINAL")
log("="*60)
log("")

# 1. Verificar Git
log("[1] Verificando Git...")
result = subprocess.run(["git", "--version"], capture_output=True, text=True, encoding='utf-8')
log(f"  {result.stdout.strip()}")
log("")

# 2. Verificar remote
log("[2] Verificando remote...")
result = subprocess.run(["git", "remote", "-v"], capture_output=True, text=True, encoding='utf-8')
log(result.stdout)
if result.stderr:
    log(f"  Stderr: {result.stderr}")
log("")

# 3. Configurar remote com token
log("[3] Configurando remote com token...")
remote_url = "https://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@github.com/MIGGRO-OFICIAL/MIGRRO-OFICIAL.git"
result = subprocess.run(
    ["git", "remote", "set-url", "origin", remote_url],
    capture_output=True, text=True, encoding='utf-8'
)
log(f"  Return: {result.returncode}")
log("")

# 4. Verificar remote novamente
log("[4] Verificando remote após configuração...")
result = subprocess.run(["git", "remote", "-v"], capture_output=True, text=True, encoding='utf-8')
log(result.stdout)
log("")

# 5. Testar conexão
log("[5] Testando conexão (ls-remote)...")
result = subprocess.run(
    ["git", "ls-remote", "origin", "main"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
log(f"  Return: {result.returncode}")
log(f"  Stdout: {result.stdout}")
if result.stderr:
    log(f"  Stderr: {result.stderr}")
log("")

# 6. Status
log("[6] Status do repositório...")
result = subprocess.run(["git", "status", "--short"], capture_output=True, text=True, encoding='utf-8')
log(result.stdout if result.stdout else "  (nenhuma mudança)")
log("")

# 7. Add e Commit
log("[7] Adicionando e fazendo commit...")
subprocess.run(["git", "add", "-A"], capture_output=True)
result = subprocess.run(
    ["git", "commit", "-m", "fix(auth): corrige sintaxe em lib/supabase/auth.ts"],
    capture_output=True, text=True, encoding='utf-8'
)
log(result.stdout)
if result.stderr and "nothing to commit" not in result.stderr:
    log(f"  Stderr: {result.stderr}")
log(f"  Return: {result.returncode}")
log("")

# 8. Hash local
log("[8] Obtendo hash local...")
result = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, encoding='utf-8')
local_hash = result.stdout.strip()
log(f"  Hash local: {local_hash}")
log("")

# 9. PUSH
log("[9] EXECUTANDO PUSH...")
log("  Comando: git push origin main")
result = subprocess.run(
    ["git", "push", "origin", "main"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
log("  STDOUT:")
log(result.stdout)
log("  STDERR:")
log(result.stderr)
log(f"  RETURN CODE: {result.returncode}")
log("")

# 10. Verificar hash remoto
log("[10] Verificando hash remoto após push...")
import time
time.sleep(2)
result = subprocess.run(
    ["git", "ls-remote", "origin", "main"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
if result.stdout:
    remote_hash = result.stdout.split()[0]
    log(f"  Hash remoto: {remote_hash}")
    log(f"  Hash local:  {local_hash}")
    if remote_hash == local_hash:
        log("  ✅ PUSH CONFIRMADO! Hashes coincidem!")
    else:
        log("  ⚠️ Hashes diferentes")
else:
    log("  ⚠️ Não foi possível obter hash remoto")
log("")

log("="*60)
log("FIM DO DIAGNÓSTICO")
log("="*60)

log_file.close()
print("\nArquivo salvo em: push_diagnostico_final.txt")

>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2

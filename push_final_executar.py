<<<<<<< HEAD
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import subprocess
import sys
import os

os.chdir(r"C:\Users\rafae\OneDrive\Documentos\MIGGRO")

output_lines = []
output_lines.append("="*60)
output_lines.append("EXECUTANDO PUSH PARA GITHUB")
output_lines.append("="*60)
output_lines.append("")

# 1. Configurar remote
output_lines.append("[1] Configurando remote...")
result = subprocess.run(
    ["git", "remote", "set-url", "origin", 
     "https://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@github.com/MIGGRO-OFICIAL/MIGRRO-OFICIAL.git"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
output_lines.append(f"  Return: {result.returncode}")
output_lines.append("")

# 2. Verificar remote
output_lines.append("[2] Verificando remote...")
result = subprocess.run(["git", "remote", "-v"], capture_output=True, text=True, encoding='utf-8', errors='replace')
output_lines.append(result.stdout)
output_lines.append("")

# 3. Status
output_lines.append("[3] Status do repositório...")
result = subprocess.run(["git", "status", "--short"], capture_output=True, text=True, encoding='utf-8', errors='replace')
output_lines.append(result.stdout if result.stdout else "(nenhuma mudança)")
output_lines.append("")

# 4. Add
output_lines.append("[4] Adicionando arquivos...")
result = subprocess.run(["git", "add", "-A"], capture_output=True, text=True, encoding='utf-8', errors='replace')
output_lines.append(f"  Return: {result.returncode}")
if result.stderr:
    output_lines.append(f"  Stderr: {result.stderr}")
output_lines.append("")

# 5. Commit
output_lines.append("[5] Fazendo commit...")
result = subprocess.run(
    ["git", "commit", "-m", "Fix: Correções de sintaxe - auth.ts e search.ts, atualizações diversas"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
output_lines.append(result.stdout)
if result.stderr:
    output_lines.append(f"  Stderr: {result.stderr}")
output_lines.append(f"  Return: {result.returncode}")
output_lines.append("")

# 6. Fetch
output_lines.append("[6] Fazendo fetch...")
result = subprocess.run(["git", "fetch", "origin", "main"], capture_output=True, text=True, encoding='utf-8', errors='replace')
output_lines.append(result.stdout)
if result.stderr:
    output_lines.append(f"  Stderr: {result.stderr}")
output_lines.append(f"  Return: {result.returncode}")
output_lines.append("")

# 7. Push
output_lines.append("[7] Fazendo push...")
result = subprocess.run(["git", "push", "origin", "main"], capture_output=True, text=True, encoding='utf-8', errors='replace')
output_lines.append("STDOUT:")
output_lines.append(result.stdout)
output_lines.append("STDERR:")
output_lines.append(result.stderr)
output_lines.append(f"RETURN CODE: {result.returncode}")
output_lines.append("")

if result.returncode != 0:
    output_lines.append("[8] Tentando push com --force-with-lease...")
    result2 = subprocess.run(["git", "push", "--force-with-lease", "origin", "main"], capture_output=True, text=True, encoding='utf-8', errors='replace')
    output_lines.append("STDOUT:")
    output_lines.append(result2.stdout)
    output_lines.append("STDERR:")
    output_lines.append(result2.stderr)
    output_lines.append(f"RETURN CODE: {result2.returncode}")
    output_lines.append("")

# 8. Verificar último commit
output_lines.append("[9] Últimos commits...")
result = subprocess.run(["git", "log", "--oneline", "-3"], capture_output=True, text=True, encoding='utf-8', errors='replace')
output_lines.append(result.stdout)
output_lines.append("")

output_lines.append("="*60)
output_lines.append("FIM")
output_lines.append("="*60)

# Escrever em arquivo e também imprimir
output_text = "\n".join(output_lines)
with open("push_resultado_final.txt", "w", encoding="utf-8") as f:
    f.write(output_text)

print(output_text)
sys.exit(0)


=======
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import subprocess
import sys
import os

os.chdir(r"C:\Users\rafae\OneDrive\Documentos\MIGGRO")

output_lines = []
output_lines.append("="*60)
output_lines.append("EXECUTANDO PUSH PARA GITHUB")
output_lines.append("="*60)
output_lines.append("")

# 1. Configurar remote
output_lines.append("[1] Configurando remote...")
result = subprocess.run(
    ["git", "remote", "set-url", "origin", 
     "https://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@github.com/MIGGRO-OFICIAL/MIGRRO-OFICIAL.git"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
output_lines.append(f"  Return: {result.returncode}")
output_lines.append("")

# 2. Verificar remote
output_lines.append("[2] Verificando remote...")
result = subprocess.run(["git", "remote", "-v"], capture_output=True, text=True, encoding='utf-8', errors='replace')
output_lines.append(result.stdout)
output_lines.append("")

# 3. Status
output_lines.append("[3] Status do repositório...")
result = subprocess.run(["git", "status", "--short"], capture_output=True, text=True, encoding='utf-8', errors='replace')
output_lines.append(result.stdout if result.stdout else "(nenhuma mudança)")
output_lines.append("")

# 4. Add
output_lines.append("[4] Adicionando arquivos...")
result = subprocess.run(["git", "add", "-A"], capture_output=True, text=True, encoding='utf-8', errors='replace')
output_lines.append(f"  Return: {result.returncode}")
if result.stderr:
    output_lines.append(f"  Stderr: {result.stderr}")
output_lines.append("")

# 5. Commit
output_lines.append("[5] Fazendo commit...")
result = subprocess.run(
    ["git", "commit", "-m", "Fix: Correções de sintaxe - auth.ts e search.ts, atualizações diversas"],
    capture_output=True, text=True, encoding='utf-8', errors='replace'
)
output_lines.append(result.stdout)
if result.stderr:
    output_lines.append(f"  Stderr: {result.stderr}")
output_lines.append(f"  Return: {result.returncode}")
output_lines.append("")

# 6. Fetch
output_lines.append("[6] Fazendo fetch...")
result = subprocess.run(["git", "fetch", "origin", "main"], capture_output=True, text=True, encoding='utf-8', errors='replace')
output_lines.append(result.stdout)
if result.stderr:
    output_lines.append(f"  Stderr: {result.stderr}")
output_lines.append(f"  Return: {result.returncode}")
output_lines.append("")

# 7. Push
output_lines.append("[7] Fazendo push...")
result = subprocess.run(["git", "push", "origin", "main"], capture_output=True, text=True, encoding='utf-8', errors='replace')
output_lines.append("STDOUT:")
output_lines.append(result.stdout)
output_lines.append("STDERR:")
output_lines.append(result.stderr)
output_lines.append(f"RETURN CODE: {result.returncode}")
output_lines.append("")

if result.returncode != 0:
    output_lines.append("[8] Tentando push com --force-with-lease...")
    result2 = subprocess.run(["git", "push", "--force-with-lease", "origin", "main"], capture_output=True, text=True, encoding='utf-8', errors='replace')
    output_lines.append("STDOUT:")
    output_lines.append(result2.stdout)
    output_lines.append("STDERR:")
    output_lines.append(result2.stderr)
    output_lines.append(f"RETURN CODE: {result2.returncode}")
    output_lines.append("")

# 8. Verificar último commit
output_lines.append("[9] Últimos commits...")
result = subprocess.run(["git", "log", "--oneline", "-3"], capture_output=True, text=True, encoding='utf-8', errors='replace')
output_lines.append(result.stdout)
output_lines.append("")

output_lines.append("="*60)
output_lines.append("FIM")
output_lines.append("="*60)

# Escrever em arquivo e também imprimir
output_text = "\n".join(output_lines)
with open("push_resultado_final.txt", "w", encoding="utf-8") as f:
    f.write(output_text)

print(output_text)
sys.exit(0)

>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2

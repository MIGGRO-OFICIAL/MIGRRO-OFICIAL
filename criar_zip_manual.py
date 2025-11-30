import zipfile
from pathlib import Path

proj = Path(r"c:\Users\rafae\OneDrive\Documentos\MIGGRO")
zip_path = Path(r"c:\Users\rafae\Downloads\MIGGRO_TODOS_CORRIGIDOS.zip")

print("=" * 70)
print("CRIANDO ZIP COMPLETO")
print("=" * 70)
print(f"Projeto: {proj}")
print(f"Destino: {zip_path}")
print()

files = []

# Config
print("1. Configuração...")
for f in ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', '.gitignore', '.env.local.example', '.cursorrules', 'vercel.json']:
    p = proj / f
    if p.exists():
        files.append(p)
        print(f"   [OK] {f}")

# Migrations
print("\n2. Migrations SQL...")
mig_dir = proj / 'supabase' / 'migrations'
if mig_dir.exists():
    sql_files = list(mig_dir.glob('*.sql'))
    files.extend(sql_files)
    print(f"   [OK] {len(sql_files)} migrations")

if (proj / 'supabase' / 'README_MIGRATIONS.md').exists():
    files.append(proj / 'supabase' / 'README_MIGRATIONS.md')
    print("   [OK] README_MIGRATIONS.md")

# Diretórios
print("\n3. Código fonte...")
for d in ['lib', 'components', 'views', 'contexts', 'assets']:
    dir_path = proj / d
    if dir_path.exists():
        dir_files = [f for f in dir_path.rglob('*') if f.is_file()]
        files.extend(dir_files)
        print(f"   [OK] {d}/ ({len(dir_files)} arquivos)")

# Raiz
print("\n4. Arquivos raiz...")
root_files = []
for ext in ['*.ts', '*.tsx', '*.css']:
    found = list(proj.glob(ext))
    root_files.extend([f for f in found if f.is_file()])
if root_files:
    files.extend(root_files)
    print(f"   [OK] {len(root_files)} arquivos")

files = [f for f in files if f.exists()]

print(f"\nTotal: {len(files)} arquivos")

# Criar ZIP
print("\n5. Criando ZIP...")
if zip_path.exists():
    zip_path.unlink()
    print("   [REMOVED] ZIP anterior")

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in files:
        rel = str(f.relative_to(proj)).replace('\\', '/')
        z.write(f, rel)

size_mb = zip_path.stat().st_size / (1024 * 1024)

print("\n" + "=" * 70)
print("✅ ZIP CRIADO COM SUCESSO!")
print("=" * 70)
print(f"Local: {zip_path}")
print(f"Tamanho: {size_mb:.2f} MB")
print(f"Arquivos: {len(files)}")
print("=" * 70)

import zipfile
from pathlib import Path

proj = Path(r"c:\Users\rafae\OneDrive\Documentos\MIGGRO")
zip_path = Path.home() / "Downloads" / "MIGGRO_TODOS_CORRIGIDOS.zip"

print("Criando ZIP completo...")
print(f"Destino: {zip_path}")

files = []
# Config
for f in ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', '.gitignore', '.env.local.example', '.cursorrules', 'vercel.json']:
    p = proj / f
    if p.exists():
        files.append(p)

# Migrations
files.extend(list((proj / 'supabase' / 'migrations').glob('*.sql')))
if (proj / 'supabase' / 'README_MIGRATIONS.md').exists():
    files.append(proj / 'supabase' / 'README_MIGRATIONS.md')

# Diretórios
for d in ['lib', 'components', 'views', 'contexts', 'assets']:
    dir_path = proj / d
    if dir_path.exists():
        files.extend([f for f in dir_path.rglob('*') if f.is_file()])

# Raiz
files.extend([f for f in proj.glob('*.ts') if f.is_file()])
files.extend([f for f in proj.glob('*.tsx') if f.is_file()])
files.extend([f for f in proj.glob('*.css') if f.is_file()])

files = [f for f in files if f.exists()]

print(f"Total: {len(files)} arquivos")

if zip_path.exists():
    zip_path.unlink()

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in files:
        rel = str(f.relative_to(proj)).replace('\\', '/')
        z.write(f, rel)

size_mb = zip_path.stat().st_size / (1024 * 1024)
print(f"\n✅ ZIP CRIADO!")
print(f"Local: {zip_path}")
print(f"Tamanho: {size_mb:.2f} MB")
print(f"Arquivos: {len(files)}")

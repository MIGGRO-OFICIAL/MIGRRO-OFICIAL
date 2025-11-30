// Script para forçar logout e mostrar tela de login
// Execute no console do navegador (F12)

// Limpar todas as sessões do Supabase
localStorage.removeItem('sb-gjphsheavnkdtmsrxmtl-auth-token');
localStorage.removeItem('supabase.auth.token');

// Limpar todas as chaves do Supabase
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('sb-')) {
    localStorage.removeItem(key);
  }
});

// Limpar sessionStorage
sessionStorage.clear();

// Recarregar a página
location.reload();

-- ============================================================================
-- VERIFICAÇÃO RÁPIDA - Dados Mock Aplicados?
-- Execute no SQL Editor do Supabase
-- ============================================================================

-- Verificação rápida por tabela
SELECT 
    'countries' as tabela,
    COUNT(*) as total
FROM countries
WHERE code IN ('BR', 'ES', 'PT', 'US', 'FR', 'IT', 'DE', 'GB')

UNION ALL

SELECT 
    'cities' as tabela,
    COUNT(*) as total
FROM cities

UNION ALL

SELECT 
    'profiles (mock)' as tabela,
    COUNT(*) as total
FROM profiles
WHERE email != 'rafaelmilfont@gmail.com'

UNION ALL

SELECT 
    'posts' as tabela,
    COUNT(*) as total
FROM posts

UNION ALL

SELECT 
    'service_listings' as tabela,
    COUNT(*) as total
FROM service_listings

UNION ALL

SELECT 
    'groups' as tabela,
    COUNT(*) as total
FROM groups

UNION ALL

SELECT 
    'conversations' as tabela,
    COUNT(*) as total
FROM conversations

UNION ALL

SELECT 
    'service_requests' as tabela,
    COUNT(*) as total
FROM service_requests

ORDER BY tabela;

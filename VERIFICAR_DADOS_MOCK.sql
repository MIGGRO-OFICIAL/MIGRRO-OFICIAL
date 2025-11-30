-- ============================================================================
-- Script para Verificar se Dados Mock Foram Aplicados
-- Execute no SQL Editor do Supabase
-- ============================================================================

-- Verificar dados em cada tabela
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
    'service_categories' as tabela,
    COUNT(*) as total
FROM service_categories
UNION ALL
SELECT 
    'badges' as tabela,
    COUNT(*) as total
FROM badges
UNION ALL
SELECT 
    'profiles' as tabela,
    COUNT(*) as total
FROM profiles
WHERE email != 'rafaelmilfont@gmail.com'  -- Excluir seu admin
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
    'post_likes' as tabela,
    COUNT(*) as total
FROM post_likes
UNION ALL
SELECT 
    'comments' as tabela,
    COUNT(*) as total
FROM comments
UNION ALL
SELECT 
    'follows' as tabela,
    COUNT(*) as total
FROM follows
UNION ALL
SELECT 
    'service_reviews' as tabela,
    COUNT(*) as total
FROM service_reviews
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
    'messages' as tabela,
    COUNT(*) as total
FROM messages
UNION ALL
SELECT 
    'notifications' as tabela,
    COUNT(*) as total
FROM notifications
UNION ALL
SELECT 
    'user_badges' as tabela,
    COUNT(*) as total
FROM user_badges
UNION ALL
SELECT 
    'service_requests' as tabela,
    COUNT(*) as total
FROM service_requests
UNION ALL
SELECT 
    'service_proposals' as tabela,
    COUNT(*) as total
FROM service_proposals
UNION ALL
SELECT 
    'ad_campaigns' as tabela,
    COUNT(*) as total
FROM ad_campaigns
UNION ALL
SELECT 
    'wallets' as tabela,
    COUNT(*) as total
FROM wallets
UNION ALL
SELECT 
    'transactions' as tabela,
    COUNT(*) as total
FROM transactions
ORDER BY tabela;

-- Resumo
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM countries WHERE code IN ('BR', 'ES', 'PT', 'US')) > 0) THEN '✅ Países'
        ELSE '❌ Países'
    END as status_paises,
    CASE 
        WHEN (SELECT COUNT(*) FROM cities) > 0 THEN '✅ Cidades'
        ELSE '❌ Cidades'
    END as status_cidades,
    CASE 
        WHEN (SELECT COUNT(*) FROM profiles WHERE email != 'rafaelmilfont@gmail.com') > 0 THEN '✅ Perfis Mock'
        ELSE '❌ Perfis Mock'
    END as status_perfis,
    CASE 
        WHEN (SELECT COUNT(*) FROM posts) > 0 THEN '✅ Posts'
        ELSE '❌ Posts'
    END as status_posts,
    CASE 
        WHEN (SELECT COUNT(*) FROM service_listings) > 0 THEN '✅ Serviços'
        ELSE '❌ Serviços'
    END as status_servicos,
    CASE 
        WHEN (SELECT COUNT(*) FROM groups) > 0 THEN '✅ Grupos'
        ELSE '❌ Grupos'
    END as status_grupos,
    CASE 
        WHEN (SELECT COUNT(*) FROM conversations) > 0 THEN '✅ Chats'
        ELSE '❌ Chats'
    END as status_chats;

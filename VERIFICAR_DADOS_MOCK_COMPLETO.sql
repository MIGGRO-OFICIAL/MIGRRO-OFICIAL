-- ============================================================================
-- VERIFICAÇÃO COMPLETA - Dados Mock Aplicados
-- Execute no SQL Editor do Supabase
-- ============================================================================

-- Verificação completa por tabela
SELECT 
    'countries' as tabela,
    COUNT(*) as total,
    'Países cadastrados' as descricao
FROM countries
WHERE code IN ('BR', 'ES', 'PT', 'US', 'FR', 'IT', 'DE', 'GB')

UNION ALL

SELECT 
    'cities' as tabela,
    COUNT(*) as total,
    'Cidades cadastradas' as descricao
FROM cities

UNION ALL

SELECT 
    'profiles' as tabela,
    COUNT(*) as total,
    'Perfis de usuários' as descricao
FROM profiles

UNION ALL

SELECT 
    'posts' as tabela,
    COUNT(*) as total,
    'Posts no feed' as descricao
FROM posts

UNION ALL

SELECT 
    'post_likes' as tabela,
    COUNT(*) as total,
    'Likes em posts' as descricao
FROM post_likes

UNION ALL

SELECT 
    'comments' as tabela,
    COUNT(*) as total,
    'Comentários em posts' as descricao
FROM comments

UNION ALL

SELECT 
    'follows' as tabela,
    COUNT(*) as total,
    'Relacionamentos de follow' as descricao
FROM follows

UNION ALL

SELECT 
    'service_listings' as tabela,
    COUNT(*) as total,
    'Serviços listados' as descricao
FROM service_listings

UNION ALL

SELECT 
    'service_requests' as tabela,
    COUNT(*) as total,
    'Pedidos de serviço' as descricao
FROM service_requests

UNION ALL

SELECT 
    'service_proposals' as tabela,
    COUNT(*) as total,
    'Propostas de serviço' as descricao
FROM service_proposals

UNION ALL

SELECT 
    'service_reviews' as tabela,
    COUNT(*) as total,
    'Reviews de serviços' as descricao
FROM service_reviews

UNION ALL

SELECT 
    'groups' as tabela,
    COUNT(*) as total,
    'Grupos criados' as descricao
FROM groups

UNION ALL

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') 
        THEN 'conversations'
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') 
        THEN 'chats'
        ELSE 'conversations/chats'
    END as tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') 
        THEN (SELECT COUNT(*) FROM conversations)
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') 
        THEN (SELECT COUNT(*) FROM chats)
        ELSE 0
    END as total,
    'Conversas criadas' as descricao

UNION ALL

SELECT 
    'messages' as tabela,
    COUNT(*) as total,
    'Mensagens enviadas' as descricao
FROM messages

UNION ALL

SELECT 
    'notifications' as tabela,
    COUNT(*) as total,
    'Notificações geradas' as descricao
FROM notifications

UNION ALL

SELECT 
    'user_badges' as tabela,
    COUNT(*) as total,
    'Badges atribuídos' as descricao
FROM user_badges

UNION ALL

SELECT 
    'ad_campaigns' as tabela,
    COUNT(*) as total,
    'Campanhas de ads' as descricao
FROM ad_campaigns

UNION ALL

SELECT 
    'wallets' as tabela,
    COUNT(*) as total,
    'Carteiras criadas' as descricao
FROM wallets

UNION ALL

SELECT 
    'transactions' as tabela,
    COUNT(*) as total,
    'Transações financeiras' as descricao
FROM transactions

UNION ALL

SELECT 
    'ad_impressions' as tabela,
    COUNT(*) as total,
    'Impressões de ads' as descricao
FROM ad_impressions

ORDER BY tabela;

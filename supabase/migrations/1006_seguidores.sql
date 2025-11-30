-- ============================================================================
-- PARTE 7: SEGUIDORES (FOLLOWS)
-- ============================================================================

INSERT INTO follows (follower_id, following_id, created_at)
SELECT 
    u1.id,
    u2.id,
    NOW() - (random() * interval '90 days')
FROM profiles u1
CROSS JOIN profiles u2
WHERE u1.id != u2.id
  AND random() > 0.7  -- 30% de chance de seguir
LIMIT 150
ON CONFLICT DO NOTHING;

-- Atualizar contadores de seguidores
UPDATE profiles p
SET 
    followers_count = (SELECT COUNT(*) FROM follows f WHERE f.following_id = p.id),
    following_count = (SELECT COUNT(*) FROM follows f WHERE f.follower_id = p.id);

SELECT '✅ Seguidores criados!' as resultado;

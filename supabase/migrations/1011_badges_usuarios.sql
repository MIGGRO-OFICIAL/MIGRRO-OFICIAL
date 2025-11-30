-- ============================================================================
-- PARTE 12: BADGES PARA USUÁRIOS
-- ============================================================================

INSERT INTO user_badges (user_id, badge_id, earned_at)
SELECT 
    p.id,
    b.id,
    NOW() - (random() * interval '90 days')
FROM profiles p
CROSS JOIN badges b
WHERE random() > 0.6  -- 40% dos usuários têm cada badge
ON CONFLICT DO NOTHING;

SELECT '✅ Badges atribuídos aos usuários!' as resultado;

-- ============================================================================
-- PARTE 14: CAMPANHAS DE ADS E CREATOR PAYOUTS (ADMIN)
-- ============================================================================

-- CAMPANHAS DE ADS
INSERT INTO ad_campaigns (
    id, sponsor_name, sponsor_email, title, description,
    status, budget, spent, impressions, clicks,
    start_date, end_date, created_by, created_at, updated_at
) VALUES
(
    gen_random_uuid(),
    'Banco Português',
    'marketing@bancopt.com',
    'Conta para Imigrantes',
    'Abra sua conta sem complicação!',
    'active',
    5000.00,
    3200.50,
    45000,
    1200,
    NOW() - interval '30 days',
    NOW() + interval '30 days',
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    NOW() - interval '30 days',
    NOW()
),
(
    gen_random_uuid(),
    'Escola de Idiomas',
    'contato@escolaidiomas.pt',
    'Aprenda Português',
    'Cursos intensivos para imigrantes',
    'active',
    3000.00,
    1800.00,
    28000,
    850,
    NOW() - interval '20 days',
    NOW() + interval '40 days',
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    NOW() - interval '20 days',
    NOW()
),
(
    gen_random_uuid(),
    'Agência Imobiliária',
    'vendas@imobiliaria.pt',
    'Encontre seu Lar',
    'Apartamentos para imigrantes',
    'paused',
    2000.00,
    1500.00,
    15000,
    400,
    NOW() - interval '15 days',
    NOW() + interval '15 days',
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
    NOW() - interval '15 days',
    NOW()
);

-- CREATOR PAYOUTS
INSERT INTO creator_payouts (
    id, creator_id, period_start, period_end,
    total_views, verified_helps, ad_impressions,
    estimated_payout, final_payout, currency, status,
    created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    p.id,
    NOW() - interval '30 days',
    NOW(),
    floor(random() * 5000)::INTEGER + 1000,
    floor(random() * 50)::INTEGER + 10,
    floor(random() * 10000)::INTEGER + 2000,
    (100 + random() * 400)::DECIMAL(10,2),
    (100 + random() * 400)::DECIMAL(10,2),
    'EUR',
    (ARRAY['pending', 'approved', 'paid'])[floor(random() * 3)::INTEGER + 1]::VARCHAR,
    NOW() - interval '5 days',
    NOW()
FROM profiles p
WHERE p.followers_count > 100
LIMIT 5;

SELECT '✅ Campanhas de ads e creator payouts criados!' as resultado;

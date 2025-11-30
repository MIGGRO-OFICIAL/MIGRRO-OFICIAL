-- ============================================================================
-- PARTE 2: CATEGORIAS E BADGES
-- ============================================================================

INSERT INTO service_categories (name, name_pt, name_en, name_es, icon, color, sort_order) VALUES
('Legal', 'Jurídico', 'Legal', 'Legal', 'Scale', 'blue', 1),
('Housing', 'Moradia', 'Housing', 'Vivienda', 'Home', 'green', 2),
('Education', 'Educação', 'Education', 'Educación', 'GraduationCap', 'purple', 3),
('Healthcare', 'Saúde', 'Healthcare', 'Salud', 'Heart', 'red', 4),
('Translation', 'Tradução', 'Translation', 'Traducción', 'Languages', 'orange', 5),
('Transport', 'Transporte', 'Transport', 'Transporte', 'Car', 'yellow', 6),
('Food', 'Alimentação', 'Food', 'Alimentación', 'Utensils', 'pink', 7),
('Finance', 'Financeiro', 'Finance', 'Finanzas', 'Wallet', 'teal', 8)
ON CONFLICT DO NOTHING;

INSERT INTO badges (name, name_pt, description, icon, color, rarity) VALUES
('First Steps', 'Primeiros Passos', 'Completou o cadastro inicial', 'Baby', 'blue', 'common'),
('Helper', 'Ajudante', 'Ajudou 10 pessoas', 'HandHeart', 'green', 'rare'),
('Verified', 'Verificado', 'Perfil verificado', 'BadgeCheck', 'purple', 'epic'),
('Community Leader', 'Líder da Comunidade', 'Mais de 100 seguidores', 'Crown', 'gold', 'legendary'),
('Top Contributor', 'Top Contribuidor', 'Mais de 50 posts', 'Star', 'orange', 'epic')
ON CONFLICT DO NOTHING;

SELECT '✅ Categorias e badges criados!' as resultado;

CREATE TABLE t_p72039120_carwash_clean_elemen.cw_articles (
  id SERIAL PRIMARY KEY,
  tag VARCHAR(50) NOT NULL DEFAULT 'Новость',
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  emoji VARCHAR(10) DEFAULT '📰',
  color VARCHAR(100) DEFAULT 'from-cyan-500/20 to-blue-500/10',
  is_promo BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO t_p72039120_carwash_clean_elemen.cw_articles (tag, title, content, emoji, color, is_promo, is_published) VALUES
('Уход', 'Кварцевое покрытие: защита на 2 года', 'Гидрофобный эффект, защита от царапин и UV-излучения. Разбираемся, стоит ли оно того.', '🔬', 'from-cyan-500/20 to-blue-500/10', FALSE, TRUE),
('Советы', '5 признаков того, что машину пора мыть', 'Грязный кузов — не только эстетика. Соль и реагенты разрушают лак уже через 3 дня.', '⚠️', 'from-amber-500/20 to-orange-500/10', FALSE, TRUE),
('Акция', '−20% на комплексную мойку по средам', 'Только в марте. Успей записаться — количество мест ограничено.', '🎯', 'from-emerald-500/20 to-green-500/10', TRUE, TRUE),
('Авто', 'Как правильно выбрать класс мойки для своего авто', 'Малолитражка, седан или внедорожник? Объясняем разницу в обработке кузова.', '🚗', 'from-purple-500/20 to-pink-500/10', FALSE, TRUE);

import Icon from "@/components/ui/icon";

const articles = [
  {
    id: 1,
    tag: "Уход",
    title: "Кварцевое покрытие: защита на 2 года",
    desc: "Гидрофобный эффект, защита от царапин и UV-излучения. Разбираемся, стоит ли оно того.",
    time: "2 часа назад",
    emoji: "🔬",
    color: "from-cyan-500/20 to-blue-500/10",
  },
  {
    id: 2,
    tag: "Советы",
    title: "5 признаков того, что машину пора мыть",
    desc: "Грязный кузов — не только эстетика. Соль и реагенты разрушают лак уже через 3 дня.",
    time: "Вчера",
    emoji: "⚠️",
    color: "from-amber-500/20 to-orange-500/10",
  },
  {
    id: 3,
    tag: "Акция",
    title: "−20% на комплексную мойку по средам",
    desc: "Только в марте. Успей записаться — количество мест ограничено.",
    time: "3 дня назад",
    emoji: "🎯",
    color: "from-emerald-500/20 to-green-500/10",
  },
  {
    id: 4,
    tag: "Авто",
    title: "Как правильно выбрать класс мойки для своего авто",
    desc: "Малолитражка, седан или внедорожник? Объясняем разницу в обработке кузова.",
    time: "1 неделю назад",
    emoji: "🚗",
    color: "from-purple-500/20 to-pink-500/10",
  },
];

const promo = {
  title: "Акция: Кварц в подарок!",
  desc: "При записи на комплекс класса 3 — кварцевое покрытие бесплатно",
  until: "до 10 марта",
};

export default function NewsScreen() {
  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <p className="text-muted-foreground text-sm">Доброе утро 👋</p>
          <h1 className="text-2xl font-oswald font-bold grad-text">АкваЛюкс</h1>
        </div>
        <div className="w-10 h-10 rounded-2xl grad-bg flex items-center justify-center neon-glow">
          <span className="text-lg">💧</span>
        </div>
      </div>

      {/* Promo banner */}
      <div className="relative grad-card rounded-3xl p-5 mb-6 overflow-hidden animate-slide-up">
        <div className="shimmer absolute inset-0 rounded-3xl" />
        <div className="relative">
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-1 rounded-full">
            🎁 {promo.until}
          </span>
          <h2 className="text-xl font-oswald font-bold text-foreground mt-2 mb-1">{promo.title}</h2>
          <p className="text-muted-foreground text-sm">{promo.desc}</p>
          <button className="mt-3 px-4 py-2 rounded-xl grad-bg text-background text-sm font-bold tap-scale">
            Записаться
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in">
        {[
          { label: "Боксов", value: "1", icon: "Warehouse" },
          { label: "Мойка за", value: "1ч", icon: "Clock" },
          { label: "Рейтинг", value: "4.9", icon: "Star" },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-3 text-center">
            <Icon name={stat.icon} size={18} className="text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-oswald font-bold grad-text">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Articles */}
      <h2 className="text-lg font-oswald font-semibold text-foreground mb-3">Статьи и новости</h2>
      <div className="space-y-3">
        {articles.map((article, i) => (
          <div
            key={article.id}
            className={`rounded-3xl p-4 bg-gradient-to-br ${article.color} border border-white/8 hover-lift cursor-pointer animate-fade-in`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-2xl flex-shrink-0">
                {article.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-400/10 px-2 py-0.5 rounded-full">
                    {article.tag}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{article.time}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground leading-snug mb-1">{article.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{article.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/93e6cf89-5622-47ce-9652-4ea75db18248";
const ADMIN_URL = "https://functions.poehali.dev/4c125b11-b8ae-489a-9ec8-c32ab4673429";
const NEWS_URL = "https://functions.poehali.dev/7dd4d5d9-c1e8-4771-bb83-207ae2db0944";

const COLORS = [
  { label: "Синий", value: "from-cyan-500/20 to-blue-500/10" },
  { label: "Жёлтый", value: "from-amber-500/20 to-orange-500/10" },
  { label: "Зелёный", value: "from-emerald-500/20 to-green-500/10" },
  { label: "Фиолетовый", value: "from-purple-500/20 to-pink-500/10" },
  { label: "Красный", value: "from-red-500/20 to-rose-500/10" },
];

const TAGS = ["Уход", "Советы", "Акция", "Авто", "Новость", "Технологии"];

type AdminTab = "bookings" | "clients" | "articles";

interface Booking { id: number; date: string; time: string; client_name: string; phone: string; service: string; emoji: string; car: string; plate: string; price: number; status: string; car_class: number; }
interface Client { id: number; name: string; phone: string; created_at: string; last_visit_at: string; booking_count: number; total_spent: number; }
interface Article { id: number; tag: string; title: string; content: string; emoji: string; color: string; is_promo: boolean; is_published: boolean; created_at: string; }
interface Stats { total_clients: number; total_bookings: number; total_revenue: number; today_bookings: number; pending_today: number; }

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: "Ожидает", color: "text-amber-400", bg: "bg-amber-400/10" },
  in_progress: { label: "В работе", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  completed:   { label: "Выполнено", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  cancelled:   { label: "Отменено", color: "text-red-400", bg: "bg-red-400/10" },
};

export default function Admin() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState<AdminTab>("bookings");
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  // Article editor
  const [editing, setEditing] = useState<Article | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ tag: "Новость", title: "", content: "", emoji: "📰", color: COLORS[0].value, is_promo: false });
  const [saving, setSaving] = useState(false);

  // Client detail
  const [selectedClient, setSelectedClient] = useState<{id: number; name: string; phone: string; created_at: string; last_visit_at: string; cars: {name: string; plate: string; car_class: number}[]; history: {date: string; time: string; service: string; price: number; status: string}[]} | null>(null);

  const doLogin = async () => {
    setLoginLoading(true); setLoginError("");
    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.is_admin) { setLoginError(data.error || "Нет прав администратора"); return; }
      setToken(data.token);
      setAuthed(true);
    } catch { setLoginError("Ошибка соединения"); }
    finally { setLoginLoading(false); }
  };

  const fetchStats = async (t: string) => {
    const res = await fetch(`${ADMIN_URL}/stats`, { headers: { "X-Auth-Token": t } });
    const data = await res.json();
    setStats(data);
  };

  const fetchBookings = async (t: string) => {
    setLoading(true);
    const res = await fetch(`${ADMIN_URL}/bookings`, { headers: { "X-Auth-Token": t } });
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  };

  const fetchClients = async (t: string) => {
    setLoading(true);
    const res = await fetch(`${ADMIN_URL}/clients`, { headers: { "X-Auth-Token": t } });
    const data = await res.json();
    setClients(data.clients || []);
    setLoading(false);
  };

  const fetchArticles = async (t: string) => {
    setLoading(true);
    const res = await fetch(`${NEWS_URL}/all`, { headers: { "X-Auth-Token": t } });
    const data = await res.json();
    setArticles(data.articles || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!authed || !token) return;
    fetchStats(token);
    if (tab === "bookings") fetchBookings(token);
    if (tab === "clients") fetchClients(token);
    if (tab === "articles") fetchArticles(token);
  }, [authed, tab, token]);

  const updateBookingStatus = async (id: number, status: string) => {
    await fetch(`${ADMIN_URL}/booking/status`, {
      method: "PUT", headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify({ booking_id: id, status }),
    });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const openClientDetail = async (id: number) => {
    const res = await fetch(`${ADMIN_URL}/client/${id}`, { headers: { "X-Auth-Token": token } });
    const data = await res.json();
    setSelectedClient(data);
  };

  const startEdit = (article: Article) => {
    setEditing(article);
    setIsNew(false);
    setForm({ tag: article.tag, title: article.title, content: article.content, emoji: article.emoji, color: article.color, is_promo: article.is_promo });
  };

  const startNew = () => {
    setEditing(null);
    setIsNew(true);
    setForm({ tag: "Новость", title: "", content: "", emoji: "📰", color: COLORS[0].value, is_promo: false });
  };

  const saveArticle = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    if (isNew) {
      await fetch(`${NEWS_URL}/create`, {
        method: "POST", headers: { "Content-Type": "application/json", "X-Auth-Token": token },
        body: JSON.stringify(form),
      });
    } else if (editing) {
      await fetch(`${NEWS_URL}/update`, {
        method: "PUT", headers: { "Content-Type": "application/json", "X-Auth-Token": token },
        body: JSON.stringify({ ...form, id: editing.id }),
      });
    }
    setSaving(false);
    setIsNew(false);
    setEditing(null);
    fetchArticles(token);
  };

  const togglePublish = async (id: number) => {
    await fetch(`${NEWS_URL}/toggle`, {
      method: "PUT", headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify({ id }),
    });
    fetchArticles(token);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl grad-bg flex items-center justify-center neon-glow mx-auto mb-4">
              <Icon name="ShieldCheck" size={28} className="text-background" />
            </div>
            <h1 className="text-3xl font-oswald font-bold grad-text">Админ панель</h1>
            <p className="text-muted-foreground text-sm mt-1">АкваЛюкс</p>
          </div>
          <div className="space-y-3">
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
              <Icon name="Phone" size={18} className="text-cyan-400" />
              <input type="tel" placeholder="+70000000000" value={phone} onChange={e => setPhone(e.target.value)}
                className="bg-transparent flex-1 text-foreground placeholder-muted-foreground text-sm outline-none" />
            </div>
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
              <Icon name="Lock" size={18} className="text-cyan-400" />
              <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doLogin()}
                className="bg-transparent flex-1 text-foreground placeholder-muted-foreground text-sm outline-none" />
            </div>
          </div>
          {loginError && <p className="mt-3 text-red-400 text-xs px-1">{loginError}</p>}
          <button onClick={doLogin} disabled={loginLoading}
            className="w-full mt-5 py-4 rounded-2xl grad-bg text-background font-bold tap-scale disabled:opacity-60 flex items-center justify-center gap-2">
            {loginLoading ? <><div className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />Входим...</> : "Войти"}
          </button>
          <p className="text-center text-muted-foreground/50 text-xs mt-4">Только для администраторов</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-border/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl grad-bg flex items-center justify-center neon-glow">
              <span className="text-lg">💧</span>
            </div>
            <div>
              <h1 className="text-lg font-oswald font-bold grad-text">АкваЛюкс</h1>
              <p className="text-[10px] text-muted-foreground">Панель управления</p>
            </div>
          </div>
          <button onClick={() => setAuthed(false)} className="text-xs text-muted-foreground flex items-center gap-1 tap-scale">
            <Icon name="LogOut" size={14} />Выйти
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {[
              { label: "Клиентов", value: stats.total_clients, icon: "Users", color: "text-cyan-400" },
              { label: "Всего записей", value: stats.total_bookings, icon: "Calendar", color: "text-purple-400" },
              { label: "Выручка", value: `${(stats.total_revenue/1000).toFixed(1)}к ₽`, icon: "TrendingUp", color: "text-emerald-400" },
              { label: "Сегодня", value: stats.today_bookings, icon: "Clock", color: "text-amber-400" },
              { label: "Ожидают", value: stats.pending_today, icon: "AlertCircle", color: "text-orange-400" },
            ].map((s, i) => (
              <div key={i} className="grad-card rounded-2xl p-3 text-center">
                <Icon name={s.icon} size={18} className={`${s.color} mx-auto mb-1`} />
                <p className={`text-xl font-oswald font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex glass rounded-2xl p-1 mb-5">
          {([["bookings", "Записи", "Calendar"], ["clients", "Клиенты", "Users"], ["articles", "Статьи", "Newspaper"]] as const).map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${tab === id ? "grad-bg text-background" : "text-muted-foreground"}`}>
              <Icon name={icon} size={14} className={tab === id ? "text-background" : ""} />{label}
            </button>
          ))}
        </div>

        {/* BOOKINGS */}
        {tab === "bookings" && (
          <div className="space-y-3">
            {loading && [1,2,3].map(i => <div key={i} className="h-24 rounded-2xl glass animate-pulse" />)}
            {!loading && bookings.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">Записей нет</div>
            )}
            {bookings.map(b => {
              const st = statusMap[b.status] ?? statusMap.pending;
              return (
                <div key={b.id} className="grad-card rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{b.emoji} {b.service}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{b.date} в {b.time?.slice(0,5)} · {b.car || "—"} {b.plate ? `(${b.plate})` : ""}</p>
                    </div>
                    <span className="font-bold grad-text">{b.price} ₽</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{b.client_name}</p>
                      <p className="text-xs text-muted-foreground">{b.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${st.color} ${st.bg}`}>{st.label}</span>
                      <select
                        value={b.status}
                        onChange={e => updateBookingStatus(b.id, e.target.value)}
                        className="text-xs bg-secondary text-foreground rounded-xl px-2 py-1 outline-none border-none cursor-pointer"
                      >
                        <option value="pending">Ожидает</option>
                        <option value="in_progress">В работе</option>
                        <option value="completed">Выполнено</option>
                        <option value="cancelled">Отменено</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CLIENTS */}
        {tab === "clients" && (
          <div className="space-y-3">
            {selectedClient && (
              <div className="grad-card rounded-2xl p-5 mb-4 animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-oswald font-bold text-lg text-foreground">{selectedClient.name}</h3>
                  <button onClick={() => setSelectedClient(null)} className="text-muted-foreground tap-scale">
                    <Icon name="X" size={20} />
                  </button>
                </div>
                <p className="text-muted-foreground text-sm mb-3">{selectedClient.phone}</p>
                {selectedClient.cars.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Автомобили</p>
                    {selectedClient.cars.map((car, i) => (
                      <div key={i} className="glass rounded-xl px-3 py-2 mb-1.5 flex items-center gap-2">
                        <span>{["🚗","🚙","🛻"][car.car_class-1] ?? "🚗"}</span>
                        <span className="text-sm font-semibold">{car.name}</span>
                        <span className="text-xs font-mono bg-secondary text-foreground px-1.5 py-0.5 rounded ml-auto">{car.plate}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedClient.history.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">История</p>
                    {selectedClient.history.map((h, i) => (
                      <div key={i} className="glass rounded-xl px-3 py-2 mb-1.5 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">{h.service}</p>
                          <p className="text-xs text-muted-foreground">{h.date}</p>
                        </div>
                        <span className="font-bold grad-text text-sm">{h.price} ₽</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {loading && [1,2,3].map(i => <div key={i} className="h-16 rounded-2xl glass animate-pulse" />)}
            {clients.map(c => (
              <button key={c.id} onClick={() => openClientDetail(c.id)}
                className="w-full grad-card rounded-2xl p-4 text-left tap-scale hover:border-cyan-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold grad-text">{c.total_spent > 0 ? `${(c.total_spent/1000).toFixed(1)}к ₽` : "—"}</p>
                    <p className="text-xs text-muted-foreground">{c.booking_count} записей</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ARTICLES */}
        {tab === "articles" && (
          <div>
            {(isNew || editing) ? (
              <div className="grad-card rounded-2xl p-5 animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-oswald font-bold text-lg text-foreground">{isNew ? "Новая статья" : "Редактировать"}</h3>
                  <button onClick={() => { setIsNew(false); setEditing(null); }} className="text-muted-foreground tap-scale">
                    <Icon name="X" size={20} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    {TAGS.map(t => (
                      <button key={t} onClick={() => setForm(p => ({ ...p, tag: t }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold tap-scale transition-all ${form.tag === t ? "grad-bg text-background" : "glass text-muted-foreground"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {["📰","🔬","⚠️","🎯","🚗","🌿","✨","💎","💧","🖤","⚡","🎁"].map(e => (
                      <button key={e} onClick={() => setForm(p => ({ ...p, emoji: e }))}
                        className={`h-10 rounded-xl text-xl tap-scale ${form.emoji === e ? "grad-bg" : "glass"}`}>{e}</button>
                    ))}
                  </div>
                  <input type="text" placeholder="Заголовок статьи" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full glass rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground text-sm outline-none" />
                  <textarea placeholder="Текст статьи / анонс" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4}
                    className="w-full glass rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground text-sm outline-none resize-none" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Цвет карточки</p>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map(c => (
                        <button key={c.value} onClick={() => setForm(p => ({ ...p, color: c.value }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r ${c.value} tap-scale border-2 transition-all ${form.color === c.value ? "border-cyan-400" : "border-transparent"}`}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setForm(p => ({ ...p, is_promo: !p.is_promo }))}
                      className={`w-12 h-6 rounded-full transition-all relative ${form.is_promo ? "grad-bg" : "bg-secondary"}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.is_promo ? "left-7" : "left-1"}`} />
                    </div>
                    <span className="text-sm text-foreground font-semibold">Показывать как акцию (баннер)</span>
                  </label>
                  {/* Preview */}
                  <div className={`rounded-2xl p-4 bg-gradient-to-br ${form.color} border border-white/8`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{form.emoji}</span>
                      <span className="text-xs text-cyan-400 font-semibold bg-cyan-400/10 px-2 py-0.5 rounded-full">{form.tag}</span>
                    </div>
                    <p className="font-semibold text-foreground text-sm">{form.title || "Заголовок"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{form.content || "Текст..."}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => { setIsNew(false); setEditing(null); }} className="px-5 py-2.5 rounded-xl glass text-muted-foreground text-sm font-semibold tap-scale">Отмена</button>
                  <button onClick={saveArticle} disabled={!form.title || !form.content || saving}
                    className="flex-1 py-2.5 rounded-xl grad-bg text-background text-sm font-bold tap-scale disabled:opacity-40 flex items-center justify-center gap-2">
                    {saving ? <><div className="w-3 h-3 border-2 border-background/40 border-t-background rounded-full animate-spin" />Сохраняем...</> : "Сохранить"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button onClick={startNew}
                  className="w-full mb-4 py-3 rounded-2xl grad-bg text-background font-bold tap-scale flex items-center justify-center gap-2 neon-glow">
                  <Icon name="Plus" size={18} className="text-background" />Добавить статью
                </button>
                {loading && [1,2,3].map(i => <div key={i} className="h-20 rounded-2xl glass animate-pulse mb-3" />)}
                <div className="space-y-3">
                  {articles.map(a => (
                    <div key={a.id} className={`rounded-2xl p-4 bg-gradient-to-br ${a.color} border border-white/8`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{a.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-cyan-400 font-semibold bg-cyan-400/10 px-2 py-0.5 rounded-full">{a.tag}</span>
                            {a.is_promo && <span className="text-xs text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-full">Акция</span>}
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-auto ${a.is_published ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
                              {a.is_published ? "Опублик." : "Скрыто"}
                            </span>
                          </div>
                          <p className="font-semibold text-sm text-foreground">{a.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.content}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => startEdit(a)}
                          className="flex-1 py-2 rounded-xl glass text-cyan-400 text-xs font-semibold tap-scale flex items-center justify-center gap-1">
                          <Icon name="Pencil" size={12} />Изменить
                        </button>
                        <button onClick={() => togglePublish(a.id)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold tap-scale flex items-center justify-center gap-1 ${a.is_published ? "glass text-red-400" : "glass text-emerald-400"}`}>
                          <Icon name={a.is_published ? "EyeOff" : "Eye"} size={12} />
                          {a.is_published ? "Скрыть" : "Опубликовать"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
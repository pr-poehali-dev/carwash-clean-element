import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import type { User } from "@/pages/Index";

const BOOKINGS_URL = "https://functions.poehali.dev/92155641-e650-45a8-aaa0-b03575911c33";

interface Props {
  user: User;
  token: string;
  onBooking: () => void;
}

interface Booking {
  id: number; date: string; time: string;
  service: string; emoji: string;
  car: string; plate: string;
  price: number; status: string;
}

const statusMap: Record<string, { label: string; color: string; dot: string }> = {
  pending:     { label: "Ожидает", color: "text-amber-400", dot: "bg-amber-400" },
  in_progress: { label: "В работе", color: "text-cyan-400", dot: "bg-cyan-400" },
  completed:   { label: "Выполнено", color: "text-emerald-400", dot: "bg-emerald-400" },
  cancelled:   { label: "Отменено", color: "text-red-400", dot: "bg-red-400" },
};

export default function ProfileScreen({ user, token, onBooking }: Props) {
  const [activeTab, setActiveTab] = useState<"history" | "settings">("history");
  const [history, setHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BOOKINGS_URL}/my`, { headers: { "X-Auth-Token": token } })
      .then(r => r.json())
      .then(d => setHistory(d.bookings || []))
      .finally(() => setLoading(false));
  }, [token]);

  const completed = history.filter(h => h.status === "completed");
  const totalSpent = completed.reduce((s, h) => s + h.price, 0);
  const lastDate = history[0]?.date ? new Date(history[0].date) : null;
  const daysSinceLast = lastDate ? Math.floor((Date.now() - lastDate.getTime()) / 86400000) : null;

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="animate-fade-in mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl grad-bg flex items-center justify-center text-3xl neon-glow">👤</div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-background" />
          </div>
          <div>
            <h2 className="text-xl font-oswald font-bold text-foreground">{user.name}</h2>
            <p className="text-muted-foreground text-sm">{user.phone}</p>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded-full">
              {completed.length >= 5 ? "Постоянный клиент" : "Новый клиент"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="grad-card rounded-2xl p-3 text-center">
            <p className="text-xl font-oswald font-bold grad-text">{history.length}</p>
            <p className="text-[10px] text-muted-foreground">Визитов</p>
          </div>
          <div className="grad-card rounded-2xl p-3 text-center">
            <p className="text-xl font-oswald font-bold grad-text">{totalSpent >= 1000 ? `${(totalSpent/1000).toFixed(1)}к` : totalSpent}</p>
            <p className="text-[10px] text-muted-foreground">Потрачено ₽</p>
          </div>
          <div className="grad-card rounded-2xl p-3 text-center">
            <p className="text-xl font-oswald font-bold" style={{ color: daysSinceLast !== null && daysSinceLast > 14 ? "#f87171" : "#00d4ff" }}>
              {daysSinceLast !== null ? `${daysSinceLast}д` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">С мойки</p>
          </div>
        </div>

        {daysSinceLast !== null && daysSinceLast > 10 && (
          <div className="mt-3 glass rounded-2xl p-3 flex items-center gap-3 border border-amber-500/20 animate-scale-in">
            <span className="text-xl">🚿</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-400">Пора на мойку!</p>
              <p className="text-xs text-muted-foreground">Соль и реагенты разрушают лак</p>
            </div>
            <button onClick={onBooking} className="text-xs grad-bg text-background font-bold px-3 py-1.5 rounded-xl tap-scale">
              Записаться
            </button>
          </div>
        )}
      </div>

      <div className="flex glass rounded-2xl p-1 mb-5">
        {(["history", "settings"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? "grad-bg text-background" : "text-muted-foreground"}`}>
            {tab === "history" ? "История" : "Настройки"}
          </button>
        ))}
      </div>

      {activeTab === "history" && (
        <div className="space-y-3 animate-fade-in">
          {loading && [1,2,3].map(i => <div key={i} className="h-20 rounded-3xl glass animate-pulse" />)}
          {!loading && history.length === 0 && (
            <div className="text-center py-10">
              <span className="text-4xl block mb-3">📋</span>
              <p className="text-muted-foreground text-sm">Записей пока нет</p>
              <button onClick={onBooking} className="mt-4 px-6 py-2.5 rounded-xl grad-bg text-background text-sm font-bold tap-scale">
                Записаться на мойку
              </button>
            </div>
          )}
          {history.map((item, i) => {
            const st = statusMap[item.status] ?? statusMap.pending;
            return (
              <div key={item.id} className="grad-card rounded-3xl p-4 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{item.emoji} {item.service}</p>
                    <p className="text-xs text-muted-foreground">{item.car ?? "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold grad-text text-sm">{item.price} ₽</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      <span className={`text-[10px] ${st.color}`}>{st.label}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Icon name="Calendar" size={12} />
                  <span className="text-xs">{item.date} в {item.time?.slice(0,5)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-3 animate-fade-in">
          {[
            { icon: "Bell", label: "Уведомления", value: "Включены" },
            { icon: "Phone", label: "Номер телефона", value: user.phone },
            { icon: "Lock", label: "Изменить пароль", value: "••••••" },
            { icon: "Shield", label: "Конфиденциальность", value: "" },
          ].map((item, i) => (
            <div key={i} className="grad-card rounded-2xl px-4 py-3.5 flex items-center gap-3 tap-scale cursor-pointer">
              <Icon name={item.icon} size={18} className="text-cyan-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                {item.value && <p className="text-xs text-muted-foreground">{item.value}</p>}
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </div>
          ))}
          <button className="w-full mt-4 py-3 rounded-2xl glass text-red-400 font-semibold text-sm flex items-center justify-center gap-2 tap-scale">
            <Icon name="LogOut" size={16} className="text-red-400" />
            Выйти из аккаунта
          </button>
        </div>
      )}
    </div>
  );
}

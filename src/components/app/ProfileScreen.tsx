import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { User } from "@/pages/Index";

interface Props {
  user: User;
}

const history = [
  { id: 1, date: "20 фев 2026", service: "Комплексная мойка", car: "Toyota Camry", price: 1200, status: "completed" },
  { id: 2, date: "05 фев 2026", service: "Экспресс + Кварц", car: "BMW X5", price: 1550, status: "completed" },
  { id: 3, date: "22 янв 2026", service: "Полная детейлинг", car: "Toyota Camry", price: 2200, status: "completed" },
];

export default function ProfileScreen({ user }: Props) {
  const [activeTab, setActiveTab] = useState<"history" | "settings">("history");

  const totalSpent = history.reduce((s, h) => s + h.price, 0);
  const visits = history.length;
  const daysSinceLast = 12;

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Profile header */}
      <div className="animate-fade-in mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl grad-bg flex items-center justify-center text-3xl neon-glow">
              👤
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-background" />
          </div>
          <div>
            <h2 className="text-xl font-oswald font-bold text-foreground">{user.name}</h2>
            <p className="text-muted-foreground text-sm">{user.phone}</p>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded-full">
              Постоянный клиент
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="grad-card rounded-2xl p-3 text-center">
            <p className="text-xl font-oswald font-bold grad-text">{visits}</p>
            <p className="text-[10px] text-muted-foreground">Визитов</p>
          </div>
          <div className="grad-card rounded-2xl p-3 text-center">
            <p className="text-xl font-oswald font-bold grad-text">{(totalSpent / 1000).toFixed(1)}к</p>
            <p className="text-[10px] text-muted-foreground">Потрачено ₽</p>
          </div>
          <div className="grad-card rounded-2xl p-3 text-center">
            <p className="text-xl font-oswald font-bold" style={{ color: daysSinceLast > 14 ? "#f87171" : "#00d4ff" }}>
              {daysSinceLast}д
            </p>
            <p className="text-[10px] text-muted-foreground">С мойки</p>
          </div>
        </div>

        {/* Hint if car is dirty */}
        {daysSinceLast > 10 && (
          <div className="mt-3 glass rounded-2xl p-3 flex items-center gap-3 border border-amber-500/20 animate-scale-in">
            <span className="text-xl">🚿</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-400">Пора на мойку!</p>
              <p className="text-xs text-muted-foreground">Соль и реагенты разрушают лак</p>
            </div>
            <button className="text-xs grad-bg text-background font-bold px-3 py-1.5 rounded-xl tap-scale">
              Записаться
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex glass rounded-2xl p-1 mb-5">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "history" ? "grad-bg text-background" : "text-muted-foreground"
          }`}
        >
          История
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "settings" ? "grad-bg text-background" : "text-muted-foreground"
          }`}
        >
          Настройки
        </button>
      </div>

      {/* History */}
      {activeTab === "history" && (
        <div className="space-y-3 animate-fade-in">
          {history.map((item, i) => (
            <div
              key={item.id}
              className="grad-card rounded-3xl p-4 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-foreground">{item.service}</p>
                  <p className="text-xs text-muted-foreground">{item.car}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold grad-text text-sm">{item.price} ₽</p>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-emerald-400">Выполнено</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Icon name="Calendar" size={12} />
                <span className="text-xs">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
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

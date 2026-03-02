import { useState } from "react";
import Icon from "@/components/ui/icon";

const carClasses = [
  { id: 1, name: "Малолитражка", emoji: "🚗", desc: "Хэтч, Smart, Mini" },
  { id: 2, name: "Седан / Кроссовер", emoji: "🚙", desc: "Camry, Tiguan, RAV4" },
  { id: 3, name: "Внедорожник", emoji: "🛻", desc: "Land Cruiser, X5, Tahoe" },
];

const services = [
  { id: 1, name: "Экспресс мойка", desc: "Кузов + стёкла", prices: [400, 500, 700], time: [30, 40, 60], emoji: "⚡" },
  { id: 2, name: "Комплексная мойка", desc: "Кузов + салон + стёкла", prices: [800, 1200, 1700], time: [60, 75, 90], emoji: "✨" },
  { id: 3, name: "Полная детейлинг", desc: "Всё включено + химчистка", prices: [1500, 2200, 3000], time: [120, 150, 180], emoji: "💎" },
];

const extras = [
  {
    id: 1, name: "Кварцевое покрытие", price: 800, emoji: "🔬",
    desc: "Гидрофобная защита кузова на 2–3 месяца. Вода скатывается — грязь не прилипает.",
    badge: "ХИТ",
    badgeColor: "text-cyan-400 bg-cyan-400/10",
  },
  {
    id: 2, name: "Полировка кузова", price: 600, emoji: "✨",
    desc: "Убирает мелкие царапины и возвращает блеск лаку.",
    badge: null,
    badgeColor: "",
  },
  {
    id: 3, name: "Озонирование салона", price: 400, emoji: "🌿",
    desc: "Уничтожает запахи, бактерии и вирусы. Как новая машина изнутри.",
    badge: "РЕКОМЕНДУЕМ",
    badgeColor: "text-emerald-400 bg-emerald-400/10",
  },
  {
    id: 4, name: "Чернение резины", price: 200, emoji: "🖤",
    desc: "Придаёт колёсам ухоженный вид. Быстро и заметно.",
    badge: null,
    badgeColor: "",
  },
  {
    id: 5, name: "Обработка стёкол антидождь", price: 350, emoji: "💧",
    desc: "Вода разлетается на скорости 60+ км/ч. Видимость в дождь в разы лучше.",
    badge: "БЕЗОПАСНОСТЬ",
    badgeColor: "text-amber-400 bg-amber-400/10",
  },
];

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const days = ["Сегодня", "Завтра", "Ср 5", "Чт 6", "Пт 7", "Сб 8"];

export default function BookingScreen() {
  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const toggleExtra = (id: number) => {
    setSelectedExtras(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const classIdx = (selectedClass ?? 1) - 1;
  const service = services.find(s => s.id === selectedService);
  const extrasTotal = selectedExtras.reduce((sum, id) => {
    const e = extras.find(ex => ex.id === id);
    return sum + (e?.price ?? 0);
  }, 0);
  const total = (service?.prices[classIdx] ?? 0) + extrasTotal;

  const steps = ["Авто", "Услуга", "Допы", "Время", "Готово"];

  return (
    <div className="px-4 pt-6 pb-4 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground">Запись</h1>
          <p className="text-muted-foreground text-sm">на автомойку</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-cyan-400 font-semibold">Шаг {step}/5</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {steps.map((s, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${i + 1 <= step ? "grad-bg" : "bg-secondary"}`} />
            <p className={`text-[9px] mt-1 text-center ${i + 1 === step ? "text-cyan-400" : "text-muted-foreground"}`}>{s}</p>
          </div>
        ))}
      </div>

      {/* Step 1: Car class */}
      {step === 1 && (
        <div className="animate-slide-up space-y-3">
          <h2 className="text-lg font-oswald font-semibold text-foreground mb-4">Выберите класс авто</h2>
          {carClasses.map(cls => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              className={`w-full rounded-3xl p-4 flex items-center gap-4 transition-all duration-300 tap-scale ${
                selectedClass === cls.id
                  ? "grad-bg neon-glow"
                  : "grad-card hover:border-cyan-500/30"
              }`}
            >
              <span className="text-3xl">{cls.emoji}</span>
              <div className="text-left">
                <p className={`font-semibold ${selectedClass === cls.id ? "text-background" : "text-foreground"}`}>
                  {cls.name}
                </p>
                <p className={`text-xs ${selectedClass === cls.id ? "text-background/70" : "text-muted-foreground"}`}>
                  {cls.desc}
                </p>
              </div>
              {selectedClass === cls.id && (
                <Icon name="CheckCircle" size={20} className="ml-auto text-background" />
              )}
            </button>
          ))}
          <button
            onClick={() => selectedClass && setStep(2)}
            disabled={!selectedClass}
            className="w-full mt-4 py-4 rounded-2xl grad-bg text-background font-bold text-base tap-scale disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Далее
          </button>
        </div>
      )}

      {/* Step 2: Service */}
      {step === 2 && (
        <div className="animate-slide-up space-y-3">
          <h2 className="text-lg font-oswald font-semibold text-foreground mb-4">Выберите услугу</h2>
          {services.map(svc => (
            <button
              key={svc.id}
              onClick={() => setSelectedService(svc.id)}
              className={`w-full rounded-3xl p-4 transition-all duration-300 tap-scale text-left ${
                selectedService === svc.id
                  ? "grad-bg neon-glow"
                  : "grad-card hover:border-cyan-500/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{svc.emoji}</span>
                <div className="flex-1">
                  <p className={`font-semibold ${selectedService === svc.id ? "text-background" : "text-foreground"}`}>
                    {svc.name}
                  </p>
                  <p className={`text-xs mt-0.5 ${selectedService === svc.id ? "text-background/70" : "text-muted-foreground"}`}>
                    {svc.desc}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-base font-bold ${selectedService === svc.id ? "text-background" : "grad-text"}`}>
                      {svc.prices[classIdx]} ₽
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${selectedService === svc.id ? "text-background/60" : "text-muted-foreground"}`}>
                      <Icon name="Clock" size={12} />
                      {svc.time[classIdx]} мин
                    </span>
                  </div>
                </div>
                {selectedService === svc.id && (
                  <Icon name="CheckCircle" size={20} className="text-background" />
                )}
              </div>
            </button>
          ))}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-2xl glass text-muted-foreground font-semibold tap-scale">
              Назад
            </button>
            <button
              onClick={() => selectedService && setStep(3)}
              disabled={!selectedService}
              className="flex-1 py-3 rounded-2xl grad-bg text-background font-bold tap-scale disabled:opacity-40 transition-all"
            >
              Далее
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Extras */}
      {step === 3 && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-oswald font-semibold text-foreground">Доп. услуги</h2>
            <span className="text-xs text-muted-foreground">необязательно</span>
          </div>

          {/* Sell banner */}
          <div className="grad-card rounded-2xl p-3 mb-4 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <p className="text-xs text-foreground/80">
              Клиенты, добавившие защитное покрытие, <span className="text-cyan-400 font-semibold">моют авто реже на 40%</span> — грязь просто не прилипает
            </p>
          </div>

          <div className="space-y-3 mb-5">
            {extras.map(extra => {
              const isSelected = selectedExtras.includes(extra.id);
              return (
                <button
                  key={extra.id}
                  onClick={() => toggleExtra(extra.id)}
                  className={`w-full rounded-3xl p-4 text-left transition-all duration-300 tap-scale ${
                    isSelected ? "border border-cyan-500/50 bg-cyan-500/10" : "grad-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{extra.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-foreground">{extra.name}</p>
                        {extra.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${extra.badgeColor}`}>
                            {extra.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{extra.desc}</p>
                      <p className="text-sm font-bold grad-text mt-1">+{extra.price} ₽</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      isSelected ? "grad-bg border-transparent" : "border-muted-foreground/30"
                    }`}>
                      {isSelected && <Icon name="Check" size={12} className="text-background" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedExtras.length > 0 && (
            <div className="glass rounded-2xl p-3 mb-4 flex items-center justify-between animate-scale-in">
              <span className="text-sm text-muted-foreground">Доп. услуги:</span>
              <span className="font-bold grad-text">+{extrasTotal} ₽</span>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="px-6 py-3 rounded-2xl glass text-muted-foreground font-semibold tap-scale">
              Назад
            </button>
            <button onClick={() => setStep(4)} className="flex-1 py-3 rounded-2xl grad-bg text-background font-bold tap-scale">
              {selectedExtras.length > 0 ? `Далее (+${extrasTotal} ₽)` : "Пропустить"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Time */}
      {step === 4 && (
        <div className="animate-slide-up">
          <h2 className="text-lg font-oswald font-semibold text-foreground mb-4">Выберите время</h2>

          {/* Days */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            {days.map((day, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-semibold transition-all tap-scale ${
                  selectedDay === i ? "grad-bg text-background" : "glass text-muted-foreground"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Time grid */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {timeSlots.map(time => {
              const isBooked = ["11:00", "15:00"].includes(time);
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => !isBooked && setSelectedTime(time)}
                  disabled={isBooked}
                  className={`py-3 rounded-2xl text-sm font-semibold transition-all tap-scale ${
                    isBooked
                      ? "bg-red-500/10 text-red-400/50 line-through cursor-not-allowed"
                      : isSelected
                      ? "grad-bg text-background neon-glow"
                      : "glass text-foreground hover:border-cyan-500/30"
                  }`}
                >
                  {isBooked ? "Занято" : time}
                </button>
              );
            })}
          </div>

          {/* Summary */}
          {selectedTime && (
            <div className="grad-card rounded-2xl p-4 mb-4 animate-scale-in">
              <p className="text-xs text-muted-foreground mb-2">Ваша запись</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Услуга</span>
                  <span className="font-semibold">{service?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Время</span>
                  <span className="font-semibold">{days[selectedDay]}, {selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Длительность</span>
                  <span className="font-semibold">{service?.time[classIdx]} мин</span>
                </div>
                <div className="border-t border-border/50 mt-2 pt-2 flex justify-between">
                  <span className="font-semibold">Итого</span>
                  <span className="text-lg font-bold grad-text">{total} ₽</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="px-6 py-3 rounded-2xl glass text-muted-foreground font-semibold tap-scale">
              Назад
            </button>
            <button
              onClick={() => selectedTime && setStep(5)}
              disabled={!selectedTime}
              className="flex-1 py-3 rounded-2xl grad-bg text-background font-bold tap-scale disabled:opacity-40 transition-all"
            >
              Подтвердить
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div className="animate-scale-in flex flex-col items-center text-center pt-8">
          <div className="w-24 h-24 rounded-full grad-bg flex items-center justify-center text-5xl neon-glow-green animate-float mb-6">
            ✅
          </div>
          <h2 className="text-3xl font-oswald font-bold grad-text mb-2">Готово!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Запись подтверждена. Ждём вас!
          </p>

          <div className="glass rounded-3xl p-5 w-full text-left mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Услуга</span>
                <span className="font-semibold text-sm">{service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Дата и время</span>
                <span className="font-semibold text-sm">{days[selectedDay]}, {selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Класс авто</span>
                <span className="font-semibold text-sm">{carClasses.find(c => c.id === selectedClass)?.name}</span>
              </div>
              {selectedExtras.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Доп. услуги</span>
                  <span className="font-semibold text-sm">{selectedExtras.length} шт.</span>
                </div>
              )}
              <div className="border-t border-border/50 pt-3 flex justify-between">
                <span className="font-bold">Итого</span>
                <span className="text-xl font-bold grad-text">{total} ₽</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-6">
            📱 Напомним за 2 часа до визита
          </p>

          <button
            onClick={() => { setStep(1); setSelectedClass(null); setSelectedService(null); setSelectedExtras([]); setSelectedTime(null); }}
            className="w-full py-4 rounded-2xl grad-bg text-background font-bold tap-scale"
          >
            Записаться ещё раз
          </button>
        </div>
      )}
    </div>
  );
}

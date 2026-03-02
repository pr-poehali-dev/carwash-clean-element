import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const GARAGE_URL = "https://functions.poehali.dev/53141044-3ddc-4ac4-a457-ef649bb7cf18";
const BOOKINGS_URL = "https://functions.poehali.dev/92155641-e650-45a8-aaa0-b03575911c33";

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
  { id: 4, name: "Кварцевое покрытие", price: 800, emoji: "🔬", desc: "Гидрофобная защита кузова на 2–3 месяца. Вода скатывается — грязь не прилипает.", badge: "ХИТ", badgeColor: "text-cyan-400 bg-cyan-400/10" },
  { id: 5, name: "Полировка кузова", price: 600, emoji: "✨", desc: "Убирает мелкие царапины и возвращает блеск лаку.", badge: null, badgeColor: "" },
  { id: 6, name: "Озонирование салона", price: 400, emoji: "🌿", desc: "Уничтожает запахи, бактерии и вирусы. Как новая машина изнутри.", badge: "РЕКОМЕНДУЕМ", badgeColor: "text-emerald-400 bg-emerald-400/10" },
  { id: 7, name: "Чернение резины", price: 200, emoji: "🖤", desc: "Придаёт колёсам ухоженный вид. Быстро и заметно.", badge: null, badgeColor: "" },
  { id: 8, name: "Обработка стёкол антидождь", price: 350, emoji: "💧", desc: "Вода разлетается на скорости 60+ км/ч. Видимость в дождь в разы лучше.", badge: "БЕЗОПАСНОСТЬ", badgeColor: "text-amber-400 bg-amber-400/10" },
];

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

interface GarageCar { id: number; name: string; plate: string; car_class: number; }

interface Props {
  token: string;
  userId: number;
  preselectedCarId?: number;
  onBack: () => void;
}

function getDayLabels() {
  const days = [];
  const now = new Date();
  const weekdays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const label = i === 0 ? "Сегодня" : i === 1 ? "Завтра" : `${weekdays[d.getDay()]} ${d.getDate()}`;
    const value = d.toISOString().split("T")[0];
    days.push({ label, value });
  }
  return days;
}

export default function BookingScreen({ token, preselectedCarId, onBack }: Props) {
  const [step, setStep] = useState(0);
  const [garageCars, setGarageCars] = useState<GarageCar[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(preselectedCarId ?? null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [newCarName, setNewCarName] = useState("");
  const [newCarPlate, setNewCarPlate] = useState("");
  const [newCarClass, setNewCarClass] = useState<number>(0);
  const [addingNew, setAddingNew] = useState(false);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const days = getDayLabels();

  useEffect(() => {
    fetch(`${GARAGE_URL}/`, { headers: { "X-Auth-Token": token } })
      .then(r => r.json())
      .then(d => {
        const cars = (d.cars || []).filter((c: GarageCar) => !c.name.startsWith("DELETED_"));
        setGarageCars(cars);
        if (preselectedCarId) {
          const car = cars.find((c: GarageCar) => c.id === preselectedCarId);
          if (car) { setSelectedCarId(car.id); setSelectedClass(car.car_class); setStep(1); }
        }
      })
      .finally(() => setLoadingCars(false));
  }, [token, preselectedCarId]);

  const toggleExtra = (id: number) => setSelectedExtras(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  const classIdx = (selectedClass ?? 1) - 1;
  const service = services.find(s => s.id === selectedService);
  const extrasTotal = selectedExtras.reduce((sum, id) => { const e = extras.find(ex => ex.id === id); return sum + (e?.price ?? 0); }, 0);
  const total = (service?.prices[classIdx] ?? 0) + extrasTotal;
  const stepLabels = ["Авто", "Услуга", "Допы", "Время", "Готово"];

  const handleAddNewCar = async () => {
    if (!newCarName || !newCarPlate || !newCarClass) return;
    const res = await fetch(`${GARAGE_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify({ name: newCarName, plate: newCarPlate, car_class: newCarClass }),
    });
    const data = await res.json();
    if (res.ok) {
      const car = { id: data.id, name: data.name, plate: data.plate, car_class: data.car_class };
      setGarageCars(prev => [...prev, car]);
      setSelectedCarId(car.id);
      setSelectedClass(car.car_class);
      setAddingNew(false);
      setStep(1);
    }
  };

  const handleBook = async () => {
    if (!selectedService || !selectedClass || !selectedTime) return;
    setSubmitting(true);
    const res = await fetch(`${BOOKINGS_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Auth-Token": token },
      body: JSON.stringify({
        service_id: selectedService,
        car_class: selectedClass,
        car_id: selectedCarId,
        date: days[selectedDay].value,
        time: selectedTime,
        total_price: total,
        extras: selectedExtras,
      }),
    });
    setSubmitting(false);
    if (res.ok) setSuccess(true);
  };

  if (success) {
    return (
      <div className="px-4 pt-6 pb-4 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full grad-bg flex items-center justify-center text-5xl neon-glow-green animate-float mb-6 mt-10">✅</div>
        <h2 className="text-3xl font-oswald font-bold grad-text mb-2">Готово!</h2>
        <p className="text-muted-foreground text-sm mb-6">Запись подтверждена. Ждём вас!</p>
        <div className="glass rounded-3xl p-5 w-full text-left mb-6">
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground text-sm">Услуга</span><span className="font-semibold text-sm">{service?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground text-sm">Дата и время</span><span className="font-semibold text-sm">{days[selectedDay].label}, {selectedTime}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground text-sm">Авто</span><span className="font-semibold text-sm">{garageCars.find(c => c.id === selectedCarId)?.name ?? "—"}</span></div>
            {selectedExtras.length > 0 && <div className="flex justify-between"><span className="text-muted-foreground text-sm">Доп. услуги</span><span className="font-semibold text-sm">{selectedExtras.length} шт.</span></div>}
            <div className="border-t border-border/50 pt-3 flex justify-between"><span className="font-bold">Итого</span><span className="text-xl font-bold grad-text">{total} ₽</span></div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-6">📱 Напомним за 2 часа до визита</p>
        <button onClick={() => { setSuccess(false); setStep(0); setSelectedCarId(null); setSelectedClass(null); setSelectedService(null); setSelectedExtras([]); setSelectedTime(null); }}
          className="w-full py-4 rounded-2xl grad-bg text-background font-bold tap-scale">
          Записаться ещё раз
        </button>
        <button onClick={onBack} className="w-full mt-3 py-3 rounded-2xl glass text-muted-foreground font-semibold tap-scale">На главную</button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 min-h-screen">
      <div className="flex items-center gap-3 mb-5 animate-fade-in">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground">Запись</h1>
          <p className="text-muted-foreground text-sm">на автомойку</p>
        </div>
        <span className="ml-auto text-xs text-cyan-400 font-semibold">Шаг {step + 1}/5</span>
      </div>

      <div className="flex gap-1.5 mb-6">
        {stepLabels.map((s, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? "grad-bg" : "bg-secondary"}`} />
            <p className={`text-[9px] mt-1 text-center ${i === step ? "text-cyan-400" : "text-muted-foreground"}`}>{s}</p>
          </div>
        ))}
      </div>

      {/* Step 0: Выбор авто */}
      {step === 0 && (
        <div className="animate-slide-up">
          <h2 className="text-lg font-oswald font-semibold text-foreground mb-4">Выберите автомобиль</h2>
          {loadingCars ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-20 rounded-3xl glass animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {garageCars.map(car => {
                const cls = carClasses.find(c => c.id === car.car_class);
                const isSelected = selectedCarId === car.id;
                return (
                  <button key={car.id} onClick={() => { setSelectedCarId(car.id); setSelectedClass(car.car_class); }}
                    className={`w-full rounded-3xl p-4 flex items-center gap-4 transition-all duration-300 tap-scale ${isSelected ? "grad-bg neon-glow" : "grad-card hover:border-cyan-500/30"}`}>
                    <span className="text-3xl">{cls?.emoji ?? "🚗"}</span>
                    <div className="text-left flex-1">
                      <p className={`font-semibold ${isSelected ? "text-background" : "text-foreground"}`}>{car.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-mono ${isSelected ? "bg-background/20 text-background" : "bg-secondary text-foreground"} px-2 py-0.5 rounded-lg tracking-wider`}>{car.plate}</span>
                        <span className={`text-xs ${isSelected ? "text-background/70" : "text-muted-foreground"}`}>{cls?.name}</span>
                      </div>
                    </div>
                    {isSelected && <Icon name="CheckCircle" size={20} className="text-background" />}
                  </button>
                );
              })}

              {/* Добавить новый */}
              {!addingNew && (
                <button onClick={() => setAddingNew(true)}
                  className="w-full rounded-3xl p-4 flex items-center gap-4 glass border border-dashed border-cyan-500/30 tap-scale hover:border-cyan-500/60 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                    <Icon name="Plus" size={20} className="text-cyan-400" />
                  </div>
                  <span className="text-cyan-400 font-semibold">Добавить новый автомобиль</span>
                </button>
              )}

              {addingNew && (
                <div className="grad-card rounded-3xl p-4 animate-scale-in space-y-3">
                  <p className="font-semibold text-sm text-foreground">Новый автомобиль</p>
                  <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                    <Icon name="Car" size={16} className="text-cyan-400" />
                    <input type="text" placeholder="Марка и модель" value={newCarName} onChange={e => setNewCarName(e.target.value)}
                      className="bg-transparent flex-1 text-sm text-foreground placeholder-muted-foreground outline-none" />
                  </div>
                  <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                    <Icon name="Hash" size={16} className="text-cyan-400" />
                    <input type="text" placeholder="Госномер" value={newCarPlate} onChange={e => setNewCarPlate(e.target.value.toUpperCase())}
                      className="bg-transparent flex-1 text-sm text-foreground placeholder-muted-foreground outline-none uppercase" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {carClasses.map(cls => (
                      <button key={cls.id} onClick={() => setNewCarClass(cls.id)}
                        className={`py-2 rounded-xl text-xs text-center transition-all tap-scale ${newCarClass === cls.id ? "grad-bg text-background font-semibold" : "glass text-muted-foreground"}`}>
                        <span className="text-base block mb-0.5">{cls.emoji}</span>
                        {cls.name.split("/")[0].trim()}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setAddingNew(false)} className="px-4 py-2 rounded-xl glass text-muted-foreground text-sm tap-scale">Отмена</button>
                    <button onClick={handleAddNewCar} disabled={!newCarName || !newCarPlate || !newCarClass}
                      className="flex-1 py-2 rounded-xl grad-bg text-background text-sm font-bold tap-scale disabled:opacity-40">
                      Добавить и выбрать
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={() => selectedCarId && setStep(1)} disabled={!selectedCarId}
            className="w-full mt-5 py-4 rounded-2xl grad-bg text-background font-bold tap-scale disabled:opacity-40 transition-all">
            Далее
          </button>
        </div>
      )}

      {/* Step 1: Услуга */}
      {step === 1 && (
        <div className="animate-slide-up space-y-3">
          <h2 className="text-lg font-oswald font-semibold text-foreground mb-4">Выберите услугу</h2>
          {services.map(svc => (
            <button key={svc.id} onClick={() => setSelectedService(svc.id)}
              className={`w-full rounded-3xl p-4 transition-all duration-300 tap-scale text-left ${selectedService === svc.id ? "grad-bg neon-glow" : "grad-card hover:border-cyan-500/30"}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{svc.emoji}</span>
                <div className="flex-1">
                  <p className={`font-semibold ${selectedService === svc.id ? "text-background" : "text-foreground"}`}>{svc.name}</p>
                  <p className={`text-xs mt-0.5 ${selectedService === svc.id ? "text-background/70" : "text-muted-foreground"}`}>{svc.desc}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-base font-bold ${selectedService === svc.id ? "text-background" : "grad-text"}`}>{svc.prices[classIdx]} ₽</span>
                    <span className={`text-xs flex items-center gap-1 ${selectedService === svc.id ? "text-background/60" : "text-muted-foreground"}`}>
                      <Icon name="Clock" size={12} />{svc.time[classIdx]} мин
                    </span>
                  </div>
                </div>
                {selectedService === svc.id && <Icon name="CheckCircle" size={20} className="text-background" />}
              </div>
            </button>
          ))}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(0)} className="px-6 py-3 rounded-2xl glass text-muted-foreground font-semibold tap-scale">Назад</button>
            <button onClick={() => selectedService && setStep(2)} disabled={!selectedService}
              className="flex-1 py-3 rounded-2xl grad-bg text-background font-bold tap-scale disabled:opacity-40 transition-all">Далее</button>
          </div>
        </div>
      )}

      {/* Step 2: Допы */}
      {step === 2 && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-oswald font-semibold text-foreground">Доп. услуги</h2>
            <span className="text-xs text-muted-foreground">необязательно</span>
          </div>
          <div className="grad-card rounded-2xl p-3 mb-4 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <p className="text-xs text-foreground/80">Клиенты, добавившие защитное покрытие, <span className="text-cyan-400 font-semibold">моют авто реже на 40%</span> — грязь просто не прилипает</p>
          </div>
          <div className="space-y-3 mb-5">
            {extras.map(extra => {
              const isSelected = selectedExtras.includes(extra.id);
              return (
                <button key={extra.id} onClick={() => toggleExtra(extra.id)}
                  className={`w-full rounded-3xl p-4 text-left transition-all duration-300 tap-scale ${isSelected ? "border border-cyan-500/50 bg-cyan-500/10" : "grad-card"}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{extra.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-foreground">{extra.name}</p>
                        {extra.badge && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${extra.badgeColor}`}>{extra.badge}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{extra.desc}</p>
                      <p className="text-sm font-bold grad-text mt-1">+{extra.price} ₽</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${isSelected ? "grad-bg border-transparent" : "border-muted-foreground/30"}`}>
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
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-2xl glass text-muted-foreground font-semibold tap-scale">Назад</button>
            <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-2xl grad-bg text-background font-bold tap-scale">
              {selectedExtras.length > 0 ? `Далее (+${extrasTotal} ₽)` : "Пропустить"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Время */}
      {step === 3 && (
        <div className="animate-slide-up">
          <h2 className="text-lg font-oswald font-semibold text-foreground mb-4">Выберите время</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
            {days.map((day, i) => (
              <button key={i} onClick={() => setSelectedDay(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-semibold transition-all tap-scale ${selectedDay === i ? "grad-bg text-background" : "glass text-muted-foreground"}`}>
                {day.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {timeSlots.map(time => {
              const isBooked = ["11:00", "15:00"].includes(time);
              const isSelected = selectedTime === time;
              return (
                <button key={time} onClick={() => !isBooked && setSelectedTime(time)} disabled={isBooked}
                  className={`py-3 rounded-2xl text-sm font-semibold transition-all tap-scale ${isBooked ? "bg-red-500/10 text-red-400/50 line-through cursor-not-allowed" : isSelected ? "grad-bg text-background neon-glow" : "glass text-foreground hover:border-cyan-500/30"}`}>
                  {isBooked ? "Занято" : time}
                </button>
              );
            })}
          </div>
          {selectedTime && (
            <div className="grad-card rounded-2xl p-4 mb-4 animate-scale-in">
              <p className="text-xs text-muted-foreground mb-2">Ваша запись</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Услуга</span><span className="font-semibold">{service?.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Время</span><span className="font-semibold">{days[selectedDay].label}, {selectedTime}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Авто</span><span className="font-semibold">{garageCars.find(c => c.id === selectedCarId)?.name ?? "—"}</span></div>
                <div className="border-t border-border/50 mt-2 pt-2 flex justify-between">
                  <span className="font-semibold">Итого</span><span className="text-lg font-bold grad-text">{total} ₽</span>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="px-6 py-3 rounded-2xl glass text-muted-foreground font-semibold tap-scale">Назад</button>
            <button onClick={handleBook} disabled={!selectedTime || submitting}
              className="flex-1 py-3 rounded-2xl grad-bg text-background font-bold tap-scale disabled:opacity-40 transition-all flex items-center justify-center gap-2">
              {submitting ? <><div className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />Подтверждаем...</> : "Подтвердить"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

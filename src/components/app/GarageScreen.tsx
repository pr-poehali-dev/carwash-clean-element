import { useState } from "react";
import Icon from "@/components/ui/icon";

const initialCars = [
  { id: 1, name: "Toyota Camry", plate: "А123БВ777", class: "Седан/Кроссовер", emoji: "🚙", classId: 2 },
  { id: 2, name: "BMW X5", plate: "О456МН199", class: "Внедорожник", emoji: "🛻", classId: 3 },
];

const carClasses = [
  { id: 1, name: "Малолитражка", emoji: "🚗" },
  { id: 2, name: "Седан / Кроссовер", emoji: "🚙" },
  { id: 3, name: "Внедорожник", emoji: "🛻" },
];

const classColors = [
  "from-blue-500/20 to-cyan-500/10",
  "from-purple-500/20 to-blue-500/10",
  "from-orange-500/20 to-red-500/10",
];

export default function GarageScreen() {
  const [cars, setCars] = useState(initialCars);
  const [adding, setAdding] = useState(false);
  const [newCar, setNewCar] = useState({ name: "", plate: "", classId: 0 });

  const addCar = () => {
    if (!newCar.name || !newCar.plate || !newCar.classId) return;
    const cls = carClasses.find(c => c.id === newCar.classId)!;
    setCars(prev => [...prev, {
      id: Date.now(),
      name: newCar.name,
      plate: newCar.plate.toUpperCase(),
      class: cls.name,
      emoji: cls.emoji,
      classId: newCar.classId,
    }]);
    setNewCar({ name: "", plate: "", classId: 0 });
    setAdding(false);
  };

  const removeCar = (id: number) => {
    setCars(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-foreground">Мой гараж</h1>
          <p className="text-muted-foreground text-sm">{cars.length} автомобиля</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="w-10 h-10 rounded-2xl grad-bg flex items-center justify-center neon-glow tap-scale"
        >
          <Icon name="Plus" size={20} className="text-background" />
        </button>
      </div>

      {/* Add car form */}
      {adding && (
        <div className="grad-card rounded-3xl p-4 mb-5 animate-scale-in">
          <h3 className="font-oswald font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Car" size={18} className="text-cyan-400" />
            Добавить авто
          </h3>
          <div className="space-y-3">
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
              <Icon name="Car" size={16} className="text-cyan-400" />
              <input
                type="text"
                placeholder="Марка и модель"
                value={newCar.name}
                onChange={e => setNewCar(p => ({ ...p, name: e.target.value }))}
                className="bg-transparent flex-1 text-foreground placeholder-muted-foreground text-sm outline-none"
              />
            </div>
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
              <Icon name="Hash" size={16} className="text-cyan-400" />
              <input
                type="text"
                placeholder="Госномер"
                value={newCar.plate}
                onChange={e => setNewCar(p => ({ ...p, plate: e.target.value }))}
                className="bg-transparent flex-1 text-foreground placeholder-muted-foreground text-sm outline-none uppercase"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {carClasses.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setNewCar(p => ({ ...p, classId: cls.id }))}
                  className={`py-2 rounded-xl text-xs text-center transition-all tap-scale ${
                    newCar.classId === cls.id
                      ? "grad-bg text-background font-semibold"
                      : "glass text-muted-foreground"
                  }`}
                >
                  <span className="text-base block mb-0.5">{cls.emoji}</span>
                  {cls.name.split("/")[0].trim()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setAdding(false)} className="px-5 py-2.5 rounded-xl glass text-muted-foreground text-sm font-semibold tap-scale">
              Отмена
            </button>
            <button
              onClick={addCar}
              disabled={!newCar.name || !newCar.plate || !newCar.classId}
              className="flex-1 py-2.5 rounded-xl grad-bg text-background text-sm font-bold tap-scale disabled:opacity-40"
            >
              Добавить
            </button>
          </div>
        </div>
      )}

      {/* Cars list */}
      <div className="space-y-3">
        {cars.map((car, i) => (
          <div
            key={car.id}
            className={`rounded-3xl p-4 bg-gradient-to-br ${classColors[car.classId - 1]} border border-white/8 animate-fade-in`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-3xl flex-shrink-0">
                {car.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{car.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono bg-secondary text-foreground px-2 py-0.5 rounded-lg tracking-wider">
                    {car.plate}
                  </span>
                  <span className="text-xs text-muted-foreground">{car.class}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="w-8 h-8 rounded-xl grad-bg flex items-center justify-center neon-glow tap-scale"
                  title="Записать этот авто"
                >
                  <Icon name="CalendarPlus" size={14} className="text-background" />
                </button>
                <button
                  onClick={() => removeCar(car.id)}
                  className="w-8 h-8 rounded-xl glass flex items-center justify-center tap-scale"
                  title="Удалить"
                >
                  <Icon name="Trash2" size={14} className="text-red-400" />
                </button>
              </div>
            </div>

            {/* Quick booking */}
            <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Последняя мойка: 12 дней назад</span>
              <button className="text-xs text-cyan-400 font-semibold flex items-center gap-1 tap-scale">
                Записать
                <Icon name="ArrowRight" size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {cars.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <span className="text-6xl block mb-4">🚗</span>
          <p className="text-muted-foreground">Ваш гараж пуст</p>
          <p className="text-sm text-muted-foreground/60">Добавьте первый автомобиль</p>
        </div>
      )}
    </div>
  );
}

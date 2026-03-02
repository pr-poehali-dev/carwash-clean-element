import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  onAuth: () => void;
}

export default function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);

  const handleSubmit = () => {
    if (mode === "login") {
      onAuth();
    } else {
      if (step === 1 && name && phone && password) {
        setStep(2);
      } else if (step === 2) {
        onAuth();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-cyan-500/10 blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/8 blur-[80px]" />
        <div className="absolute top-[40%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-blue-500/6 blur-[60px]" />
      </div>

      {/* Logo */}
      <div className="relative mb-10 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl grad-bg flex items-center justify-center neon-glow animate-float">
          <span className="text-4xl">💧</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-background" />
      </div>

      <div className="relative w-full animate-slide-up">
        <h1 className="text-4xl font-oswald font-bold text-center mb-1 grad-text tracking-wide">
          АкваЛюкс
        </h1>
        <p className="text-muted-foreground text-center text-sm mb-8">Автомойка премиум класса</p>

        {/* Tabs */}
        <div className="flex glass rounded-2xl p-1 mb-6">
          <button
            onClick={() => { setMode("login"); setStep(1); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === "login" ? "grad-bg text-background" : "text-muted-foreground"
            }`}
          >
            Войти
          </button>
          <button
            onClick={() => { setMode("register"); setStep(1); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === "register" ? "grad-bg text-background" : "text-muted-foreground"
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3">
          {mode === "register" && step === 1 && (
            <div className="animate-fade-in">
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-500/50 border border-transparent transition-colors">
                <Icon name="User" size={18} className="text-cyan-400" />
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-transparent flex-1 text-foreground placeholder-muted-foreground text-sm outline-none"
                />
              </div>
            </div>
          )}

          {(mode === "login" || step === 1) && (
            <>
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-500/50 border border-transparent transition-colors">
                <Icon name="Phone" size={18} className="text-cyan-400" />
                <input
                  type="tel"
                  placeholder="+7 900 000-00-00"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="bg-transparent flex-1 text-foreground placeholder-muted-foreground text-sm outline-none"
                />
              </div>
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-500/50 border border-transparent transition-colors">
                <Icon name="Lock" size={18} className="text-cyan-400" />
                <input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-transparent flex-1 text-foreground placeholder-muted-foreground text-sm outline-none"
                />
              </div>
            </>
          )}

          {mode === "register" && step === 2 && (
            <div className="animate-fade-in">
              <div className="grad-card rounded-2xl p-4 mb-4">
                <p className="text-cyan-400 text-sm font-semibold mb-1 flex items-center gap-2">
                  <Icon name="CheckCircle" size={16} />
                  Добавьте первый автомобиль
                </p>
                <p className="text-muted-foreground text-xs">Можно добавить позже в разделе «Гараж»</p>
              </div>
              <div className="space-y-3">
                <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                  <Icon name="Car" size={18} className="text-cyan-400" />
                  <input
                    type="text"
                    placeholder="Марка и модель (напр. Toyota Camry)"
                    className="bg-transparent flex-1 text-foreground placeholder-muted-foreground text-sm outline-none"
                  />
                </div>
                <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                  <Icon name="Hash" size={18} className="text-cyan-400" />
                  <input
                    type="text"
                    placeholder="Госномер (напр. А123БВ777)"
                    className="bg-transparent flex-1 text-foreground placeholder-muted-foreground text-sm outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Малолитражка", "Седан/Кроссовер", "Внедорожник"].map((cls, i) => (
                    <button
                      key={i}
                      className="glass rounded-xl py-2 px-1 text-xs text-center text-muted-foreground hover:text-cyan-400 hover:border-cyan-500/30 border border-transparent transition-all"
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress for register */}
        {mode === "register" && (
          <div className="flex gap-2 mt-4 mb-2">
            {[1, 2].map(s => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  step >= s ? "grad-bg" : "bg-secondary"
                }`}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full mt-5 py-4 rounded-2xl grad-bg text-background font-bold text-base neon-glow tap-scale transition-all duration-300 hover:opacity-90"
        >
          {mode === "login" ? "Войти" : step === 1 ? "Далее" : "Создать аккаунт"}
        </button>

        {mode === "login" && (
          <p className="text-center text-muted-foreground text-xs mt-4">
            Забыли пароль?{" "}
            <span className="text-cyan-400 cursor-pointer">Восстановить</span>
          </p>
        )}
      </div>
    </div>
  );
}

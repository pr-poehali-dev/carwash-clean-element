import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { User } from "@/pages/Index";

const AUTH_URL = "https://functions.poehali.dev/93e6cf89-5622-47ce-9652-4ea75db18248";

interface Props {
  onAuth: (user: User) => void;
}

export default function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!phone || !password) { setError("Введите номер и пароль"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Ошибка входа"); return; }
      onAuth(data);
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !phone || !password) { setError("Заполните все поля"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${AUTH_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Ошибка регистрации"); return; }
      onAuth(data);
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "login") { handleLogin(); return; }
    if (step === 1) {
      if (!name || !phone || !password) { setError("Заполните все поля"); return; }
      setError(""); setStep(2);
    } else {
      handleRegister();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-cyan-500/10 blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/8 blur-[80px]" />
        <div className="absolute top-[40%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-blue-500/6 blur-[60px]" />
      </div>

      <div className="relative mb-10 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl grad-bg flex items-center justify-center neon-glow animate-float">
          <span className="text-4xl">💧</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-background" />
      </div>

      <div className="relative w-full animate-slide-up">
        <h1 className="text-4xl font-oswald font-bold text-center mb-1 grad-text tracking-wide">АкваЛюкс</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">Автомойка премиум класса</p>

        <div className="flex glass rounded-2xl p-1 mb-6">
          <button
            onClick={() => { setMode("login"); setStep(1); setError(""); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${mode === "login" ? "grad-bg text-background" : "text-muted-foreground"}`}
          >
            Войти
          </button>
          <button
            onClick={() => { setMode("register"); setStep(1); setError(""); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${mode === "register" ? "grad-bg text-background" : "text-muted-foreground"}`}
          >
            Регистрация
          </button>
        </div>

        <div className="space-y-3">
          {mode === "register" && step === 1 && (
            <div className="animate-fade-in">
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-500/50 border border-transparent transition-colors">
                <Icon name="User" size={18} className="text-cyan-400" />
                <input type="text" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)}
                  className="bg-transparent flex-1 text-foreground placeholder-muted-foreground text-sm outline-none" />
              </div>
            </div>
          )}

          {(mode === "login" || step === 1) && (
            <>
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-500/50 border border-transparent transition-colors">
                <Icon name="Phone" size={18} className="text-cyan-400" />
                <input type="tel" placeholder="+7 900 000-00-00" value={phone} onChange={e => setPhone(e.target.value)}
                  className="bg-transparent flex-1 text-foreground placeholder-muted-foreground text-sm outline-none" />
              </div>
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-cyan-500/50 border border-transparent transition-colors">
                <Icon name="Lock" size={18} className="text-cyan-400" />
                <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  className="bg-transparent flex-1 text-foreground placeholder-muted-foreground text-sm outline-none" />
              </div>
            </>
          )}

          {mode === "register" && step === 2 && (
            <div className="animate-fade-in">
              <div className="grad-card rounded-2xl p-4 mb-2">
                <p className="text-cyan-400 text-sm font-semibold mb-1 flex items-center gap-2">
                  <Icon name="CheckCircle" size={16} />
                  Аккаунт почти готов!
                </p>
                <p className="text-muted-foreground text-xs">Вы сможете добавить авто в разделе «Гараж»</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 animate-scale-in">
            <p className="text-red-400 text-xs font-medium">{error}</p>
          </div>
        )}

        {mode === "register" && (
          <div className="flex gap-2 mt-4 mb-2">
            {[1, 2].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? "grad-bg" : "bg-secondary"}`} />
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 py-4 rounded-2xl grad-bg text-background font-bold text-base neon-glow tap-scale transition-all duration-300 hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin" /> Подождите...</>
          ) : (
            mode === "login" ? "Войти" : step === 1 ? "Далее" : "Создать аккаунт"
          )}
        </button>

        {mode === "login" && (
          <p className="text-center text-muted-foreground text-xs mt-4">
            Забыли пароль? <span className="text-cyan-400 cursor-pointer">Восстановить</span>
          </p>
        )}
      </div>
    </div>
  );
}

import Icon from "@/components/ui/icon";
import type { Screen } from "@/pages/Index";

interface Props {
  active: Screen;
  onChange: (screen: Screen) => void;
}

const tabs: { id: Screen; label: string; icon: string }[] = [
  { id: "news", label: "Новости", icon: "Newspaper" },
  { id: "booking", label: "Запись", icon: "CalendarPlus" },
  { id: "garage", label: "Гараж", icon: "Car" },
  { id: "profile", label: "Профиль", icon: "UserCircle" },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4 pb-4">
      <div className="glass rounded-3xl px-2 py-2 flex items-center justify-around border border-white/10">
        {tabs.map(tab => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 tap-scale ${
                isActive ? "grad-bg" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                name={tab.icon}
                size={20}
                className={isActive ? "text-background" : ""}
              />
              <span className={`text-[10px] font-semibold ${isActive ? "text-background" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
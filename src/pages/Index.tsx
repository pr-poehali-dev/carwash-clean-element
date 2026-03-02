import { useState } from "react";
import AuthScreen from "@/components/app/AuthScreen";
import NewsScreen from "@/components/app/NewsScreen";
import BookingScreen from "@/components/app/BookingScreen";
import GarageScreen from "@/components/app/GarageScreen";
import ProfileScreen from "@/components/app/ProfileScreen";
import BottomNav from "@/components/app/BottomNav";

export type Screen = "news" | "booking" | "garage" | "profile";

export interface User {
  name: string;
  phone: string;
}

export default function Index() {
  const [isAuth, setIsAuth] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>("news");
  const [user] = useState<User>({ name: "Алексей", phone: "+7 999 123-45-67" });

  if (!isAuth) {
    return <AuthScreen onAuth={() => setIsAuth(true)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <div className="flex-1 overflow-y-auto pb-24">
        {activeScreen === "news" && <NewsScreen />}
        {activeScreen === "booking" && <BookingScreen />}
        {activeScreen === "garage" && <GarageScreen />}
        {activeScreen === "profile" && <ProfileScreen user={user} />}
      </div>
      <BottomNav active={activeScreen} onChange={setActiveScreen} />
    </div>
  );
}

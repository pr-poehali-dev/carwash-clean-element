import { useState } from "react";
import AuthScreen from "@/components/app/AuthScreen";
import NewsScreen from "@/components/app/NewsScreen";
import BookingScreen from "@/components/app/BookingScreen";
import GarageScreen from "@/components/app/GarageScreen";
import ProfileScreen from "@/components/app/ProfileScreen";
import BottomNav from "@/components/app/BottomNav";

export type Screen = "news" | "booking" | "garage" | "profile";

export interface User {
  id: number;
  name: string;
  phone: string;
  token: string;
  is_admin: boolean;
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [activeScreen, setActiveScreen] = useState<Screen>("news");
  const [bookingCarId, setBookingCarId] = useState<number | undefined>();

  const goToBooking = (carId?: number) => {
    setBookingCarId(carId);
    setActiveScreen("booking");
  };

  if (!user) {
    return <AuthScreen onAuth={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <div className="flex-1 overflow-y-auto pb-24">
        {activeScreen === "news" && <NewsScreen onBooking={() => goToBooking()} />}
        {activeScreen === "booking" && (
          <BookingScreen
            token={user.token}
            userId={user.id}
            preselectedCarId={bookingCarId}
            onBack={() => setActiveScreen("news")}
          />
        )}
        {activeScreen === "garage" && (
          <GarageScreen token={user.token} onBooking={(carId) => goToBooking(carId)} />
        )}
        {activeScreen === "profile" && (
          <ProfileScreen user={user} token={user.token} onBooking={() => goToBooking()} />
        )}
      </div>
      <BottomNav active={activeScreen} onChange={(s) => { setBookingCarId(undefined); setActiveScreen(s); }} />
    </div>
  );
}

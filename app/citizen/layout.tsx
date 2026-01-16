import type { ReactNode } from "react";
import BottomNav from "../components/citizen/BottomNav";

export default function CitizenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      {children}
      <BottomNav />
    </div>
  );
}

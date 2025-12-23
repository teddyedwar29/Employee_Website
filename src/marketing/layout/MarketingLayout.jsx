import { Outlet } from "react-router-dom";
import MarketingSidebar from "./MarketingSidebar";

export default function MarketingLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <MarketingSidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

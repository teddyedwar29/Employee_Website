import { Outlet } from "react-router-dom";
import OperatorSidebar from "./OperatorSidebar";

export default function OperatorLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <OperatorSidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

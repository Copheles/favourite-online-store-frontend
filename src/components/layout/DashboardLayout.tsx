import { Outlet } from "react-router-dom";
import { PosHeader } from "./PosHeader";

export function DashboardLayout() {
  return (
    <div className="flex h-screen flex-col bg-app-gradient">
      <PosHeader />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

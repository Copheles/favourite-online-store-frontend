import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { ProductCreatePage } from "@/pages/ProductCreatePage";
import { ExpensesPage } from "@/pages/ExpensesPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { HelpCenterPage } from "@/pages/HelpCenterPage";
import { SalePage } from "@/pages/SalePage";
import { StockPage } from "@/pages/StockPage";
import { SaleReportPage } from "@/pages/SaleReportPage";
import { SummaryReportPage } from "@/pages/SummaryReportPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute, PublicOnlyRoute } from "@/routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sale" element={<SalePage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/create" element={<ProductCreatePage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/pending" element={<OrdersPage />} />
          <Route path="/orders/completed" element={<OrdersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/reports/sale" element={<SaleReportPage />} />
          <Route path="/reports/summary" element={<SummaryReportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

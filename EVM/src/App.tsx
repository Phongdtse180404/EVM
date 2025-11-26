import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VehicleShowroom from "./pages/VehicleShowroom";
import WarehouseManagement from "./pages/WarehouseManagement";
import CustomerManagement from "./pages/CustomerManagement";
import ReportsManagement from "./pages/ReportsManagement";
import ServiceManagement from "./pages/ServiceManagement";
import SalesManagement from "./pages/SalesManagement";
import OrderDetails from "./pages/OrderDetails";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import Orders from "./pages/admin/Orders";
import AdminSales from "./pages/admin/Sales";
import Users from "./pages/admin/Users";
import AdminWarehouses from "./pages/admin/Warehouses";
import Dealerships from "./pages/admin/Dealerships";
import PaymentHistory from "./pages/PaymentHistory";
import ResetPasswork from "./pages/ResetPasswork";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/showroom" element={<VehicleShowroom />} />
          <Route path="/sales" element={<SalesManagement />} />
          <Route path="/order-details" element={<OrderDetails />} />
          <Route path="/inventory" element={<WarehouseManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/reports" element={<ReportsManagement />} />
          <Route path="/service" element={<ServiceManagement />} />
          <Route path="/login" element={<Login />} />
          <Route path="/paymentHistory" element={<PaymentHistory />} />
          <Route path="/resetpasswork" element={<ResetPasswork />} />
          {/* Admin pages */}
          <Route
            path="/admin/orders"
            element={
              <DashboardLayout>
                <Orders />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/sales"
            element={
              <DashboardLayout>
                <AdminSales />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/warehouses"
            element={
              <DashboardLayout>
                <AdminWarehouses />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/dealerships"
            element={
              <DashboardLayout>
                <Dealerships />
              </DashboardLayout>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VehicleShowroom />} />
          <Route path="/sales" element={<SalesManagement />} />
          <Route path="/order-details" element={<OrderDetails />} />
          <Route path="/inventory" element={<WarehouseManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/reports" element={<ReportsManagement />} />
          <Route path="/service" element={<ServiceManagement />} />
          <Route path="/login" element={<Login />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
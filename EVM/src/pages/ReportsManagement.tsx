import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { orderService, OrderResponse } from "@/services/api-orders";
import { customerService, CustomerResponse } from "@/services/api-customers";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart as RBarChart,
} from "recharts";
import {
  electricVehicleService,
  ElectricVehicleResponse,
} from "@/services/api-electric-vehicle";


// format tiền VND
const formatVND = (n: number) =>
  n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const formatDayLabel = (d: Date) =>
  d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

const formatDateTimeVN = (d: Date) =>
  d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const ReportsManagement = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<ElectricVehicleResponse[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);




  // ===== Fetch data =====
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const data = await orderService.getAllOrders();
        setOrders(data);
      } catch (e: any) {
        console.log("Orders error:", e?.response?.status, e?.response?.data);
        setError(e?.response?.data?.message ?? e?.message ?? "Fetch orders failed");
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const data = await customerService.getCustomers();
        setCustomers(data);
      } catch (e: any) {
        console.log("Customers error:", e?.response?.status, e?.response?.data);
        setError(e?.response?.data?.message ?? e?.message ?? "Fetch customers failed");
      } finally {
        setLoadingCustomers(false);
      }
    };

    const fetchVehicles = async () => {
      try {
        setLoadingVehicles(true);
        const data = await electricVehicleService.getAllElectricVehicles();
        setVehicles(data);
      } catch (e: any) {
        console.log("EV error:", e?.response?.status, e?.response?.data);
        setError(e?.response?.data?.message ?? e?.message ?? "Fetch vehicles failed");
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchOrders();
    fetchCustomers();
    fetchVehicles();
  }, []);

  const loading = loadingOrders || loadingCustomers || loadingVehicles;

  // ===== Metrics =====
  const validOrders = useMemo(
    () => orders.filter(o => o.status !== "CANCELLED"),
    [orders]
  );

  const vehicleMap = useMemo(() => {
    const m = new Map<number, ElectricVehicleResponse>();
    vehicles.forEach(v => m.set(v.vehicleId, v));
    return m;
  }, [vehicles]);

  const calcProfit = (o: OrderResponse): number => {
    if (!o.vehicleId) return 0;
    const v = vehicleMap.get(o.vehicleId);
    if (!v) return 0;

    // totalAmount ≈ price, nếu BE đã lưu giá bán vào totalAmount
    const price = o.totalAmount ?? v.price;
    const cost = v.cost ?? 0;

    return price - cost;
  };

  const totalRevenue = useMemo(
    () => validOrders.reduce((sum, o) => sum + calcProfit(o), 0),
    [validOrders, vehicleMap]
  );

  const totalOrders = useMemo(() => validOrders.length, [validOrders]);

  const totalCustomers = useMemo(
    () => customers.filter(c => c.status === "CUSTOMER").length,
    [customers]
  );

  const avgOrderValue = useMemo(() => {
    if (!totalOrders) return 0;
    return totalRevenue / totalOrders;
  }, [totalRevenue, totalOrders]);



  const quickStats = [
    {
      title: "Doanh thu",
      value: loading ? "Đang tải..." : formatVND(totalRevenue),
    },
    {
      title: "Số đơn hàng",
      value: loading ? "Đang tải..." : totalOrders.toLocaleString("vi-VN"),
    },
    {
      title: "Số khách hàng",
      value: loading ? "Đang tải..." : totalCustomers.toLocaleString("vi-VN"),
    },
    {
      title: "Giá trị đơn TB",
      value: loading ? "Đang tải..." : formatVND(avgOrderValue),
    },
  ];

  // ===== Chart: doanh thu 7 ngày gần nhất =====
  const salesData = useMemo(() => {
    const revenueByDate = new Map<string, number>();

    validOrders.forEach(o => {
      if (!o.orderDate) return;
      const dateObj = new Date(o.orderDate as any);
      const key = dateObj.toISOString().slice(0, 10);

      revenueByDate.set(
        key,
        (revenueByDate.get(key) || 0) + calcProfit(o)
      );
    });

    const result: { date: string; revenue: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);

      result.push({
        date: formatDayLabel(d),
        revenue: revenueByDate.get(key) || 0,
      });
    }

    return result;
  }, [validOrders]);

  // ===== Chart: top model bán chạy =====
  const productData = useMemo(() => {
    const countByModel = new Map<string, number>();

    validOrders.forEach(o => {
      // chỉ tính các đơn đã paid/complete (tuỳ bạn)
      if (!["COMPLETED", "ORDER_PAID"].includes(o.status)) return;
      const model = o.vehicleModel || `Xe #${o.vehicleId}`;
      countByModel.set(model, (countByModel.get(model) || 0) + 1);
    });

    return Array.from(countByModel.entries())
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [validOrders]);

  // ===== Recent orders (5 đơn mới nhất) =====
  const recentOrders = useMemo(() => {
    return [...validOrders]
      .filter(o => o.orderDate)
      .sort(
        (a, b) =>
          new Date(b.orderDate as any).getTime() -
          new Date(a.orderDate as any).getTime()
      )
      .slice(0, 5);
  }, [validOrders]);





  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/showroom")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Báo cáo doanh số & công nợ
            </h1>
            <p className="text-muted-foreground">
              Tổng quan doanh thu, đơn hàng và sản phẩm bán chạy
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="p-6 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue last 7 days */}
        <Card className="shadow-soft p-4">
          <h2 className="text-lg font-semibold mb-3">Doanh thu 7 ngày gần nhất</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                formatter={(v: any) => formatVND(Number(v))}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top products */}
        <Card className="shadow-soft p-4">
          <h2 className="text-lg font-semibold mb-3">Top model bán chạy</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RBarChart data={productData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="shadow-soft p-4">
        <h2 className="text-lg font-semibold mb-3">Đơn hàng gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left py-2">Khách hàng</th>
                <th className="text-left py-2">Model</th>
                <th className="text-right py-2">Doanh thu</th>
                <th className="text-right py-2">Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.orderId} className="border-b border-border/50">
                  <td className="py-2">{o.customerName}</td>
                  <td className="py-2">{o.vehicleModel}</td>
                  <td className="py-2 text-right">
                    {formatVND(calcProfit(o))}
                  </td>
                  <td className="py-2 text-right">
                    {o.orderDate ? formatDateTimeVN(new Date(o.orderDate as any)) : "N/A"}
                  </td>
                </tr>
              ))}

              {!recentOrders.length && (
                <tr>
                  <td colSpan={4} className="py-3 text-center text-muted-foreground">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-md border border-red-300 text-red-600 bg-red-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;

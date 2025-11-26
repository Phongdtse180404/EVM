import { useEffect, useMemo, useState } from "react";
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "@/components/MetricCard";
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
import { orderService, OrderResponse } from "@/services/api-orders";
import { customerService, CustomerResponse } from "@/services/api-customers";
import {
  electricVehicleService,
  ElectricVehicleResponse,
} from "@/services/api-electric-vehicle";


// format tiền VND gọn gàng
const formatVND = (n: number) =>
  n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function Sales() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<ElectricVehicleResponse[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const data = await orderService.getAllOrders();
        setOrders(data);
      } catch (e: any) {
        setError(e?.message ?? "Fetch orders failed");
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
        setError(e?.message ?? "Fetch customers failed");

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
        setError(e?.message ?? "Fetch vehicles failed");
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchOrders();
    fetchCustomers();
    fetchVehicles();
  }, []);

  const vehicleMap = useMemo(() => {
    const m = new Map<number, ElectricVehicleResponse>();
    vehicles.forEach(v => m.set(v.vehicleId, v));
    return m;
  }, [vehicles]);

  const calcProfit = (o: OrderResponse): number => {
    if (!o.vehicleId) return 0;
    const v = vehicleMap.get(o.vehicleId);
    if (!v) return 0;
    const price = o.totalAmount ?? v.price;
    const cost = v.cost ?? 0;
    return price - cost;
  };

  // tính toán metric từ orders
  const totalRevenue = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== "CANCELLED");
    return validOrders.reduce((sum, o) => sum + calcProfit(o), 0);
  }, [orders, vehicleMap]);


  const totalOrders = useMemo(() => orders.length, [orders]);

  // tính toán metric từ costomers
  const totalCustomers = useMemo(() => {
    //chỉ đếm khách thật (không tính LEAD) thì mở dòng dưới
    return customers.filter(c => c.status === "CUSTOMER").length;
  }, [customers]);

  const loading = loadingOrders || loadingCustomers || loadingVehicles;

  // format ngày giờ theo VN
  const formatDateTimeVN = (d: Date) =>
    d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const recentActivity = useMemo(() => {
    const sorted = [...orders]
      .filter(o => o.orderDate)
      .sort(
        (a, b) =>
          new Date(b.orderDate as any).getTime() -
          new Date(a.orderDate as any).getTime()
      )
      .slice(0, 4);

    return sorted.map(o => ({
      id: o.orderId,
      customer: o.customerName ?? `KH #${o.customerId}`,
      action: `Mua ${o.vehicleModel ?? `Xe #${o.vehicleId}`}`,
      amount: formatVND(calcProfit(o)),    // <-- lợi nhuận
      orderDate: o.orderDate
        ? formatDateTimeVN(new Date(o.orderDate as any))
        : "N/A",
    }));
  }, [orders, vehicleMap]);


  const metrics = [
    {
      title: "Tổng doanh thu",
      value: loading ? "Đang tải..." : formatVND(totalRevenue),
      change: "+12.5%",               // nếu muốn tính thật thì làm thêm API so sánh tháng trước
      icon: DollarSign,
    },
    {
      title: "Đơn hàng",
      value: loading ? "Đang tải..." : totalOrders.toLocaleString("vi-VN"),
      icon: ShoppingCart,
    },
    {
      title: "Khách hàng",
      value: loading ? "Đang tải..." : totalCustomers.toLocaleString("vi-VN"),
      icon: Users,
    },
  ];

  const formatDayLabel = (d: Date) =>
    d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

  // biểu đồ doanh thu theo ngày
  const salesData = useMemo(() => {
    const revenueByDate = new Map<string, number>();

    orders.forEach(o => {
      if (!o.orderDate) return;
      if (o.status === "CANCELLED") return;
      if (o.paymentStatus !== "PAID") return; // chỉ tính đơn đã thanh toán

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
  }, [orders, vehicleMap]);


  // top model bán chạy
  const productData = useMemo(() => {
    const countByModel = new Map<string, number>();

    orders.forEach(o => {
      if (o.status === "CANCELLED") return;

      // chỉ tính đơn đã có tiền (cọc hoặc thanh toán full)
      if (!["DEPOSIT_PAID", "PAID"].includes(o.paymentStatus)) return;

      const model = o.vehicleModel || `Xe #${o.vehicleId}`;
      countByModel.set(model, (countByModel.get(model) || 0) + 1);
    });

    return Array.from(countByModel.entries())
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doanh số</h1>
        <p className="text-muted-foreground mt-1">
          Tổng quan về doanh thu và hiệu suất bán hàng
        </p>
      </div>

      {/* show lỗi nếu có */}
      {error && (
        <div className="p-3 rounded-md border border-red-300 text-red-600 bg-red-50">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
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
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Top model bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            {!productData.length ? (
              <p className="text-sm text-muted-foreground">
                Chưa có dữ liệu bán hàng.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
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
            )}
          </CardContent>
        </Card>

      </div>

      {/* Recent Activity */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gradient-card border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary" />
                  <div>
                    <p className="font-medium">{activity.customer}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">{activity.amount}</p>
                  {/* đổi time thành orderDate */}
                  <p className="text-sm text-muted-foreground">
                    {activity.orderDate}
                  </p>
                </div>
              </div>
            ))}

            {!recentActivity.length && (
              <p className="text-sm text-muted-foreground">
                Chưa có đơn hàng nào.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

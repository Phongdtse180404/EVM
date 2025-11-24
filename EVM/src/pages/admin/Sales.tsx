import { useEffect, useMemo, useState } from "react";
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "@/components/MetricCard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { orderService, OrderResponse } from "@/services/api-orders";
import { customerService, CustomerResponse } from "@/services/api-customers";

// format tiền VND gọn gàng
const formatVND = (n: number) =>
  n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function Sales() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    fetchOrders();
    fetchCustomers();
  }, []);

  // tính toán metric từ orders
  const totalRevenue = useMemo(() => {
    // chỉ tính order không bị cancel (tuỳ rule bên bạn)
    const validOrders = orders.filter(o => o.status !== "CANCELLED");
    return validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders]);

  const totalOrders = useMemo(() => orders.length, [orders]);

  // tính toán metric từ costomers
  const totalCustomers = useMemo(() => {
    //chỉ đếm khách thật (không tính LEAD) thì mở dòng dưới
    return customers.filter(c => c.status === "CUSTOMER").length;
  }, [customers]);

  const loading = loadingOrders || loadingCustomers;

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
      .filter(o => o.orderDate) // chỉ lấy cái có ngày
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
      amount: formatVND(o.totalAmount || 0),
      orderDate: o.orderDate
        ? formatDateTimeVN(new Date(o.orderDate as any))
        : "N/A",
    }));
  }, [orders]);

  const metrics = [
    {
      title: "Tổng doanh thu",
      value: loading ? "Đang tải..." : formatVND(totalRevenue),
      change: "+12.5%",               // nếu muốn tính thật thì làm thêm API so sánh tháng trước
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "Đơn hàng",
      value: loading ? "Đang tải..." : totalOrders.toLocaleString("vi-VN"),
      change: "+8.2%",
      trend: "up" as const,
      icon: ShoppingCart,
    },
    {
      title: "Khách hàng",
      value: loading ? "Đang tải..." : totalCustomers.toLocaleString("vi-VN"),
      change: "+15.3%",
      trend: "up" as const,
      icon: Users,
    },
  ];

  const formatDayLabel = (d: Date) =>
    d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

  const salesData = useMemo(() => {
    // map doanh thu theo key yyyy-mm-dd
    const revenueByDate = new Map<string, number>();

    orders.forEach(o => {
      if (!o.orderDate || o.status === "CANCELLED") return;

      const dateObj = new Date(o.orderDate as any);
      const key = dateObj.toISOString().slice(0, 10); // yyyy-mm-dd

      revenueByDate.set(
        key,
        (revenueByDate.get(key) || 0) + (o.totalAmount || 0)
      );
    });

    // tạo list 7 ngày gần nhất (tính cả hôm nay)
    const result: { date: string; revenue: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      const key = d.toISOString().slice(0, 10);
      result.push({
        date: formatDayLabel(d),                 // label hiển thị: dd/MM
        revenue: revenueByDate.get(key) || 0,    // nếu không có đơn => 0
      });
    }

    return result;
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
      <div className="grid gap-6 lg:grid-cols-1">
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

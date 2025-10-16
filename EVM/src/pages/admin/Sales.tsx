import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui_admin/card";
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

const metrics = [
  {
    title: "Tổng doanh thu",
    value: "2.45 tỷ ₫",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Đơn hàng",
    value: "1,234",
    change: "+8.2%",
    trend: "up" as const,
    icon: ShoppingCart,
  },
  {
    title: "Khách hàng",
    value: "892",
    change: "+15.3%",
    trend: "up" as const,
    icon: Users,
  },
  {
    title: "Tỷ lệ tăng trưởng",
    value: "24.5%",
    change: "+3.2%",
    trend: "up" as const,
    icon: TrendingUp,
  },
];

const salesData = [
  { month: "T1", revenue: 180 },
  { month: "T2", revenue: 195 },
  { month: "T3", revenue: 210 },
  { month: "T4", revenue: 230 },
  { month: "T5", revenue: 215 },
  { month: "T6", revenue: 245 },
];

const productData = [
  { name: "Model S Pro", sales: 234 },
  { name: "City EV", sales: 198 },
  { name: "Urban X", sales: 167 },
  { name: "Sport GT", sales: 145 },
  { name: "Family Van", sales: 120 },
];

const recentActivity = [
  { id: 1, customer: "Nguyễn Văn A", action: "Mua Model S Pro", time: "5 phút trước", amount: "890tr ₫" },
  { id: 2, customer: "Trần Thị B", action: "Mua City EV", time: "12 phút trước", amount: "650tr ₫" },
  { id: 3, customer: "Lê Văn C", action: "Mua Urban X", time: "25 phút trước", amount: "720tr ₫" },
  { id: 4, customer: "Phạm Thị D", action: "Mua Sport GT", time: "1 giờ trước", amount: "1.2 tỷ ₫" },
];

export default function Sales() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doanh số</h1>
        <p className="text-muted-foreground mt-1">
          Tổng quan về doanh thu và hiệu suất bán hàng
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
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
            <CardTitle>Top sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
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
              </BarChart>
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
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{activity.amount}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

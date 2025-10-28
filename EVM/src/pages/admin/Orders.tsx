import { useState } from "react";
import { Search, Filter, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminClasses, getStatusBadgeClass } from "@/lib/admin-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const orders = [
  {
    id: "#ORD-001",
    customer: "Nguyễn Văn A",
    product: "Model S Pro",
    date: "2024-01-15",
    amount: "890,000,000 ₫",
    status: "completed",
  },
  {
    id: "#ORD-002",
    customer: "Trần Thị B",
    product: "City EV",
    date: "2024-01-14",
    amount: "650,000,000 ₫",
    status: "processing",
  },
  {
    id: "#ORD-003",
    customer: "Lê Văn C",
    product: "Urban X",
    date: "2024-01-14",
    amount: "720,000,000 ₫",
    status: "completed",
  },
  {
    id: "#ORD-004",
    customer: "Phạm Thị D",
    product: "Sport GT",
    date: "2024-01-13",
    amount: "1,200,000,000 ₫",
    status: "pending",
  },
  {
    id: "#ORD-005",
    customer: "Hoàng Văn E",
    product: "Family Van",
    date: "2024-01-13",
    amount: "980,000,000 ₫",
    status: "completed",
  },
  {
    id: "#ORD-006",
    customer: "Vũ Thị F",
    product: "Model S Pro",
    date: "2024-01-12",
    amount: "890,000,000 ₫",
    status: "cancelled",
  },
  {
    id: "#ORD-007",
    customer: "Đặng Văn G",
    product: "City EV",
    date: "2024-01-12",
    amount: "650,000,000 ₫",
    status: "processing",
  },
  {
    id: "#ORD-008",
    customer: "Bùi Thị H",
    product: "Urban X",
    date: "2024-01-11",
    amount: "720,000,000 ₫",
    status: "completed",
  },
];

const statusConfig = {
  completed: { label: "Hoàn thành", className: "bg-success/10 text-success border-success/20" },
  processing: { label: "Đang xử lý", className: "bg-info/10 text-info border-info/20" },
  pending: { label: "Chờ xử lý", className: "bg-warning/10 text-warning border-warning/20" },
  cancelled: { label: "Đã hủy", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đơn hàng</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý và theo dõi tất cả đơn hàng
        </p>
      </div>

      {/* Filters */}
      <Card className={`${adminClasses.card} shadow-soft`}>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm đơn hàng..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className={adminClasses.primaryButton}>
                <Download className="h-4 w-4 mr-2" />
                Xuất
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className={`${adminClasses.card} shadow-soft`}>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`${adminClasses.table} rounded-md border`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell className="font-semibold">{order.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClass(order.status)}
                        >
                          {statusConfig[order.status as keyof typeof statusConfig].label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
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
import { OrderResponse, orderService, OrderStatus } from "@/services/api-orders";


const statusConfig = {
  completed: { label: "Hoàn thành", className: "bg-success/10 text-success border-success/20" },
  processing: { label: "Đang xử lý", className: "bg-info/10 text-info border-info/20" },
  cancelled: { label: "Đã hủy", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderResponse[]>([]);


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await orderService.getAllOrders();
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    // Filter orders based on search query
    const filtered = orders.filter((order) => {
      return (
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderId.toString().includes(searchQuery.toLowerCase()) ||
        order.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);


  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return "bg-success/10 text-success border-success/20";
      case OrderStatus.PROCESSING:
        return "bg-info/10 text-info border-info/20";
      case OrderStatus.CANCELLED:
        return "bg-destructive/10 text-destructive border-destructive/20";
      case OrderStatus.ORDER_PAID:
        return "bg-success/10 text-success border-success/20";
      case OrderStatus.DELIVERING:
        return "bg-info/10 text-info border-info/20";
      default:
        return "bg-muted/10 text-muted border-muted/20";
    }
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đơn hàng</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý và theo dõi tất cả đơn hàng
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="relative flex items-center gap-4 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Tìm kiếm đơn hàng..."
                className="pl-9 border border-gray-300 rounded-md shadow-sm px-3 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Hãng xe</TableHead>
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
                    <TableRow key={order.orderId}>
                      <TableCell className="font-medium">{order.orderId}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.vehicleModel}</TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">{order.totalAmount.toLocaleString()} ₫</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeClass(order.status)}>
                          {statusConfig[order.status]?.label || order.status}
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

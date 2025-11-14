import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VehicleShowcase } from "@/components/VehicleShowcase";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  Trash2,
  Car,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { orderService, OrderResponse, OrderStatus, OrderPaymentStatus } from "@/services/api-orders";
import { customerService, CustomerResponse } from "@/services/api-customers";
import { paymentService, PaymentPurpose } from "@/services/api-payment";
import { Input } from "@/components/ui/input";
import { contractService } from "@/services/api-contact-delivery";
import { fi } from "date-fns/locale";
import { Search } from "lucide-react";

export default function SalesManagement() {
  const navigate = useNavigate();

  // Check URL params for pre-filling form
  const urlParams = new URLSearchParams(window.location.search);


  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showVehicleShowcase, setShowVehicleShowcase] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<OrderResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "vnpay">("vnpay");
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cashNote, setCashNote] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customersData, orderData] = await Promise.all([
          customerService.getCustomers(),
          orderService.getAllOrders(),
        ]);

        if (!Array.isArray(customersData) || !Array.isArray(orderData)) {
          throw new Error("Dữ liệu trả về không hợp lệ!");
        }

        setCustomers(customersData);
        setOrders(orderData);
      } catch (error: any) {
        toast.error('Không tải được dữ liệu', {
          description: error.response?.data?.message || error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const filteredOrders = orders.filter(order => {
    const searchTerm_clean = searchTerm.trim();
    if (!searchTerm_clean) return true; // Show all if no search term

    const searchLower = searchTerm_clean.toLowerCase();

    // Search by customer name
    if (order.customerName.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search by customer phone - find matching customer
    const matchingCustomer = customers.find(customer => {
      const phoneMatch = customer.customerId === order.customerId &&
        customer.phoneNumber &&
        customer.phoneNumber.includes(searchTerm_clean);

      // Debug logging
      if (searchTerm_clean && customer.customerId === order.customerId) {
        console.log(`Order ${order.orderId} - Customer ${customer.customerId}: ${customer.phoneNumber} vs search "${searchTerm_clean}" = ${phoneMatch}`);
      }

      return phoneMatch;
    });

    return !!matchingCustomer;
  });


  const getStatusColor = (status: OrderResponse['status']) => {
    switch (status) {
      case 'COMPLETED': return 'text-success border-success';
      case 'CANCELLED': return 'text-destructive border-destructive';
      default: return 'text-warning border-warning';
    }
  };

  const getStatusText = (status: OrderResponse['status']) => {
    switch (status) {
      case 'COMPLETED': return 'Đơn hàng hoàn tất';
      case 'CANCELLED': return 'Đã hủy';
      default: return 'Đang xử lý';
    }
  };

  const getPaymentColor = (status: OrderResponse['paymentStatus']) => {
    switch (status) {
      case 'PAID': return 'text-success border-success';
      case 'OVERDUE': return 'text-destructive border-destructive';
      case 'DEPOSIT_PAID': return 'text-yellow-500 border-yellow-500';
      default: return 'text-warning border-warning';
    }
  };

  const getPaymentText = (status: OrderResponse['paymentStatus']) => {
    switch (status) {
      case 'PAID': return 'Đã thanh toán hết';
      case 'OVERDUE': return 'Đã quá hạn';
      case 'DEPOSIT_PAID': return 'Đã thanh toán cọc';
      default: return 'Chưa thanh toán';
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xoá đơn hàng này không?")) return;

    try {
      setLoading(true);
      await orderService.deleteOrder(id);
      setOrders((prev) => prev.filter((order) => order.orderId !== id));
      toast.success("Xoá đơn hàng thành công!");
    } catch (error: any) {
      console.error("Lỗi khi xoá đơn hàng:", error);
      toast.error(error.response?.data?.message || "Không thể xoá đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    if (!paymentOrder) {
      toast.error("Không có đơn hàng để thanh toán!");
      return;
    }

    // Kiểm tra số tiền nhập
    const amt = Number(cashAmount);
    if (!amt || amt <= 0) {
      toast.error("Số tiền thanh toán phải lớn hơn 0!");
      return;
    }

    // Xác định phase: deposit hay remaining
    const isDepositPhase = paymentOrder.paymentStatus === OrderPaymentStatus.UNPAID;
    const purpose = isDepositPhase ? PaymentPurpose.DEPOSIT : PaymentPurpose.REMAINING;

    // Tính tiền tối đa có thể thanh toán ở phase hiện tại (phòng trường hợp người nhập lớn hơn)
    const remainingToPay = isDepositPhase
      ? (paymentOrder.planedDepositAmount ?? 0)
      : (paymentOrder.remainingAmount ?? 0);

    if (amt > remainingToPay) {
      // Không bắt buộc nhưng đề nghị cảnh báo / chặn overpay
      toast.error(`Số tiền không được lớn hơn ${remainingToPay.toLocaleString('vi-VN')} VND`);
      return;
    }

    try {
      setLoading(true);

      const paid = await paymentService.payCash(paymentOrder.orderId, {
        amount: amt,
        applyTo: purpose,
        note: cashNote || (isDepositPhase ? `Thanh toán tiền cọc cho đơn #${paymentOrder.orderId}` : `Thanh toán phần còn lại cho đơn #${paymentOrder.orderId}`)
      });

      // cập nhật UI: thay order cũ bằng object trả về từ backend
      setOrders(prev => prev.map(o => (o.orderId === paid.orderId ? (paid as OrderResponse) : o)));

      toast.success(isDepositPhase ? "Thanh toán tiền cọc thành công!" : "Thanh toán phần còn lại thành công!");
      setPaymentOrder(null);

      // optional: reset cash inputs
      setCashAmount(0);
      setCashNote("");
    } catch (err: any) {
      console.error("payCash error:", err);
      toast.error(err.response?.data?.message || "Lỗi khi thanh toán tiền mặt!");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPaymentMethod = async (method: "cash" | "vnpay") => {
    if (!paymentOrder) {
      toast.error("Không có đơn hàng để thanh toán!");
      return;
    }

    setPaymentMethod(method);
    if (method === "cash") {
      return; // KHÔNG gọi API tại đây
    }
    if (method === "vnpay") {
      try {
        setLoading(true);

        const isDepositPhase =
          paymentOrder.paymentStatus === OrderPaymentStatus.UNPAID;

        const purpose = isDepositPhase
          ? PaymentPurpose.DEPOSIT
          : PaymentPurpose.REMAINING;

        const res = await paymentService.startVnpay(paymentOrder.orderId, {
          purpose,
          bankCode: "NCB",
        });

        if (res.paymentUrl) {
          toast.success("Đang chuyển hướng đến VNPay...");
          window.location.href = res.paymentUrl;
        } else {
          toast.error("Không nhận được URL thanh toán!");
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.response?.data?.message || "Không thể khởi tạo thanh toán VNPay!");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDepositContract = async (orderId: number) => {
    try {
      setLoading(true);

      const pdfBlob = await contractService.getDepositContract(orderId);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank"); // mở file PDF trong tab mới
    } catch (error) {
      toast.error("Không thể tải hợp đồng đặt cọc!");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDeliverySlip = async (orderId: number) => {
    try {
      setLoading(true);
      const pdfBlob = await contractService.getDeliverySlip(orderId);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    } catch (error) {
      toast.error("Không thể tải phiếu giao xe!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeliveryDate = async (orderId: number) => {
    if (!deliveryDate) {
      toast.warning("Vui lòng nhập ngày giao xe!");
      return;
    }

    // Validate: ngày giao không được nhỏ hơn hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset giờ phút giây

    const inputDate = new Date(deliveryDate);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      toast.error("Không được chọn ngày đã qua!");
      return;
    }

    try {
      setLoading(true);

      const res = await contractService.updateDeliveryDate(orderId, {
        deliveryDate: deliveryDate, // format: YYYY-MM-DD
      });

      toast.success("Cập nhật ngày giao xe thành công!");
      console.log("Updated order:", res);

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật ngày giao xe!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/showroom")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Tạo hợp đồng
            </h1>
            <p className="text-muted-foreground">
              Nhập đơn khi khách tới showroom, chốt hợp đồng trực tiếp/online, chỉnh sửa/hủy đơn khi xe giao trễ
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-card border-border/50">
            <div className="text-3xl font-bold text-primary mb-2">
              {orders.filter(o => o.status === 'COMPLETED').length}
            </div>
            <p className="text-muted-foreground">Đơn đã chốt</p>
          </Card>

          <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-card border-border/50">
            <div className="text-3xl font-bold text-warning mb-2">
              {orders.filter(o => o.status === 'PROCESSING').length}
            </div>
            <p className="text-muted-foreground">Đang xử lý</p>
          </Card>

          <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-card border-border/50">
            <div className="text-3xl font-bold text-accent mb-2">
              {(orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.totalAmount, 0) / 1000000000).toFixed(1)}B₫
            </div>
            <p className="text-muted-foreground">Doanh thu</p>
          </Card>
        </div>
      }
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên khách hàng hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm("")}
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Vehicle Showcase Dialog */}
      <VehicleShowcase
        open={showVehicleShowcase}
        onOpenChange={setShowVehicleShowcase}
      />

      {/* Orders List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Danh sách đơn hàng ({filteredOrders.length})</h3>

        {filteredOrders.map((order) => (
          <div key={order.orderId}>
            <Card className="p-6 bg-gradient-card border-border/50">
              <div className="flex items-start justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium">{order.customerName}</span>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{ }</p>
                    <p className="text-xs text-muted-foreground">ID: {order.orderId}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4 text-secondary" />
                      <span className="font-medium">{order.vehicleModel}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{order.deliveryDate}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Tổng giá </span>
                      <DollarSign className="w-4 h-4 text-accent" />
                      <span className="font-medium">
                        {order.totalAmount.toLocaleString('vi-VN')} VND
                      </span>
                      <Badge variant="outline" className={getPaymentColor(order.paymentStatus)}>
                        {getPaymentText(order.paymentStatus)}
                      </Badge>
                    </div>
                    {order.paymentStatus !== 'UNPAID' && order.paymentStatus !== 'PAID' && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Cần Thanh Toán: </span>
                        <DollarSign className="w-4 h-4 text-accent" />
                        <span className="font-medium">
                          {order.remainingAmount.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    )}
                    {order.paymentStatus !== 'UNPAID' && order.paymentStatus !== 'PAID' && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Tiền đã cọc: </span>
                        <DollarSign className="w-4 h-4 text-accent" />
                        <span className="font-medium">
                          {order.planedDepositAmount.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {order.status === 'PROCESSING' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => setPaymentOrder(order)}
                        className="bg-gradient-primary text-xs"
                      >
                        <CreditCard className="w-3 h-3 mr-1" />
                        Thanh toán
                      </Button>
                    </>
                  )}

                  {order.paymentStatus === 'DEPOSIT_PAID' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleViewDepositContract(order.orderId)}
                        className="bg-secondary text-xs"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Xuất hợp đồng
                      </Button>
                    </>
                  )}

                  {order.paymentStatus === 'PAID' && (
                    <>
                      {order.deliveryDate === null && (
                        <>
                          <Input
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                          />
                          <Button onClick={() => handleUpdateDeliveryDate(order.orderId)}>
                            Lưu ngày giao
                          </Button>
                        </>
                      )}
                      {order.deliveryDate !== null && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleViewDeliverySlip(order.orderId)}
                            className="bg-secondary text-xs"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Xuất phiếu giao xe
                          </Button>
                        </>
                      )}
                    </>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteOrder(order.orderId)}
                    className="text-xs border-destructive text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ))
        }
      </div >

      {/* Payment Dialog */}
      < Dialog open={!!paymentOrder} onOpenChange={() => setPaymentOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Thanh toán đơn hàng</DialogTitle>
          </DialogHeader>

          {paymentOrder && (
            <div className="space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Phương thức thanh toán</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={paymentMethod === "cash" ? "default" : "outline"}
                    onClick={() => handleSelectPaymentMethod("cash")}
                    className="h-12 text-base font-semibold"
                    disabled={loading}
                  >
                    Tiền mặt
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === "vnpay" ? "default" : "outline"}
                    onClick={() => handleSelectPaymentMethod("vnpay")}
                    className="h-12 text-base font-semibold"
                    disabled={loading}
                  >
                    VNPay
                  </Button>
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đơn hàng:</span>
                  <span className="font-semibold">{paymentOrder.orderId}</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Khách hàng:</span>
                  <span className="font-medium">{paymentOrder.customerName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loại xe:</span>
                  <span className="font-medium">{paymentOrder.vehicleModel}</span>
                </div>

                <Separator />
                {paymentOrder.paymentStatus === 'UNPAID' && (
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Tiền cọc:</span>
                    <span className="font-bold text-primary">
                      {(paymentOrder.planedDepositAmount).toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                )}
                {paymentOrder.paymentStatus === 'DEPOSIT_PAID' && (
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Khoản còn lại:</span>
                    <span className="font-bold text-primary">
                      {(paymentOrder.remainingAmount).toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                )}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Quét mã QR để thanh toán qua ứng dụng ngân hàng
              </p>
            </div>
          )}

          {paymentMethod === "cash" && (
            <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
              <div>
                <Label>Số tiền thanh toán (VND)</Label>
                <Input
                  type="text"
                  value={
                    paymentOrder.paymentStatus === "UNPAID"
                      ? paymentOrder.planedDepositAmount.toLocaleString("vi-VN") + " VND"
                      : paymentOrder.remainingAmount.toLocaleString("vi-VN") + " VND"
                  }
                  readOnly
                />
              </div>
              <div>
                <Label>Ghi chú</Label>
                <Input
                  value={cashNote}
                  onChange={(e) => setCashNote(e.target.value)}
                  placeholder="VD: Thanh toán tiền cọc"
                />
              </div>

              <Button onClick={handleCashPayment} disabled={loading} className="w-full h-12 font-semibold">
                Xác nhận thanh toán
              </Button>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}